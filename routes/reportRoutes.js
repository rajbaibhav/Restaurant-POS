const express = require('express');
const router = express.Router();
const {
  getThirtyDaySummary,
  getDailyTableReport,
  getSoldItemsLogs,
} = require('../controllers/reportController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Route for 30-day summary
// Protected and restricted to admin
router.get('/summary', protect, authorizeRole('admin'), getThirtyDaySummary);

// Route for daily table report
router.get('/daily/:date', protect, authorizeRole('admin'), getDailyTableReport);

// Sold items logs — table-wise itemized breakdown for a date (last 30 days retained)
router.get('/logs/:date', protect, authorizeRole('admin'), getSoldItemsLogs);

module.exports = router;
