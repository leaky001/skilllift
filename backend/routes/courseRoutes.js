const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireKYCApproval, requireTutor } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');


router.get('/', courseController.getCourses);

// Authenticated routes
router.use(protect);

// Learner routes
router.get('/enrolled', courseController.getEnrolledCourses);

// Admin routes (must come before /:id routes)
router.get('/all', authorize('admin'), courseController.getAllCourses);
router.get('/admin/statistics', authorize('admin'), courseController.getCourseStatistics);

// Tutor-only routes
router.get('/tutor/my-courses', authorize('tutor'), courseController.getTutorCourses);
router.get('/tutor/course/:id', authorize('tutor'), courseController.getTutorCourse);

router.post('/', authorize('tutor'), requireKYCApproval, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'previewVideo', maxCount: 1 },
  { name: 'content', maxCount: 10 }
]), courseController.createCourse);

// Course-specific routes (must come after specific routes)
router.put('/:id', authorize('tutor'), requireKYCApproval, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'previewVideo', maxCount: 1 },
  { name: 'content', maxCount: 10 }
]), courseController.updateCourse);
router.delete('/:id', authorize('tutor'), requireKYCApproval, courseController.deleteCourse);
router.post('/:id/publish', authorize('tutor'), requireKYCApproval, courseController.publishCourse);
router.post('/:id/archive', authorize('tutor'), requireKYCApproval, courseController.archiveCourse);
router.post('/:id/restore', authorize('tutor'), courseController.restoreCourse);

// Wildcard routes (must be last to avoid conflicts)
router.get('/:id', courseController.getCourse);
router.get('/:id/preview', courseController.getCoursePreview);

// Live classes routes
router.get('/:courseId/live-classes', courseController.getCourseLiveClasses);

module.exports = router;
