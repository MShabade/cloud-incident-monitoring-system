const jwt = require('jsonwebtoken');

// 1. Gatekeeper Middleware: Verifies if the user is logged in via JWT
exports.protect = (req, res, next) => {
  let token;

  // Check if the token is sent in the incoming request headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the "Bearer <TOKEN>" format
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key from the .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user's ID and role directly to the request object for later use
      req.user = decoded;
      
      // Everything looks good! Move to the next function (the controller)
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  // If no token was found in the headers at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no security token provided' });
  }
};

// 2. Role-Based Access Control (RBAC) Middleware: Restricts endpoints to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user was just created by the 'protect' middleware right above!
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access Denied: Your role (${req.user.role}) does not have permission to perform this action.` 
      });
    }
    next();
  };
};