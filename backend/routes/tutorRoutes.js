const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const User = require('../models/User');

// Import controllers (we'll create these next)
const tutorController = require('../controllers/tutorController');

// All routes require authentication and tutor authorization
router.use(protect);
router.use(authorize('tutor'));

// ===== DASHBOARD & STATISTICS =====
router.get('/dashboard/stats', tutorController.getDashboardStats);
router.get('/dashboard/recent-learners', tutorController.getRecentLearners);
router.get('/dashboard/upcoming-sessions', tutorController.getUpcomingSessions);
router.get('/dashboard/notifications', tutorController.getRecentNotifications);
router.get('/dashboard/course-performance', tutorController.getCoursePerformance);
router.get('/dashboard/earnings', tutorController.getEarnings);

// ===== LEARNER MANAGEMENT =====
router.get('/learners', tutorController.getLearners);
router.get('/learners/:id', tutorController.getLearner);
router.get('/learners/:id/courses/:courseId/progress', tutorController.getLearnerProgress);
router.get('/learners/:id/courses/:courseId/assignments', tutorController.getLearnerAssignments);
router.post('/learners/:id/message', tutorController.sendMessageToLearner);

// ===== PAYMENTS & EARNINGS =====
router.get('/payments', tutorController.getPayments);
router.get('/payments/earnings-report', tutorController.getEarningsReport);
router.get('/payments/history', tutorController.getPaymentHistory);
router.post('/payments/withdraw', tutorController.requestWithdrawal);

// ===== PROFILE & SETTINGS =====
router.get('/profile', tutorController.getProfile);
router.put('/profile', upload.single('avatar'), tutorController.updateProfile);
router.get('/settings', tutorController.getSettings);
router.put('/settings', tutorController.updateSettings);

// ===== ANALYTICS =====
router.get('/analytics', tutorController.getAnalytics);
router.get('/analytics/courses/:courseId', tutorController.getCourseAnalytics);
router.get('/analytics/learners', tutorController.getLearnerAnalytics);

// ===== REPLAYS =====
router.get('/replays', tutorController.getReplays);
router.post('/replays/upload', upload.single('replayFile'), tutorController.uploadReplay);
router.delete('/replays/:id', tutorController.deleteReplay);

// ===== NOTIFICATIONS =====
router.get('/notifications', tutorController.getTutorNotifications);
router.put('/notifications/:id/read', tutorController.markNotificationAsRead);
router.put('/notifications/read-all', tutorController.markAllNotificationsAsRead);

module.exports = router;
