const MenuItem = require('../models/MenuItem');

// @desc    Fetch all menu items
// @route   GET /api/menu
// @access  Private (Staff & Admin)
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching menu', error: error.message });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private (Admin only)
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, isAvailable } = req.body;

    // Grab the Cloudinary URL from the uploaded file via Multer
    const imageUrl = req.file ? req.file.path : 'https://via.placeholder.com/150';

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      image: imageUrl,
      isVeg,
      isAvailable
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid menu item data', error: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin only)
const updateMenuItem = async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Copy everything from the request body
    const updateData = { ...req.body };

    // If a new image was uploaded via Multer, overwrite the old image URL
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true } 
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update item', error: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await menuItem.deleteOne();
    res.json({ message: `${menuItem.name} removed from menu` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};