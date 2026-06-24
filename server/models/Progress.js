const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalStars: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  currentLevel: { type: Number, default: 1 },
  skills: { type: Map, of: Number, default: {} },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
