const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  cgst: {
    type: Number,
    required: true,
    min: 0
  },
  sgst: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'UPI'],
    required: true
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  changeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  customerDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  paidAt: {
    type: Date,
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
billSchema.index({ franchiseId: 1 });
billSchema.index({ orderId: 1 });
billSchema.index({ paidAt: -1 });

module.exports = mongoose.model('Bill', billSchema);