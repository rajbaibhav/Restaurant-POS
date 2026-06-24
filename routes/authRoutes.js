const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, registerUser, validateUser, getPendingUsers, getAllUsers, updateUser, deleteUser, changePassword, getMe } = require('../controllers/authController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Security: Block IPs after 5 failed login attempts in 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Public routes
router.post('/register', registerUser);
router.post('/login', login);

// Protected route — any logged-in user can fetch their own profile (for role restoration on refresh)
router.get('/me', protect, getMe);

//user can change their own password (PIN)
router.put('/change-password', protect, changePassword);

// Protected Admin routes
router.get('/pending', protect, authorizeRole('admin'), getPendingUsers);
router.get('/all-users', protect, authorizeRole('admin'), getAllUsers);
router.put('/validate/:id', protect, authorizeRole('admin'), validateUser);

//update and delete routes for admin to manage users
router.put('/update/:id', protect, authorizeRole('admin'), updateUser);
router.delete('/delete/:id', protect, authorizeRole('admin'), deleteUser);

module.exports = router;