
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { rateTutor } = require('../controllers/ratingController'); 

router.post('/', protect, rateTutor);

module.exports = router;
