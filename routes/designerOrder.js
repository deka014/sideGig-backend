const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getAssignedOrderWithLatestContentSubmission, getPendingOrdersForDesigner,getAvailableOrdersForDesigner, acceptOrderForDesigners, getCompletedOrdersForDesigners} = require('../services/designerOrderService');


// for designers 

// Get available orders
router.get('/available-orders', verifyToken, async (req, res) => {
  try {
    const orders = await getAvailableOrdersForDesigner();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Accept an order
router.post('/accept-order/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const {userId} = req.user; // Extract designer ID from JWT

    const order = await acceptOrderForDesigners(orderId, userId);
    res.status(200).json({ message: 'Order accepted successfully', order });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all pending orders for a designer
router.get('/pending-orders', verifyToken, async (req, res) => {
  try {
    const {userId} = req.user // Designer ID from JWT
    const orders = await getPendingOrdersForDesigner(userId);

    // if (orders.length === 0) {
    //   return res.status(404).json({ message: 'No pending orders found.' });
    // }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all completed orders for a designer
router.get('/completed-orders', verifyToken, async (req, res) => {
  try {
    const designerId = req.user.id; // Designer ID from JWT
    const orders = await getCompletedOrdersForDesigners(designerId);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No completed orders found.' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// route for designer to get order details
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const {userId} = req.user; // Extract designer ID from JWT
    const { orderId } = req.params;
  
    // Fetch the order and ensure the designer is assigned
    const order = await getAssignedOrderWithLatestContentSubmission(orderId, userId);

    if (!order) {
      return res.status(403).json({ message: 'You are not authorized to view this order.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Failed to fetch order details.' });
  }
});




module.exports = router;
