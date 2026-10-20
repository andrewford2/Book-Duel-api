const { SessionPlayer, Session, Round, Answer, Question, Choice } = require('../models');

async function joinSession(sessionId, nickname) {
  const session = await Session.findByPk(sessionId);
  if (!session) return { error: 'SESSION_NOT_FOUND' };
  if (session.status !== 'waiting' && session.status !== 'playing') return { error: 'SESSION_NOT_JOINABLE' };

  const existing = await SessionPlayer.findOne({
    where: { session_id: sessionId, nickname },
  });
  if (existing) return { error: 'NICKNAME_TAKEN' };

  const player = await SessionPlayer.create({ session_id: sessionId, nickname });
  return { player };
}

async function findPlayerById(playerId) {
  return SessionPlayer.findByPk(playerId);
}

async function findPlayerBySessionAndNickname(sessionId, nickname) {
  return SessionPlayer.findOne({ where: { session_id: sessionId, nickname } });
}

async function updatePlayerScoreAndHP(playerId, scoreDelta, hpDelta) {
  const player = await SessionPlayer.findByPk(playerId);
  if (!player) return null;
  player.score += scoreDelta;
  player.hp = Math.max(0, player.hp + hpDelta);
  player.is_eliminated = player.hp === 0;
  await player.save();
  return player;
}

async function setPlayerAsWinner(playerId) {
  const player = await SessionPlayer.findByPk(playerId);
  if (!player) return null;
  player.is_winner = true;
  await player.save();
  return player;
}

async function getLeaderboard(sessionId) {
  return SessionPlayer.findAll({
    where: { session_id: sessionId },
    order: [['hp', 'DESC'], ['score', 'DESC'], ['joined_at', 'ASC']],
  });
}

async function getPlayerAnswers(playerId) {
  return Answer.findAll({
    where: { session_player_id: playerId },
    include: [
      { association: 'round', include: [{ association: 'question' }] },
      { association: 'choice' },
    ],
    order: [['answered_at', 'ASC']],
  });
}

async function findPlayersBySession(sessionId) {
  return SessionPlayer.findAll({ where: { session_id: sessionId } });
}

async function countAlivePlayers(sessionId) {
  return SessionPlayer.count({
    where: { session_id: sessionId, is_eliminated: false },
  });
}

module.exports = {
  joinSession,
  findPlayerById,
  findPlayerBySessionAndNickname,
  updatePlayerScoreAndHP,
  setPlayerAsWinner,
  getLeaderboard,
  getPlayerAnswers,
  findPlayersBySession,
  countAlivePlayers,
};