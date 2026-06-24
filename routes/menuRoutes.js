const express = require('express');
const router = express.Router();
const csv = require('csvtojson');
const multer = require('multer');
const fs = require('fs');
const MenuItem = require('../models/MenuItem');

// Import Controllers and Middleware
const { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require('../controllers/menuController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const cloudUpload = require('../config/cloudinary'); // For single food images

// ---------------------------------------------------
// 1. LOCAL MULTER CONFIG (For CSV Uploads Only)
// ---------------------------------------------------
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' folder exists in your root directory!
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const localUpload = multer({ storage: localStorage });

// ---------------------------------------------------
// 2. STANDARD CRUD ROUTES
// ---------------------------------------------------
router.route('/')
  .get(protect, getMenuItems) // Staff & Admin can view
  .post(protect, authorizeRole('admin'), cloudUpload.single('image'), addMenuItem); // Admin adds 1 item

router.route('/:id')
  .put(protect, authorizeRole('admin'), cloudUpload.single('image'), updateMenuItem) // Admin edits 1 item
  .delete(protect, authorizeRole('admin'), deleteMenuItem); // Admin deletes 1 item

// ---------------------------------------------------
// 3. BULK CSV UPLOAD ROUTE
// ---------------------------------------------------
// Added Admin protection here so random users can't override your menu!
router.post('/upload-csv', protect, authorizeRole('admin'), localUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jsonArray = await csv().fromFile(req.file.path);

    const formattedData = jsonArray.map(item => ({
      name: item.name,
      description: item.description || '',
      price: isNaN(Number(item.price)) ? 0 : Number(item.price),
      category: item.category ? item.category.trim().toUpperCase() : 'GENERAL',
      isVeg: String(item.isVeg).toLowerCase() === 'true',
      isAvailable: String(item.isAvailable).toLowerCase() === 'true',
      image: item.image || 'https://via.placeholder.com/150'
    }));

    await MenuItem.insertMany(formattedData);

    // delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'CSV uploaded successfully',
      count: formattedData.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;