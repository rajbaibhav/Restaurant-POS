const Bill = require('../models/Bill');
const { RETENTION_DAYS } = require('../jobs/retentionCron');

const parseDateRange = (dateStr) => {
  const startDate = new Date(dateStr);
  if (isNaN(startDate.getTime())) {
    return null;
  }
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(dateStr);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

const aggregateSoldItemsByTable = (bills) => {
  const tableMap = {};

  bills.forEach((bill) => {
    const tableKey = bill.tableNumber;
    if (!tableMap[tableKey]) {
      tableMap[tableKey] = {
        tableNumber: tableKey,
        totalSales: 0,
        totalBills: 0,
        totalItems: 0,
        soldItems: {},
      };
    }

    const entry = tableMap[tableKey];
    entry.totalSales += bill.totalAmount;
    entry.totalBills += 1;

    bill.items.forEach((item) => {
      entry.totalItems += item.quantity;
      entry.soldItems[item.name] = (entry.soldItems[item.name] || 0) + item.quantity;
    });
  });

  return Object.values(tableMap)
    .map((row) => ({
      ...row,
      soldItems: Object.entries(row.soldItems).map(([name, quantity]) => ({ name, quantity })),
    }))
    .sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber));
};

// GET /reports/summary — 30-day revenue summary by date
exports.getThirtyDaySummary = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - RETENTION_DAYS);

    const summary = await Bill.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }, // server local timezone
          },
          dailyTotal: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({ success: true, retentionDays: RETENTION_DAYS, data: summary });
  } catch (error) {
    console.error('Error in getThirtyDaySummary:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /reports/daily/:date — table-wise totals for a specific date
exports.getDailyTableReport = async (req, res) => {
  try {
    const range = parseDateRange(req.params.date);
    if (!range) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const { startDate, endDate } = range;

    const tableReport = await Bill.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$tableNumber',
          tableTotalSales: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 },
          bills: { $push: '$$ROOT' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, date: req.params.date, data: tableReport });
  } catch (error) {
    console.error('Error in getDailyTableReport:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /reports/logs/:date — sold items log (table-wise itemized breakdown)
exports.getSoldItemsLogs = async (req, res) => {
  try {
    const range = parseDateRange(req.params.date);
    if (!range) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const { startDate, endDate } = range;
    const bills = await Bill.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    const tables = aggregateSoldItemsByTable(bills);
    const dayTotalSales = tables.reduce((sum, t) => sum + t.totalSales, 0);
    const dayTotalItems = tables.reduce((sum, t) => sum + t.totalItems, 0);

    res.status(200).json({
      success: true,
      date: req.params.date,
      retentionDays: RETENTION_DAYS,
      summary: {
        totalSales: dayTotalSales,
        totalItemsSold: dayTotalItems,
        totalBills: bills.length,
      },
      tables,
      receipts: bills,
    });
  } catch (error) {
    console.error('Error in getSoldItemsLogs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
