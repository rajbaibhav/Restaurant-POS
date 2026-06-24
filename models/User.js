const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'],
    unique: true // Prevents duplicate names
  },
  role: { 
    type: String, 
    enum: ['admin', 'staff'], 
    default: 'staff' 
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  pin: { 
    type: String, 
    required: [true, 'Please add a 4-digit PIN'],
    minlength: 4
  }
}, { timestamps: true });

// Pre-save hook: Hash the PIN before saving
userSchema.pre('save', async function() {
  if (!this.isModified('pin')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
});

// Custom method to compare entered PIN
userSchema.methods.matchPin = async function(enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);