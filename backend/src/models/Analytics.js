const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalOrders: {
    type: Number,
    required: true,
    min: 0
  },
  totalRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  totalExpenses: {
    type: Number,
    required: true,
    min: 0
  },
  netProfit: {
    type: Number,
    required: true
  },
  grossProfit: {
    type: Number,
    required: true
  },
  averageOrderValue: {
    type: Number,
    required: true,
    min: 0
  },
  popularItems: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  peakHours: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
analyticsSchema.index({ franchiseId: 1 });
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);