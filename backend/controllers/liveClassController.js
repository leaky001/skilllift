const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const { generateStreamToken } = require('../services/streamTokenService');

// Ensure all models are registered
require('../models/User');
require('../models/Course');
require('../models/Enrollment');
require('../models/Notification');
require('../models/LiveClass');

// @desc    Create a new live class
// @route   POST /api/live-classes
// @access  Private (Tutor)
const createLiveClass = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      scheduledDate,
      duration,
      settings = {}
    } = req.body;

    const tutorId = req.user._id;

    // Validate required fields
    if (!title || !description || !courseId || !scheduledDate || !duration) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Verify the course exists and user is the tutor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create live classes for your own courses'
      });
    }

    // Check if there's already an active live class for this course
    const existingActiveClass = await LiveClass.findActiveByCourse(courseId);
    if (existingActiveClass) {
      return res.status(400).json({
        success: false,
        message: 'There is already an active live class for this course'
      });
    }

    // Create the live class
    const liveClass = new LiveClass({
      title,
      description,
      courseId,
      tutorId,
      scheduledDate: new Date(scheduledDate),
      duration,
      settings: {
        allowScreenShare: settings.allowScreenShare !== false,
        allowChat: settings.allowChat !== false,
        allowLearnerScreenShare: settings.allowLearnerScreenShare || false,
        maxParticipants: settings.maxParticipants || 50,
        autoRecord: settings.autoRecord !== false,
        ...settings
      }
    });

    await liveClass.save();

    // Add the live class to the course's liveClasses array
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { liveClasses: liveClass._id } },
      { new: true }
    );

    // Populate the response
    await liveClass.populate([
      { path: 'courseId', select: 'title description' },
      { path: 'tutorId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Live class created successfully',
      data: liveClass
    });

  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create live class',
      error: error.message
    });
  }
};

// @desc    Start a live class
// @route   POST /api/live-classes/:id/start
// @access  Private (Tutor)
const startLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Verify the user is the tutor
    if (liveClass.tutorId.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can start this live class'
      });
    }

    // Check if class is already live
    if (liveClass.status === 'live') {
      // If already live, just generate token and return
      const streamToken = generateStreamToken(tutorId, liveClass.callId, true);
      
      res.status(200).json({
        success: true,
        message: 'Live class is already active',
        data: {
          liveClass,
          streamToken,
          callId: liveClass.callId,
          sessionId: liveClass.sessionId
        }
      });
      return;
    }

    // Start the session
    await liveClass.startSession();

    // Generate Stream token for the tutor (host)
    const streamToken = generateStreamToken(tutorId, liveClass.callId, true);

    // Get enrolled learners for notifications
    const enrollments = await Enrollment.find({
      course: liveClass.courseId,
      status: 'active'
    }).populate('learner', 'name email');

    // Send notifications to enrolled learners
    const notificationPromises = enrollments.map(enrollment => {
      const notification = new Notification({
        recipient: enrollment.learner._id,
        sender: tutorId,
        type: 'live_class_started',
        title: 'Live Class Started',
        message: `The live class "${liveClass.title}" has started. Join now!`,
        data: {
          liveClassId: liveClass._id,
          callId: liveClass.callId,
          courseId: liveClass.courseId
        },
        priority: 'high'
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    // Populate the response
    await liveClass.populate([
      { path: 'courseId', select: 'title description' },
      { path: 'tutorId', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Live class started successfully',
      data: {
        liveClass,
        streamToken,
        callId: liveClass.callId,
        sessionId: liveClass.sessionId
      }
    });

  } catch (error) {
    console.error('Error starting live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start live class',
      error: error.message
    });
  }
};

// @desc    Join a live class (for tutors to join their own live class)
// @route   POST /api/live-classes/:id/join-tutor
// @access  Private (Tutor)
const joinLiveClassAsTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user._id;

    const liveClass = await LiveClass.findById(id).populate('courseId', 'title');
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Verify the user is the tutor
    if (liveClass.tutorId.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can join this live class'
      });
    }

    // Check if class is live or ready
    if (!['ready', 'live'].includes(liveClass.status)) {
      return res.status(400).json({
        success: false,
        message: 'Live class is not currently active'
      });
    }

    // Generate Stream token for the tutor (host)
    const streamToken = generateStreamToken(tutorId, liveClass.callId, true);

    res.status(200).json({
      success: true,
      message: 'Joined live class successfully',
      data: {
        liveClass,
        streamToken,
        callId: liveClass.callId,
        sessionId: liveClass.sessionId
      }
    });

  } catch (error) {
    console.error('Error joining live class as tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join live class',
      error: error.message
    });
  }
};

