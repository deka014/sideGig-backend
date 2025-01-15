const User = require("../models/Users");

const checkUserPaymentStatus = async (req, res, next) => {
  try {

    if (req.user.access === 'admin' ) {
      return next();
    }

    const userId = req.user.userId; // Assuming `req.user` is set by a previous middleware (like `verifyToken`)
    
    const userPaymentStatus = await User.findOne({ _id: userId }).select('paymentStatus');
    
    if (!userPaymentStatus || !userPaymentStatus.paymentStatus) {
      return res.status(402).json({
        message: 'Payment not complete. If you have already made payment, please contact support.',
      });
    }
    
    // If payment is complete, move to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error checking user payment status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = checkUserPaymentStatus;