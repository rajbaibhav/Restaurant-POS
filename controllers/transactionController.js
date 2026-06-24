const Transaction = require('../models/Transactions');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const { getDayBounds } = require('../utils/dateRange');

// @desc    Securely process payment, save bill, and clear table
// @route   POST /api/transactions
// @access  Private (Staff & Admin)
const createTransaction = async (req, res) => {
  try {
    // 1. The frontend ONLY sends the Table ID and how they paid
    const { tableId, paymentMethod } = req.body;

    if (!tableId || !paymentMethod) {
      return res.status(400).json({ message: 'Table ID and Payment Method are required.' });
    }

    // 2. Look up the table securely in the DB and populate the food prices
    const table = await Table.findOne({ tableId }).populate('currentOrder.menuItemId');
    
    if (!table) return res.status(404).json({ message: 'Table not found.' });
    if (table.currentOrder.length === 0) {
      return res.status(400).json({ message: 'Cannot checkout an empty table.' });
    }

    // 3. Let the backend do all the math so it can't be faked
    let subtotal = 0;
    const billItems = [];
    const transactionItems = table.currentOrder.map(item => {
      const price = item.menuItemId ? item.menuItemId.price : 0;
      const name = item.menuItemId ? item.menuItemId.name : 'Unknown Item';
      subtotal += price * item.quantity;

      billItems.push({
        name,
        quantity: item.quantity,
        price,
      });

      return {
        menuItemId: item.menuItemId ? item.menuItemId._id : null,
        quantity: item.quantity,
      };
    });

    // Remove any null items (just in case)
    const validItems = transactionItems.filter(item => item.menuItemId !== null);

    const total = subtotal;

    // 4. Generate the Receipt ID
    const receiptId = 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 5. Save the permanent transaction
    const transaction = await Transaction.create({
      receiptId,
      tableId,
      items: validItems,
      subtotal: Math.round(subtotal),
      total: Math.round(total),
      paymentMethod,
      processedBy: req.user._id,
    });

    await Bill.create({
      receiptId,
      tableNumber: String(tableId),
      paymentMethod,
      items: billItems,
      totalAmount: Math.round(total),
    });

    // 6. Instantly clear the table for the next customer
    table.currentOrder = [];
    table.status = (table.tableId === 7) ? 'RESERVED' : 'AVAILABLE';
    await table.save();

    // 7. Send back the success response
    res.status(201).json({
      message: `Payment successful! Table ${tableId} is cleared.`,
      transaction
    });

  } catch (error) {
    res.status(400).json({ message: 'Failed to process transaction', error: error.message });
  }
};

// @desc    Get all transactions (admin master list)
// @route   GET /transactions
// @access  Private (Admin Only)
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name price')
      .populate('processedBy', 'name role');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching transactions', error: error.message });
  }
};

// @desc    Bill Registry — today's finalized settlements only
// @route   GET /transactions/registry
// @access  Private (Staff & Admin)
const getBillRegistry = async (req, res) => {
  try {
    const bounds = getDayBounds();
    if (!bounds) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const { start, end, dateLabel } = bounds;

    const transactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name price')
      .populate('processedBy', 'name role');

    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalItemsServed = transactions.reduce(
      (sum, t) => sum + t.items.reduce((acc, item) => acc + item.quantity, 0),
      0
    );

    res.json({
      date: dateLabel,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalBills: transactions.length,
        totalItemsServed,
      },
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching bill registry', error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getBillRegistry,
};