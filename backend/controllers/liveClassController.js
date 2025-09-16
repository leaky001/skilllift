const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');
// const { notifyLiveClassScheduled, scheduleLiveClassReminder } = require('../services/courseNotificationService');

// Get Socket.IO instance
let io;
const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// @desc    Create a live class for published courses
// @route   POST /api/tutor/live-classes
// @access  Private (Tutor)
const createLiveClass = asyncHandler(async (req, res) => {
  console.log('🎥 Creating live class for published course...');
  console.log('📝 Request body:', req.body);
  console.log('👤 User:', req.user);
  
  const {
    title,
    description,
    courseId,
    scheduledDate,
    duration,
    maxParticipants = 50,
    type = 'lecture',
    level = 'beginner',
    prerequisites = [],
    materials = [],
    tags = [],
    isPublic = true,
    requiresApproval = false,
    price = 0,
    currency = 'USD',
    meetingLink,
    meetingId,
    meetingPassword,
    platform = 'google_meet',
    recordingEnabled = true,
    chatEnabled = true,
    qaEnabled = true,
    breakoutRooms = false,
    waitingRoom = true,
    screenShare = true,
    whiteboard = true,
    polls = false,
    handRaise = true
  } = req.body;

  // Validate required fields
  if (!title || !description || !courseId || !scheduledDate || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, course ID, scheduled date, and duration are required'
    });
  }

  // Check if course exists and belongs to tutor
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only create live classes for your own courses'
    });
  }

  // Check if course is published
  if (course.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Course must be published before creating live classes'
    });
  }

  // Validate scheduled date (must be in the future)
  const scheduledDateTime = new Date(scheduledDate);
  if (scheduledDateTime <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Scheduled date must be in the future'
    });
  }

  // Check if scheduled date is within course duration
  if (course.startDate && course.endDate) {
    if (scheduledDateTime < course.startDate || scheduledDateTime > course.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Live class must be scheduled within the course duration period'
      });
    }
  }

  // Validate duration
  if (duration < 15 || duration > 480) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be between 15 minutes and 8 hours'
    });
  }

  // Check for conflicting live classes
  const conflictingClass = await LiveClass.findOne({
    courseId,
    scheduledDate: {
      $gte: new Date(scheduledDateTime.getTime() - duration * 60000),
      $lte: new Date(scheduledDateTime.getTime() + duration * 60000)
    },
    status: { $in: ['scheduled', 'live'] }
  });

  if (conflictingClass) {
    return res.status(400).json({
      success: false,
      message: 'There is already a live class scheduled at this time'
    });
  }

  // Create the live class
  console.log('🔨 Creating LiveClass object...');
  const liveClass = new LiveClass({
    title,
    description,
    courseId,
    tutorId: req.user._id,
    scheduledDate: scheduledDateTime,
    duration,
    maxParticipants,
    type,
    level,
    prerequisites,
    materials,
    tags,
    isPublic,
    requiresApproval,
    price,
    currency,
    platform,
    recordingEnabled,
    chatEnabled,
    qaEnabled,
    breakoutRooms,
    waitingRoom,
    screenShare,
    whiteboard,
    polls,
    handRaise
  });

  console.log('💾 Saving live class to database...');
  await liveClass.save();
  console.log('✅ Live class saved successfully:', liveClass._id);

  // Notify enrolled students about the new live class
  try {
    const enrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'active' 
    }).populate('learner', 'name email');

    for (const enrollment of enrollments) {
      // Create notification
      await Notification.create({
        recipient: enrollment.learner._id,
        type: 'live_class_scheduled',
        title: '🎥 New Live Class Scheduled!',
        message: `Your tutor has scheduled a new live class "${title}" for ${scheduledDateTime.toLocaleDateString()} at ${scheduledDateTime.toLocaleTimeString()}. Duration: ${duration} minutes. Join on SkillLift platform!`,
        data: {
          liveClassId: liveClass._id,
          courseId: courseId,
          courseTitle: course.title,
          scheduledDate: scheduledDateTime,
          duration: duration,
          platform: liveClass.platform
        },
        priority: 'high',
        isRead: false
      });

      // Send email notification
      await sendEmail({
        to: enrollment.learner.email,
        subject: `🎥 New Live Class Scheduled: ${title}`,
        template: 'liveClassScheduled',
        data: {
          name: enrollment.learner.name,
          courseTitle: course.title,
          liveClassTitle: title,
          description: description,
          scheduledDate: scheduledDateTime.toLocaleDateString(),
          scheduledTime: scheduledDateTime.toLocaleTimeString(),
          duration: duration,
          platform: 'SkillLift Platform',
          tutorName: req.user.name
        }
      });
    }

    console.log(`✅ Notified ${enrollments.length} students about new live class`);
  } catch (error) {
    console.error('❌ Error notifying students:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Live class created successfully',
    data: liveClass
  });
});

