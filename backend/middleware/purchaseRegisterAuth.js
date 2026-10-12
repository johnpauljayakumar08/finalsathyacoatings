const jwt = require('jsonwebtoken');

const normalizeRole = (role) => {
  const normalized = String(role || '').replace(/[\s-]/g, '').toLowerCase();
  if (normalized === 'md' || normalized === 'managingdirector') return 'managing_director';
  if (normalized === 'accountsteam') return 'accounts_team';
  if (normalized === 'siteincharge') return 'siteincharge';
  return normalized;
};

exports.authenticate = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication is required' });
  }
  try {
    req.purchaseUser = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.purchaseUser.role = normalizeRole(req.purchaseUser.role);
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired authentication token' });
  }
};

exports.authorize = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.purchaseUser?.role)) {
    return res.status(403).json({ status: 'error', message: 'Your role is not allowed to perform this purchase register action' });
  }
  next();
};
