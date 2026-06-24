const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, pin } = req.body; 

  try {
    const isFirstAccount = (await User.countDocuments({})) === 0;
    
    const role = isFirstAccount ? 'admin' : 'staff';
    const status = isFirstAccount ? 'approved' : 'pending';

    const user = await User.create({ name, pin, role, status });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      status: user.status,
      message: isFirstAccount 
        ? 'Admin account created successfully!' 
        : 'Registration successful! Please wait for an admin to approve your account.'
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid data. Name might already be taken.', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { name, pin } = req.body;

  try {
    const user = await User.findOne({ name });

    if (user && (await user.matchPin(pin))) {
      if (user.status === 'pending') {
        return res.status(403).json({ message: 'Your account is still pending admin approval.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid name or PIN' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Validate/Approve a pending staff member
// @route   PUT /api/auth/validate/:id
const validateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'approved';
    await user.save();

    res.json({ message: `${user.name} has been approved and can now log in.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (for staff management)
// @route   GET /api/auth/all-users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-pin');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged-in user's profile (used for role restoration on page refresh)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      status: req.user.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all pending users (awaiting admin approval)
// @route   GET /api/auth/pending
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select('-pin');
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user details (Name, Role, Status, or securely reset PIN)
// @route   PUT /api/auth/manage/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;

    // Admin resetting someone else's PIN
    if (req.body.newPin || req.body.confirmNewPin) {
      const { newPin, confirmNewPin } = req.body;

      if (!newPin || !confirmNewPin) {
        return res.status(400).json({ message: 'Please provide both new PIN and confirm new PIN.' });
      }
      if (newPin !== confirmNewPin) {
        return res.status(400).json({ message: 'The new PINs do not match.' });
      }
      if (newPin.length !== 4) {
        return res.status(400).json({ message: 'PIN must be exactly 4 digits.' });
      }

      user.pin = newPin; 
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/auth/manage/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    await user.deleteOne();
    
    res.json({ message: `${user.name} has been removed from the system.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change own password (PIN)
// @route   PUT /api/auth/change-password
// @access  Private (Any logged-in user)
const changePassword = async (req, res) => {
  const { newPin, confirmNewPin } = req.body;

  if (!newPin || !confirmNewPin) {
    return res.status(400).json({ message: 'Please provide both new PIN and confirm new PIN.' });
  }
  if (newPin !== confirmNewPin) {
    return res.status(400).json({ message: 'The new PINs do not match.' });
  }
  if (newPin.length !== 4) {
    return res.status(400).json({ message: 'PIN must be exactly 4 digits.' });
  }

  try {
    // Finds the user automatically based on their logged-in token
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.pin = newPin;
    await user.save(); 

    res.json({ message: 'Your password has been changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  registerUser, 
  login,
  getMe,
  validateUser, 
  getAllUsers,
  getPendingUsers, 
  updateUser, 
  deleteUser,
  changePassword,
};