const mongoose = require('mongoose');

const ContentSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Link to the User
  name: String,
  title: String,
  logo: String, // Path to the uploaded logo image
  photo: String, // Path to the uploaded photo image
  facebook: String,
  instagram: String,
  thread: String,
  xlink: String,
  website: String,
  selectedPreviews: [Number],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ContentSubmission', ContentSubmissionSchema);
