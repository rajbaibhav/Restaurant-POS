const express = require('express');
const router = express.Router();
const { 
  getTables, 
  updateTableOrder, 
  generateRunningBill, 
  clearTable,
  createTable,
  updateTable,
  deleteTable
} = require('../controllers/tableController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

// Route: /api/tables
router.route('/')
  .get(protect, getTables)
  .post(protect, authorizeRole('admin'), createTable);

// Route: /api/tables/:id
// Update or delete table config
router.route('/:id')
  .put(protect, authorizeRole('admin'), updateTable)
  .delete(protect, authorizeRole('admin'), deleteTable);

// Route: /api/tables/:id/order
// Used to push items from the OrderModule into the database
router.route('/:id/order')
  .put(protect, updateTableOrder);

// Route: /api/tables/:id/bill
// Used to generate the live Proforma Invoice with calculated totals
router.route('/:id/bill')
  .get(protect, generateRunningBill);

// Route: /api/tables/:id/clear
// Used to reset the table immediately after a transaction is saved
router.route('/:id/clear')
  .put(protect, clearTable);

module.exports = router;