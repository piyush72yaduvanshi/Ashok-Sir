const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'FRANCHISE_ADMIN'],
    default: 'FRANCHISE_ADMIN'
  },
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ franchiseId: 1 });

module.exports = mongoose.model('User', userSchema);