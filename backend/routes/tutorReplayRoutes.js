const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const Replay = require('../models/Replay');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// -------------------------------------------------
// Test endpoint: only verify auth + multer saving
// Use this to isolate upload issues (disk, multer, auth)
// POST /api/tutor/replays/test
router.post('/test', protect, upload.single('replayFile'), asyncHandler(async (req, res) => {
  console.log('🧪 Test upload hit - file:', req.file && {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype
  });

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded in test' });
  }

  res.json({ success: true, message: 'Test upload saved', file: {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path.replace(/\\/g, '/'),
    size: req.file.size,
    mimetype: req.file.mimetype
  }});
}));
// -------------------------------------------------

// @desc    Upload replay video
// @route   POST /api/tutor/replays/upload
// @access  Private (Tutor only)
router.post('/upload', protect, upload.single('replayFile'), asyncHandler(async (req, res) => {
  console.log('🔍 Upload request details:', {
    body: req.body,
    file: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file',
    user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
  });

  const { courseId, topic } = req.body;
  const tutorId = req.user._id;

  if (!courseId || !topic || !req.file) {
    return res.status(400).json({ success: false, message: 'Course ID, topic, and video file are required' });
  }

  // Verify course exists and belongs to tutor
  const course = await Course.findOne({ _id: courseId, tutor: tutorId });
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found or you do not own this course' });
  }

  // Create replay record
  const replay = await Replay.create({
    course: courseId,
    tutor: tutorId,
    title: topic,
    fileName: req.file.originalname,
    fileUrl: '/' + req.file.path.replace(/\\/g, '/'),
    fileSize: req.file.size,
    status: 'ready',
    description: `Replay for course ${course.title}`
  });

  console.log('✅ Replay created successfully:', { replayId: replay._id });

  // Create notifications for enrolled students (non-blocking)
  (async () => {
    try {
      const enrolledStudents = await User.find({ 'learnerProfile.enrolledCourses': courseId }).select('_id name email');
      for (const student of enrolledStudents) {
        await Notification.create({
          recipient: student._id,
          sender: tutorId,
          type: 'replay_uploaded',
          title: 'New Class Replay Available',
          message: `A new replay for "${topic}" has been uploaded to your course "${course.title}".`,
          data: { courseId, courseTitle: course.title, replayId: replay._id, topic }
        });
      }
      console.log(`📢 Notified ${enrolledStudents.length} students about new replay`);
    } catch (notificationError) {
      console.error('❌ Error creating notifications (non-blocking):', notificationError);
    }
  })();

  return res.status(201).json({ success: true, data: replay, message: 'Replay uploaded successfully! Students will be notified.' });
}));

// @desc    Get tutor's replays
// @route   GET /api/tutor/replays
// @access  Private (Tutor only)
router.get('/', protect, asyncHandler(async (req, res) => {
  try {
    const tutorId = req.user._id;
    
    const replays = await Replay.find({ tutorId })
      .populate('courseId', 'title')
      .sort({ uploadDate: -1 });

    console.log(`📚 Found ${replays.length} replays for tutor ${tutorId}`);

    res.json({
      success: true,
      data: replays.map(replay => ({
        _id: replay._id,
        courseId: replay.courseId,
        courseTitle: replay.courseId?.title || 'Unknown Course',
        topic: replay.topic,
        fileName: replay.fileName,
        originalName: replay.originalName,
        fileSize: replay.fileSize,
        uploadDate: replay.uploadDate,
        status: replay.status,
        views: replay.views || 0
      })),
      message: 'Replays retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching replays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replays',
      error: error.message
    });
  }
}));

// @desc    Delete replay
// @route   DELETE /api/tutor/replays/:id
// @access  Private (Tutor only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const replayId = req.params.id;
    const tutorId = req.user._id;

    const replay = await Replay.findById(replayId);
    if (!replay) {
      return res.status(404).json({
        success: false,
        message: 'Replay not found'
      });
    }

    if (replay.tutorId.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own replays'
      });
    }

    // Delete file from filesystem
    if (replay.fileUrl && fs.existsSync(replay.fileUrl)) {
      try {
        fs.unlinkSync(replay.fileUrl);
        console.log(`🗑️ Deleted file: ${replay.fileUrl}`);
      } catch (fileError) {
        console.error(`❌ Error deleting file ${replay.fileUrl}:`, fileError);
      }
    }

    // Delete from database
    await Replay.findByIdAndDelete(replayId);

    console.log(`✅ Replay deleted: ${replayId}`);

    res.json({
      success: true,
      message: 'Replay deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete replay',
      error: error.message
    });
  }
}));

module.exports = router;
