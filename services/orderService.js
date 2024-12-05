// services-> orderServcie.js

const ContentSubmission = require('../models/ContentSubmission');
const Order = require('../models/Orders');
const Design = require('../models/Design');
const mongoose = require('mongoose');

exports.createOrder = async (userId, assignee, selectedCreative) => {
  try {
    console.log('userId:', userId);
    console.log('selectedCreative:', selectedCreative);

    if (!selectedCreative) {
      throw new Error('Selected creative is required.');
    }

    //fetching single content submission entry for the given userId
    const contentSubmission = await ContentSubmission.findOne({ userId });
    console.log('ContentSubmission:', contentSubmission);

    if (!contentSubmission) {
      throw new Error('No content submission found for the user.');
    }

    //contentSubmission data
    const contentSnapshot = { 
      name: contentSubmission.name,
      title: contentSubmission.title,
      logo: contentSubmission.logo,
      photo: contentSubmission.photo,
      facebook: contentSubmission.facebook,
      instagram: contentSubmission.instagram,
      thread: contentSubmission.thread,
      xlink: contentSubmission.xlink,
      website: contentSubmission.website,
      selectedPreviews: contentSubmission.selectedPreviews,
      submissionCreatedAt: contentSubmission.createdAt
     };

    const newOrder = new Order({
      userId,
      assignee: assignee || null,
      selectedCreative,
      contentSnapshot,
    });

    // Save the new order to the database
    const savedOrder = await newOrder.save();
    console.log('Order saved:', savedOrder);

    return savedOrder;
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw new Error('Failed to create order');
  }
};


const generateReadableOrderId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomId = Array.from({ length: 6 })
    .map(() => characters[Math.floor(Math.random() * characters.length)])
    .join('');
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  return `ORD-${timestamp}-${randomId}`;
};

exports.placeOrder = async (userId, selectedDesigns, price, additionalInfo) => {
  try {
    // Validate All Design IDs
    const designs = await Design.find({ _id: { $in: selectedDesigns } });

    if (designs.length !== selectedDesigns.length) {
      throw new Error('One or more design IDs are invalid or do not exist.');
    }

    // Check and update each design
    const updatedDesigns = [];
    for (const design of designs) {
      design.selectedCount = (design.selectedCount || 0) + 1;

      // Update status if selectedCount exceeds 20
      if (design.selectedCount > 20) {
        design.status = 'unavailable';
      }

      await design.save();

      updatedDesigns.push({
        designId: design._id,
        deliverUrl: null, // Placeholder for the personalized URL
        status: 'Processing',
      });
    }

    // Generate a human-readable order ID
    const orderId = generateReadableOrderId();

    // Create the order
    const newOrder = new Order({
      orderId,
      userId,
      selectedDesigns: updatedDesigns,
      price,
      additionalInfo,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    const savedOrder = await newOrder.save();
    console.log('Order saved:', savedOrder);

    //trim the savedOrder object to return only the necessary fields
    const orderDTO = {
      mongoOrderId: savedOrder._id,
      orderId: savedOrder.orderId,
      userId: savedOrder.userId,
      estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,

    };

    return orderDTO;
  } catch (error) {
    console.error('Error in placeOrder service:', error);
    throw error;
  }
};


exports.getUserOrders = async (userId) => {
  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) // Sort by createdAt descending
      .select('-selectedDesigns') // Exclude the selectedDesigns field
      .limit(10); // Limit to 10 orders

    console.log('Orders fetched:', orders);

    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error('Failed to fetch orders');
  }
};


exports.viewOrder = async (orderId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid Order ID');
    }

    const order = await Order.findOne({ _id: orderId}) // Use _id for MongoDB ObjectId
      .populate('selectedDesigns.designId', 'title imageUrl description') // Populate design details
      .exec();

    if (!order) {
      throw new Error('Order not found or access denied');
    }

    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

