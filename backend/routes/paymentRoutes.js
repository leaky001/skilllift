const express = require('express');
const router = express.Router();

const { recordPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Route to record a payment
router.post('/', protect, recordPayment);

module.exports = router;
