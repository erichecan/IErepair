/**
 * Role guard factory.
 * Returns middleware that checks whether req.user.role matches one of the
 * allowed roles. Must be used after the authenticate middleware.
 *
 * Usage:
 *   router.get('/admin', authenticate, requireRole('hq_admin'), handler);
 *   router.get('/both', authenticate, requireRole('merchant', 'hq_admin'), handler);
 */
export function requireRole(...roles) {
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

export default requireRole;
