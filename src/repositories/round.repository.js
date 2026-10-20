const { Round, Question, Session, SessionPlayer, Answer, Choice } = require('../models');

async function createRound({ sessionId, questionId, roundNo }) {
  return Round.create({
    session_id: sessionId,
    question_id: questionId,
    round_no: roundNo,
    status: 'open',
    started_at: new Date(),
    deadline_at: new Date(Date.now() + 60000), // Will be updated by service
  });
}

async function findRoundById(roundId) {
  return Round.findByPk(roundId, {
    include: [
      { association: 'question', include: [{ association: 'choices' }] },
    ],
  });
}

async function findOpenRound(sessionId) {
  return Round.findOne({
    where: { session_id: sessionId, status: 'open' },
    include: [{ association: 'question', include: [{ association: 'choices' }] }],
  });
}

async function closeRound(round) {
  round.status = 'closed';
  round.closed_at = new Date();
  return round.save();
}

async function voidRound(round) {
  round.is_voided = true;
  return round.save();
}

async function getAnswersForRound(roundId) {
  return Answer.findAll({
    where: { round_id: roundId },
    include: [
      { association: 'sessionPlayer' },
      { association: 'choice' },
    ],
  });
}

async function countAlivePlayersWithoutAnswer(sessionId, roundId) {
  const alivePlayers = await Round.findByPk(roundId, {
    include: [{
      association: 'session',
      include: [{
        association: 'players',
        where: { is_eliminated: false },
        required: true,
      }],
    }],
  }).then(r => r.session.players);

  const answeredPlayerIds = await Answer.findAll({
    where: { round_id: roundId },
    attributes: ['session_player_id'],
  }).then(a => a.map(a => a.session_player_id));

  return alivePlayers.filter(p => !answeredPlayerIds.includes(p.session_player_id)).length;
}

module.exports = {
  createRound,
  findRoundById,
  findOpenRound,
  closeRound,
  voidRound,
  getAnswersForRound,
  countAlivePlayersWithoutAnswer,
};