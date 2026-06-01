function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

const ROLES = {
  admin: ['admin'],
  security: ['admin', 'security'],
  cafeteria: ['admin', 'cafeteria'],
  teacher: ['admin', 'teacher'],
  librarian: ['admin', 'librarian'],
  student: ['admin', 'student'],
  scanner: ['admin', 'security', 'cafeteria', 'teacher', 'librarian'],
  reports: ['admin', 'teacher', 'librarian'],
};

module.exports = { requireRoles, ROLES };
