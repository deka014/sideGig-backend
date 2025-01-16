// routes/order.js

const express = require('express');
const router = express.Router();
const { createOrder } = require('../services/orderService');
const { verifyToken } = require('../middleware/authMiddleware');
const { placeOrder,getUserOrders,viewOrder} = require('../services/orderService');

// deprecated route - dont use

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


// Place Order Route
router.post('/place-order', verifyToken, async (req, res) => {
  try {
    const {userId} = req.user // Extract user ID from the JWT token
    console.log('Request userId:', userId);
    const { selectedDesigns, price, additionalInfo } = req.body;

    if (!selectedDesigns || selectedDesigns.length === 0) {
      return res.status(400).json({ message: 'No designs selected for the order' });
    }

    const order = await placeOrder(userId, selectedDesigns, price, additionalInfo);

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get All Orders for a User
router.get('/user-orders', verifyToken, async (req, res) => {
  try {
    const {userId} = req.user; // Extract user ID from JWT token

    const orders = await getUserOrders(userId);

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// View Order Route
router.get('/view-order/:orderId', verifyToken, async (req, res) => {
  try {
    const {userId} = req.user // Extract user ID from JWT token
    let isAdmin = false;
    if(req.user.access == 'admin'){
      isAdmin = true;
    }
    const { orderId } = req.params; // Get orderId from the URL
   
    const order = await viewOrder(orderId, userId, isAdmin);

    res.status(200).json({
      message: 'Order fetched successfully',
      order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(403).json({ message: error.message });
  }
});
 


module.exports = router;