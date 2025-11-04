const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Replay = require('../models/Replay');
const asyncHandler = require('express-async-handler');

// All routes require authentication and learner or tutor authorization
router.use(protect);
router.use(authorize('learner', 'tutor'));

// @desc    Get replays for enrolled learner
// @route   GET /api/learner/replays
// @access  Private (Learner)
router.get('/', asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    const { page = 1, limit = 10, search, courseId } = req.query;

    console.log('🔍 Getting replays for learner:', learnerId);

    // Get learner's enrolled courses
    const enrollments = await Enrollment.find({ learner: learnerId })
      .populate('course', 'title tutor')
      .select('course');

    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course._id);
    
    if (enrolledCourseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          current: parseInt(page),
          pages: 0,
          total: 0
        },
        message: 'No enrolled courses found'
      });
    }

    // Build query for replays
    let query = { 
      course: { $in: enrolledCourseIds },
      deleteAt: { $gt: new Date() } // Only show replays that haven't expired
    };

    // Apply course filter
    if (courseId && courseId !== 'all') {
      query.course = courseId;
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get manual replays with pagination
    const totalManualReplays = await Replay.countDocuments(query);
    const manualReplays = await Replay.find(query)
      .populate('course', 'title')
      .populate('tutor', 'name')
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get Google Meet recordings for enrolled courses
    const LiveClassSession = require('../models/LiveClassSession');
    const googleMeetRecordings = await LiveClassSession.find({
      courseId: { $in: enrolledCourseIds },
      status: { $in: ['ended', 'completed'] }, // Check for both statuses
      recordingUrl: { $exists: true, $ne: null }
    })
    .populate('courseId', 'title')
    .populate('tutorId', 'name')
    .sort({ endTime: -1 });

    // Format manual replays
    const formattedManualReplays = manualReplays.map(replay => ({
      _id: replay._id,
      title: replay.title,
      description: replay.description,
      courseTitle: replay.course.title,
      tutorName: replay.tutor.name,
      sessionTitle: replay.title,
      duration: replay.duration || '1h 30m',
      thumbnail: replay.thumbnail || null,
      fileUrl: replay.fileUrl,
      fileName: replay.fileName,
      fileSize: replay.fileSize,
      views: replay.views || 0,
      uploadedAt: replay.uploadDate,
      sessionDate: replay.uploadDate,
      deleteAt: replay.deleteAt,
      type: 'manual'
    }));

    // Format Google Meet recordings
    const formattedGoogleMeetRecordings = googleMeetRecordings.map(session => ({
      _id: session._id,
      sessionId: session.sessionId,
      title: `Live Class - ${session.courseId.title}`,
      description: `Recorded live session for ${session.courseId.title}`,
      courseTitle: session.courseId.title,
      tutorName: session.tutorId.name,
      sessionTitle: `Live Class - ${session.courseId.title}`,
      duration: session.endTime && session.startTime ? 
        Math.round((session.endTime - session.startTime) / 60000) + ' minutes' : 'Unknown',
      thumbnail: null,
      fileUrl: session.recordingUrl,
      fileName: `live-class-${session.sessionId}.mp4`,
      fileSize: null,
      views: 0,
      uploadedAt: session.endTime,
      sessionDate: session.endTime,
      deleteAt: null,
      type: 'google_meet',
      recordingUrl: session.recordingUrl,
      startTime: session.startTime,
      endTime: session.endTime
    }));

    // Combine both types of replays
    const allReplays = [...formattedManualReplays, ...formattedGoogleMeetRecordings];
    
    // Sort combined replays by upload date (most recent first)
    allReplays.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    // Apply pagination to combined results
    const total = allReplays.length;
    const paginatedReplays = allReplays.slice(
      (parseInt(page) - 1) * parseInt(limit),
      parseInt(page) * parseInt(limit)
    );

    console.log(`📹 Found ${formattedManualReplays.length} manual replays and ${formattedGoogleMeetRecordings.length} Google Meet recordings`);
    console.log(`📊 Total replays: ${total}, Returning: ${paginatedReplays.length}`);

    res.status(200).json({
      success: true,
      data: paginatedReplays,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total: total
      },
      message: 'Replays retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching learner replays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replays',
      error: error.message
    });
  }
}));

