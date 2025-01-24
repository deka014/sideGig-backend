const mongoose = require('mongoose');
const Order = require('../models/Orders');
const ContentSubmission = require('../models/ContentSubmission');
const AppError = require('../customExceptions/AppError');

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

exports.getAssignedOrderWithLatestContentSubmission = async (orderId, designerId, isAdmin = false) => {
  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError('Invalid order ID', 400);
    }
    // Build the query condition
    const query = { _id: orderId }; // Always filter by orderId
    if (!isAdmin) {
      // If not an admin, ensure the designer is assigned to the order
      query.assignee = designerId;
    }

    // Fetch the order
    console.log('fetching order with query:', query);
    console.log('fetching orders');
    const order = await Order.findOne(query)
      .select('orderId userId selectedDesigns createdAt estimatedDeliveryDate status orderPreviewUrl')
      .populate({
        path: 'selectedDesigns.designId',
        select: 'title imageUrl description',
      })
      .lean();
    console.log('orders fetched');
    // Check if the order exists
    if (!order) {
      return null; // Return null if the order is not found or the designer is not assigned
    }

    // Fetch the latest Content Submission based on the userId
    console.log('fetching content submission');
    const contentSubmission = await ContentSubmission.findOne({ userId: order.userId })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .select('name title logo photo facebook instagram thread xlink website selectedPreviews createdAt');

    // Attach content submission to the response
    return {
      ...order,
      contentSubmission: contentSubmission || null, // Attach the latest content submission or null if not found
    };
  } catch (error) {
    throw error ;
  }
};



//to update orderPreviewUrl
exports.updateOrderPreviewUrl = async (orderId,dataToUpdate) => {
  try {
    const orderPreviewUrl = dataToUpdate?.orderPreviewUrl || null;
    if(!orderPreviewUrl) {
      throw new Error('Cannot update with orderPreviewUrl as null!')
    }

    const updatedOrder = await Order.findOneAndUpdate({_id : orderId},{$set:{orderPreviewUrl:orderPreviewUrl}},{new:true})
    return updatedOrder;
  } catch (error) {
    console.log('Error occured at updateOrderimagePreviewUrl Service',error)
    throw new Error('Error updating imagePreviewUrl!');
  }
}

exports.updateStatus = async (orderId,dataToUpdate) => {
  const status = dataToUpdate?.status || null;
  if(!status) {
    throw new Error('Cannot updtae sttaus with null')
  }
  try {
    const updatedOrder = await Order.findOneAndUpdate({_id:orderId},{$set:{status:status}},{new:true});
    return updatedOrder;
  } catch (error) {
    console.log('Error occured at updateOrderStatus service!',error);
    throw new Error('Error updating order sttaus!');
  }
}