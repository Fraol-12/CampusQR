const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token =
    req.cookies?.token ||
    (header?.startsWith('Bearer ') ? header.slice(7) : null) ||
    req.query.token ||
    null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = req.cookies?.token || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret);
    } catch {
      /* ignore */
    }
  }
  next();
}

module.exports = { authenticate, optionalAuth };
