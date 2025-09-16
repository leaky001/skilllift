const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/submissions/' });

const assignmentController = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes (for enrolled students)
router.get('/course/:courseId', assignmentController.getCourseAssignments);

// Protected routes
router.use(protect);

// Student routes
router.get('/my-assignments', assignmentController.getMyAssignments);
router.get('/:id', assignmentController.getAssignment);

// Tutor routes
router.post('/', authorize('tutor'), assignmentController.createAssignment);
router.get('/tutor/my-assignments', authorize('tutor'), assignmentController.getTutorAssignments);
router.put('/:id', authorize('tutor'), assignmentController.updateAssignment);
router.delete('/:id', authorize('tutor'), assignmentController.deleteAssignment);
router.put('/:id/publish', authorize('tutor'), assignmentController.publishAssignment);
router.put('/:id/archive', authorize('tutor'), assignmentController.archiveAssignment);
router.post('/:id/duplicate', authorize('tutor'), assignmentController.duplicateAssignment);
router.get('/:id/stats', authorize('tutor'), assignmentController.getAssignmentStats);

module.exports = router;
