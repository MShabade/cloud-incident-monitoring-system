const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Guest', 'User', 'Administrator'],
    default: 'User'
  }
}, {
  timestamps: true 
});

// Modernized Pre-Save Hook (No 'next' callback required for async/await)
UserSchema.pre('save', async function () {
  // If the password hasn't changed, exit early and let the promise resolve
  if (!this.isModified('password')) return;

  // Modern async error handling handles rejections automatically
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
