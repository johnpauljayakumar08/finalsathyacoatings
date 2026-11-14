const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication is required' });
  }

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }

  const role = String(user.role || '').replace(/[\s_-]/g, '').toLowerCase();
  if (!['admin', 'superadmin', 'managingdirector', 'md'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Reports are available to administrators and the managing director' });
  }
  req.reportUser = user;
  return next();
};
