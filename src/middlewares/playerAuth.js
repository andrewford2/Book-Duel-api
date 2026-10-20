// For player endpoints - uses simple session_player_id as token
// In production, this should be a proper JWT or session token

async function requirePlayerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Missing or invalid Authorization header' } });
  }
  const token = authHeader.slice(7);
  const playerId = parseInt(token, 10);
  if (isNaN(playerId)) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Invalid player token' } });
  }
  req.authPlayer = { playerId };
  next();
}

module.exports = { requirePlayerAuth };