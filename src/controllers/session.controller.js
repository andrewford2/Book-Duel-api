const sessionService = require('../services/session.service');

async function createSession(req, res) {
  const { questionSetId } = req.body;
  const session = await sessionService.createSession(req.authHost.hostId, { questionSetId });
  res.status(201).json({ session_code: session.join_code, status: session.status });
}

async function getSession(req, res) {
  const { code } = req.params;
  const session = await sessionService.getSessionByCode(code);
  if (session.host_id !== req.authHost.hostId) {
    return res.status(403).json({ error: { code: 'NOT_YOUR_SESSION', message: 'Not your session' } });
  }
  const players = session.players.map(p => ({
    session_player_id: p.session_player_id,
    nickname: p.nickname,
    hp: p.hp,
    score: p.score,
    is_eliminated: p.is_eliminated,
    is_winner: p.is_winner,
    joined_at: p.joined_at,
  }));
  const rounds = session.rounds.map(r => ({
    round_id: r.round_id,
    round_no: r.round_no,
    question_id: r.question_id,
    status: r.status,
    is_voided: r.is_voided,
    started_at: r.started_at,
    deadline_at: r.deadline_at,
    closed_at: r.closed_at,
  }));
  res.json({ ...session.toJSON(), players, rounds });
}

async function endSession(req, res) {
  const { code } = req.params;
  const { status } = req.body;
  if (status !== 'ended') {
    return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'status must be "ended"' } });
  }
  const session = await sessionService.getSessionByCode(code);
  if (session.host_id !== req.authHost.hostId) {
    return res.status(403).json({ error: { code: 'NOT_YOUR_SESSION', message: 'Not your session' } });
  }
  const updated = await sessionService.endSession(session.session_id, req.authHost.hostId);
  res.json(updated);
}

async function joinSession(req, res) {
  const { code } = req.params;
  const { nickname } = req.body;
  if (!nickname || nickname.trim().length < 2) {
    return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'nickname required (2-20 chars)' } });
  }
  const result = await sessionService.joinSession(code, nickname.trim());
  res.status(201).json({ session_code: result.session.join_code, player_token: result.player.session_player_id });
}

async function startRound(req, res) {
  const { code } = req.params;
  const session = await sessionService.getSessionByCode(code);
  if (session.host_id !== req.authHost.hostId) {
    return res.status(403).json({ error: { code: 'NOT_YOUR_SESSION', message: 'Not your session' } });
  }
  const round = await sessionService.startRound(session.session_id);
  res.status(201).json({ round_id: round.round_id, round_no: round.round_no, question: { question_id: round.question.question_id, text: round.question.text, type: round.question.type, time_limit_sec: round.question.time_limit_sec, choices: round.question.choices.map(c => ({ choice_id: c.choice_id, text: c.text, position: c.position })) }, deadline_at: round.deadline_at });
}

async function getCurrentRound(req, res) {
  const { code } = req.params;
  const session = await sessionService.getSessionByCode(code);
  // Check if host or player
  const isHost = req.authHost && session.host_id === req.authHost.hostId;
  const isPlayer = req.authPlayer && session.players.some(p => p.session_player_id === req.authPlayer.playerId);
  if (!isHost && !isPlayer) {
    return res.status(403).json({ error: { code: 'NOT_YOUR_SESSION', message: 'Not your session' } });
  }
  const round = await sessionService.getCurrentRound(session.session_id);
  if (!round) {
    return res.status(404).json({ error: { code: 'NO_OPEN_ROUND', message: 'No current round' } });
  }
  const question = round.question;
  if (req.authPlayer) {
    // Player view: don't send correct answer
    res.json({
      round_id: round.round_id,
      round_no: round.round_no,
      status: round.status,
      is_voided: round.is_voided,
      started_at: round.started_at,
      deadline_at: round.deadline_at,
      question: {
        question_id: question.question_id,
        text: question.text,
        type: question.type,
        time_limit_sec: question.time_limit_sec,
        choices: question.choices.map(c => ({ choice_id: c.choice_id, text: c.text, position: c.position })),
      },
    });
  } else {
    // Host view: include correct answer
    res.json({
      round_id: round.round_id,
      round_no: round.round_no,
      status: round.status,
      is_voided: round.is_voided,
      started_at: round.started_at,
      deadline_at: round.deadline_at,
      question: {
        question_id: question.question_id,
        text: question.text,
        type: question.type,
        time_limit_sec: question.time_limit_sec,
        choices: question.choices.map(c => ({ choice_id: c.choice_id, text: c.text, position: c.position, is_correct: c.is_correct })),
      },
    });
  }
}

async function submitAnswer(req, res) {
  const { code } = req.params;
  const { questionId, choiceIndex } = req.body;
  const session = await sessionService.getSessionByCode(code);
  if (!session) {
    return res.status(404).json({ error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } });
  }
  const playerId = req.authPlayer?.playerId;
  if (!playerId) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Player token required' } });
  }
  const result = await sessionService.submitAnswer({ sessionId: session.session_id, playerId, questionId: Number(questionId), choiceIndex: Number(choiceIndex) });
  if (result.error) {
    const statusMap = {
      SESSION_NOT_FOUND: 404,
      SESSION_ENDED: 409,
      NO_OPEN_ROUND: 409,
      ROUND_CLOSED: 409,
      PLAYER_ELIMINATED: 403,
      ALREADY_ANSWERED: 409,
      VALIDATION_FAILED: 400,
    };
    return res.status(statusMap[result.error] || 400).json({ error: { code: result.error, message: result.error } });
  }
  res.status(201).json({ answer_id: result.answer.answer_id, is_correct: result.isCorrect });
}

async function getLeaderboard(req, res) {
  const { code } = req.params;
  const session = await sessionService.getSessionByCode(code);
  const leaderboard = await sessionPlayerRepo.getLeaderboard(session.session_id);
  res.json(leaderboard.map(p => ({
    session_player_id: p.session_player_id,
    nickname: p.nickname,
    hp: p.hp,
    score: p.score,
    is_eliminated: p.is_eliminated,
    is_winner: p.is_winner,
    rank: p.rank,
  })));
}

const sessionPlayerRepo = require('../repositories/sessionPlayer.repository');

module.exports = { createSession, getSession, endSession, joinSession, startRound, getCurrentRound, submitAnswer, getLeaderboard };