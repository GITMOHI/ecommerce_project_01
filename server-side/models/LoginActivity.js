const mongoose = require("mongoose");
const User = require('../models/Users.js')

const loginActivitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  activityType: {
    type: String,
    required: true,
    enum: ['Login', 'Password Change', 'Reset Password'], 
    default: 'Login'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: String,  // IP address of the user, optional
  device: String,  // Device information, optional
  location: String,  // Location, optional
});

const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);
module.exports = LoginActivity;
