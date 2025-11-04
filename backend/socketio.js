const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const UserPresence = require('./models/UserPresence');
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

  io.on('connection', async (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.userId})`);
    
    // Store connection
    activeConnections.set(socket.userId, socket);
    
    // Update user presence in database
    try {
      await UserPresence.updatePresence(socket.userId, {
        isOnline: true,
        status: 'online',
        socketId: socket.id,
        userAgent: socket.handshake.headers['user-agent'],
        ipAddress: socket.handshake.address
      });
      console.log(`✅ User presence updated: ${socket.user.name} is online`);
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
    
    // Emit user online status to all connected users
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      userName: socket.user.name,
      userRole: socket.user.role,
      status: 'online',
      lastSeen: new Date()
    });
    
    // Send current online users to the newly connected user
    try {
      const onlineUsers = await UserPresence.getOnlineUsers(socket.userId);
      socket.emit('online_users', onlineUsers.map(presence => ({
        userId: presence.user._id,
        userName: presence.user.name,
        userRole: presence.user.role,
        status: presence.status,
        lastSeen: presence.lastSeen,
        currentActivity: presence.currentActivity
      })));
      console.log(`📊 Sent ${onlineUsers.length} online users to ${socket.user.name}`);
    } catch (error) {
      console.error('Error getting online users:', error);
    }

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
          console.log(`❌ Conversation not found: ${conversationId}`);
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        console.log('📋 Conversation found:', {
          id: conversation._id,
          participants: conversation.participants.map(p => p.toString()),
          participantCount: conversation.participants.length
        });

        // Check if user is participant (fix: participants are ObjectIds, not objects with userId)
        const isParticipant = conversation.participants.some(
          p => p.toString() === socket.userId
        );
        
        if (!isParticipant) {
          console.log(`❌ User ${socket.userId} not participant in conversation ${conversationId}`);
          socket.emit('error', { message: 'You are not a participant in this conversation' });
          return;
        }

        // Leave any previous conversation room
        const previousRoom = chatRooms.get(socket.userId);
        if (previousRoom && previousRoom !== conversationId) {
          socket.leave(`conversation_${previousRoom}`);
          console.log(`📤 Left previous conversation room: ${previousRoom}`);
        }

        // Join the room
        socket.join(`conversation_${conversationId}`);
        chatRooms.set(socket.userId, conversationId);
        
        // Check room size after joining
        const roomName = `conversation_${conversationId}`;
        const room = io.sockets.adapter.rooms.get(roomName);
        const roomSize = room ? room.size : 0;
        
        console.log(`✅ ${socket.user.name} joined conversation: ${conversationId}`);
        console.log(`📊 Room info after joining:`, {
          roomName,
          roomSize,
          hasRoom: !!room
        });
        
        // Notify other participants
        socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });

        // Update user presence with current activity
        try {
          await UserPresence.updatePresence(socket.userId, {
            currentActivity: 'in_chat',
            currentConversation: conversationId
          });
          console.log(`📱 Updated presence for ${socket.user.name}: in_chat`);
        } catch (error) {
          console.error('Error updating presence for conversation join:', error);
        }

        // Send confirmation to the user
        socket.emit('conversation_joined', {
          conversationId: conversationId,
          roomSize: roomSize
        });
        
        // Notify conversation partners about online status
        try {
          const partnersStatus = await UserPresence.getConversationPartnersStatus(socket.userId, conversationId);
          socket.emit('conversation_partners_status', partnersStatus.map(presence => ({
            userId: presence.user._id,
            userName: presence.user.name,
            userRole: presence.user.role,
            isOnline: presence.isOnline,
            status: presence.status,
            lastSeen: presence.lastSeen,
            currentActivity: presence.currentActivity
          })));
          console.log(`📊 Sent conversation partners status to ${socket.user.name}`);
        } catch (error) {
          console.error('Error getting conversation partners status:', error);
        }

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
        
        socket.leave(`conversation_${conversationId}`);
        chatRooms.delete(socket.userId);
        
        // Notify other participants
        socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });

        console.log(`✅ ${socket.user.name} left conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error leaving conversation:', error);
      }
    });

    // Send message - Handle both 'send_message' and 'chat_message' events
    const handleSendMessage = async (data) => {
      try {
        const { conversationId, content, messageType = 'text', receiverId } = data;
        console.log(`💬 ${socket.user.name} sending message to conversation: ${conversationId}`);
        
        // Verify user has access to this conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant (fix: participants are ObjectIds, not objects with userId)
        const isParticipant = conversation.participants.some(
          p => p.toString() === socket.userId
        );
        
        if (!isParticipant) {
          socket.emit('error', { message: 'You are not a participant in this conversation' });
          return;
        }

        // Create message using the ChatMessage model's static method
        const message = await ChatMessage.createTextMessage({
          conversationId: conversationId,
          senderId: socket.userId,
          receiverId: receiverId || conversation.participants.find(p => p.toString() !== socket.userId),
          content: content,
          type: messageType
        });

        // Send notification to the receiver
        try {
          const NotificationService = require('./services/notificationService');
          const User = require('./models/User');
          
          // Get receiver user info
          const receiverUser = await User.findById(message.receiver._id);
          const senderUser = await User.findById(socket.userId);
          
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
              sender: socket.userId,
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

        // Broadcast message to all participants in the conversation
        const broadcastData = {
          id: message._id,
          conversationId: conversationId,
          senderId: socket.userId,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          receiverId: message.receiver._id,
          content: content,
          type: messageType,
          timestamp: message.createdAt,
          status: 'sent'
        };

        console.log('📡 Broadcasting message to conversation room:', {
          roomName: `conversation_${conversationId}`,
          messageId: message._id,
          senderId: socket.userId,
          senderName: socket.user.name,
          content: content.substring(0, 50) + '...'
        });

        // Check how many users are in the conversation room
        const roomName = `conversation_${conversationId}`;
        const room = io.sockets.adapter.rooms.get(roomName);
        const roomSize = room ? room.size : 0;
        
        console.log('📊 Conversation room info:', {
          roomName,
          roomSize,
          hasRoom: !!room,
          participants: conversation.participants.map(p => p.toString())
        });

        // Emit to conversation room
        io.to(`conversation_${conversationId}`).emit('chat_message', broadcastData);
        
        // Also emit as 'new_message' for backward compatibility
        io.to(`conversation_${conversationId}`).emit('new_message', broadcastData);

        // Also emit to individual users as fallback
        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            const participantSocket = activeConnections.get(participantId.toString());
            if (participantSocket) {
              participantSocket.emit('chat_message', broadcastData);
              console.log(`📤 Message sent directly to participant: ${participantId}`);
            }
          }
        });

        console.log(`✅ Message sent by ${socket.user.name} to conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    };

    // Handle both event names for compatibility
    socket.on('send_message', handleSendMessage);
    socket.on('chat_message', handleSendMessage);

    // Typing indicators - Handle both event names for compatibility
    const handleTypingStart = (data) => {
      try {
        const { conversationId } = data;
        typingUsers.set(socket.userId, {
          conversationId: conversationId,
          userName: socket.user.name,
          timestamp: Date.now()
        });
        
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });
        
        // Also emit as 'typing' for frontend compatibility
        socket.to(`conversation_${conversationId}`).emit('typing', {
          conversationId: conversationId,
          users: [socket.user.name]
        });
      } catch (error) {
        console.error('Error handling typing start:', error);
      }
    };

    const handleTypingStop = (data) => {
      try {
        const { conversationId } = data;
        typingUsers.delete(socket.userId);
        
        socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });
        
        // Also emit as 'typing' for frontend compatibility
        socket.to(`conversation_${conversationId}`).emit('typing', {
          conversationId: conversationId,
          users: []
        });
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    };

    // Handle both event names for compatibility
    socket.on('typing_start', handleTypingStart);
    socket.on('typing', (data) => {
      if (data.isTyping) {
        handleTypingStart(data);
      } else {
        handleTypingStop(data);
      }
    });
    socket.on('typing_stop', handleTypingStop);

    // Handle presence updates
    socket.on('update_presence', async (data) => {
      try {
        const { status, currentActivity } = data;
        await UserPresence.updatePresence(socket.userId, {
          status: status || 'online',
          currentActivity: currentActivity || null
        });
        
        console.log(`📱 Presence updated for ${socket.user.name}: ${status || 'online'}`);
        
        // Notify conversation partners if in a chat
        const conversationId = chatRooms.get(socket.userId);
        if (conversationId) {
          socket.to(`conversation_${conversationId}`).emit('user_presence_updated', {
            userId: socket.userId,
            userName: socket.user.name,
            status: status || 'online',
            currentActivity: currentActivity || null,
            lastSeen: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    });

    // Handle heartbeat/ping to keep connection alive and update last seen
    socket.on('ping', () => {
      socket.emit('pong');
      // Update last seen timestamp
      UserPresence.updatePresence(socket.userId, {
        lastSeen: new Date()
      }).catch(error => {
        console.error('Error updating last seen on ping:', error);
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);
      
      // Update user presence in database
      try {
        await UserPresence.setOffline(socket.userId);
        console.log(`✅ User presence updated: ${socket.user.name} is offline`);
      } catch (error) {
        console.error('Error updating user presence on disconnect:', error);
      }
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Remove from typing users
      typingUsers.delete(socket.userId);
      
      // Remove from chat rooms
      const conversationId = chatRooms.get(socket.userId);
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId: conversationId
        });
        chatRooms.delete(socket.userId);
      }
      
      // Emit user offline status to all connected users
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        userName: socket.user.name,
        userRole: socket.user.role,
        status: 'offline',
        lastSeen: new Date()
      });
    });
  });

  return io;
};

module.exports = initializeSocketIO;
