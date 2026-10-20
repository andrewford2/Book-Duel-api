const service = require('../services/auth.service');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: { code: 'VALIDATION_FAILED', message: 'username and password required' },
    });
  }
  const result = await service.loginHost({ username, password });
  res.json(result);
}

async function register(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: { code: 'VALIDATION_FAILED', message: 'username and password required' },
    });
  }
  const result = await service.registerHost({ username, password });
  res.status(201).json({ host_id: result.host.host_id, username: result.host.username });
}

module.exports = { login, register };