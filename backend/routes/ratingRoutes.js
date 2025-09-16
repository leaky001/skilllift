
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/course/:courseId', ratingController.getCourseRatings);
router.get('/course/:courseId/stats', ratingController.getCourseReviewStats);
router.get('/course/:courseId/enrollment', ratingController.getCourseRatingsForEnrollment);

// Protected routes (Learners only)
router.post('/', protect, authorize('learner'), ratingController.createRating);
router.put('/:id', protect, authorize('learner'), ratingController.updateRating);
router.delete('/:id', protect, authorize('learner'), ratingController.deleteRating);
router.get('/user', protect, authorize('learner'), ratingController.getMyRatings);

// Protected routes (Tutors only)
router.get('/tutor/my-courses', protect, authorize('tutor'), ratingController.getTutorCourseRatings);
router.get('/tutor/analytics', protect, authorize('tutor'), ratingController.getTutorRatingAnalytics);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), ratingController.getAllRatings);
router.get('/admin/pending', protect, authorize('admin'), ratingController.getPendingRatings);
router.put('/admin/:id/approve', protect, authorize('admin'), ratingController.approveRating);
router.put('/admin/:id/reject', protect, authorize('admin'), ratingController.rejectRating);
router.get('/admin/statistics', protect, authorize('admin'), ratingController.getRatingStatistics);

module.exports = router;
