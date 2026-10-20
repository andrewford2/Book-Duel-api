const sessionRepo = require('../repositories/session.repository');
const sessionPlayerRepo = require('../repositories/sessionPlayer.repository');
const roundRepo = require('../repositories/round.repository');
const answerRepo = require('../repositories/answer.repository');
const questionSetRepo = require('../repositories/questionSet.repository');

async function createSession(hostId, { questionSetId }) {
  if (!questionSetId) {
    const err = new Error('question_set_id is required');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }
  const session = await sessionRepo.createSession({ questionSetId: Number(questionSetId), hostId });
  if (!session) {
    const err = new Error('Invalid question set or no questions available');
    err.status = 400;
    throw err;
  }
  return session;
}

async function getSessionByCode(code) {
  const session = await sessionRepo.findSessionByCode(code);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  return session;
}

async function startSession(sessionId) {
  const session = await sessionRepo.findSessionById(sessionId);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  if (session.status !== 'waiting') {
    const err = new Error('Session already started or ended');
    err.status = 409;
    err.code = 'SESSION_ALREADY_STARTED';
    throw err;
  }
  if (!session.questionSet.questions || session.questionSet.questions.length === 0) {
    const err = new Error('No questions in question set');
    err.status = 409;
    err.code = 'NO_QUESTIONS_LEFT';
    throw err;
  }
  return sessionRepo.startSession(session);
}

async function endSession(sessionId, hostId) {
  const session = await sessionRepo.findSessionById(sessionId);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  if (session.host_id !== hostId) {
    const err = new Error('Not your session');
    err.status = 403;
    err.code = 'NOT_YOUR_SESSION';
    throw err;
  }
  if (session.status === 'ended') {
    const err = new Error('Session already ended');
    err.status = 409;
    err.code = 'SESSION_ENDED';
    throw err;
  }
  return sessionRepo.endSession(session, 'host_ended');
}

async function joinSession(code, nickname) {
  const session = await sessionRepo.findSessionByCodeWithPlayers(code);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  if (session.status !== 'waiting' && session.status !== 'playing') {
    const err = new Error('Session not joinable');
    err.status = 409;
    err.code = 'SESSION_ENDED';
    throw err;
  }
  if (session.players.length >= 30) {
    const err = new Error('Session full');
    err.status = 409;
    err.code = 'SESSION_FULL';
    throw err;
  }
  const result = await sessionPlayerRepo.joinSession(session.session_id, nickname);
  if (result.error) {
    const err = new Error(result.error);
    err.status = result.error === 'NICKNAME_TAKEN' ? 409 : 400;
    err.code = result.error;
    throw err;
  }
  return { session, player: result.player };
}

async function startRound(sessionId) {
  const session = await sessionRepo.findSessionById(sessionId);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  if (session.status !== 'playing') {
    if (session.status === 'waiting') {
      await sessionRepo.startSession(session);
    } else {
      const err = new Error('Session not in playing state');
      err.status = 409;
      err.code = 'SESSION_ENDED';
      throw err;
    }
  }

  const openRound = await roundRepo.findOpenRound(session.session_id);
  if (openRound) {
    const err = new Error('Round already in progress');
    err.status = 409;
    err.code = 'ROUND_IN_PROGRESS';
    throw err;
  }

  const question = await sessionRepo.getRandomQuestion(session);
  if (!question) {
    const err = new Error('No more questions');
    err.status = 409;
    err.code = 'NO_QUESTIONS_LEFT';
    throw err;
  }

  const round = await roundRepo.createRound({
    sessionId: session.session_id,
    questionId: question.question_id,
    roundNo: (await Round.count({ where: { session_id: sessionId } })) + 1,
  });

  round.deadline_at = new Date(Date.now() + question.time_limit_sec * 1000);
  await round.save();

  return round;
}

async function getCurrentRound(sessionId) {
  const session = await sessionRepo.findSessionById(sessionId);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  return sessionRepo.getCurrentRound(session);
}

async function submitAnswer({ sessionId, playerId, questionId, choiceIndex }) {
  const session = await sessionRepo.findSessionById(sessionId);
  if (!session) {
    const err = new Error('Session not found');
    err.status = 404;
    err.code = 'SESSION_NOT_FOUND';
    throw err;
  }
  if (session.status !== 'playing') {
    const err = new Error('Session not active');
    err.status = 409;
    err.code = 'SESSION_ENDED';
    throw err;
  }

  const openRound = await roundRepo.findOpenRound(sessionId);
  if (!openRound) {
    const err = new Error('No open round');
    err.status = 409;
    err.code = 'NO_OPEN_ROUND';
    throw err;
  }
  if (openRound.deadline_at < new Date()) {
    await roundRepo.closeRound(openRound);
    return { error: 'ROUND_CLOSED' };
  }

  const player = await SessionPlayer.findByPk(playerId);
  if (!player || player.session_id !== sessionId) {
    const err = new Error('Player not in session');
    err.status = 403;
    err.code = 'PLAYER_ELIMINATED';
    throw err;
  }
  if (player.is_eliminated) {
    const err = new Error('Player eliminated');
    err.status = 403;
    err.code = 'PLAYER_ELIMINATED';
    throw err;
  }

  const question = await Question.findByPk(questionId);
  if (!question || openRound.question_id !== questionId) {
    const err = new Error('Invalid question');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const choices = await Choice.findAll({ where: { question_id: questionId } });
  if (choiceIndex < 0 || choiceIndex >= choices.length) {
    const err = new Error('Invalid choice index');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const choice = choices[choiceIndex];
  const isCorrect = choice.is_correct;

  // Save answer with pending values (will be resolved after round closes)
  const answer = await Answer.create({
    round_id: openRound.round_id,
    session_player_id: playerId,
    question_id: questionId,
    choice_id: choice.choice_id,
    is_correct: choice.is_correct,
    damage_taken: 0,
    score_earned: 0,
    answered_at: new Date(),
  });

  return { answer, isCorrect };
}

const { Question, Choice, Answer, SessionPlayer, Round } = require('../models');

module.exports = {
  createSession,
  getSessionByCode,
  startSession,
  endSession,
  joinSession,
  startRound,
  getCurrentRound,
  submitAnswer,
};