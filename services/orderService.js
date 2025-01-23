// services-> orderServcie.js

const ContentSubmission = require('../models/ContentSubmission');
const Order = require('../models/Orders');
const Design = require('../models/Design');
const User = require('../models/Users');
const mongoose = require('mongoose');
const AppError = require('../customExceptions/AppError');

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
    const user = await User.findById(userId);

    if(!user) {
      throw new AppError('User not found', 400);
    }

    if (designs.length !== selectedDesigns.length) {
      throw new Error('One or more design IDs are invalid or do not exist.');
    }

    // Check and update each design
    const updatedDesigns = [];
    for (const design of designs) {
      design.selectedCount = (design.selectedCount || 0) + 1;

      // Update status if selectedCount exceeds 20
      if (design.selectedCount > 15) {
        design.status = 'unavailable';
      }

      await design.save();

      updatedDesigns.push({
        designId: design._id,
        designImage: design.imageUrl,
        owner : design.owner
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
      estimatedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 days from now
    });

    const savedOrder = await newOrder.save();

    console.log('Order saved:', savedOrder);

    // mark user payment status as false 

    user.paymentStatus = false;
    user.selectedPackage = 'free';
    user.price = 0;

    const savedUser = await user.save();

    console.log('User saved:', savedUser); 
    

    //trim the savedOrder object to return only the necessary fields
    const orderDTO = {
      mongoOrderId: savedOrder._id,
      orderId: savedOrder.orderId,
      userId: savedOrder.userId,
      estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
      price: savedOrder.price,
      additionalInfo: savedOrder.additionalInfo,
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


exports.viewOrder = async (orderId, userId, isAdmin) => {
  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid Order ID');
    }

    // Build the query condition
    const query = { _id: orderId }; // Always check by orderId
    if (!isAdmin) {
      // If not an admin, ensure the order belongs to the user
      query.userId = userId;
    }

    // Fetch the order
    const order = await Order.findOne(query)
      .populate('selectedDesigns.designId', 'title imageUrl description') // Populate design details
      .exec();

    // Check if the order exists
    if (!order) {
      throw new Error('Order not found or access denied');
    }

    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};


// for admin only + pagination

exports.getAllOrders = async (page, status, userId, assigneeId, limit = 10) => {
  try {
    const filter = {}; // Initialize an empty filter object
    // capi is the status of the order
    status = status && status.charAt(0).toUpperCase() + status.slice(1); // Capitalize the status
    // If a status is provided, add it to the filter
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (userId && userId !== 'all' && userId !== '') {
      filter.userId = userId; ;
    };
    if (assigneeId && assigneeId !== 'all' && assigneeId !== '') {
      filter.assignee = assigneeId;
    };
    console.log(filter);

    // Fetch orders with filtering, pagination, and sorting
    const orders = await Order.find(filter)
      .populate('assignee', 'phoneNumber') // Populate assignee field
      .populate('userId', 'phoneNumber') // Populate userId field
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .select('-selectedDesigns') // Exclude selectedDesigns field
      .skip((page - 1) * limit) // Skip records for pagination
      .limit(limit); // Limit the number of results per page

    console.log('Orders fetched:', orders);

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};




// for admin all pending orders for all designers assignee is not null , status: 'Confirmed' 
// get the assignee name from user 
exports.getAllPendingOrdersFromDesigners = async () => {
  try {
    const orders = await Order.find({status: 'Confirmed' } , {selectedDesigns : 0}).populate('assignee', 'phoneNumber')
      .sort({ createdAt: -1 }).exec() // Sort by createdAt descending

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error( 'Failed to fetch orders');
  }
}

// get all completed orders with pagination 

exports.getAllCompletedOrders = async (page, limit = 30) => {
  try {
    const orders = await Order.find({status: 'Delivered' }, {selectedDesigns : 0})
      .sort({ createdAt: -1 }) // Sort by createdAt descending
      .skip((page - 1) * limit) // Skip to the correct page
      .limit(limit); // Limit the number of results per page

    console.log('Orders fetched:', orders);

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error( 'Failed to fetch orders');
  }
}






