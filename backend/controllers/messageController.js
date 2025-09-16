const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const Course = require('../models/Course');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { receiver, subject, message, messageType, priority, course, rating, tags } = req.body;

  // Validate required fields
  if (!receiver || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Receiver, subject, and message are required'
    });
  }

  // Check if receiver exists
  const receiverUser = await User.findById(receiver);
  if (!receiverUser) {
    return res.status(404).json({
      success: false,
      message: 'Receiver not found'
    });
  }

  // Check if sender and receiver are different
  if (req.user._id.toString() === receiver) {
    return res.status(400).json({
      success: false,
      message: 'Cannot send message to yourself'
    });
  }

  // Create message
  const newMessage = await Message.create({
    sender: req.user._id,
    receiver,
    subject,
    message,
    messageType: messageType || 'general',
    priority: priority || 'medium',
    course: course || null,
    rating: rating || null,
    tags: tags || []
  });

  // Populate sender and receiver details
  await newMessage.populate([
    { path: 'sender', select: 'name email role' },
    { path: 'receiver', select: 'name email role' },
    { path: 'course', select: 'title' },
    { path: 'rating', select: 'overallRating review' }
  ]);

  // Create notification for receiver
  await Notification.create({
    recipient: receiver,
    type: 'message_received',
    title: 'New Message Received',
    message: `You have received a new message from ${req.user.name}: ${subject}`,
    data: {
      messageId: newMessage._id,
      senderId: req.user._id,
      senderName: req.user.name
    }
  });

  res.status(201).json({
    success: true,
    data: newMessage,
    message: 'Message sent successfully'
  });
});

// @desc    Get messages for a user (inbox)
// @route   GET /api/messages/inbox
// @access  Private
exports.getInbox = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, messageType, priority } = req.query;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { receiver: req.user._id };
  if (status) filter.status = status;
  if (messageType) filter.messageType = messageType;
  if (priority) filter.priority = priority;

  const messages = await Message.find(filter)
    .populate('sender', 'name email role')
    .populate('course', 'title')
    .populate('rating', 'overallRating review')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments(filter);

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
exports.getSentMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, messageType, priority } = req.query;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { sender: req.user._id };
  if (status) filter.status = status;
  if (messageType) filter.messageType = messageType;
  if (priority) filter.priority = priority;

  const messages = await Message.find(filter)
    .populate('receiver', 'name email role')
    .populate('course', 'title')
    .populate('rating', 'overallRating review')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Message.countDocuments(filter);

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get a specific message
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .populate('course', 'title')
    .populate('rating', 'overallRating review')
    .populate('replies.sender', 'name email role');

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user has access to this message
  if (message.sender._id.toString() !== req.user._id.toString() && 
      message.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Mark as read if user is the receiver
  if (message.receiver._id.toString() === req.user._id.toString() && !message.isRead) {
    await message.markAsRead();
  }

  res.json({
    success: true,
    data: message
  });
});

// @desc    Reply to a message
// @route   POST /api/messages/:id/reply
// @access  Private
exports.replyToMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Reply message is required'
    });
  }

  const originalMessage = await Message.findById(req.params.id);
  if (!originalMessage) {
    return res.status(404).json({
      success: false,
      message: 'Original message not found'
    });
  }

  // Check if user has access to reply
  if (originalMessage.sender._id.toString() !== req.user._id.toString() && 
      originalMessage.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Add reply
  await originalMessage.addReply(req.user._id, message);

  // Create notification for the other party
  const otherUserId = originalMessage.sender._id.toString() === req.user._id.toString() 
    ? originalMessage.receiver._id 
    : originalMessage.sender._id;

  await Notification.create({
    recipient: otherUserId,
    type: 'message_reply',
    title: 'Message Reply Received',
    message: `${req.user.name} replied to your message: ${originalMessage.subject}`,
    data: {
      messageId: originalMessage._id,
      senderId: req.user._id,
      senderName: req.user.name
    }
  });

  // Get updated message
  const updatedMessage = await Message.findById(req.params.id)
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .populate('replies.sender', 'name email role');

  res.json({
    success: true,
    data: updatedMessage,
    message: 'Reply sent successfully'
  });
});

// @desc    Update message status
// @route   PUT /api/messages/:id/status
// @access  Private
exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['sent', 'delivered', 'read', 'replied', 'resolved'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status is required'
    });
  }

  const message = await Message.findById(req.params.id);
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user has access to update this message
  if (message.sender._id.toString() !== req.user._id.toString() && 
      message.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  message.status = status;
  if (status === 'read') {
    message.isRead = true;
    message.readAt = new Date();
  }

  await message.save();

  res.json({
    success: true,
    data: message,
    message: 'Message status updated successfully'
  });
});

