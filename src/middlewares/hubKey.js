const crypto = require('crypto');
const env = require('../config/env');

function sameText(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requireHubKey(req, res, next) {
  const sent = req.get('X-Hub-Key');
  if (!sent || !sameText(sent, env.hubApiKey)) {
    return res.status(401).json({
      error: { code: 'HUB_KEY_REQUIRED', message: 'Send the library key in the X-Hub-Key header.' },
    });
  }
  next();
}

module.exports = { requireHubKey };