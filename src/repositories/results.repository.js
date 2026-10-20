const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

// Every player of every finished game, with the pieces /results needs.
// A player "completed" the tournament when they answered every round that
// counted, whatever their final HP or rank (see README, "What completed means").
const FINISHED_GAME_PLAYERS = `
  SELECT
    s.join_code AS session_code,
    s.started_at,
    s.ended_at,
    COALESCE(u.school_id, 'unknown') AS school_id,
    sp.nickname,
    sp.score,
    (
      EXISTS (
        SELECT 1 FROM rounds r
        WHERE r.session_id = s.session_id AND r.is_voided = false
      )
      AND NOT EXISTS (
        SELECT 1 FROM rounds r
        WHERE r.session_id = s.session_id AND r.is_voided = false
          AND NOT EXISTS (
            SELECT 1 FROM answers a
            WHERE a.round_id = r.round_id
              AND a.session_player_id = sp.session_player_id
              AND a.choice_id IS NOT NULL
              AND a.answered_at IS NOT NULL
          )
      )
    ) AS completed
  FROM sessions s
  JOIN session_players sp ON sp.session_id = s.session_id
  LEFT JOIN users u ON u.user_id = sp.user_id
  WHERE s.status = 'ended'
    AND s.ended_at IS NOT NULL
`;

async function findFinishedGamePlayers(since) {
  const where = [];
  const replacements = {};
  if (since) {
    where.push('AND s.ended_at > :since');
    replacements.since = since;
  }

  return sequelize.query(`${FINISHED_GAME_PLAYERS}${where.join('\n')}
    ORDER BY s.ended_at ASC, sp.score DESC, sp.nickname ASC`, {
    replacements,
    type: QueryTypes.SELECT,
  });
}

module.exports = { findFinishedGamePlayers };
