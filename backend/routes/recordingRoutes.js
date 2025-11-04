const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { protect } = require('../middleware/authMiddleware');
const LiveClassSession = require('../models/LiveClassSession');
const Course = require('../models/Course');
const NotificationService = require('../services/notificationService');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/recordings');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 2000 * 1024 * 1024, // 2GB limit (increased from 1GB)
    fieldSize: 100 * 1024 * 1024   // 100MB for form fields
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

/**
 * @route   POST /api/recordings/upload
 * @desc    Upload recorded live class video
 * @access  Private (Tutor)
 */
router.post('/upload', protect, (req, res, next) => {
  // Increase timeout for large uploads
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
}, upload.single('recording'), async (req, res) => {
  try {
    console.log('📤 Recording upload started');
    console.log('User:', req.user ? req.user._id : 'No user');
    console.log('User role:', req.user ? req.user.role : 'No role');
    console.log('File:', req.file ? req.file.filename : 'No file');
    console.log('File size:', req.file ? `${(req.file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A');
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No recording file provided' 
      });
    }

    const { sessionId, courseId, courseTitle, duration } = req.body;

    if (!sessionId || !courseId) {
      return res.status(400).json({ 
        success: false,
        error: 'Session ID and Course ID are required' 
      });
    }

    const recordingPath = req.file.path;
    const recordingFileName = req.file.filename;
    const recordingSize = req.file.size;
    
    console.log(`✅ File uploaded: ${recordingFileName} (${(recordingSize / 1024 / 1024).toFixed(2)} MB)`);

    // Find the session
    const session = await LiveClassSession.findOne({ sessionId });
    
    if (!session) {
      console.warn('⚠️ Session not found:', sessionId);
      // Still save the recording info even if session not found
    }

    // Update session with recording info
    if (session) {
      session.recordingUrl = `/api/recordings/${recordingFileName}`;
      session.recordingId = recordingFileName;
      
      if (duration) {
        session.recordingDuration = parseInt(duration);
      }
      
      await session.save();
      console.log('✅ Session updated with recording URL');
    }

    // Get course and notify learners
    try {
      const course = await Course.findById(courseId).populate('enrolledStudents');
      
      if (course && course.enrolledStudents) {
        console.log(`📢 Notifying ${course.enrolledStudents.length} learners...`);
        
        const notificationPromises = course.enrolledStudents.map(async (learner) => {
          try {
            // Don't notify the uploader (tutor)
            if (learner._id.toString() === req.user._id.toString()) {
              return;
            }

            await NotificationService.emitNotification(learner._id, {
              type: 'replay_ready',
              title: 'Class Recording Ready! 🎥',
              message: `The recording for "${courseTitle || course.title}" is now available to watch.`,
              data: {
                courseId: courseId,
                sessionId: sessionId,
                recordingUrl: `/api/recordings/${recordingFileName}`,
                courseTitle: courseTitle || course.title
              }
            });
          } catch (notifError) {
            console.error('Failed to notify learner:', learner._id, notifError.message);
          }
        });

        await Promise.all(notificationPromises);
        console.log('✅ Learner notifications sent');
      }
    } catch (notifyError) {
      console.error('❌ Error notifying learners:', notifyError.message);
      // Don't fail the request if notifications fail
    }

    res.json({
      success: true,
      message: 'Recording uploaded successfully',
      recordingUrl: `/api/recordings/${recordingFileName}`,
      recordingId: recordingFileName,
      size: recordingSize,
      duration: duration || null
    });

  } catch (error) {
    console.error('❌ Recording upload error:', error);
    
    // Delete file if exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload recording',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/recordings/:filename
 * @desc    Stream/download recording file
 * @access  Private
 */
router.get('/:filename', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/recordings', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ 
        success: false,
        error: 'Recording not found' 
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;

    // Support video streaming with range requests
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const file = require('fs').createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/webm',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/webm',
      };
      
      res.writeHead(200, head);
      require('fs').createReadStream(filePath).pipe(res);
    }

  } catch (error) {
    console.error('Error streaming recording:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to stream recording' 
    });
  }
});

/**
 * @route   DELETE /api/recordings/:filename
 * @desc    Delete a recording file
 * @access  Private (Tutor only)
 */
router.delete('/:filename', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/recordings', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ 
        success: false,
        error: 'Recording not found' 
      });
    }

    // Delete the file
    await fs.unlink(filePath);
    
    // Update database
    await LiveClassSession.updateOne(
      { recordingId: filename },
      { $unset: { recordingUrl: '', recordingId: '' } }
    );

    console.log('✅ Recording deleted:', filename);

    res.json({
      success: true,
      message: 'Recording deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete recording' 
    });
  }
});

/**
 * @route   GET /api/recordings/list/:courseId
 * @desc    List all recordings for a course
 * @access  Private
 */
router.get('/list/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;

    const recordings = await LiveClassSession.find({
      courseId: courseId,
      status: 'ended',
      recordingUrl: { $exists: true, $ne: null }
    })
    .select('sessionId recordingUrl recordingId startTime endTime recordingDuration')
    .sort({ endTime: -1 })
    .limit(50);

    res.json({
      success: true,
      count: recordings.length,
      recordings: recordings
    });

  } catch (error) {
    console.error('Error listing recordings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to list recordings' 
    });
  }
});

module.exports = router;

