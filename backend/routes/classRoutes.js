const express = require('express');
const router = express.Router();
const { createClass, getClasses } = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createClass);
router.get('/', protect, getClasses);

module.exports = router;
