const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameBangla: { type: String },
  nickname: { type: String },
  classGrade: { type: String, default: 'প্রথম শ্রেণী' },
  role: { type: String, enum: ['child', 'parent', 'teacher', 'admin'], required: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  avatar: { type: String },
  pin: { type: String },
  schoolName: { type: String },
  teacherNotes: { type: String, default: '' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
