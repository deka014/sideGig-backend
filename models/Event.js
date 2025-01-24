const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    // required: true,
    trim: true,
    default : ''
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
  // the caption for the event will be in an array
  captions: [
    {
      type: String,
    }
  ],
  hashtag: {
    type : String
  }
});

module.exports = mongoose.model('Event', EventSchema);
