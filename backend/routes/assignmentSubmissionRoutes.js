const express = require('express');
const router = express.Router();
const assignmentSubmissionController = require('../controllers/assignmentSubmissionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All authenticated users
router.use(protect);

// Debug route
router.get('/debug-assignment/:assignmentId', assignmentSubmissionController.debugAssignment);

// Learners only
router.post('/', authorize('learner'), upload.fields([
  { name: 'attachments', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]), assignmentSubmissionController.submitAssignment);
router.get('/my-submissions', authorize('learner'), assignmentSubmissionController.getMySubmissions);
router.get('/:id', authorize('learner'), assignmentSubmissionController.getSubmission);
router.put('/:id', authorize('learner'), upload.fields([
  { name: 'attachments', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]), assignmentSubmissionController.updateSubmission);
router.delete('/:id', authorize('learner'), assignmentSubmissionController.deleteSubmission);

// Tutors only
router.get('/tutor/assignments/:assignmentId/submissions', authorize('tutor'), assignmentSubmissionController.getAssignmentSubmissions);
router.put('/:id/grade', authorize('tutor'), assignmentSubmissionController.gradeSubmission);
router.post('/:id/feedback', authorize('tutor'), assignmentSubmissionController.addFeedback);
router.get('/tutor/ungraded', authorize('tutor'), assignmentSubmissionController.getUngradedSubmissions);

// Admin routes
router.get('/admin/all', authorize('admin'), assignmentSubmissionController.getAllSubmissions);
router.get('/admin/statistics', authorize('admin'), assignmentSubmissionController.getSubmissionStatistics);
router.put('/:id/moderate', authorize('admin'), assignmentSubmissionController.moderateSubmission);

module.exports = router;
