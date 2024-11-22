// routes/order.js

const express = require('express');
const router = express.Router();
const { createOrder } = require('../services/orderService');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create-order', verifyToken, async (req, res) => {
  try {
    // Extract the userId from the verified token attached to req.user
    const { userId } = req.user;                  

    // Extract `assignee` and `selectedCreative` from the request body
    const { assignee, selectedCreative } = req.body;

    // Log the userId to verify it is correctly extracted from the token
    console.log('Request userId:', userId);

    // Log the request body
    console.log('Request body:', req.body);

    // Check if `selectedCreative` is provided in the request
    if (!selectedCreative) {
      return res.status(400).json({ message: 'Selected creative is required' });
    }

    // Call the createOrder function, passing the extracted userId, assignee and selectedCreative
    const newOrder = await createOrder(userId, assignee, selectedCreative);

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    // Log the error to the console for debugging purposes
    console.error('Error creating order:', error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;