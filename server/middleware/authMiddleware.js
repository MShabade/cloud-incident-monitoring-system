const jwt = require('jsonwebtoken');

// Gatekeeper Middleware: Verifies if the user is logged in via JWT
exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no security token provided' });
  }
};

// Role-Based Access Control (RBAC) Middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access Denied: Your role (${req.user.role}) does not have permission to perform this action.`
      });
    }
    next();
  };
};