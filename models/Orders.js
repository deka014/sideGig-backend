const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String
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
    type: Number, // Total price of the order
  },
  status: {
    type: String,
    enum: ['Progress', 'Confirmed', 'Delivered', 'Cancelled'], // Possible order statuses
    default: 'Progress',
  },
  additionalInfo: {
    type: String,
    default: null,
  },
  orderPreviewUrl: {
    type: String, // URL for the preview image of the order
    default: 'https://images.unsplash.com/photo-1593175692310-7b1bedb76360?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8b3JkZXJzfGVufDB8fDB8fHww',
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
