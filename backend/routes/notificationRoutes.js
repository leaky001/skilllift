// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getNotifications, sendNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);     // <== make sure this is a function
router.post('/', protect, sendNotification);    // <== make sure this is a function

module.exports = router;
