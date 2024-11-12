// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  selectedState: String,
  selectedLanguage: String,
  selectedPackage: { type: String, default: 'free' }, // 'free', 'basic', 'premium'
  paymentStatus: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now }, // When the user registered
  subscriptionStart: { type: Date, default: null }, // Start date of subscription
  subscriptionEnd: { type: Date, default: null },   // End date of subscription
});

module.exports = mongoose.model('User', UserSchema);



