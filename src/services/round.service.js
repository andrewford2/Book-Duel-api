const roundRepo = require('../repositories/round.repository');
const answerRepo = require('../repositories/answer.repository');
const sessionPlayerRepo = require('../repositories/sessionPlayer.repository');
const sessionRepo = require('../repositories/session.repository');
const { Question, Choice, Answer, SessionPlayer, Round, Session } = require('../models');

async function resolveRound(roundId) {
  const round = await roundRepo.findRoundById(roundId);
  if (!round || round.status !== 'open') return;

  const answers = await roundRepo.getAnswersForRound(roundId);
  const alivePlayers = await sessionPlayerRepo.findPlayersBySession(round.session_id);
  const alive = alivePlayers.filter(p => !p.is_eliminated);

  // Mark missing answers
  for (const player of alive) {
    const hasAnswer = answers.some(a => a.session_player_id === player.session_player_id);
    if (!hasAnswer) {
      await Answer.create({
        round_id: roundId,
        session_player_id: player.session_player_id,
        question_id: round.question_id,
        choice_id: null,
        is_correct: false,
        damage_taken: 0,
        score_earned: 0,
        answered_at: null,
      });
    }
  }

  // Refresh answers
  const allAnswers = await roundRepo.getAnswersForRound(roundId);
  const wrongAnswers = allAnswers.filter(a => !a.is_correct);
  const alivePlayersWithAnswers = alive.map(p => {
    const ans = allAnswers.find(a => a.session_player_id === p.session_player_id);
    return { player: p, answer: ans };
  });

  // Determine round result
  let isVoided = false;
  const wrongPlayers = alivePlayersWithAnswers.filter(a => !a.answer.is_correct);

  if (wrongPlayers.length === alivePlayersWithAnswers.length) {
    // All wrong - void round
    await roundRepo.voidRound(round);
    isVoided = true;
  } else if (wrongPlayers.length >= 2) {
    // 2+ wrong - roulette
    const roulette = wrongPlayers[Math.floor(Math.random() * wrongPlayers.length)];
    roulette.answer.damage_taken = 2;
    roulette.answer.is_correct = false;
    await roulette.answer.save();
    await sessionPlayerRepo.updatePlayerScoreAndHP(roulette.player.session_player_id, 0, -2);

    for (const wrong of wrongPlayers) {
      if (wrong.session_player_id !== roulette.player.session_player_id) {
        wrong.answer.damage_taken = 1;
        await wrong.answer.save();
        await sessionPlayerRepo.updatePlayerScoreAndHP(wrong.player.session_player_id, 0, -1);
      }
    }

    for (const correct of alivePlayersWithAnswers.filter(a => a.answer.is_correct)) {
      correct.answer.score_earned = 100;
      await correct.answer.save();
      await sessionPlayerRepo.updatePlayerScoreAndHP(correct.player.session_player_id, 100, 0);
    }
  } else if (wrongPlayers.length === 1) {
    // Exactly one wrong
    wrongPlayers[0].answer.damage_taken = 1;
    await wrongPlayers[0].answer.save();
    await sessionPlayerRepo.updatePlayerScoreAndHP(wrongPlayers[0].player.session_player_id, 0, -1);

    for (const correct of alivePlayersWithAnswers.filter(a => a.answer.is_correct)) {
      correct.answer.score_earned = 100;
      await correct.answer.save();
      await sessionPlayerRepo.updatePlayerScoreAndHP(correct.player.session_player_id, 100, 0);
    }
  } else {
    // All correct
    for (const correct of alivePlayersWithAnswers.filter(a => a.answer.is_correct)) {
      correct.answer.score_earned = 100;
      await correct.answer.save();
      await sessionPlayerRepo.updatePlayerScoreAndHP(correct.player.session_player_id, 100, 0);
    }
  }

  // Check eliminations
  for (const player of alive) {
    if (player.hp <= 0) {
      player.is_eliminated = true;
      player.hp = 0;
      await player.save();
    }
  }

  // Check session end conditions
  const aliveCount = (await sessionPlayerRepo.findPlayersBySession(round.session_id)).filter(p => !p.is_eliminated).length;
  const remainingQuestions = await getRemainingQuestionsCount(round.session_id);

  if (aliveCount <= 1 || remainingQuestions === 0) {
    const session = await Session.findByPk(round.session_id);
    let endReason = 'questions_ran_out';
    if (aliveCount <= 1) endReason = 'last_player_standing';

    await sessionRepo.endSession(session, endReason);
    await determineWinners(round.session_id);
  } else {
    await roundRepo.closeRound(round);
  }

  return { isVoided, round };
}

async function getRemainingQuestionsCount(sessionId) {
  const session = await Session.findByPk(sessionId, {
    include: [{ association: 'questionSet', include: [{ association: 'questions' }] }],
  });
  if (!session) return 0;
  const totalQuestions = session.questionSet.questions.length;
  const askedCount = await Round.count({ where: { session_id: sessionId } });
  return Math.max(0, totalQuestions - askedCount);
}

async function determineWinners(sessionId) {
  const players = await SessionPlayer.findAll({
    where: { session_id: sessionId },
    order: [['hp', 'DESC'], ['score', 'DESC']],
  });

  const alivePlayers = players.filter(p => !p.is_eliminated);
  if (alivePlayers.length === 0) return;

  const maxHp = alivePlayers[0].hp;
  const topPlayers = alivePlayers.filter(p => p.hp === maxHp);
  const maxScore = topPlayers[0].score;
  const winners = topPlayers.filter(p => p.score === maxScore);

  for (const winner of winners) {
    winner.is_winner = true;
    await winner.save();
  }
}

module.exports = { resolveRound };