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
      eventTitle: {
        type: String, // Title of the event
        required: true,
      },
      eventDate : {
        type: Date,
        required: true
      },
      designId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'Design', // Reference to the Design schema
        required: true,
      },
      designImage: {
        type: String, // URL for the design image
        required: true,
      },
      owner: {
        type : mongoose.Schema.Types.ObjectId,
        default: null
      }, // Pre-embed owner
      deliverUrl: {
        type: String, // Personalized delivery URL for the design if required
        default: null,
      },     
      caption : {
        type: String,
        default: null
      }
      , // Caption for the design
      hashtag : {
        type: String,
        default: null
      } // Hashtag for the design
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
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  selectedPackage : {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Order', OrderSchema);
