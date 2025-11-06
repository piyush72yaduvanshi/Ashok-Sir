import mongoose from "mongoose";

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
    enum: ['CASH', 'ONLINE'],
    required: true
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  customerDetails: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
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

billSchema.index({ franchiseId: 1 });
billSchema.index({ orderId: 1 });
billSchema.index({ paidAt: -1 });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;