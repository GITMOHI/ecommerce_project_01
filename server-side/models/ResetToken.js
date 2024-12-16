const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reset Token Schema
const resetTokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

module.exports = ResetToken;
