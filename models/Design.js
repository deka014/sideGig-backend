// models/Design.js
const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  releaseDate: { type: Date, required: true }, // Date the design becomes available
  accessLevel: { type: String, default: 'limited' }, // Options: 'limited', 'monthly', 'all'
  description: { type: String },
});

module.exports = mongoose.model('Design', DesignSchema);
