const { Session, QuestionSet, SessionPlayer, Round, Question } = require('../models');

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createSession({ questionSetId, hostId }) {
  const questionSet = await QuestionSet.findByPk(questionSetId, {
    include: [{ association: 'questions' }],
  });
  if (!questionSet) return null;
  if (questionSet.host_id !== hostId) return null;
  if (!questionSet.questions || questionSet.questions.length === 0) return null;

  let code;
  let exists = true;
  while (exists) {
    code = generateCode();
    exists = await Session.findOne({ where: { join_code: code } });
  }

  return Session.create({
    question_set_id: questionSetId,
    host_id: hostId,
    join_code: code,
    status: 'waiting',
  });
}

async function findSessionByCode(code) {
  return Session.findOne({
    where: { join_code: code },
    include: [
      { association: 'questionSet', include: [{ association: 'questions' }] },
      { association: 'players' },
      { association: 'rounds', include: [{ association: 'question' }] },
    ],
  });
}

async function findSessionById(sessionId) {
  return Session.findByPk(sessionId, {
    include: [
      { association: 'questionSet', include: [{ association: 'questions' }] },
      { association: 'players' },
      { association: 'rounds', include: [{ association: 'question' }] },
    ],
  });
}

async function startSession(session) {
  session.status = 'playing';
  session.started_at = new Date();
  return session.save();
}

async function endSession(session, reason) {
  session.status = 'ended';
  session.end_reason = reason;
  session.ended_at = new Date();
  return session.save();
}

async function getOpenRound(session) {
  return Round.findOne({
    where: { session_id: session.session_id, status: 'open' },
    include: [{ association: 'question', include: [{ association: 'choices' }] }],
  });
}

async function getCurrentRound(session) {
  const openRound = await getOpenRound(session);
  if (openRound) return openRound;

  const closedRound = await Round.findOne({
    where: { session_id: session.session_id, status: 'closed' },
    order: [['round_no', 'DESC']],
    include: [{ association: 'question', include: [{ association: 'choices' }] }],
  });
  return closedRound;
}

async function getRandomQuestion(session) {
  const questions = session.questionSet.questions;
  if (!questions || questions.length === 0) return null;

  const usedQuestionIds = await Round.findAll({
    where: { session_id: session.session_id },
    attributes: ['question_id'],
  }).then(r => r.map(r => r.question_id));

  const available = questions.filter(q => !usedQuestionIds.includes(q.question_id));
  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)];
}

async function findOpenRound(sessionId) {
  return Round.findOne({
    where: { session_id: sessionId, status: 'open' },
    include: [{ association: 'question', include: [{ association: 'choices' }] }],
  });
}

async function findSessionByCodeWithPlayers(code) {
  return Session.findOne({
    where: { join_code: code },
    include: [
      { association: 'players' },
      { association: 'questionSet', include: [{ association: 'questions' }] },
    ],
  });
}

module.exports = {
  createSession,
  findSessionByCode,
  findSessionById,
  startSession,
  endSession,
  getOpenRound,
  getCurrentRound,
  getRandomQuestion,
  findOpenRound,
  findSessionByCodeWithPlayers,
};