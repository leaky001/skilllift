const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

// Socket.IO instance (will be set by server.js)
let io = null;

// Function to set Socket.IO instance
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    console.log('📱 Getting conversations for user:', userId);

    const conversations = await Conversation.getUserConversations(userId, page, limit);
    
    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
      const unreadCount = conv.getUnreadCount(userId);
      return {
        ...conv.toObject(),
        unreadCount
      };
    });

    console.log('✅ Found conversations:', conversationsWithUnread.length);

    res.json(ApiResponse.success(conversationsWithUnread, 'Conversations retrieved successfully'));
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json(ApiResponse.error('Failed to get conversations', 500));
  }
});

// @desc    Get or create conversation between two users
// @route   POST /api/messages/conversation
// @access  Private
exports.createConversation = asyncHandler(async (req, res) => {
  try {
    const { participantId, courseId } = req.body;
    const userId = req.user._id;

    console.log('💬 Creating conversation between:', userId, 'and', participantId);

    if (!participantId) {
      return res.status(400).json(ApiResponse.error('Participant ID is required', 400));
    }

    if (participantId === userId.toString()) {
      return res.status(400).json(ApiResponse.error('Cannot create conversation with yourself', 400));
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json(ApiResponse.error('Participant not found', 404));
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreateConversation(userId, participantId, courseId);

    console.log('✅ Conversation created/found:', conversation._id);

    res.json(ApiResponse.success(conversation, 'Conversation retrieved successfully'));
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json(ApiResponse.error('Failed to create conversation', 500));
  }
});

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/conversation/:id
// @access  Private
exports.getConversation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    console.log('📨 Getting messages for conversation:', id);

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(id).populate('participants', 'name email role');
    if (!conversation) {
      return res.status(404).json(ApiResponse.error('Conversation not found', 404));
    }

    const isParticipant = conversation.participants.some(p => p._id.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json(ApiResponse.error('Access denied to this conversation', 403));
    }

    // Get messages
    const messages = await ChatMessage.getConversationMessages(id, page, limit);

    // Mark conversation as read for current user
    await conversation.markAsRead(userId);

    console.log('✅ Found messages:', messages.length);

    res.json(ApiResponse.success({
      conversation,
      messages
    }, 'Messages retrieved successfully'));
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    res.status(500).json(ApiResponse.error('Failed to get conversation', 500));
  }
});

