const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.get('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Handle both { id, role } and { user: { id, role } } payloads
      req.user = decoded.user ? { id: decoded.user.id, role: decoded.user.role } : { id: decoded.id, role: decoded.role };
      
      // Validate role if roles are specified
      if (roles.length && (!req.user.role || !roles.includes(req.user.role))) {
        return res.status(403).json({ msg: 'Access denied' });
      }
      
      next();
    } catch (err) {
      console.error('Auth error:', err);
      res.status(401).json({ msg: 'Invalid token' });
    }
  };
};