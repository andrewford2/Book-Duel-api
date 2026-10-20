const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/host.repository');
const env = require('../config/env');

async function registerHost({ username, password }) {
  const existing = await repo.findByUsername(username);
  if (existing) {
    const err = new Error('Username already exists');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  return repo.createHost({ username, password_hash: passwordHash });
}

async function loginHost({ username, password }) {
  const host = await repo.findByUsername(username);
  if (!host) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const valid = await bcrypt.compare(password, host.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const token = jwt.sign({ hostId: host.host_id, username: host.username }, env.jwtSecret, { expiresIn: '24h' });
  return { token, host: { host_id: host.host_id, username: host.username } };
}

async function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

module.exports = { registerHost, loginHost, verifyToken };