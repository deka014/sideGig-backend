// routes/subscription.js
const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/Users');

// Select Package Route
router.post('/select-package/:packageName', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const packageName = req.params.packageName;
    const response = await subscriptionService.selectPackage(userId, packageName);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error selecting package:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Initiate Payment Route
router.post('/initiate-payment',verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from decoded token
    const { packageName } = req.body;
    const response = await subscriptionService.initiatePayment(userId, packageName);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error initiating payment:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Verify Payment Route
router.post('/verify-payment',verifyToken,async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from decoded token
    const { packageName } = req.body;
    const response = await subscriptionService.verifyPayment(userId, packageName);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});


router.get('/check-payment-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      paymentStatus: user.paymentStatus,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

router.get('/check-package', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      selectedPackage: user.selectedPackage,
    });
    
  } catch (error) {
    console.error('Error checking package status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

module.exports = router;
