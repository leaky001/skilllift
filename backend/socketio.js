const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const LiveClass = require('./models/LiveClass');
const Conversation = require('./models/Conversation');
const ChatMessage = require('./models/ChatMessage');

// Store active connections
const activeConnections = new Map();
const classRooms = new Map();
const chatRooms = new Map(); // New: Store chat room connections
const typingUsers = new Map(); // New: Store typing users

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
      // Try to get token from auth object first, then from query params
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      console.log('🔐 Socket authentication attempt:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        socketId: socket.id,
        authToken: !!socket.handshake.auth.token,
        queryToken: !!socket.handshake.query.token
      });
      
      if (!token) {
        console.log('❌ No token provided for socket authentication');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔐 Token decoded successfully:', { userId: decoded.id });
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('❌ User not found for socket authentication:', decoded.id);
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      console.log('✅ Socket authentication successful:', { userId: socket.userId, userName: socket.user.name });
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
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

    // Join live class
    socket.on('join-live-class', async (data) => {
      try {
        const { classId } = data;
        console.log('🎥 User attempting to join live class:', {
          userId: socket.userId,
          userName: socket.user.name,
          classId: classId
        });
        
        // Verify user is enrolled in the class
        const liveClass = await LiveClass.findById(classId).populate('courseId');
        if (!liveClass) {
          console.log('❌ Live class not found:', classId);
          socket.emit('error', { message: 'Live class not found' });
          return;
        }

        console.log('📚 Live class found:', {
          id: liveClass._id,
          title: liveClass.title,
          courseId: liveClass.courseId._id,
          tutorId: liveClass.tutorId
        });

        // Check if user is enrolled (for learners) or is the tutor
        const isTutor = liveClass.tutorId.toString() === socket.userId;
        console.log('👨‍🏫 Is tutor check:', { isTutor, tutorId: liveClass.tutorId, userId: socket.userId });
        
        const isEnrolled = await checkEnrollment(socket.userId, liveClass.courseId._id);
        console.log('📝 Enrollment check:', { isEnrolled, userId: socket.userId, courseId: liveClass.courseId._id });
        
        if (!isTutor && !isEnrolled) {
          console.log('❌ User not enrolled in class:', {
            userId: socket.userId,
            userName: socket.user.name,
            courseId: liveClass.courseId._id,
            isTutor,
            isEnrolled
          });
          socket.emit('error', { message: 'You are not enrolled in this class' });
          return;
        }

        // Join room
        socket.join(classId);
        
        // Initialize room if it doesn't exist
        if (!classRooms.has(classId)) {
          classRooms.set(classId, {
            participants: new Map(),
            chatMessages: [],
            handRaised: new Set()
          });
        }

        const room = classRooms.get(classId);
        
        // Check if user is already in the room
        let participantData;
        if (room.participants.has(socket.userId)) {
          console.log(`⚠️ User ${socket.user.name} is already in the room, updating join time`);
          const existingParticipant = room.participants.get(socket.userId);
          existingParticipant.joinedAt = new Date();
          room.participants.set(socket.userId, existingParticipant);
          participantData = existingParticipant;
        } else {
          console.log(`✅ Adding new participant: ${socket.user.name}`);
          participantData = {
            id: socket.userId,
            name: socket.user.name,
            role: socket.user.role,
            joinedAt: new Date()
          };
          room.participants.set(socket.userId, participantData);
        }

        // Add participant to database
        try {
          console.log('💾 Adding attendee to database:', { userId: socket.userId, userName: socket.user.name });
          await liveClass.addAttendee(socket.userId);
          console.log(`✅ Added ${socket.user.name} to live class attendees in database`);
        } catch (error) {
          console.error('❌ Error adding attendee to database:', error);
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            userId: socket.userId,
            liveClassId: liveClass._id
          });
          // Don't fail the entire join process for database errors
          console.log('⚠️ Continuing with join despite database error');
        }

        // Notify others in the room
        console.log(`📢 Notifying others about ${socket.user.name} joining...`);
        socket.to(classId).emit('user-joined', {
          user: participantData
        });
        console.log(`📢 User-joined event sent for:`, participantData);

        // Send current participants to the new user
        const participantsArray = Array.from(room.participants.values());
        console.log(`📤 Sending participants list to ${socket.user.name}:`, participantsArray);
        socket.emit('participants-list', participantsArray);

        // Send chat history
        socket.emit('chat-history', room.chatMessages);

        console.log(`👥 ${socket.user.name} joined live class: ${liveClass.title} (Session: ${liveClass.sessionId || 'No session'})`);
        console.log(`📊 Current room participants: ${room.participants.size}`);
      } catch (error) {
        console.error('❌ Error joining live class:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          userId: socket.userId,
          userName: socket.user?.name,
          classId: classId
        });
        socket.emit('error', { message: 'Failed to join live class: ' + error.message });
      }
    });

    // Handle user leaving live class
    socket.on('leave-live-class', async (data) => {
      try {
        const { classId } = data;
        console.log('🚪 User leaving live class:', {
          userId: socket.userId,
          userName: socket.user.name,
          classId: classId
        });
        
        // Remove user from room participants
        const room = classRooms.get(classId);
        if (room && room.participants.has(socket.userId)) {
          console.log(`👋 Removing ${socket.user.name} from participants`);
          room.participants.delete(socket.userId);
          
          // Notify other participants
          socket.to(classId).emit('user-left', {
            userId: socket.userId,
            userName: socket.user.name
          });
          
          console.log(`📊 Remaining participants: ${room.participants.size}`);
        }
        
        // Remove user from database attendees
        try {
          const LiveClass = require('./models/LiveClass');
          const liveClass = await LiveClass.findById(classId);
          if (liveClass) {
            await liveClass.removeAttendee(socket.userId);
            console.log(`✅ Removed ${socket.user.name} from live class attendees in database`);
          }
        } catch (error) {
          console.error('❌ Error removing attendee from database:', error);
        }
        
        // Leave the socket room
        socket.leave(classId);
        console.log(`👋 ${socket.user.name} left live class: ${classId}`);
        
      } catch (error) {
        console.error('❌ Error handling leave-live-class:', error);
      }
    });

    // Handle user away/back status
    socket.on('user-away', (data) => {
      const { classId } = data;
      console.log('😴 User away:', { userId: socket.userId, userName: socket.user.name, classId });
      socket.to(classId).emit('user-status-changed', {
        userId: socket.userId,
        userName: socket.user.name,
        status: 'away'
      });
    });

    socket.on('user-back', (data) => {
      const { classId } = data;
      console.log('😊 User back:', { userId: socket.userId, userName: socket.user.name, classId });
      socket.to(classId).emit('user-status-changed', {
        userId: socket.userId,
        userName: socket.user.name,
        status: 'active'
      });
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      try {
        const { message, classId } = data;
        
        if (!socket.rooms.has(classId)) {
          socket.emit('error', { message: 'You are not in this class' });
          return;
        }

        const messageData = {
          id: Date.now(),
          userId: socket.userId,
          userName: socket.user.name,
          userRole: socket.user.role,
          message: message,
          timestamp: new Date(),
          classId: classId
        };

        // Store message in room
        const room = classRooms.get(classId);
        if (room) {
          room.chatMessages.push(messageData);
          // Keep only last 100 messages
          if (room.chatMessages.length > 100) {
            room.chatMessages = room.chatMessages.slice(-100);
          }
        }

        // Broadcast to all participants in the room
        io.to(classId).emit('chat-message', messageData);
        
        console.log(`💬 ${socket.user.name}: ${message}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle live class start (for tutors)
    socket.on('start-live-class', async (data) => {
      try {
        const { classId } = data;
        console.log('🎥 Tutor starting live class:', {
          userId: socket.userId,
          userName: socket.user.name,
          classId: classId
        });
        
        // Verify the live class exists and user is the tutor
        const liveClass = await LiveClass.findById(classId).populate('courseId');
        if (!liveClass) {
          console.log('❌ Live class not found:', classId);
          socket.emit('error', { message: 'Live class not found' });
          return;
        }
        
        if (liveClass.tutorId.toString() !== socket.userId) {
          console.log('❌ User is not the tutor for this live class');
          socket.emit('error', { message: 'Only the tutor can start this live class' });
          return;
        }
        
        // Update live class status to 'live'
        await LiveClass.findByIdAndUpdate(classId, { 
          status: 'live',
          startedAt: new Date()
        });
        
        console.log('✅ Live class status updated to live:', classId);
        
        // Broadcast to all enrolled students that the class has started
        const enrolledStudents = await Enrollment.find({ 
          courseId: liveClass.courseId._id,
          status: 'active'
        }).populate('userId', 'name email');
        
        console.log('📢 Broadcasting live class start to', enrolledStudents.length, 'enrolled students');
        
        // Emit to all connected users (they can filter on frontend)
        io.emit('live-class-started', {
          classId: classId,
          title: liveClass.title,
          tutor: liveClass.tutorId,
          courseId: liveClass.courseId._id,
          startedAt: new Date()
        });
        
        // Send individual notifications to enrolled students
        for (const enrollment of enrolledStudents) {
          const studentSocket = activeConnections.get(enrollment.userId._id.toString());
          if (studentSocket) {
            studentSocket.emit('live-class-notification', {
              classId: classId,
              title: liveClass.title,
              tutor: liveClass.tutorId,
              courseId: liveClass.courseId._id,
              message: 'Your live class has started!'
            });
          }
        }
        
        socket.emit('live-class-started-success', {
          classId: classId,
          message: 'Live class started successfully'
        });
        
      } catch (error) {
        console.error('❌ Error starting live class:', error);
        socket.emit('error', { message: 'Failed to start live class: ' + error.message });
      }
    });

    // Handle live class end (for tutors)
    socket.on('end-live-class', async (data) => {
      try {
        const { classId } = data;
        console.log('🏁 Tutor ending live class:', {
          userId: socket.userId,
          userName: socket.user.name,
          classId: classId
        });
        
        // Verify the live class exists and user is the tutor
        const liveClass = await LiveClass.findById(classId);
        if (!liveClass) {
          console.log('❌ Live class not found:', classId);
          socket.emit('error', { message: 'Live class not found' });
          return;
        }
        
        if (liveClass.tutorId.toString() !== socket.userId) {
          console.log('❌ User is not the tutor for this live class');
          socket.emit('error', { message: 'Only the tutor can end this live class' });
          return;
        }
        
        // Update live class status to 'completed'
        await LiveClass.findByIdAndUpdate(classId, { 
          status: 'completed',
          endedAt: new Date()
        });
        
        console.log('✅ Live class status updated to completed:', classId);
        
        // Broadcast to all participants that the class has ended
        socket.to(classId).emit('live-class-ended', {
          classId: classId,
          message: 'Live class has ended'
        });
        
        socket.emit('live-class-ended-success', {
          classId: classId,
          message: 'Live class ended successfully'
        });
        
      } catch (error) {
        console.error('❌ Error ending live class:', error);
        socket.emit('error', { message: 'Failed to end live class: ' + error.message });
      }
    });

    // Handle hand raise
    socket.on('hand-raise', (data) => {
      try {
        const { classId, isRaised } = data;
        
        if (!socket.rooms.has(classId)) {
          socket.emit('error', { message: 'You are not in this class' });
          return;
        }

        const room = classRooms.get(classId);
        if (room) {
          if (isRaised) {
            room.handRaised.add(socket.userId);
          } else {
            room.handRaised.delete(socket.userId);
          }
        }

        // Broadcast hand raise status
        socket.to(classId).emit('hand-raise-update', {
          userId: socket.userId,
          userName: socket.user.name,
          isRaised: isRaised
        });

        console.log(`✋ ${socket.user.name} ${isRaised ? 'raised' : 'lowered'} hand`);
      } catch (error) {
        console.error('Error handling hand raise:', error);
        socket.emit('error', { message: 'Failed to update hand raise' });
      }
    });

    // Handle Enhanced WebRTC signaling for multi-participant video chat
    socket.on('webrtc-offer', (data) => {
      try {
        const { offer, roomId, to } = data;
        console.log('📞 WebRTC offer from:', socket.userId, 'to:', to);
        
        if (to) {
          // Send to specific participant
          socket.to(to).emit('webrtc-offer', { 
            offer, 
            from: socket.userId,
            roomId 
          });
        } else {
          // Broadcast to all participants in room
          socket.to(roomId).emit('webrtc-offer', { 
            offer, 
            from: socket.userId,
            roomId 
          });
        }
      } catch (error) {
        console.error('Error handling WebRTC offer:', error);
      }
    });

    socket.on('webrtc-answer', (data) => {
      try {
        const { answer, roomId, to } = data;
        console.log('📞 WebRTC answer from:', socket.userId, 'to:', to);
        
        if (to) {
          // Send to specific participant
          socket.to(to).emit('webrtc-answer', { 
            answer, 
            from: socket.userId,
            roomId 
          });
        } else {
          // Broadcast to all participants in room
          socket.to(roomId).emit('webrtc-answer', { 
            answer, 
            from: socket.userId,
            roomId 
          });
        }
      } catch (error) {
        console.error('Error handling WebRTC answer:', error);
      }
    });

    socket.on('webrtc-ice-candidate', (data) => {
      try {
        const { candidate, roomId, to } = data;
        console.log('🧊 WebRTC ICE candidate from:', socket.userId, 'to:', to);
        
        if (to) {
          // Send to specific participant
          socket.to(to).emit('webrtc-ice-candidate', { 
            candidate, 
            from: socket.userId,
            roomId 
          });
        } else {
          // Broadcast to all participants in room
          socket.to(roomId).emit('webrtc-ice-candidate', { 
            candidate, 
            from: socket.userId,
            roomId 
          });
        }
      } catch (error) {
        console.error('Error handling WebRTC ICE candidate:', error);
      }
    });

    // Handle screen sharing offers
    socket.on('screen-share-offer', (data) => {
      try {
        const { offer, roomId } = data;
        console.log('🖥️ Screen share offer from:', socket.userId);
        
        socket.to(roomId).emit('screen-share-offer', { 
          offer, 
          from: socket.userId,
          roomId 
        });
      } catch (error) {
        console.error('Error handling screen share offer:', error);
      }
    });

    // Handle participant joining with enhanced data
    socket.on('participant-joined', (data) => {
      try {
        const { roomId, userId, userName, userRole } = data;
        console.log('👥 Enhanced participant joined:', { userId, userName, userRole, roomId });
        
        // Notify all participants in the room
        socket.to(roomId).emit('participant-joined', {
          userId,
          userName,
          userRole,
          joinedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling participant joined:', error);
      }
    });

    // Handle participant leaving with enhanced data
    socket.on('participant-left', (data) => {
      try {
        const { roomId, userId } = data;
        console.log('👥 Enhanced participant left:', { userId, roomId });
        
        // Notify all participants in the room
        socket.to(roomId).emit('participant-left', {
          userId,
          leftAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling participant left:', error);
      }
    });

    // Legacy WebRTC signaling (for backward compatibility)
    socket.on('offer', (data) => {
      try {
        const { offer, classId } = data;
        socket.to(classId).emit('offer', { offer, from: socket.userId });
      } catch (error) {
        console.error('Error handling legacy offer:', error);
      }
    });

    socket.on('answer', (data) => {
      try {
        const { answer, classId } = data;
        socket.to(classId).emit('answer', { answer, from: socket.userId });
      } catch (error) {
        console.error('Error handling legacy answer:', error);
      }
    });

    socket.on('ice-candidate', (data) => {
      try {
        const { candidate, classId } = data;
        socket.to(classId).emit('ice-candidate', { candidate, from: socket.userId });
      } catch (error) {
        console.error('Error handling legacy ICE candidate:', error);
      }
    });

    // ===== CHAT FUNCTIONALITY =====
    
    // Join conversation room
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        console.log('💬 User joining conversation:', { 
          userId: socket.userId, 
          userName: socket.user.name,
          userRole: socket.user.role,
          conversationId 
        });
        
        // Verify user is participant in conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          console.log('❌ Conversation not found:', conversationId);
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        console.log('📋 Conversation found:', {
          id: conversation._id,
          participants: conversation.participants.map(p => p.toString()),
          participantCount: conversation.participants.length
        });
        
        const isParticipant = conversation.participants.some(p => p.toString() === socket.userId);
        if (!isParticipant) {
          console.log('❌ User not participant:', {
            userId: socket.userId,
            participants: conversation.participants.map(p => p.toString()),
            isParticipant
          });
          socket.emit('error', { message: 'Access denied to this conversation' });
          return;
        }
        
        // Join the conversation room
        socket.join(`conversation_${conversationId}`);
        
        // Store chat room connection
        if (!chatRooms.has(conversationId)) {
          chatRooms.set(conversationId, new Set());
        }
        chatRooms.get(conversationId).add(socket.userId);
        
        console.log('✅ User joined conversation room:', { 
          userId: socket.userId, 
          userName: socket.user.name,
          conversationId,
          roomMembers: chatRooms.get(conversationId).size
        });
        
        // Notify other participants
        socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
          userId: socket.userId,
          userName: socket.user.name,
          conversationId
        });
        
      } catch (error) {
        console.error('❌ Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      console.log('💬 User leaving conversation:', { userId: socket.userId, conversationId });
      
      socket.leave(`conversation_${conversationId}`);
      
      // Remove from chat room connections
      if (chatRooms.has(conversationId)) {
        chatRooms.get(conversationId).delete(socket.userId);
        if (chatRooms.get(conversationId).size === 0) {
          chatRooms.delete(conversationId);
        }
      }
      
      // Notify other participants
      socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
        userId: socket.userId,
        userName: socket.user.name,
        conversationId
      });
    });

    // Handle live class chat messages
    socket.on('live-class-chat', async (data) => {
      try {
        const { classId, message, messageType = 'text' } = data;
        console.log('💬 Live class chat message:', { 
          senderId: socket.userId, 
          senderName: socket.user.name,
          classId, 
          message: message.substring(0, 50) + '...',
          messageType
        });
        
        // Verify user is in the live class
        if (!socket.rooms.has(classId)) {
          socket.emit('error', { message: 'You are not in this live class' });
          return;
        }
        
        // Broadcast message to all participants in the live class
        socket.to(classId).emit('live-class-chat', {
          id: Date.now() + Math.random(), // Simple ID generation
          senderId: socket.userId,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          message: message,
          messageType: messageType,
          timestamp: new Date(),
          classId: classId
        });
        
        console.log('✅ Live class chat message broadcasted to room:', classId);
        
      } catch (error) {
        console.error('❌ Error handling live class chat:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Send chat message - RE-ENABLED: Frontend uses WebSocket for real-time messaging
    socket.on('chat_message', async (data) => {
      try {
        const { conversationId, receiverId, content, replyTo, replyContent } = data;
        console.log('💬 Chat message received via WebSocket:', { 
          senderId: socket.userId, 
          conversationId, 
          receiverId, 
          content: content.substring(0, 50) + '...' 
        });
        
        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        const isParticipant = conversation.participants.some(p => p.toString() === socket.userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied to this conversation' });
          return;
        }
        
        // Create message in database
        const message = await ChatMessage.createTextMessage({
          conversationId,
          senderId: socket.userId,
          receiverId,
          content,
          replyTo,
          replyContent
        });
        
        console.log('✅ Chat message saved via WebSocket:', message._id);
        
        // Emit message to all participants in the conversation
        io.to(`conversation_${conversationId}`).emit('chat_message', {
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
        });
        
        // Emit notification to receiver if not in the room
        const receiverSocket = activeConnections.get(receiverId);
        if (receiverSocket && !chatRooms.get(conversationId)?.has(receiverId)) {
          receiverSocket.emit('new_message_notification', {
            conversationId,
            senderName: message.sender.name,
            content: message.content,
            unreadCount: conversation.getUnreadCount(receiverId)
          });
        }
        
      } catch (error) {
        console.error('❌ Error sending chat message via WebSocket:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      
      console.log('⌨️ Typing event received:', {
        userId: socket.userId,
        userName: socket.user.name,
        conversationId,
        isTyping
      });
      
      if (isTyping) {
        typingUsers.set(socket.userId, {
          userId: socket.userId,
          conversationId,
          userName: socket.user.name,
          timestamp: Date.now()
        });
      } else {
        typingUsers.delete(socket.userId);
      }
      
      // Get all users currently typing in this conversation (excluding the current user)
      const conversationTypingUsers = Array.from(typingUsers.values())
        .filter(user => user.conversationId === conversationId && user.userId !== socket.userId)
        .map(user => ({
          userId: user.userId,
          userName: user.userName,
          timestamp: user.timestamp
        }));
      
      console.log('⌨️ Sending typing status to conversation:', {
        conversationId,
        typingUsers: conversationTypingUsers,
        currentUserId: socket.userId
      });
      
      // Emit typing status to other participants in the conversation
      socket.to(`conversation_${conversationId}`).emit('typing', {
        conversationId,
        users: conversationTypingUsers,
        isTyping: conversationTypingUsers.length > 0
      });
    });

    // Mark message as read
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        
        const message = await ChatMessage.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }
        
        // Mark as read
        await message.markAsRead(socket.userId);
        
        // Update conversation unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          await conversation.markAsRead(socket.userId);
        }
        
        // Emit read status to sender
        const senderSocket = activeConnections.get(message.sender.toString());
        if (senderSocket) {
          senderSocket.emit('message_read', {
            messageId,
            readBy: socket.userId,
            readAt: new Date()
          });
        }
        
        console.log('✅ Message marked as read:', messageId);
        
      } catch (error) {
        console.error('❌ Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Remove from typing users
      typingUsers.delete(socket.userId);
      
      // Remove from all chat rooms
      chatRooms.forEach((users, conversationId) => {
        users.delete(socket.userId);
        if (users.size === 0) {
          chatRooms.delete(conversationId);
        }
      });
      
      // Emit user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        userName: socket.user.name,
        userRole: socket.user.role
      });
      
      // Remove from all rooms and notify others
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) { // Skip the socket's own room
          const room = classRooms.get(roomId);
          if (room) {
            room.participants.delete(socket.userId);
            room.handRaised.delete(socket.userId);
            
            // Remove from database
            try {
              const LiveClass = require('./models/LiveClass');
              await LiveClass.findByIdAndUpdate(roomId, {
                $pull: { attendees: { userId: socket.userId } }
              });
              console.log(`✅ Removed ${socket.user.name} from live class attendees in database`);
            } catch (error) {
              console.error('❌ Error removing attendee from database:', error);
            }
            
            // Notify others in the room
            socket.to(roomId).emit('user-left', {
              userId: socket.userId,
              userName: socket.user.name
            });
          }
        }
      }
    });
  });

  return io;
};

// Helper function to check enrollment
const checkEnrollment = async (userId, courseId) => {
  try {
    console.log('🔍 Checking enrollment:', { userId, courseId });
    const Enrollment = require('./models/Enrollment');
    const enrollment = await Enrollment.findOne({
      learner: userId,
      course: courseId,
      status: 'active'
    });
    console.log('📝 Enrollment result:', { 
      found: !!enrollment, 
      enrollmentId: enrollment?._id,
      status: enrollment?.status 
    });
    return !!enrollment;
  } catch (error) {
    console.error('❌ Error checking enrollment:', error);
    return false;
  }
};

module.exports = { initializeSocketIO };