// @desc    Get tutor's live classes
// @route   GET /api/tutor/live-classes
// @access  Private (Tutor)
const getTutorLiveClasses = asyncHandler(async (req, res) => {
  const { status, courseId, page = 1, limit = 10 } = req.query;
  
  const query = { tutorId: req.user._id };
  
  if (status) {
    query.status = status;
  }
  
  if (courseId) {
    query.courseId = courseId;
  }

  const liveClasses = await LiveClass.find(query)
    .populate('courseId', 'title category startDate endDate thumbnail')
    .populate('tutorId', 'name email')
    .sort({ scheduledDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await LiveClass.countDocuments(query);

  res.json({
    success: true,
    data: liveClasses,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get live class by ID
// @route   GET /api/tutor/live-classes/:id
// @access  Private (Tutor)
const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
    .populate('courseId', 'title category startDate endDate')
    .populate('tutorId', 'name email')
    .populate('attendees.userId', 'name email')
    .populate('questions.userId', 'name email')
    .populate('questions.answeredBy', 'name email')
    .populate('chatMessages.userId', 'name email')
    .populate('feedback.userId', 'name email');

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      message: 'Live class not found'
    });
  }

  // Check if tutor owns this live class
  if (liveClass.tutorId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: liveClass
  });
});

// @desc    Start live class
// @route   POST /api/tutor/live-classes/:id/start
// @access  Private (Tutor)
const startLiveClass = asyncHandler(async (req, res) => {
  console.log('🎥 START LIVE CLASS ENDPOINT CALLED');
  console.log('📝 Request params:', req.params);
  console.log('👤 User:', req.user);
  console.log('🔍 User ID:', req.user._id);
  
  const liveClass = await LiveClass.findById(req.params.id);
  console.log('📚 Found live class:', liveClass);
  console.log('📚 Live class tutor ID:', liveClass?.tutorId);
  console.log('📚 Live class status:', liveClass?.status);
  console.log('📚 Live class scheduled date:', liveClass?.scheduledDate);

  if (!liveClass) {
    console.log('❌ Live class not found');
    return res.status(404).json({
      success: false,
      message: 'Live class not found'
    });
  }

  if (liveClass.tutorId.toString() !== req.user._id.toString()) {
    console.log('❌ Access denied - tutor ID mismatch');
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (liveClass.status !== 'scheduled') {
    console.log('❌ Live class is not scheduled, current status:', liveClass.status);
    return res.status(400).json({
      success: false,
      message: 'Live class is not scheduled'
    });
  }

  // Check if it's time to start (allow 15 minutes early)
  const now = new Date();
  const startTime = new Date(liveClass.scheduledDate);
  const earlyStartTime = new Date(startTime.getTime() - 15 * 60000);

  console.log('⏰ Time check:', {
    now: now.toISOString(),
    startTime: startTime.toISOString(),
    earlyStartTime: earlyStartTime.toISOString(),
    canStart: now >= earlyStartTime
  });

  if (now < earlyStartTime) {
    console.log('❌ Too early to start live class');
    console.log('❌ Current time:', now.toISOString());
    console.log('❌ Start time:', startTime.toISOString());
    console.log('❌ Early start time:', earlyStartTime.toISOString());
    console.log('❌ Time difference (minutes):', (startTime.getTime() - now.getTime()) / (1000 * 60));
    return res.status(400).json({
      success: false,
      message: 'Live class cannot start more than 15 minutes early',
      details: {
        currentTime: now.toISOString(),
        scheduledTime: startTime.toISOString(),
        earlyStartTime: earlyStartTime.toISOString(),
        timeDifferenceMinutes: Math.round((startTime.getTime() - now.getTime()) / (1000 * 60))
      }
    });
  }

  console.log('✅ Starting live class...');
  
  // Generate unique session ID
  const sessionId = `session_${liveClass._id}_${Date.now()}`;
  console.log('🔑 Generated session ID:', sessionId);
  
  liveClass.status = 'live';
  liveClass.startedAt = now;
  liveClass.sessionId = sessionId;
  await liveClass.save();
  console.log('✅ Live class status updated to live with session ID:', sessionId);

  // Notify enrolled students that live class has started
  try {
    console.log('📢 Notifying enrolled students...');
    // Get course details for notification
    const course = await Course.findById(liveClass.courseId).select('title');
    console.log('📚 Course found:', course);
    
    const enrollments = await Enrollment.find({ 
      course: liveClass.courseId, 
      status: 'active' 
    }).populate('learner', 'name email');
    
    console.log('👥 Found enrollments:', enrollments.length);

    for (const enrollment of enrollments) {
      console.log('📧 Creating notification for learner:', enrollment.learner.name);
      
      // Create direct join URL
      const joinUrl = `/learner/live-classes/${liveClass._id}/room`;
      
      await Notification.create({
        recipient: enrollment.learner._id,
        type: 'live_class_started',
        title: '🚀 Live Class Started!',
        message: `Live class "${liveClass.title}" has started! Click to join now.`,
        data: {
          liveClassId: liveClass._id,
          courseId: liveClass.courseId,
          courseTitle: course.title,
          liveClassTitle: liveClass.title,
          platform: liveClass.platform || 'skilllift',
          sessionId: sessionId,
          joinUrl: joinUrl,
          actionType: 'join_live_class',
          actionText: 'Join Live Class'
        },
        priority: 'high',
        isActionable: true
      });
    }

    console.log(`✅ Notified ${enrollments.length} students that live class started`);
    
    // Broadcast to all connected learners via WebSocket
    if (io) {
      console.log('📡 Broadcasting live class start via WebSocket...');
      io.emit('live-class-started', {
        classId: liveClass._id,
        sessionId: sessionId,
        joinUrl: `/learner/live-classes/${liveClass._id}/room`,
        liveClass: {
          _id: liveClass._id,
          title: liveClass.title,
          status: liveClass.status,
          startedAt: liveClass.startedAt,
          sessionId: sessionId
        },
        message: `Live class "${liveClass.title}" has started! Click to join now.`,
        actionType: 'join_live_class',
        actionText: 'Join Live Class'
      });
      console.log('✅ WebSocket broadcast sent to all connected users');
    } else {
      console.log('⚠️ Socket.IO instance not available for broadcasting');
    }
  } catch (error) {
    console.error('❌ Error notifying students:', error);
  }

  res.json({
    success: true,
    message: 'Live class started successfully',
    data: {
      ...liveClass.toObject(),
      sessionId: sessionId
    }
  });
});

// @desc    End live class
// @route   POST /api/tutor/live-classes/:id/end
// @access  Private (Tutor)
const endLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      message: 'Live class not found'
    });
  }

  if (liveClass.tutorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (liveClass.status !== 'live') {
    return res.status(400).json({
      success: false,
      message: 'Live class is not currently live'
    });
  }

  liveClass.status = 'completed';
  liveClass.endedAt = new Date();
  await liveClass.save();

  res.json({
    success: true,
    message: 'Live class ended successfully',
    data: liveClass
  });
});

