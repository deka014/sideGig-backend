const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User schema
    required: true,
  },
  selectedDesigns: [
    {
      designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design', // Reference to the Design schema
        required: true,
      },
      deliverUrl: {
        type: String, // Personalized delivery URL for the design
        default: null,
      },
      status: {
        type: String,
        enum: ['Processing', 'Completed' , 'cancelled'], // Delivery status for the design
        default: 'Processing',
      },
      deliveredDate: {
        type: Date, // Date when the design was delivered
        default: null,
      },
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Confirmed', 'Delivered', 'Cancelled'], // Possible order statuses
    default: 'In Progress',
  },
  additionalInfo: {
    type: String,
    default: null,
  },
  orderPreviewUrl: {
    type: String, // URL for the preview image of the order
    default: null,
  },
  estimatedDeliveryDate: {
    type: Date, // Estimated delivery date of the order
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', OrderSchema);
