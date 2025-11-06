const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const Replay = require('../models/Replay');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
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
router.post('/upload', protect, (req, res, next) => {
  // Log request immediately
  console.log('📥 Upload request received:', {
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
    },
    body: req.body,
    hasFile: !!req.file,
    timestamp: new Date().toISOString()
  });
  
  // Set extended timeout for large file uploads (10 minutes)
  // This allows for uploading files up to 2GB even on slower connections
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
}, (req, res, next) => {
  // Handle multer upload with proper error handling
  upload.single('replayFile')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum file size is 2GB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed per request.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    
    // Log after multer processes the file
    console.log('📦 After multer processing:', {
      hasFile: !!req.file,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        sizeMB: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
        path: req.file.path
      } : null,
      body: req.body
    });
    next();
  });
}, asyncHandler(async (req, res) => {
  const uploadStartTime = Date.now();
  console.log('🔍 Upload request received at:', new Date().toISOString());
  console.log('🔍 Upload request details:', {
    body: req.body,
    file: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      sizeMB: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
      path: req.file.path
    } : 'No file',
    user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
  });

  try {
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please select a video file.' 
      });
    }

    console.log('✅ File received, processing...');
    const { courseId, topic } = req.body;
    const tutorId = req.user._id;

    if (!courseId || !topic) {
      return res.status(400).json({ success: false, message: 'Course ID and topic are required' });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    console.log('🔍 Checking MongoDB connection...');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected, state:', mongoose.connection.readyState);
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection unavailable. Please try again in a few moments.' 
      });
    }
    console.log('✅ MongoDB connected');

    // Verify course exists and belongs to tutor
    console.log('🔍 Verifying course...', { courseId, tutorId });
    const course = await Course.findOne({ _id: courseId, tutor: tutorId });
    if (!course) {
      console.error('❌ Course not found or not owned by tutor');
      return res.status(404).json({ success: false, message: 'Course not found or you do not own this course' });
    }
    console.log('✅ Course verified:', course.title);

    // Create replay record
    console.log('🔍 Creating replay record...');
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

    const dbTime = Date.now();
    console.log('✅ Replay created successfully:', { 
      replayId: replay._id,
      timeTaken: (dbTime - uploadStartTime) + 'ms'
    });

    // Send response immediately, then notify students in background
    const responseTime = Date.now();
    console.log('✅ Sending response to client, total time:', (responseTime - uploadStartTime) + 'ms');
    res.status(201).json({ 
      success: true, 
      data: replay, 
      message: 'Replay uploaded successfully! Students will be notified.' 
    });

    // Create notifications for enrolled students (non-blocking)
    (async () => {
      try {
        console.log('📢 Starting notification process in background...');
        // Find enrolled students using Enrollment model
        const enrollments = await Enrollment.find({ 
          course: courseId,
          status: { $in: ['active', 'completed'] }
        }).populate('learner', '_id name email');
        
        console.log(`📢 Found ${enrollments.length} enrolled students for course ${courseId}`);
      
      // Send notifications via NotificationService (WebSocket + Database)
      for (const enrollment of enrollments) {
        if (enrollment.learner && enrollment.learner._id) {
          try {
            // Use NotificationService for WebSocket notifications
            await NotificationService.emitNotification(enrollment.learner._id, {
              type: 'replay_uploaded',
              title: 'New Class Replay Available',
              message: `A new replay for "${topic}" has been uploaded to your course "${course.title}". Click to view it now!`,
              data: { 
                courseId: courseId.toString(), 
                courseTitle: course.title, 
                replayId: replay._id.toString(), 
                topic 
              },
              priority: 'medium' // Medium priority for replay notifications
            });
            
            // Also create database notification record
            await Notification.create({
              recipient: enrollment.learner._id,
              sender: tutorId,
              type: 'replay_uploaded',
              title: 'New Class Replay Available',
              message: `A new replay for "${topic}" has been uploaded to your course "${course.title}". Click to view it now!`,
              data: { 
                courseId: courseId.toString(), 
                courseTitle: course.title, 
                replayId: replay._id.toString(), 
                topic 
              },
              priority: 'medium', // Medium priority for replay notifications
              isRead: false
            });
          } catch (notifError) {
            console.error(`❌ Error notifying student ${enrollment.learner._id}:`, notifError);
          }
        }
      }
      console.log(`✅ Notified ${enrollments.length} students about new replay`);
    } catch (notificationError) {
      console.error('❌ Error creating notifications (non-blocking):', notificationError);
      console.error('❌ Notification error details:', {
        message: notificationError.message,
        stack: notificationError.stack
      });
    }
    })();
  } catch (error) {
    console.error('❌ Error in upload route:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Cleaned up uploaded file due to error');
      } catch (cleanupError) {
        console.error('❌ Error cleaning up file:', cleanupError);
      }
    }

    // Return appropriate error response
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database error. Please check your MongoDB connection and try again.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload replay: ' + error.message 
    });
  }
}));

// @desc    Get tutor's replays
// @route   GET /api/tutor/replays
// @access  Private (Tutor only)
router.get('/', protect, asyncHandler(async (req, res) => {
  try {
    const tutorId = req.user._id;
    
    const replays = await Replay.find({ tutor: tutorId })
      .populate('course', 'title')
      .sort({ uploadDate: -1 });

    console.log(`📚 Found ${replays.length} replays for tutor ${tutorId}`);

    res.json({
      success: true,
      data: replays.map(replay => ({
        _id: replay._id,
        course: replay.course?._id,
        courseTitle: replay.course?.title || 'Unknown Course',
        title: replay.title,
        fileName: replay.fileName,
        fileUrl: replay.fileUrl,
        fileSize: replay.fileSize,
        uploadDate: replay.uploadDate,
        status: replay.status,
        viewCount: replay.viewCount || 0,
        deleteAt: replay.deleteAt
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

    if (replay.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own replays'
      });
    }

    // Delete file from filesystem
    if (replay.fileUrl) {
      try {
        // Remove leading slash if present and construct full path
        const filePath = replay.fileUrl.startsWith('/') 
          ? replay.fileUrl.substring(1) 
          : replay.fileUrl;
        const fullPath = path.join(__dirname, '..', filePath);
        
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`🗑️ Deleted file: ${fullPath}`);
        } else {
          console.warn(`⚠️ File not found: ${fullPath}`);
        }
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
