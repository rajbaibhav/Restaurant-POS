const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  receiptId: {
    type: String,
    required: true,
  },
  tableNumber: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI'],
    required: true,
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d', // MongoDB TTL: auto-delete after 30 days
  },
});

module.exports = mongoose.model('Bill', billSchema);
