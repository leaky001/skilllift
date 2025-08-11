const express = require('express');
const router = express.Router();
const {
  applyForMentorship,
  getMentorshipRequests,
  respondToRequest
} = require('../controllers/mentorshipController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, applyForMentorship); // Corrected function name
router.get('/', protect, getMentorshipRequests);
router.put('/:id/respond', protect, respondToRequest);

module.exports = router;
