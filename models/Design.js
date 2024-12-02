const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  selectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User who selected the design
  deliverUrl: { type: String, default: null }, // URL where the design is delivered
  delivered: { type: Boolean, default: false }, // Delivery status
  deliveredDate: { type: Date, default: null }, // Date when the design was delivered
  eventTitle: { type: String, default: null }, // Event title associated with this design
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the design
  status: { type: String, enum: ['available', 'selected'], default: 'available' },
  // releaseDate: { type: Date, required: true }, // Date the design becomes available
  // accessLevel: { type: String, default: 'limited' }, // Options: 'limited', 'monthly', 'all'
});

module.exports = mongoose.model('Design', DesignSchema);
