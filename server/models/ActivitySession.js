const mongoose = require('mongoose');

const activitySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feature: { type: String },
  activityType: { type: String },
  score: { type: Number },
  starsEarned: { type: Number, default: 0 },
  accuracy: { type: Number },
  durationMs: { type: Number },
  details: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('ActivitySession', activitySessionSchema);