// @desc    Get learner's enrolled courses for filter
// @route   GET /api/learner/replays/courses
// @access  Private (Learner or Tutor)
router.get('/courses', asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;

    console.log('🔍 Getting enrolled courses for learner:', learnerId);

    // Check if MongoDB is connected
    if (!mongoose.connection.readyState) {
      console.log('⚠️ MongoDB not connected, returning empty courses list');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Database not available - no courses loaded'
      });
    }

    const enrollments = await Enrollment.find({ learner: learnerId })
      .populate('course', 'title')
      .select('course');

    const courses = enrollments.map(enrollment => ({
      _id: enrollment.course._id,
      title: enrollment.course.title
    }));

    console.log('✅ Found', courses.length, 'enrolled courses');

    res.status(200).json({
      success: true,
      data: courses,
      message: 'Enrolled courses retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching enrolled courses:', error);
    
    // Return empty array instead of error to prevent frontend crashes
    res.status(200).json({
      success: true,
      data: [],
      message: 'Unable to load courses - database connection issue'
    });
  }
}));

// @desc    Get replay details
// @route   GET /api/learner/replays/:id
// @access  Private (Learner or Tutor)
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const replayId = req.params.id;

    console.log('🔍 Getting replay details:', { userId, userRole, replayId });

    // First try to get from Replay collection (manual replays)
    let replay = await Replay.findById(replayId)
      .populate('course', 'title')
      .populate('tutor', 'name');

    let replayType = 'manual';
    let sessionData = null;

    // If not found in Replay collection, check LiveClassSession collection (Google Meet recordings)
    if (!replay) {
      const LiveClassSession = require('../models/LiveClassSession');
      const session = await LiveClassSession.findById(replayId)
        .populate('courseId', 'title')
        .populate('tutorId', 'name');

      if (session && session.recordingUrl) {
        // Convert LiveClassSession to replay format
        replay = {
          _id: session._id,
          title: `Live Class - ${session.courseId.title}`,
          description: `Recorded live session for ${session.courseId.title}`,
          course: session.courseId,
          tutor: session.tutorId,
          fileUrl: session.recordingUrl,
          fileName: `live-class-${session.sessionId}.mp4`,
          fileSize: null,
          views: 0,
          uploadDate: session.endTime,
          sessionId: session.sessionId,
          startTime: session.startTime,
          endTime: session.endTime
        };
        replayType = 'google_meet';
        sessionData = session;
      }
    }

    if (!replay) {
      return res.status(404).json({
        success: false,
        message: 'Replay not found'
      });
    }

    // Check access permissions
    let hasAccess = false;
    
    if (userRole === 'tutor') {
      // Tutors can access their own replays
      hasAccess = replay.tutor._id.equals(userId);
      console.log('👨‍🏫 Tutor access check:', { 
        replayTutorId: replay.tutor._id, 
        userId, 
        hasAccess,
        replayType
      });
    } else if (userRole === 'learner') {
      // Learners can access replays from courses they're enrolled in
      const enrollments = await Enrollment.find({ learner: userId })
        .populate('course', '_id')
        .select('course');

      const enrolledCourseIds = enrollments.map(enrollment => enrollment.course._id);
      hasAccess = enrolledCourseIds.some(id => id.equals(replay.course._id));
      console.log('👨‍🎓 Learner access check:', { 
        enrolledCourseIds, 
        replayCourseId: replay.course._id, 
        hasAccess,
        replayType
      });
    }
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: userRole === 'tutor' 
          ? 'You can only access your own replays' 
          : 'You are not enrolled in this course'
      });
    }

    // Increment view count (only for manual replays)
    if (replayType === 'manual') {
      await replay.incrementView();
    }

    res.status(200).json({
      success: true,
      data: {
        _id: replay._id,
        title: replay.title,
        description: replay.description,
        courseTitle: replay.course.title,
        tutorName: replay.tutor.name,
        fileUrl: replay.fileUrl,
        fileName: replay.fileName,
        fileSize: replay.fileSize,
        viewCount: replay.views || 0,
        type: replayType,
        uploadDate: replay.uploadDate,
        deleteAt: replay.deleteAt,
        // Additional fields for Google Meet recordings
        ...(replayType === 'google_meet' && {
          sessionId: replay.sessionId,
          startTime: replay.startTime,
          endTime: replay.endTime,
          recordingUrl: replay.fileUrl
        })
      },
      message: 'Replay details retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching replay details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replay details',
      error: error.message
    });
  }
}));

module.exports = router;
