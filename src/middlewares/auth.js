const authService = require('../services/auth.service');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Missing or invalid Authorization header' } });
  }
  const token = authHeader.slice(7);
  const payload = await authService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Invalid or expired token' } });
  }
  req.authHost = { hostId: payload.hostId, username: payload.username };
  next();
}

module.exports = { requireAuth };