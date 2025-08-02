const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const requireModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    res.status(403).json({ message: 'Moderator or Admin access required' });
  }
};

const requireMember = (req, res, next) => {
  if (req.user && ['admin', 'moderator', 'member'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Member access required' });
  }
};

module.exports = { authenticateToken, requireAdmin, requireModerator, requireMember };
