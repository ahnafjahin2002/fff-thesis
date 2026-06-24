const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['child', 'parent', 'teacher', 'admin'], required: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  avatar: { type: String },
  pin: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
