const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', messageController.sendMessage);

// @desc    Get received messages (inbox)
// @route   GET /api/messages/received
// @access  Private
router.get('/received', messageController.getInbox);

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
router.get('/sent', messageController.getSentMessages);

// @desc    Get message stats
// @route   GET /api/messages/stats
// @access  Private
router.get('/stats', messageController.getMessageStats);

// @desc    Get messaging users
// @route   GET /api/messages/users
// @access  Private
router.get('/users', messageController.getMessagingUsers);

// @desc    Get tutor learners
// @route   GET /api/messages/tutor-learners
// @access  Private
router.get('/tutor-learners', messageController.getTutorLearners);

// @desc    Get learner tutors
// @route   GET /api/messages/learner-tutors
// @access  Private
router.get('/learner-tutors', messageController.getLearnerTutors);

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', messageController.getUnreadCount);

// @desc    Get message details
// @route   GET /api/messages/:id
// @access  Private
router.get('/:id', messageController.getMessage);

// @desc    Reply to message
// @route   POST /api/messages/:id/reply
// @access  Private
router.post('/:id/reply', messageController.replyToMessage);

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', messageController.deleteMessage);

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', messageController.updateMessageStatus);

module.exports = router;