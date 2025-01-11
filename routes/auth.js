// routes/auth.js
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// @route   POST /api/auth/send-otp
// @desc    Send OTP to the user's phone number
// @access  Public
router.post('/send-otp', async (req, res) => {
    console.log('In /send-otp')
    const { phoneNumber } = req.body;
    try {
        const result = await authService.sendOtp(phoneNumber);
        return res.status(200).json(result); // Return response to client
    } catch (error) {
        console.error('Error in sendOtp controller:', error);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and authenticate user
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const { user, token } = await authService.verifyOtp(phoneNumber, otp);
        // save the user 

        return res.status(200).json({
            success: true,
            token,
            data: {
                userId: user._id,
                access: user.access,                                
                phoneNumber: user.phoneNumber,
            },
        }); // Return response to client
    } catch (error) {
        console.error('Error in verifyOtp controller:', error);
        return res.status(400).json({ success: false, error: error.message });
    }
});

// @route   POST /api/auth/decode-jwt
// @desc    Decode JWT token
router.post('/decode-jwt' , async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = authService.decodeJwt(token);
        return res.status(200).json({ success: true, data: decoded });
    } catch (error) {
        console.error('Error in decodeJwt controller:', error);
        return res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
