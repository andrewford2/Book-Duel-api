const { Answer, Round, SessionPlayer, Choice, Question } = require('../models');

async function submitAnswer({ roundId, sessionPlayerId, questionId, choiceIndex }) {
  const round = await Round.findByPk(roundId, {
    include: [{ association: 'question', include: [{ association: 'choices' }] }],
  });
  if (!round) return { error: 'ROUND_NOT_FOUND' };
  if (round.status !== 'open') return { error: 'ROUND_CLOSED' };
  if (round.deadline_at < new Date()) return { error: 'ROUND_CLOSED' };

  const player = await SessionPlayer.findByPk(sessionPlayerId);
  if (!player) return { error: 'SESSION_NOT_FOUND' };
  if (player.is_eliminated) return { error: 'PLAYER_ELIMINATED' };

  const question = await Question.findByPk(questionId);
  if (!question) return { error: 'QUESTION_NOT_FOUND' };
  if (round.question_id !== questionId) return { error: 'INVALID_QUESTION' };

  const choices = await Choice.findAll({ where: { question_id: questionId } });
  if (choiceIndex < 0 || choiceIndex >= choices.length) return { error: 'INVALID_CHOICE_INDEX' };

  const choice = choices[choiceIndex];
  const choiceId = choice.choice_id;

  const existing = await Answer.findOne({
    where: { round_id: roundId, session_player_id: sessionPlayerId },
  });
  if (existing) return { error: 'ALREADY_ANSWERED' };

  const isCorrect = choice.is_correct;
  const damageTaken = 0; // Will be set during round resolution
  const scoreEarned = isCorrect ? 100 : 0;

  const answer = await Answer.create({
    round_id: roundId,
    session_player_id: sessionPlayerId,
    question_id: questionId,
    choice_id: choice.choice_id,
    is_correct: isCorrect,
    damage_taken: 0,
    score_earned: scoreEarned,
    answered_at: new Date(),
  });

  return { answer, isCorrect, damageTaken: 0, scoreEarned };
}

async function getPlayerAnswerForRound(roundId, sessionPlayerId) {
  return Answer.findOne({
    where: { round_id: roundId, session_player_id: sessionPlayerId },
    include: [{ association: 'choice' }],
  });
}

async function getRoundAnswers(roundId) {
  return Answer.findAll({
    where: { round_id: roundId },
    include: [
      { association: 'sessionPlayer' },
      { association: 'choice' },
    ],
  });
}

module.exports = { submitAnswer, getPlayerAnswerForRound, getRoundAnswers };