// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  selectedState: String,
  selectedLanguage: String,
  selectedPackage: { type: String, default: 'free' }, // 'free', 'basic', 'premium'
  paymentStatus: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);



