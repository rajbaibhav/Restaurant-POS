const cron = require('node-cron');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transactions');

const RETENTION_DAYS = 30;

const getCutoffDate = () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
};

/**
 * Removes receipt data older than 30 days (day 31 frees day-30 data).
 * MongoDB TTL indexes also expire documents; this job is an explicit backup.
 */
const purgeExpiredReceipts = async () => {
  const cutoff = getCutoffDate();

  const [billResult, txnResult] = await Promise.all([
    Bill.deleteMany({ createdAt: { $lt: cutoff } }),
    Transaction.deleteMany({ createdAt: { $lt: cutoff } }),
  ]);

  console.log(
    `[retention-cron] Purged records older than ${cutoff.toISOString().slice(0, 10)}: ` +
      `${billResult.deletedCount} bills, ${txnResult.deletedCount} transactions`
  );

  return {
    cutoff: cutoff.toISOString(),
    billsDeleted: billResult.deletedCount,
    transactionsDeleted: txnResult.deletedCount,
  };
};

const startRetentionCron = () => {
  // Run daily at 00:05 server time
  cron.schedule('5 0 * * *', async () => {
    try {
      await purgeExpiredReceipts();
    } catch (error) {
      console.error('[retention-cron] Failed:', error.message);
    }
  });

  console.log('[retention-cron] Scheduled daily purge for receipts older than 30 days');
};

module.exports = { startRetentionCron, purgeExpiredReceipts, RETENTION_DAYS };
