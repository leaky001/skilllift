const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  initializePayment,
  verifyPayment,
  verifyPaymentManual,
  getPaymentHistory,
  getPaymentDetails,
  sendClassStartNotification,
  getAllPayments,
  getDueInstallments,
  sendPaymentReminders
} = require('../controllers/paymentController');

// Payment routes - SIMPLIFIED VERSION
router.post('/initialize', initializePayment); // Authentication handled inside controller
router.post('/verify', verifyPayment); // Change from GET to POST to match frontend
router.post('/verify-manual', verifyPaymentManual); // Manual verification for testing
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId', protect, getPaymentDetails);

// Admin routes for notifications
router.post('/notify-class-start', protect, sendClassStartNotification);

// Admin payment management routes
router.get('/admin/all', protect, getAllPayments);
router.get('/admin/due-installments', protect, getDueInstallments);
router.post('/admin/send-reminders', protect, sendPaymentReminders);

module.exports = router;
