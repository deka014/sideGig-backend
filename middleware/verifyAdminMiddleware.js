

// Middleware to check admin access
const verifyAdmin = (req, res, next) => {
    if (req.user.access !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  };