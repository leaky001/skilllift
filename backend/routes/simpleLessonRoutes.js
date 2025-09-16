const express = require('express');
const router = express.Router();
const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateProgress,
  submitQuiz,
  submitAssignment,
  getCourseCompletion
} = require('../controllers/simpleLessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * SIMPLIFIED LESSON ROUTES
 * 
 * Key Simplifications:
 * 1. Clear, descriptive route names
 * 2. Minimal middleware
 * 3. Simple parameter handling
 * 4. Easy to understand and maintain
 */

// All routes require authentication
router.use(protect);

// Tutor routes (create lessons)
router.post('/', authorize('tutor'), createLesson);

// Learner routes (view lessons and track progress)
router.get('/course/:courseId', getLessonsByCourse);
router.get('/course/:courseId/completion', getCourseCompletion);
router.get('/:lessonId', getLessonById);
router.put('/:lessonId/progress', updateProgress);
router.post('/:lessonId/quiz', submitQuiz);
router.post('/:lessonId/assignment', submitAssignment);

module.exports = router;
