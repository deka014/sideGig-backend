const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  title: { type: String, required: true }, // title of the design
  imageUrl: { type: String, required: true }, // image url of the design
  description: { type: String }, // description of the design
  selectedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ], // User who selected the design
  maxSelections: { type: Number, default: 20 }, // Maximum number of users who can select this design
  selectedCount: { type: Number, default: 0 }, // Tracks the number of users who have selected the design
  eventTitle: { type: String, default: null }, // Event title associated with this design
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the design
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  isPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Design', DesignSchema);