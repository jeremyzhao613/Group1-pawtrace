const crypto = require('crypto');
const config = require('../config');

/**
 * When MONITOR_API_TOKEN is set, require matching credentials for monitor APIs.
 * Accepts: Authorization: Bearer <token>, query ?token=, or JSON body.token (POST).
 * When unset, passes through (local dev).
 */
function requireMonitorAuth(req, res, next) {
  const expected = config.MONITOR_API_TOKEN;
  if (!expected) return next();

  const bearer =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : '';
  const queryTok = String(req.query?.token || '').trim();
  const bodyTok =
    req.body && typeof req.body === 'object' && req.body !== null
      ? String(req.body.token || '').trim()
      : '';

  const provided = bearer || queryTok || bodyTok;
  const a = Buffer.from(String(expected), 'utf8');
  const b = Buffer.from(String(provided), 'utf8');
  if (a.length === b.length && b.length > 0 && crypto.timingSafeEqual(a, b)) {
    return next();
  }
  return res.status(401).json({ error: 'Monitor API unauthorized' });
}

module.exports = { requireMonitorAuth };