// @desc    Get message statistics
// @route   GET /api/messages/stats
// @access  Private
// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user has access to delete this message
  if (message.sender._id.toString() !== req.user._id.toString() && 
      message.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await Message.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

exports.getMessageStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        unreadMessages: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0
            ]
          }
        },
        sentMessages: {
          $sum: {
            $cond: [{ $eq: ['$sender', userId] }, 1, 0]
          }
        },
        receivedMessages: {
          $sum: {
            $cond: [{ $eq: ['$receiver', userId] }, 1, 0]
          }
        },
        urgentMessages: {
          $sum: {
            $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const messageStats = stats[0] || {
    totalMessages: 0,
    unreadMessages: 0,
    sentMessages: 0,
    receivedMessages: 0,
    urgentMessages: 0
  };

  res.json({
    success: true,
    data: messageStats
  });
});

// @desc    Get users for messaging (admin can message tutors, tutors can message admin)
// @route   GET /api/messages/users
// @access  Private
exports.getMessagingUsers = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'admin') {
    // Admin can message tutors
    filter.role = 'tutor';
  } else if (req.user.role === 'tutor') {
    // Tutors can message admin
    filter.role = 'admin';
  } else {
    // Learners can message tutors and admin
    filter.role = { $in: ['tutor', 'admin'] };
  }

  const users = await User.find(filter)
    .select('name email role tutorProfile.skills')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: users
  });
});

// @desc    Get tutor learners
// @route   GET /api/messages/tutor-learners
// @access  Private
// @desc    Get learner tutors (tutors from enrolled courses)
// @route   GET /api/messages/learner-tutors
// @access  Private
exports.getLearnerTutors = asyncHandler(async (req, res) => {
  // Only learners can access this endpoint
  if (req.user.role !== 'learner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only learners can access this endpoint.'
    });
  }

  try {
    // Get all courses the learner is enrolled in
    const enrolledCourses = await Course.find({ 
      enrolledStudents: req.user._id 
    })
      .select('_id title tutor')
      .populate('tutor', 'name email role profilePicture');

    // Extract unique tutors from enrolled courses
    const tutorIds = new Set();
    const tutors = [];

    enrolledCourses.forEach(course => {
      if (course.tutor && !tutorIds.has(course.tutor._id.toString())) {
        tutorIds.add(course.tutor._id.toString());
        tutors.push({
          _id: course.tutor._id,
          name: course.tutor.name,
          email: course.tutor.email,
          role: course.tutor.role,
          profilePicture: course.tutor.profilePicture,
          courses: enrolledCourses
            .filter(c => c.tutor._id.toString() === course.tutor._id.toString())
            .map(c => ({ _id: c._id, title: c.title }))
        });
      }
    });

    // Sort by name
    tutors.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: tutors,
      message: `Found ${tutors.length} tutors from ${enrolledCourses.length} enrolled courses`
    });
  } catch (error) {
    console.error('Error fetching learner tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutors'
    });
  }
});

exports.getTutorLearners = asyncHandler(async (req, res) => {
  // Only tutors can access this endpoint
  if (req.user.role !== 'tutor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only tutors can access this endpoint.'
    });
  }

  try {
    // Get all courses created by this tutor
    const tutorCourses = await Course.find({ tutor: req.user._id })
      .select('_id title enrolledStudents')
      .populate('enrolledStudents', 'name email role profilePicture');

    // Extract unique enrolled students from all courses
    const enrolledStudentIds = new Set();
    const enrolledStudents = [];

    tutorCourses.forEach(course => {
      course.enrolledStudents.forEach(student => {
        if (!enrolledStudentIds.has(student._id.toString())) {
          enrolledStudentIds.add(student._id.toString());
          enrolledStudents.push({
            _id: student._id,
            name: student.name,
            email: student.email,
            role: student.role,
            profilePicture: student.profilePicture,
            courses: tutorCourses
              .filter(c => c.enrolledStudents.some(s => s._id.toString() === student._id.toString()))
              .map(c => ({ _id: c._id, title: c.title }))
          });
        }
      });
    });

    // Sort by name
    enrolledStudents.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: enrolledStudents,
      message: `Found ${enrolledStudents.length} enrolled students across ${tutorCourses.length} courses`
    });
  } catch (error) {
    console.error('Error fetching tutor learners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students'
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count unread messages received by the user
    const unreadCount = await Message.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        unreadCount: unreadCount
      },
      message: 'Unread count retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});
