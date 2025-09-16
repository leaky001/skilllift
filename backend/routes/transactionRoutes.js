const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getMyTransactions,
  getTransaction,
  getTutorPayouts,
  requestPayout,
  getTutorEarnings,
  getAllTransactions,
  getPendingPayouts,
  processPayout,
  getTransactionStatistics,
  processRefund
} = require('../controllers/transactionController');

// Public routes (if any)
// router.get('/public/verify/:reference', verifyTransaction);

// Protected routes - require authentication
router.use(protect);

// User routes (learners and tutors)
router.get('/my-transactions', getMyTransactions);
router.get('/transaction/:transactionId', getTransaction);

// Tutor routes
router.get('/tutor/payouts', authorize('tutor'), getTutorPayouts);
router.post('/tutor/request-payout', authorize('tutor'), requestPayout);
router.get('/tutor/earnings', authorize('tutor'), getTutorEarnings);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllTransactions);
router.get('/admin/pending-payouts', authorize('admin'), getPendingPayouts);
router.put('/admin/payout/:transactionId', authorize('admin'), processPayout);
router.get('/admin/statistics', authorize('admin'), getTransactionStatistics);
router.post('/admin/refund/:transactionId', authorize('admin'), processRefund);

module.exports = router;
