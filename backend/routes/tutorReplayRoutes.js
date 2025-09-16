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

// @desc    Upload replay video
// @route   POST /api/tutor/replays/upload
// @access  Private (Tutor only)
router.post('/upload', protect, upload.single('replayFile'), asyncHandler(async (req, res) => {
  try {
    const { courseId, topic } = req.body;
    const tutorId = req.user._id;
    const replayFile = req.file;

    console.log('🎬 Replay upload request:', {
      courseId,
      topic,
      tutorId,
      fileName: replayFile?.originalname,
      fileSize: replayFile?.size
    });

    // Validate required fields
    if (!courseId || !topic || !replayFile) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, topic, and video file are required'
      });
    }

    // Verify course exists and belongs to tutor
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
        message: 'You can only upload replays for your own courses'
      });
    }

    // Create replay record
    const replay = await Replay.create({
      courseId,
      tutorId,
      topic,
      fileName: replayFile.filename,
      originalName: replayFile.originalname,
      fileUrl: replayFile.path.replace(/\\/g, '/'), // Normalize path
      fileSize: replayFile.size,
      uploadDate: new Date(),
      status: 'ready'
    });

    console.log('✅ Replay uploaded successfully:', {
      replayId: replay._id,
      courseId: replay.courseId,
      topic: replay.topic,
      fileName: replay.fileName
    });

    // Create notifications for enrolled students
    try {
      const enrolledStudents = await User.find({
        'learnerProfile.enrolledCourses': courseId
      }).select('_id name email');

      for (const student of enrolledStudents) {
        await Notification.create({
          recipient: student._id,
          sender: tutorId,
          type: 'replay_uploaded',
          title: 'New Class Replay Available',
          message: `A new replay for "${topic}" has been uploaded to your course "${course.title}".`,
          data: {
            courseId,
            courseTitle: course.title,
            replayId: replay._id,
            topic: replay.topic
          }
        });
      }

      console.log(`📢 Notified ${enrolledStudents.length} students about new replay`);
    } catch (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
      // Don't fail the upload if notifications fail
    }

    res.json({
      success: true,
      data: {
        replay: {
          _id: replay._id,
          courseId: replay.courseId,
          topic: replay.topic,
          fileName: replay.fileName,
          originalName: replay.originalName,
          fileSize: replay.fileSize,
          uploadDate: replay.uploadDate,
          status: replay.status
        },
        studentsNotified: enrolledStudents?.length || 0
      },
      message: 'Replay uploaded successfully! Students have been notified.'
    });

  } catch (error) {
    console.error('❌ Error uploading replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload replay',
      error: error.message
    });
  }
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