// @desc    Join live class (for enrolled students)
// @route   POST /api/learner/live-classes/:id/join
// @access  Private (Learner)
const joinLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
    .populate('courseId', 'title');

  if (!liveClass) {
    return res.status(404).json({
      success: false,
      message: 'Live class not found'
    });
  }

  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: liveClass.courseId,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to join the live class'
    });
  }

  // Check if live class is live or about to start
  const now = new Date();
  const startTime = new Date(liveClass.scheduledDate);
  const earlyJoinTime = new Date(startTime.getTime() - 5 * 60000); // 5 minutes early

  if (liveClass.status === 'scheduled' && now < earlyJoinTime) {
    return res.status(400).json({
      success: false,
      message: 'Live class has not started yet'
    });
  }

  if (liveClass.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Live class has already ended'
    });
  }

  // Add user to attendees if not already there
  const existingAttendee = liveClass.attendees.find(
    a => a.userId.toString() === req.user._id.toString()
  );

  if (!existingAttendee) {
    liveClass.attendees.push({ userId: req.user._id });
    await liveClass.save();
  }

  res.json({
    success: true,
    message: 'Joined live class successfully',
    data: {
      liveClassId: liveClass._id,
      meetingLink: liveClass.meetingLink,
      meetingPassword: liveClass.meetingPassword,
      status: liveClass.status
    }
  });
});

