const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  designs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design', // Reference to the Design schema
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Event', EventSchema);
