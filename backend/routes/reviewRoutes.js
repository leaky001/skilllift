const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

// Public routes
router.get('/course/:courseId', ratingController.getCourseRatings);
router.get('/course/:courseId/stats', ratingController.getCourseReviewStats);

// Protected routes
router.use(protect);

// User routes
router.post('/', authorize('learner'), ratingController.createRating);
router.get('/my-reviews', ratingController.getMyRatings);
router.put('/:id', authorize('learner'), ratingController.updateRating);
router.delete('/:id', authorize('learner'), ratingController.deleteRating);

// Review interactions
router.post('/:id/like', ratingController.likeRating);
router.delete('/:id/like', ratingController.unlikeRating);
router.post('/:id/report', ratingController.reportRating);

// Admin routes
router.get('/admin/pending', authorize('admin'), ratingController.getPendingRatings);
router.put('/:id/approve', authorize('admin'), ratingController.approveRating);
router.put('/:id/reject', authorize('admin'), ratingController.rejectRating);
router.get('/admin/statistics', authorize('admin'), ratingController.getRatingStatistics);
router.get('/admin/tutor-analytics', authorize('admin'), ratingController.getTutorReviewAnalytics);
router.get('/admin/tutor/:tutorId/analytics', authorize('admin'), ratingController.getTutorDetailedAnalytics);

module.exports = router;
