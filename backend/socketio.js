const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
// LiveClass model removed - Live class functionality deleted
const Conversation = require('./models/Conversation');
const ChatMessage = require('./models/ChatMessage');
const Enrollment = require('./models/Enrollment');

// Store active connections
const activeConnections = new Map();
const chatRooms = new Map(); // Store chat room connections
const typingUsers = new Map(); // Store typing users

const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.userId})`);
    
    // Store connection
    activeConnections.set(socket.userId, socket);
    
    // Emit user online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      userName: socket.user.name,
      userRole: socket.user.role
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
    });

    // ===== LIVE CLASS FUNCTIONALITY =====
    // Removed - Live class functionality deleted

    // ===== CHAT FUNCTIONALITY =====
    
    // Join conversation room
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        console.log(`💬 ${socket.user.name} joining conversation: ${conversationId}`);
        
        // Verify user has access to this conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId
        );
        
        if (!isParticipant) {
          socket.emit('error', { message: 'You are not a participant in this conversation' });
          return;
        }

        // Join the room
        socket.join(conversationId);
        chatRooms.set(socket.userId, conversationId);
        
        // Notify other participants
        socket.to(conversationId).emit('user_joined_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });

        console.log(`✅ ${socket.user.name} joined conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (data) => {
      try {
        const { conversationId } = data;
        console.log(`💬 ${socket.user.name} leaving conversation: ${conversationId}`);
        
        socket.leave(conversationId);
        chatRooms.delete(socket.userId);
        
        // Notify other participants
        socket.to(conversationId).emit('user_left_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });

        console.log(`✅ ${socket.user.name} left conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error leaving conversation:', error);
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text' } = data;
        console.log(`💬 ${socket.user.name} sending message to conversation: ${conversationId}`);
        
        // Verify user has access to this conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId
        );
        
        if (!isParticipant) {
          socket.emit('error', { message: 'You are not a participant in this conversation' });
          return;
        }

        // Create message
        const message = new ChatMessage({
          conversationId: conversationId,
          senderId: socket.userId,
          content: content,
          messageType: messageType,
          timestamp: new Date()
        });

        await message.save();

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageAt: new Date()
        });

        // Broadcast message to all participants in the conversation
        io.to(conversationId).emit('new_message', {
          id: message._id,
          conversationId: conversationId,
          senderId: socket.userId,
          senderName: socket.user.name,
          content: content,
          messageType: messageType,
          timestamp: message.timestamp
        });

        console.log(`✅ Message sent by ${socket.user.name} to conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      try {
        const { conversationId } = data;
        typingUsers.set(socket.userId, {
          conversationId: conversationId,
          userName: socket.user.name,
          timestamp: Date.now()
        });
        
        socket.to(conversationId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });
      } catch (error) {
        console.error('Error handling typing start:', error);
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        const { conversationId } = data;
        typingUsers.delete(socket.userId);
        
        socket.to(conversationId).emit('user_stopped_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Remove from typing users
      typingUsers.delete(socket.userId);
      
      // Remove from chat rooms
      const conversationId = chatRooms.get(socket.userId);
      if (conversationId) {
        socket.to(conversationId).emit('user_left_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });
        chatRooms.delete(socket.userId);
      }
      
      // Emit user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        userName: socket.user.name,
        userRole: socket.user.role
      });
    });
  });

  return io;
};

module.exports = initializeSocketIO;
