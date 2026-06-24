const mongoose = require('mongoose');

const bornoBazarProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lettersLearned: [{ type: String }],
  wordsSpelled: [{ type: String }],
  conversationsCompleted: { type: Number, default: 0 },
  shopsBuilt: [{ type: mongoose.Schema.Types.Mixed }],
  customersServed: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  lastSessionAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('BornoBazarProgress', bornoBazarProgressSchema);
