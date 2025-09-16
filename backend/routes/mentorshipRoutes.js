const express = require('express');
const router = express.Router();
const {
  applyForMentorship,
  getMentorshipRequests,
  getLearnerMentorships,
  updateMentorship,
  cancelMentorship
} = require('../controllers/mentorshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Learner routes
router.post('/', protect, authorize('learner'), applyForMentorship);
router.get('/learner', protect, authorize('learner'), getLearnerMentorships);
router.put('/:id', protect, authorize('learner'), updateMentorship);
router.put('/:id/cancel', protect, authorize('learner'), cancelMentorship);

// Admin routes
router.get('/admin', protect, authorize('admin'), getMentorshipRequests);
router.put('/admin/:id/review', protect, authorize('admin'), updateMentorship);

module.exports = router;
