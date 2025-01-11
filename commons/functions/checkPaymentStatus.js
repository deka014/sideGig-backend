const User = require("../../models/Users");

const checkUserPaymentStatus = async (userId) => {
    try {
      const userPaymentStatus = await User.findOne({ _id: userId }).select('paymentStatus');
      
      if (!userPaymentStatus || !userPaymentStatus.paymentStatus) {
        const error = new Error('Payment not complete. If you have already made payment, please contact support.');
        error.statusCode = 402;
        throw error;
      }
      
      return true; // Payment is complete
    } catch (error) {
      throw error;
    }
  };

  module.exports = checkUserPaymentStatus;
  