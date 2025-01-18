// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.verifyToken = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user ID to the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};



// Middleware to check admin access
exports.verifyAdmin = (req, res, next) => {
  if (req.user.access !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};


// Middleware to check designer access but admin have access too
exports.verifyDesigner = (req, res, next) => {

  if(req.user.access === 'admin'){
   return next()
  }
  
  if (req.user.access !== 'designer') {
    return res.status(403).json({ message: 'Access denied. Designers only.' });
  }
  next();
};

