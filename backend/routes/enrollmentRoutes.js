const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  createEnrollment,
  getMyEnrollments,
  checkEnrollmentStatus,
  checkInstallmentStatus,
  sendInstallmentReminders,
  suspendEnrollment,
  reactivateEnrollment
} = require('../controllers/enrollmentController');

// Protected routes - require authentication
router.use(protect);

// Learner routes
router.post('/', createEnrollment);
router.get('/my-enrollments', getMyEnrollments);
router.get('/check-status/:courseId', checkEnrollmentStatus);
router.get('/installment-status', checkInstallmentStatus);

// Admin/Tutor routes
router.post('/send-reminders', authorize('admin'), sendInstallmentReminders);
router.post('/:enrollmentId/suspend', authorize('admin'), suspendEnrollment);
router.post('/:enrollmentId/reactivate', authorize('admin'), reactivateEnrollment);

module.exports = router;
