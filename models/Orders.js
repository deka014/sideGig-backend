const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  selectedDesigns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design', // Reference to the Design schema
      required: true,
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
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
