const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(protect);

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
router.get('/conversations', chatController.getConversations);

// @desc    Get or create conversation between two users
// @route   POST /api/chat/conversation
// @access  Private
router.post('/conversation', chatController.createConversation);

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/conversation/:id
// @access  Private
router.get('/conversation/:id', chatController.getConversation);

// @desc    Get conversation participants
// @route   GET /api/chat/conversation/:id/participants
// @access  Private
router.get('/conversation/:id/participants', chatController.getConversationParticipants);

// @desc    Mark conversation as read
// @route   PUT /api/chat/conversation/:id/read
// @access  Private
router.put('/conversation/:id/read', chatController.markConversationAsRead);

// @desc    Send a chat message
// @route   POST /api/chat/chat
// @access  Private
router.post('/chat', chatController.sendChatMessage);

// @desc    Send a file message
// @route   POST /api/chat/send-file
// @access  Private
router.post('/send-file', upload.single('file'), chatController.sendFileMessage);

// @desc    Delete a message
// @route   DELETE /api/chat/chat/:id
// @access  Private
router.delete('/chat/:id', chatController.deleteMessage);

// @desc    Get online users
// @route   GET /api/chat/online-users
// @access  Private
router.get('/online-users', chatController.getOnlineUsers);

module.exports = router;
