const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

// @desc    Get all tables (Auto-generates tables 1-7 if DB is empty)
// @route   GET /api/tables
// @access  Private (Staff & Admin)
const getTables = async (req, res) => {
  try {
    let tables = await Table.find({}).sort({ tableId: 1 });

    // Auto-create tables if they don't exist yet
    if (tables.length === 0) {
      const defaultTables = Array.from({ length: 7 }, (_, i) => ({
        tableId: i + 1,
        status: (i + 1 === 7) ? 'RESERVED' : 'AVAILABLE',
        label: (i + 1 === 7) ? "Owner's VIP Corner" : "",
        currentOrder: []
      }));
      await Table.insertMany(defaultTables);
      tables = await Table.find({}).sort({ tableId: 1 });
    }

    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching tables', error: error.message });
  }
};

// @desc    Add new items to a table's current order
// @route   PUT /api/tables/:id/order
// @access  Private (Staff & Admin)
// @desc    Add new items to a table's current order
// @route   PUT /api/tables/:id/order
// @access  Private (Staff & Admin)
const updateTableOrder = async (req, res) => {
  try {
    const table = await Table.findOne({ tableId: req.params.id });
    if (!table) return res.status(404).json({ message: 'Table not found' });

    const newItems = req.body.items; 

    // ✅ SAFETY CHECK: Ensure newItems exists and is an array
    if (!newItems || !Array.isArray(newItems) || newItems.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of items to add.' });
    }

    newItems.forEach(newItem => {
      const existingItemIndex = table.currentOrder.findIndex(
        (order) => order.menuItemId.toString() === newItem.menuItemId
      );

      if (existingItemIndex > -1) {
        table.currentOrder[existingItemIndex].quantity += newItem.quantity;
        if (newItem.notes) table.currentOrder[existingItemIndex].notes = newItem.notes;
      } else {
        table.currentOrder.push(newItem);
      }
    });

    table.status = 'OCCUPIED';
    await table.save();

    res.json(table);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add items to table', error: error.message });
  }
};

// @desc    Generate a running bill preview (Calculates totals without finalizing)
// @route   GET /api/tables/:id/bill
// @access  Private (Staff & Admin)
const generateRunningBill = async (req, res) => {
  try {
    const table = await Table.findOne({ tableId: req.params.id }).populate('currentOrder.menuItemId');
    if (!table) return res.status(404).json({ message: 'Table not found' });

    if (table.currentOrder.length === 0) {
      return res.status(400).json({ message: 'No items ordered for this table yet.' });
    }

    let subtotal = 0;
    const itemizedBill = table.currentOrder.map(item => {
      // ✅ SAFETY CHECK: If the menu item was deleted from the DB mid-meal, fallback to safe defaults
      const price = item.menuItemId ? item.menuItemId.price : 0;
      const name = item.menuItemId ? item.menuItemId.name : 'Unknown/Deleted Item';
      
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        name: name,
        pricePerItem: price,
        quantity: item.quantity,
        totalPrice: itemTotal
      };
    });

    const total = subtotal;

    table.status = 'PENDING_PAYMENT';
    await table.save();

    res.json({
      tableId: table.tableId,
      items: itemizedBill,
      subtotal: Math.round(subtotal),
      total: Math.round(total)
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to generate bill', error: error.message });
  }
};

// @desc    Clear a table after payment is completely finished
// @route   PUT /api/tables/:id/clear
// @access  Private (Staff & Admin)
const clearTable = async (req, res) => {
  try {
    const table = await Table.findOne({ tableId: req.params.id });
    if (!table) return res.status(404).json({ message: 'Table not found' });

    // Empty the order and reset the status
    table.currentOrder = [];
    table.status = (table.tableId === 7) ? 'RESERVED' : 'AVAILABLE';
    
    await table.save();
    res.json({ message: `Table ${table.tableId} has been cleared and is ready for the next customer.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear table', error: error.message });
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private (Admin only)
const createTable = async (req, res) => {
  try {
    const { tableId, label, status } = req.body;

    // Validation
    if (!tableId || tableId <= 0) {
      return res.status(400).json({ message: 'Valid Table ID is required' });
    }

    // Check if table already exists
    const existingTable = await Table.findOne({ tableId });
    if (existingTable) {
      return res.status(400).json({ message: `Table ${tableId} already exists` });
    }

    const newTable = await Table.create({
      tableId,
      label: label || '',
      status: status || 'AVAILABLE',
      currentOrder: []
    });

    res.status(201).json({
      message: `Table ${tableId} created successfully`,
      table: newTable
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create table', error: error.message });
  }
};

// @desc    Update table details (label, status)
// @route   PUT /api/tables/:id
// @access  Private (Admin only)
const updateTable = async (req, res) => {
  try {
    const table = await Table.findOne({ tableId: req.params.id });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Update allowed fields
    if (req.body.label !== undefined) table.label = req.body.label;
    if (req.body.status !== undefined) {
      // Validate status
      const validStatuses = ['AVAILABLE', 'OCCUPIED', 'PENDING_PAYMENT', 'RESERVED'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      table.status = req.body.status;
    }

    const updatedTable = await table.save();

    res.json({
      message: `Table ${req.params.id} updated successfully`,
      table: updatedTable
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update table', error: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private (Admin only)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findOne({ tableId: req.params.id });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Prevent deletion if table has active orders
    if (table.currentOrder.length > 0) {
      return res.status(400).json({ message: 'Cannot delete table with active orders' });
    }

    await table.deleteOne();

    res.json({
      message: `Table ${req.params.id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete table', error: error.message });
  }
};

module.exports = {
  getTables,
  updateTableOrder,
  generateRunningBill,
  clearTable,
  createTable,
  updateTable,
  deleteTable
};