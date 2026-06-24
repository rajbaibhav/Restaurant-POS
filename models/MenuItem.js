const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a food item name'],
    trim: true
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: [true, 'Please add a price'] 
  },
 category: { 
  type: String,
  required: [true, 'Please assign a category'],
  trim: true,
  uppercase: true,
  enum: {
    values: [
      'MOMOS','NOODLES','PAW BHAJI','DOSA','UTTAPAM',
      'BEVERAGES','SHAKE','BLOSSOM','LASSI','SOFT MOCKTAILS',
      'BEVERAGES & SHAKES','DESERT',
      'SOUP','CURDS & RAITA','SALAD','PAPAD',
      'VEG STARTER','NON VEG STARTER',
      'EAT N PARK SPECIAL',
      'MAIN COURSE (VEG)',
      'DAL','OIL FRIED CHICKEN',
      'MAIN COURSE CHICKEN','MAIN COURSE MUTTON',
      'ROTI','RICE','BIRYANI',
      'SEA FOOD','DESSERT'
    ],
    message: '{VALUE} is not a supported category'
  }
},
  image: {
    type: String,
    required: [true, 'Please provide an image URL'],
    default: 'https://via.placeholder.com/150'
  },
  isVeg: {
    type: Boolean,
    required: true,
    default: true
  },
  isAvailable: { 
    type: Boolean, 
    default: true
  },
  status: {
    type: String,
    enum: ['current', 'pending', 'not_selling'],
    default: 'current'
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);