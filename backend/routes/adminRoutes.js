const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// ===== DASHBOARD & STATISTICS =====
router.get('/dashboard', adminController.getDashboardStats);
router.get('/statistics', adminController.getPlatformStatistics);

// ===== USER MANAGEMENT =====
router.get('/users', adminController.getAllUsers);
router.get('/users/pending', adminController.getPendingUsers);
router.get('/users/recent', adminController.getRecentUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/approve', adminController.approveUser);
router.put('/users/:id/reject', adminController.rejectUser);
router.delete('/users/:id', adminController.deleteUser);

// ===== KYC MANAGEMENT =====
router.get('/kyc/pending', adminController.getPendingKYC);
router.get('/kyc/tutors', adminController.getAllTutorsKYC);
router.get('/kyc/stats', adminController.getKYCStats);
router.put('/kyc/approve/:tutorId', adminController.approveKYC);
router.put('/kyc/reject/:tutorId', adminController.rejectKYC);

// ===== ACCOUNT MANAGEMENT =====
router.get('/suspended-accounts', adminController.getSuspendedAccounts);
router.put('/reactivate-account/:learnerId', adminController.reactivateAccount);



// ===== COURSE MANAGEMENT =====
router.get('/courses/all', adminController.getAllCourses);
router.put('/courses/:id/feature', adminController.toggleCourseFeature);

// ===== PAYMENT & TRANSACTION MANAGEMENT =====
router.get('/payments', adminController.getAllPayments);
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/recent', adminController.getRecentTransactions);
router.get('/payouts/pending', adminController.getPendingPayouts);
router.put('/payouts/:id/process', adminController.processPayout);
router.get('/financial-summary', adminController.getFinancialSummary);

// ===== COMPLAINTS & REPORTS =====
router.get('/complaints', adminController.getComplaints);

// ===== RATING MANAGEMENT =====
router.get('/ratings/pending', adminController.getPendingRatings);
router.get('/ratings', adminController.getAllRatings);
router.put('/ratings/:id/approve', adminController.approveRating);
router.put('/ratings/:id/reject', adminController.rejectRating);
router.put('/ratings/:id/flag', adminController.flagRating);
router.get('/ratings/statistics', adminController.getRatingStatistics);

// ===== ENROLLMENT MANAGEMENT =====
router.get('/enrollments', adminController.getAllEnrollments);
router.get('/enrollments/stats', adminController.getEnrollmentStats);

// ===== TUTOR PERFORMANCE =====
router.get('/tutors/performance', adminController.getTutorPerformance);
router.get('/tutors/:tutorId/stats', adminController.getTutorStats);

// ===== LEARNER ACTIVITY =====
router.get('/learners/activity', adminController.getLearnerActivity);
router.get('/learners/:learnerId/stats', adminController.getLearnerStats);

// ===== CONTENT MODERATION =====
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);
router.get('/flagged-content', adminController.getFlaggedContent);
router.put('/moderate/:type/:id', adminController.moderateContent);

// ===== SYSTEM SETTINGS =====
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);
router.get('/logs', adminController.getSystemLogs);

// ===== ANALYTICS =====
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/courses', adminController.getCourseAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/engagement', adminController.getEngagementAnalytics);

// ===== NOTIFICATIONS =====
router.get('/notifications', adminController.getSystemNotifications);
router.post('/notifications', adminController.createSystemNotification);
router.put('/notifications/:id/read', adminController.markNotificationAsRead);
router.delete('/notifications/:id', adminController.deleteNotification);

module.exports = router;
