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

    // Get replays with pagination
    const total = await Replay.countDocuments(query);
    const replays = await Replay.find(query)
      .populate('course', 'title')
      .populate('tutor', 'name')
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Format the response
    const formattedReplays = replays.map(replay => ({
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
      deleteAt: replay.deleteAt
    }));

    res.status(200).json({
      success: true,
      data: formattedReplays,
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

    // Get the replay from database
    const replay = await Replay.findById(replayId)
      .populate('course', 'title')
      .populate('tutor', 'name');

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
        hasAccess 
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
        hasAccess 
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

    // Increment view count
    await replay.incrementView();

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
        viewCount: replay.viewCount,
        uploadDate: replay.uploadDate,
        deleteAt: replay.deleteAt
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
