const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload, handleUploadError, cleanupUploads } = require('../middleware/uploadMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Apply upload error handling middleware
router.use(handleUploadError);
router.use(cleanupUploads);

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Private (Tutor)
router.post(
  '/',
  authorize('tutor'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'document', maxCount: 1 },
    { name: 'assignmentFiles', maxCount: 5 }
  ]),
  lessonController.createLesson
);

// @desc    Get lessons for a course
// @route   GET /api/lessons/course/:courseId
// @access  Private
router.get('/course/:courseId', lessonController.getLessonsByCourse);

// @desc    Get a single lesson
// @route   GET /api/lessons/:id
// @access  Private
router.get('/:id', lessonController.getLesson);

// @desc    Update lesson progress
// @route   PUT /api/lessons/:id/progress
// @access  Private (Learner)
router.put('/:id/progress', authorize('learner'), lessonController.updateLessonProgress);

// @desc    Submit quiz
// @route   POST /api/lessons/:id/quiz/submit
// @access  Private (Learner)
router.post('/:id/quiz/submit', authorize('learner'), lessonController.submitQuiz);

// @desc    Submit assignment
// @route   POST /api/lessons/:id/assignment/submit
// @access  Private (Learner)
router.post(
  '/:id/assignment/submit',
  authorize('learner'),
  upload.array('files', 5),
  lessonController.submitAssignment
);

// @desc    Grade assignment
// @route   PUT /api/lessons/:id/assignment/grade
// @access  Private (Tutor)
router.put('/:id/assignment/grade', authorize('tutor'), lessonController.gradeAssignment);

// @desc    Add note to lesson
// @route   POST /api/lessons/:id/notes
// @access  Private (Learner)
router.post('/:id/notes', authorize('learner'), lessonController.addNote);

// @desc    Add bookmark to lesson
// @route   POST /api/lessons/:id/bookmarks
// @access  Private (Learner)
router.post('/:id/bookmarks', authorize('learner'), lessonController.addBookmark);

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Tutor)
router.put(
  '/:id',
  authorize('tutor'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  lessonController.updateLesson
);

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Tutor)
router.delete('/:id', authorize('tutor'), lessonController.deleteLesson);

// @desc    Get lesson statistics
// @route   GET /api/lessons/:id/statistics
// @access  Private (Tutor)
router.get('/:id/statistics', authorize('tutor'), lessonController.getLessonStatistics);

module.exports = router;
