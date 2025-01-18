// services/authService.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/Users');
const AppError = require('../customExceptions/AppError');

dotenv.config();

let otpStorage = {};

// Utility function to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// Set OTP expiration (in milliseconds)
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes


exports.verifyOtp = async (phoneNumber, otp) => {
  try {
    
    if (!/^\d{10}$/.test(phoneNumber)) {
      throw new AppError('Invalid phone number. It must be exactly 10 digits.', 400);
    }

    console.log('verifyOtp is running for:', phoneNumber);

    if (
      phoneNumber in otpStorage &&
      otpStorage[phoneNumber].otp === otp &&
      otpStorage[phoneNumber].expiresAt > Date.now()
    ) {
      // OTP is valid; remove it from storage
      delete otpStorage[phoneNumber];
      // Check if user already exists, if not, create a new one
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        // If this is a new user, you may want to initialize more details as needed
        user = new User({ phoneNumber });
        await user.save(); // Save the user after successful verification
      }
      // Generate JWT token with additional user details
      const tokenPayload = {
        userId: user._id,
        selectedPackage: user.selectedPackage,
        paymentStatus : user.paymentStatus,
        access: user.access
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return { user, token }; // Return the user object and the token
    } else {
      throw new AppError('Invalid OTP or Expired', 400);
    }
  } catch (error) {
    console.log('Error in verifyOtp service');
    throw error;
  }
};

exports.sendOtp = async (phoneNumber) => {
  try {
    if (!/^\d{10}$/.test(phoneNumber)) {
      const err = new Error(`Invalid phone number = ${phoneNumber}. It must be exactly 10 digits.`);
      err.status = 400;
      throw new AppError('Invalid phone number. It must be exactly 10 digits.', 400);
    }
    console.log('sendOtp is running for:', phoneNumber);
    // const otp = generateOtp();
    // TEST
    const otp = 123456;
    const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
    otpStorage[phoneNumber] = { otp, expiresAt };

    // Simulate sending OTP (replace with actual SMS service in production)
    console.log(`OTP for ${phoneNumber} successfully sent: ${otp}`);
    return { success: true, message: 'OTP sent successfully' };

  } catch (error) {
    console.error('Error in sendOtp service');
    throw error;

  }
};


exports.decodeJwt = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Error in decodeJwt:', error);
    throw new Error('Invalid token');
  }
};



