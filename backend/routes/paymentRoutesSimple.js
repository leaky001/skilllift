const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails
} = require('../controllers/paymentController');

// Payment routes - SIMPLIFIED VERSION
router.post('/initialize', protect, initializePayment);
router.get('/verify', verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId', protect, getPaymentDetails);

module.exports = router;