// @desc    Send a chat message
// @route   POST /api/messages/chat
// @access  Private
exports.sendChatMessage = asyncHandler(async (req, res) => {
  try {
    const { conversationId, receiverId, content, replyTo, replyContent } = req.body;
    const senderId = req.user._id;

    console.log('💬 Sending chat message:', { 
      conversationId, 
      receiverId, 
      content: content?.substring(0, 50) + '...',
      senderId,
      userRole: req.user.role,
      userName: req.user.name
    });

    if (!conversationId || !receiverId || !content) {
      console.log('❌ Missing required fields:', { 
        hasConversationId: !!conversationId,
        hasReceiverId: !!receiverId,
        hasContent: !!content
      });
      return res.status(400).json(ApiResponse.error('Conversation ID, receiver ID, and content are required', 400));
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('❌ Conversation not found:', conversationId);
      return res.status(404).json(ApiResponse.error('Conversation not found', 404));
    }

    console.log('📋 Conversation found:', {
      id: conversation._id,
      participants: conversation.participants,
      participantCount: conversation.participants.length
    });

    const isParticipant = conversation.participants.some(p => p.toString() === senderId.toString());
    if (!isParticipant) {
      console.log('❌ User not participant:', {
        senderId,
        participants: conversation.participants.map(p => p.toString()),
        isParticipant
      });
      return res.status(403).json(ApiResponse.error('Access denied to this conversation', 403));
    }

    // Create message
    const message = await ChatMessage.createTextMessage({
      conversationId,
      senderId,
      receiverId,
      content,
      replyTo,
      replyContent
    });

    console.log('✅ Message sent:', message._id);

    // Send notification to the receiver
    try {
      const NotificationService = require('../services/notificationService');
      const User = require('../models/User');
      
      // Get receiver and sender user info
      const receiverUser = await User.findById(receiverId);
      const senderUser = await User.findById(senderId);
      
      if (receiverUser && senderUser) {
        // Determine notification type based on sender role
        let notificationType = 'chat_message';
        let notificationTitle = 'New Message';
        
        if (senderUser.role === 'tutor') {
          notificationType = 'tutor_message';
          notificationTitle = 'New Message from Tutor';
        } else if (senderUser.role === 'learner') {
          notificationType = 'learner_message';
          notificationTitle = 'New Message from Student';
        }
        
        // Create notification
        await NotificationService.emitNotification(receiverUser._id, {
          type: notificationType,
          title: notificationTitle,
          message: `${senderUser.name}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
          sender: senderId,
          data: {
            conversationId: conversationId,
            messageId: message._id,
            senderName: senderUser.name,
            senderRole: senderUser.role,
            content: content
          }
        });
        
        console.log(`🔔 Notification sent to ${receiverUser.name} for message from ${senderUser.name}`);
      }
    } catch (notificationError) {
      console.error('Error sending message notification:', notificationError);
      // Don't fail the message sending if notification fails
    }

    // Broadcast message via Socket.IO if available
    if (io) {
      try {
        const broadcastData = {
          id: message._id,
          conversationId,
          senderId: message.sender._id,
          senderName: message.sender.name,
          senderRole: message.sender.role,
          receiverId: message.receiver._id,
          content: message.content,
          type: message.type,
          timestamp: message.createdAt,
          replyTo: message.replyTo,
          replyContent: message.replyContent,
          status: message.status
        };
        
        console.log('📡 Broadcasting message via Socket.IO:', {
          messageId: message._id,
          conversationId,
          senderId: message.sender._id,
          senderName: message.sender.name,
          senderRole: message.sender.role,
          receiverId: message.receiver._id,
          content: message.content.substring(0, 50) + '...'
        });
        
        // Check how many users are in the conversation room
        const roomName = `conversation_${conversationId}`;
        const room = io.sockets.adapter.rooms.get(roomName);
        const roomSize = room ? room.size : 0;
        
        console.log('📊 Conversation room info:', {
          roomName,
          roomSize,
          hasRoom: !!room
        });
        
        // Emit message to all participants in the conversation
        io.to(`conversation_${conversationId}`).emit('chat_message', broadcastData);
        
        console.log('✅ Message broadcasted successfully to conversation:', conversationId);
      } catch (error) {
        console.error('❌ Error broadcasting message via Socket.IO:', error);
        // Don't fail the API call if Socket.IO broadcasting fails
      }
    } else {
      console.log('⚠️ Socket.IO not available for broadcasting');
    }

    res.json(ApiResponse.success(message, 'Message sent successfully'));
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    res.status(500).json(ApiResponse.error('Failed to send message', 500));
  }
});

// @desc    Send a file message
// @route   POST /api/messages/send-file
// @access  Private
exports.sendFileMessage = asyncHandler(async (req, res) => {
  try {
    const { conversationId, receiverId } = req.body;
    const senderId = req.user._id;

    console.log('📎 Sending file message:', { conversationId, receiverId });

    if (!req.file) {
      return res.status(400).json(ApiResponse.error('File is required', 400));
    }

    if (!conversationId || !receiverId) {
      return res.status(400).json(ApiResponse.error('Conversation ID and receiver ID are required', 400));
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json(ApiResponse.error('Conversation not found', 404));
    }

    const isParticipant = conversation.participants.some(p => p.toString() === senderId.toString());
    if (!isParticipant) {
      return res.status(403).json(ApiResponse.error('Access denied to this conversation', 403));
    }

    // Determine file type
    let fileType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'voice';
    }

    // Create file message
    const message = await ChatMessage.createFileMessage({
      conversationId,
      senderId,
      receiverId,
      fileUrl: `/${req.file.path.replace(/\\/g, '/')}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType
    });

    console.log('✅ File message sent:', message._id);

    res.json(ApiResponse.success({
      message,
      fileUrl: message.fileUrl
    }, 'File sent successfully'));
  } catch (error) {
    console.error('❌ Error sending file message:', error);
    res.status(500).json(ApiResponse.error('Failed to send file', 500));
  }
});

// @desc    Mark conversation as read
// @route   PUT /api/messages/conversation/:id/read
// @access  Private
exports.markConversationAsRead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('👁️ Marking conversation as read:', id);

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json(ApiResponse.error('Conversation not found', 404));
    }

    const isParticipant = conversation.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json(ApiResponse.error('Access denied to this conversation', 403));
    }

    await conversation.markAsRead(userId);

    console.log('✅ Conversation marked as read');

    res.json(ApiResponse.success(null, 'Conversation marked as read'));
  } catch (error) {
    console.error('❌ Error marking conversation as read:', error);
    res.status(500).json(ApiResponse.error('Failed to mark conversation as read', 500));
  }
});

// @desc    Get online users
// @route   GET /api/messages/online-users
// @access  Private
exports.getOnlineUsers = asyncHandler(async (req, res) => {
  try {
    // This would typically be managed by WebSocket connections
    // For now, return a mock list of online users
    const onlineUsers = await User.find({
      _id: { $ne: req.user._id },
      role: { $in: ['tutor', 'learner'] }
    }).select('name email role').limit(20);

    console.log('🌐 Online users:', onlineUsers.length);

    res.json(ApiResponse.success(onlineUsers, 'Online users retrieved successfully'));
  } catch (error) {
    console.error('❌ Error getting online users:', error);
    res.status(500).json(ApiResponse.error('Failed to get online users', 500));
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/chat/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('🗑️ Deleting message:', id);

    const message = await ChatMessage.findById(id);
    if (!message) {
      return res.status(404).json(ApiResponse.error('Message not found', 404));
    }

    // Check if user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json(ApiResponse.error('You can only delete your own messages', 403));
    }

    await ChatMessage.findByIdAndDelete(id);

    console.log('✅ Message deleted');

    res.json(ApiResponse.success(null, 'Message deleted successfully'));
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json(ApiResponse.error('Failed to delete message', 500));
  }
});

// @desc    Get conversation participants
// @route   GET /api/messages/conversation/:id/participants
// @access  Private
exports.getConversationParticipants = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('👥 Getting conversation participants:', id);

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email role');

    if (!conversation) {
      return res.status(404).json(ApiResponse.error('Conversation not found', 404));
    }

    const isParticipant = conversation.participants.some(p => p._id.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json(ApiResponse.error('Access denied to this conversation', 403));
    }

    console.log('✅ Participants found:', conversation.participants.length);

    res.json(ApiResponse.success(conversation.participants, 'Participants retrieved successfully'));
  } catch (error) {
    console.error('❌ Error getting participants:', error);
    res.status(500).json(ApiResponse.error('Failed to get participants', 500));
  }
});

// Export setSocketIO function
exports.setSocketIO = setSocketIO;
