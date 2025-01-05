const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  selectedState: String,
  selectedLanguage: String,
  selectedPackage: { type: String, default: 'free' }, // 'free', 'basic', 'premium'
  paymentStatus: { type: Boolean, default: false },  // Active subscription or not
  registrationDate: { type: Date, default: Date.now },
  access: { type: String, default: 'user' }, // 'user', 'admin' , 'designer'
});

module.exports = mongoose.model('User', UserSchema);
