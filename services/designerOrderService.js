const mongoose = require('mongoose');
const Order = require('../models/Orders');
const ContentSubmission = require('../models/ContentSubmission');

exports.getPendingOrdersForDesigner = async (designerId) => {
  try {
    // Step 1: Fetch orders with status 'Progress'
    const orders = await Order.find({
      status: { $ne: 'Delivered' }, // Exclude delivered orders
      assignee: designerId, // Ensure the order is assigned to the designer
    })
      .select('orderId selectedDesigns estimatedDeliveryDate') // Select only necessary fields
      .lean(); // Use lean for better performance
    
      console.log('Orders fetched:', orders);
    return orders;

  } catch (error) {
    console.error('Error fetching pending designs for designer:', error);
    throw new Error('Could not fetch pending designs');
  }
};

// Fetch all completed orders for a designer
exports.getCompletedOrdersForDesigners = async (designerId) => {
  try {
    const orders = await Order.find({
      status:  'Delivered' , 
      assignee: designerId, // Ensure the order is assigned to the designer
    })
      .select('orderId selectedDesigns estimatedDeliveryDate') // Select only necessary fields
      .lean(); // Use lean for better performance

      return orders;
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    throw new Error('Could not fetch completed orders');
  }
};

exports.getAvailableOrdersForDesigner = async () => {
  try {
    // Fetch all unassigned orders
    return await Order.find({ assignee: null, status: 'Progress' })
      .select('orderId orderPreviewUrl estimatedDeliveryDate createdAt status') // Select only necessary fields
      .lean();
  } catch (error) {
    console.error('Error fetching available orders:', error);
    throw new Error('Could not fetch available orders');
  }
};

exports.acceptOrderForDesigners = async (orderId, designerId) => {
  try {
    // Atomic operation to ensure order is only accepted once
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, assignee: null, status: 'Progress' }, // Ensure order is still available
      { assignee: designerId, status: 'Confirmed' }, // Assign to designer and update status
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      throw new Error('Order is no longer available for acceptance');
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error accepting order:', error);
    throw new Error('Could not accept the order');
  }
};


exports.getAssignedOrderWithLatestContentSubmission = async (orderId, designerId) => {
  try {
    // Fetch the order to verify ownership and retrieve relevant details
    const order = await Order.findOne({
      _id: orderId,
      assignee: designerId, // Verify the designer is assigned
    })
      .select('orderId userId selectedDesigns createdAt estimatedDeliveryDate status')
      .populate({
        path: 'selectedDesigns.designId',
        select: 'title imageUrl description',
      })
      .lean();
    
    if (!order) {
      return null; // Return null if the order is not found or the designer is not assigned
    }

    // Fetch the latest Content Submission based on the userId
    const contentSubmission = await ContentSubmission.findOne({ userId: order.userId })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .select('name title logo photo facebook instagram thread xlink website selectedPreviews createdAt');

    // Attach content submission to the response
    return {
      ...order,
      contentSubmission: contentSubmission || null, // Attach the latest content submission or null if not found
    };
  } catch (error) {
    console.error('Error fetching assigned order with latest content submission:', error);
    throw new Error('Failed to fetch order details.');
  }
};

