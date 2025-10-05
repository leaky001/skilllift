const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createLiveClass,
  startLiveClass,
  joinLiveClass,
  joinLiveClassAsTutor,
  endLiveClass,
  getLiveClass,
  getLiveClasses,
  getCourseLiveClasses,
  sendChatMessage,
  getChatMessages
} = require('../controllers/liveClassController');

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Create a new live class
// @route   POST /api/live-classes
// @access  Private (Tutor)
router.post('/', authorize('tutor'), createLiveClass);

// @desc    Get all live classes for enrolled courses (learner) or created by tutor
// @route   GET /api/live-classes
// @access  Private (All authenticated users)
router.get('/', getLiveClasses);

// @desc    Get live class details
// @route   GET /api/live-classes/:id
// @access  Private
router.get('/:id', getLiveClass);

// @desc    Start a live class - DISABLED - USE /join instead
// @route   POST /api/live-classes/:id/start
// @access  Private (Tutor)
// router.post('/:id/start', authorize('tutor'), startLiveClass); // Disabled

// @desc    Join a live class (for tutors) - DISABLED - USE /join instead  
// @route   POST /api/live-classes/:id/join-tutor
// @access  Private (Tutor)
// router.post('/:id/join-tutor', authorize('tutor'), joinLiveClassAsTutor); // Disabled

// @desc    Join a live class
// @route   POST /api/live-classes/:id/join
// @access  Private (Learner or Tutor)
router.post('/:id/join', authorize(['learner', 'tutor']), joinLiveClass);

// @desc    End a live class
// @route   POST /api/live-classes/:id/end
// @access  Private (Tutor)
router.post('/:id/end', authorize('tutor'), endLiveClass);

// @desc    Send chat message
// @route   POST /api/live-classes/:id/chat
// @access  Private
router.post('/:id/chat', sendChatMessage);

// @desc    Get chat messages
// @route   GET /api/live-classes/:id/chat
// @access  Private
router.get('/:id/chat', getChatMessages);

module.exports = router;
