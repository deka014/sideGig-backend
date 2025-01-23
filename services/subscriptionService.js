// services/subscriptionService.js
const User = require('../models/Users');
const packages = require('../config/packages');
const AppError = require('../customExceptions/AppError');

// Select Package
exports.selectPackage = async (userId, packageName) => {
  const selectedPackage = packages[packageName];
  if (!selectedPackage) {
    throw new Error('Invalid package name');
  }

  // Find the user in the database
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Return selected package details for the user
  return {
    success: true,
    message: `Selected package: ${selectedPackage.name}, amount: ${selectedPackage.price}`,
    package: selectedPackage,
  };
};

// Initiate Payment
exports.initiatePayment = async (userId, packageName) => {
  const selectedPackage = packages[packageName];
  if (!selectedPackage) {
    throw new Error('Invalid package name');
  }

  // Placeholder logic for initiating payment
  // In production, you’d initiate a real payment with a payment gateway
  return {
    success: true,
    message: 'Payment initiated successfully. Complete payment to activate subscription.',
  };
};

// Verify Payment
exports.verifyPayment = async (userId, packageName) => {
  const selectedPackage = packages[packageName];
  if (!selectedPackage) {
    throw new Error('Invalid package name');
  }

  // Placeholder logic for payment verification
  // In production, you’d verify the payment status with the payment gateway

  // Update user subscription details upon successful payment
  const user = await User.findByIdAndUpdate(
    userId,
    {
      paymentStatus: true,
      selectedPackage: selectedPackage.name,
    },
    { new: true } // Return the updated document
  );

  if (!user) {
    throw new Error('User not found');
  }

  return {
    success: true,
    message: `Payment verified. Subscription activated for ${selectedPackage.name}.`,
    user,
  };
};


// find the price of the package from users

exports.findPackagePrice = async (userId) => {
  // only the package price is needed

  const userPrice = await User.findById(userId, { price: 1 });

  if (!userPrice) {
    throw new AppError('User or package not found ', 400);
  }

  return userPrice;
}
