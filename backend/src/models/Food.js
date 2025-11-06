const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['STARTERS', 'MAIN_COURSE', 'BEVERAGES', 'DESSERTS', 'SNACKS', 'CHAAT'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    default: null
  },
  isUniversal: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
foodSchema.index({ name: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ franchiseId: 1 });
foodSchema.index({ isUniversal: 1 });
foodSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Food', foodSchema);