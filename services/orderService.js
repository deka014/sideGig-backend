// services-> orderServcie.js

const ContentSubmission = require('../models/ContentSubmission');
const Order = require('../models/Orders');

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
