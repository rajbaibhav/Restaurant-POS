const express = require('express');
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  getBillRegistry,
} = require('../controllers/transactionController');

const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Bill Registry — today's settlements (staff & admin)
router.get('/registry', protect, getBillRegistry);

// Route: /transactions
router.route('/')
  .post(protect, createTransaction)
  .get(protect, authorizeRole('admin'), getTransactions);

module.exports = router;