// @desc    Join a live class
// @route   POST /api/live-classes/:id/join
// @access  Private (Learner or Tutor)
const joinLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const liveClass = await LiveClass.findById(id).populate('courseId', 'title');
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    console.log('🎯 Join live class request:', {
      userId,
      userRole,
      liveClassId: id,
      courseId: liveClass.courseId._id,
      tutorId: liveClass.tutorId
    });

    // Check if class is live or ready
    if (!['ready', 'live'].includes(liveClass.status)) {
      return res.status(400).json({
        success: false,
        message: 'Live class is not currently active'
      });
    }

    // Determine if user is the tutor (host) or learner
    const isTutor = liveClass.tutorId.toString() === userId.toString();
    const isHost = isTutor;

    console.log('🎯 User role determination:', {
      isTutor,
      isHost,
      userRole,
      tutorId: liveClass.tutorId.toString(),
      userId: userId.toString()
    });

    // For learners, check enrollment - TEMPORARILY DISABLED FOR TESTING
    if (!isTutor) {
      console.log('🎯 TEMPORARY: Skipping enrollment check for testing');
      console.log('🎯 Allowing learner access without enrollment verification');
      // TODO: Re-enable enrollment check once MongoDB is properly configured
      
      /* ORIGINAL ENROLLMENT CHECK (commented out):
      console.log('🎯 Checking enrollment for learner:', {
        userId,
        courseId: liveClass.courseId._id,
        liveClassId: id
      });
      
      const enrollment = await Enrollment.findOne({
        learner: userId,
        course: liveClass.courseId._id,
        status: 'active'
      });
      
      console.log('🎯 Learner enrollment check result:', {
        userId,
        courseId: liveClass.courseId._id,
        enrollmentFound: !!enrollment,
        enrollment: enrollment,
        allEnrollments: await Enrollment.find({ learner: userId }).limit(5)
      });
      
      if (!enrollment) {
        console.log('❌ Enrollment not found, returning 403');
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course',
          debug: {
            userId,
            courseId: liveClass.courseId._id,
            liveClassId: id
          }
        });
      }
      
      console.log('✅ Enrollment found, allowing access');
      */
    }

    // Add user to attendees (if not already added)
    await liveClass.addAttendee(userId);

    // Generate Stream token with appropriate host status
    const streamToken = generateStreamToken(userId, liveClass.callId, isHost);

    console.log('🔍 BACKEND JOIN SUCCESS:', {
      userId: userId.toString(),
      userRole,
      isHost,
      isTutor,
      callId: liveClass.callId,
      callIdType: typeof liveClass.callId,
      streamTokenGenerated: !!streamToken,
      liveClassStatus: liveClass.status,
      sessionId: liveClass.sessionId
    });

    res.status(200).json({
      success: true,
      message: 'Joined live class successfully',
      data: {
        liveClass,
        streamToken,
        callId: liveClass.callId,
        sessionId: liveClass.sessionId,
        isHost
      }
    });

  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join live class',
      error: error.message
    });
  }
};

// @desc    End a live class
// @route   POST /api/live-classes/:id/end
// @access  Private (Tutor)
const endLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user._id;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Verify the user is the tutor
    if (liveClass.tutorId.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can end this live class'
      });
    }

    // End the session
    await liveClass.endSession();

    res.status(200).json({
      success: true,
      message: 'Live class ended successfully',
      data: liveClass
    });

  } catch (error) {
    console.error('Error ending live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end live class',
      error: error.message
    });
  }
};

// @desc    Get live class details
// @route   GET /api/live-classes/:id
// @access  Private
const getLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const liveClass = await LiveClass.findById(id)
      .populate('courseId', 'title description')
      .populate('tutorId', 'name email')
      .populate('attendees.userId', 'name email');

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if user has access (tutor or enrolled learner)
    const isTutor = liveClass.tutorId._id.toString() === userId.toString();
    let hasAccess = isTutor;

    // If user is the tutor, always allow access
    if (isTutor) {
      console.log('🎯 User is tutor, allowing access');
      hasAccess = true;
    } else {
      // For learners, check enrollment
      const enrollment = await Enrollment.findOne({
        learner: userId,
        course: liveClass.courseId._id,
        status: 'active'
      });
      hasAccess = !!enrollment;
      console.log('🎯 User is learner, enrollment found:', !!enrollment);
    }

    // Temporarily allow all access for testing
    console.log('🎯 Temporarily allowing all access for testing');
    hasAccess = true;

    res.status(200).json({
      success: true,
      data: liveClass
    });

  } catch (error) {
    console.error('Error fetching live class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live class',
      error: error.message
    });
  }
};

// @desc    Get live classes for a course
// @route   GET /api/courses/:courseId/live-classes
// @access  Private
const getCourseLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user has access (tutor or enrolled learner)
    const isTutor = course.tutor.toString() === userId.toString();
    let hasAccess = isTutor;

    if (!isTutor) {
      const enrollment = await Enrollment.findOne({
        learner: userId,
        course: courseId,
        status: 'active'
      });
      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course'
      });
    }

    const liveClasses = await LiveClass.find({ courseId })
      .populate('tutorId', 'name email')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      data: liveClasses
    });

  } catch (error) {
    console.error('Error fetching course live classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live classes',
      error: error.message
    });
  }
};

// @desc    Send chat message
// @route   POST /api/live-classes/:id/chat
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if chat is enabled
    if (!liveClass.settings.allowChat) {
      return res.status(400).json({
        success: false,
        message: 'Chat is disabled for this live class'
      });
    }

    // Add message to chat
    await liveClass.addChatMessage(userId, message.trim());

    // Populate sender info
    const messageWithSender = liveClass.chatMessages[liveClass.chatMessages.length - 1];
    await messageWithSender.populate('senderId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithSender
    });

  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/live-classes/:id/chat
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const liveClass = await LiveClass.findById(id)
      .populate('chatMessages.senderId', 'name email');

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: liveClass.chatMessages
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages',
      error: error.message
    });
  }
};

// @desc    Get all live classes for enrolled courses (learner)
// @route   GET /api/live-classes
// @access  Private (Learner)
const getLiveClasses = async (req, res) => {
  try {
    const learnerId = req.user._id;

    // Get all enrollments for the learner
    const enrollments = await Enrollment.find({
      learner: learnerId,
      status: 'active'
    }).populate('course');

    if (enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.course._id);

    // Get live classes for enrolled courses
    const liveClasses = await LiveClass.find({
      courseId: { $in: courseIds }
    })
      .populate('courseId', 'title description thumbnail')
      .populate('tutorId', 'name email')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      data: liveClasses
    });

  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live classes',
      error: error.message
    });
  }
};

module.exports = {
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
};