// @desc    Get learner's live classes
// @route   GET /api/learner/live-classes
// @access  Private (Learner)
const getLearnerLiveClasses = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get courses the learner is enrolled in
    const enrollments = await Enrollment.find({ learner: userId, status: 'active' })
      .populate('course', 'title category startDate endDate');

    const courseIds = enrollments
      .filter(enrollment => enrollment.course && enrollment.course._id)
      .map(enrollment => enrollment.course._id);
    
    // Get live classes for enrolled courses
    const liveClasses = await LiveClass.find({
      courseId: { $in: courseIds },
      status: { $in: ['scheduled', 'live'] }
    })
    .populate('courseId', 'title category startDate endDate thumbnail')
    .populate('tutorId', 'name email')
    .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: liveClasses
    });
  } catch (error) {
    console.error('Error fetching learner live classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live classes',
      error: error.message
    });
  }
});

// @desc    Get a single live class by ID
// @route   GET /api/live-classes/:id
// @access  Private
const getLiveClassById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid live class ID format'
      });
    }
    
    const liveClass = await LiveClass.findById(id)
      .populate('courseId', 'title category thumbnail')
      .populate('tutorId', 'name email');

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      data: liveClass
    });
  } catch (error) {
    console.error('Error fetching live class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Check if user can join live class
// @route   GET /api/live-classes/:id/can-join
// @access  Private
const canJoinLiveClass = asyncHandler(async (req, res) => {
  console.log('🔍 CAN JOIN LIVE CLASS CHECK');
  console.log('📝 Request params:', req.params);
  console.log('👤 User:', req.user);
  
  const liveClass = await LiveClass.findById(req.params.id).populate('courseId');
  
  if (!liveClass) {
    return res.status(404).json({
      success: false,
      message: 'Live class not found'
    });
  }

  // Check if user is the tutor
  const isTutor = liveClass.tutorId.toString() === req.user._id.toString();
  console.log('👨‍🏫 Is tutor:', isTutor);

  // Check if user is enrolled (for learners)
  let isEnrolled = false;
  if (!isTutor) {
    const enrollment = await Enrollment.findOne({
      learner: req.user._id,
      course: liveClass.courseId._id,
      status: 'active'
    });
    isEnrolled = !!enrollment;
    console.log('📝 Is enrolled:', isEnrolled);
  }

  const canJoin = isTutor || isEnrolled;

  res.json({
    success: true,
    data: {
      canJoin,
      isTutor,
      isEnrolled,
      liveClass: {
        id: liveClass._id,
        title: liveClass.title,
        status: liveClass.status,
        courseId: liveClass.courseId._id,
        courseTitle: liveClass.courseId.title
      },
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role
      }
    }
  });
});

// @desc    Debug live class status
// @route   GET /api/tutor/live-classes/:id/debug
// @access  Private (Tutor)
const debugLiveClass = asyncHandler(async (req, res) => {
  console.log('🔍 DEBUG LIVE CLASS ENDPOINT CALLED');
  console.log('📝 Request params:', req.params);
  console.log('👤 User:', req.user);
  
  const liveClass = await LiveClass.findById(req.params.id);
  
  if (!liveClass) {
    return res.status(404).json({
      success: false,
      message: 'Live class not found'
    });
  }

  const now = new Date();
  const startTime = new Date(liveClass.scheduledDate);
  const earlyStartTime = new Date(startTime.getTime() - 15 * 60000);

  res.json({
    success: true,
    data: {
      id: liveClass._id,
      title: liveClass.title,
      status: liveClass.status,
      scheduledDate: liveClass.scheduledDate,
      tutorId: liveClass.tutorId,
      currentUserId: req.user._id,
      isTutor: liveClass.tutorId.toString() === req.user._id.toString(),
      timeInfo: {
        now: now.toISOString(),
        startTime: startTime.toISOString(),
        earlyStartTime: earlyStartTime.toISOString(),
        canStart: now >= earlyStartTime,
        timeDifferenceMinutes: Math.round((startTime.getTime() - now.getTime()) / (1000 * 60))
      }
    }
  });
});

module.exports = {
  createLiveClass,
  getTutorLiveClasses,
  getLiveClass,
  getLiveClassById,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  getLearnerLiveClasses,
  debugLiveClass,
  canJoinLiveClass,
  setSocketIO
};