const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  receiptId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Example: "TXN-A1B2C3"
  tableId: { 
    type: Number, 
    required: true 
  },
  items: [{
    menuItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  subtotal: { 
    type: Number, 
    required: true 
  },
  total: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Card', 'UPI'], 
    required: true 
  },
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// TTL backup: receipts older than 30 days are removed from MongoDB
transactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Transaction', transactionSchema);