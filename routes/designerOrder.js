const express = require('express');
const router = express.Router();
const { verifyToken, verifyDesigner } = require('../middleware/authMiddleware');
const { getAssignedOrderWithLatestContentSubmission, getPendingOrdersForDesigner,getAvailableOrdersForDesigner, acceptOrderForDesigners, getCompletedOrdersForDesigners, updateOrderPreviewUrl, updateStatus} = require('../services/designerOrderService');


// for designers 

// Get available orders
router.get('/available-orders', verifyToken, verifyDesigner, async (req, res) => {
  try {
    const orders = await getAvailableOrdersForDesigner();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Accept an order
router.post('/accept-order/:orderId', verifyToken,verifyDesigner, async (req, res) => {
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
router.get('/pending-orders', verifyToken, verifyDesigner, async (req, res) => {
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
router.get('/completed-orders', verifyToken, verifyDesigner, async (req, res) => {
  try {
    const designerId = req.user.userId; // Designer ID from JWT
    
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
router.get('/order/:orderId', verifyToken, verifyDesigner, async (req, res) => {
  try {
    const {userId} = req.user; // Extract designer ID from JWT
    const { orderId } = req.params;
    const id = orderId.replace(':','');
    let isAdmin = false;

    if(req.user.access == 'admin'){
      isAdmin = true;
    }
    // Fetch the order and ensure the designer is assigned
    const order = await getAssignedOrderWithLatestContentSubmission(id, userId,isAdmin);

    if (!order) {
      return res.status(403).json({ message: 'You are not authorized to view this order.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Failed to fetch order details.' });
  }
});

//route to update the OrderPreviewUrl
router.patch('/view-order/update-orderPreviewUrl/:orderId',verifyToken,verifyDesigner, async (req,res) => {
  try {
    const {orderId} = req.params;
    const id = orderId.replace(':','');
    const { orderPreviewUrl } = req.body;
    const dataToUpdate = {
      orderPreviewUrl
    }

    const updatedOrder = await updateOrderPreviewUrl(orderId,dataToUpdate)

    res.status(200).json({success:true,message:'Update Success', updatedOrder})
  } catch (error) {
    console.log('Error updating order')
    res.status(500).json({success:false,message:'Failed to update imagePreviewUrl'})
  }
})

//route to update the status
router.patch('/view-order/update-status/:orderId',verifyToken,verifyDesigner, async (req,res) => {
  try {
    const {orderId} = req.params;
    const id = orderId.replace(':','');
    const { status } = req.body;
    const dataToUpdate = {
      status
    }

    const updatedOrder = await updateStatus(id,dataToUpdate)

    res.status(200).json({success:true,message:'Update Success', updatedOrder})
  } catch (error) {
    console.log('Error updating order')
    res.status(500).json({success:false,message:'Failed to update status'})
  }
})
module.exports = router;
