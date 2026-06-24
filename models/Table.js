const mongoose = require('mongoose');

// Sub-schema for the items added to a table's order
const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem', // Connects directly to our MenuItem database
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false }); // Prevents Mongoose from creating unnecessary IDs for every single food item

const tableSchema = new mongoose.Schema({
  tableId: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'PENDING_PAYMENT', 'RESERVED'],
    default: 'AVAILABLE'
  },
  label: {
    type: String, // e.g., "Owner's VIP Corner"
  },
  currentOrder: [orderItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);