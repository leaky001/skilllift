/**
 * Replay Controller
 * Handles automated recording and replay management
 */

const MeetRecordingBot = require('../services/meetRecordingBot');
const User = require('../models/User');
const LiveClass = require('../models/LiveClass');
const fs = require('fs').promises;
const path = require('path');

// Store active recording bots
const activeBots = new Map();

// Recordings metadata storage
const RECORDINGS_FILE = path.join(__dirname, '../recordings.json');

/**
 * Load recordings metadata
 */
async function loadRecordingsMetadata() {
  try {
    const data = await fs.readFile(RECORDINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
    return [];
  }
}

/**
 * Save recordings metadata
 */
async function saveRecordingsMetadata(recordings) {
  await fs.writeFile(RECORDINGS_FILE, JSON.stringify(recordings, null, 2));
}

/**
 * Start automated recording for a live session
 * POST /api/replay/start
 */
exports.startRecording = async (req, res) => {
  try {
    const { sessionId, meetLink } = req.body;
    const tutorId = req.user._id;

    console.log('🎬 Starting automated recording for session:', sessionId);

    // Validate input
    if (!sessionId || !meetLink) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Meet link are required'
      });
    }

    // Check if already recording
    if (activeBots.has(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Recording already in progress for this session'
      });
    }

    // Get tutor's Google tokens
    const tutor = await User.findById(tutorId);
    if (!tutor || !tutor.googleTokens) {
      return res.status(400).json({
        success: false,
        error: 'Google account not connected. Please connect your Google account first.'
      });
    }

    // Create and initialize bot
    const bot = new MeetRecordingBot();
    activeBots.set(sessionId, bot);

    // Start recording (this will run in background)
    bot.recordMeeting(meetLink, sessionId, tutor.googleTokens, tutor.email)
      .then(result => {
        console.log('✅ Recording started successfully:', result);
      })
      .catch(error => {
        console.error('❌ Recording failed:', error);
        activeBots.delete(sessionId);
      });

    res.json({
      success: true,
      message: 'Automated recording started successfully',
      sessionId
    });
  } catch (error) {
    console.error('❌ Error starting recording:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start recording'
    });
  }
};

/**
 * Stop recording and upload to Drive
 * POST /api/replay/stop
 */
exports.stopRecording = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const tutorId = req.user._id;

    console.log('⏹️ Stopping recording for session:', sessionId);

    // Get the bot
    const bot = activeBots.get(sessionId);
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'No active recording found for this session'
      });
    }

    // Stop recording
    await bot.stopRecording();
    await bot.leaveMeeting();

    // Get tutor's Google tokens for upload
    const tutor = await User.findById(tutorId);
    
    // Upload to Drive
    const recordingPath = path.join(__dirname, '../recordings', `${sessionId}.mp4`);
    const fileName = `SkillLift-Recording-${sessionId}-${Date.now()}.mp4`;
    
    const uploadResult = await bot.uploadToDrive(recordingPath, fileName, sessionId);

    // Cleanup bot
    await bot.cleanup();
    activeBots.delete(sessionId);

    // Save metadata
    const recordings = await loadRecordingsMetadata();
    recordings.push({
      sessionId,
      courseId,
      tutorId: tutorId.toString(),
      fileName: uploadResult.fileName,
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      webContentLink: uploadResult.webContentLink,
      uploadedAt: uploadResult.uploadedAt,
      recordedAt: new Date().toISOString()
    });
    await saveRecordingsMetadata(recordings);

    // Update LiveClass with replay URL
    await LiveClass.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          replayUrl: uploadResult.webViewLink,
          replayFileId: uploadResult.fileId,
          recordingStatus: 'completed'
        }
      }
    );

    // Delete local file to save space (optional)
    try {
      await fs.unlink(recordingPath);
      console.log('✅ Local recording file deleted');
    } catch (e) {
      console.log('⚠️ Could not delete local file:', e.message);
    }

    res.json({
      success: true,
      message: 'Recording stopped and uploaded successfully',
      replay: {
        sessionId,
        fileName: uploadResult.fileName,
        fileId: uploadResult.fileId,
        url: uploadResult.webViewLink,
        uploadedAt: uploadResult.uploadedAt
      }
    });
  } catch (error) {
    console.error('❌ Error stopping recording:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stop recording'
    });
  }
};

/**
 * Upload a local recording to Drive
 * POST /api/replay/upload
 */
exports.uploadRecording = async (req, res) => {
  try {
    const { sessionId, filePath } = req.body;
    const tutorId = req.user._id;

    console.log('📤 Uploading recording to Drive:', { sessionId, filePath });

    // Validate input
    if (!sessionId || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and file path are required'
      });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Recording file not found'
      });
    }

    // Get tutor's Google tokens
    const tutor = await User.findById(tutorId);
    if (!tutor || !tutor.googleTokens) {
      return res.status(400).json({
        success: false,
        error: 'Google account not connected'
      });
    }

    // Create bot instance for upload
    const bot = new MeetRecordingBot();
    bot.oauth2Client.setCredentials({
      access_token: tutor.googleTokens.accessToken,
      refresh_token: tutor.googleTokens.refreshToken,
      expiry_date: tutor.googleTokens.expiryDate
    });

    // Upload to Drive
    const fileName = `SkillLift-Recording-${sessionId}-${Date.now()}.mp4`;
    const uploadResult = await bot.uploadToDrive(filePath, fileName, sessionId);

    // Save metadata
    const recordings = await loadRecordingsMetadata();
    recordings.push({
      sessionId,
      tutorId: tutorId.toString(),
      fileName: uploadResult.fileName,
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      webContentLink: uploadResult.webContentLink,
      uploadedAt: uploadResult.uploadedAt,
      recordedAt: new Date().toISOString()
    });
    await saveRecordingsMetadata(recordings);

    // Update LiveClass
    await LiveClass.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          replayUrl: uploadResult.webViewLink,
          replayFileId: uploadResult.fileId,
          recordingStatus: 'completed'
        }
      }
    );

    res.json({
      success: true,
      message: 'Recording uploaded successfully',
      replay: {
        sessionId,
        fileName: uploadResult.fileName,
        fileId: uploadResult.fileId,
        url: uploadResult.webViewLink,
        uploadedAt: uploadResult.uploadedAt
      }
    });
  } catch (error) {
    console.error('❌ Error uploading recording:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload recording'
    });
  }
};

/**
 * Get all replay recordings
 * GET /api/replay/list
 */
exports.listReplays = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { courseId } = req.query;

    console.log('📋 Fetching replay list for tutor:', tutorId);

    // Load all recordings
    let recordings = await loadRecordingsMetadata();

    // Filter by tutor
    recordings = recordings.filter(r => r.tutorId === tutorId.toString());

    // Filter by course if provided
    if (courseId) {
      recordings = recordings.filter(r => r.courseId === courseId);
    }

    // Sort by date (newest first)
    recordings.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

    res.json({
      success: true,
      count: recordings.length,
      recordings
    });
  } catch (error) {
    console.error('❌ Error fetching replays:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch replays'
    });
  }
};

/**
 * Get specific replay by session ID
 * GET /api/replay/:sessionId
 */
exports.getReplay = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const tutorId = req.user._id;

    console.log('🔍 Fetching replay for session:', sessionId);

    // Load recordings
    const recordings = await loadRecordingsMetadata();
    
    // Find recording
    const recording = recordings.find(r => 
      r.sessionId === sessionId && r.tutorId === tutorId.toString()
    );

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }

    res.json({
      success: true,
      recording
    });
  } catch (error) {
    console.error('❌ Error fetching replay:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch replay'
    });
  }
};

/**
 * Delete a replay recording
 * DELETE /api/replay/:sessionId
 */
exports.deleteReplay = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const tutorId = req.user._id;

    console.log('🗑️ Deleting replay for session:', sessionId);

    // Get tutor's Google tokens
    const tutor = await User.findById(tutorId);
    if (!tutor || !tutor.googleTokens) {
      return res.status(400).json({
        success: false,
        error: 'Google account not connected'
      });
    }

    // Load recordings
    let recordings = await loadRecordingsMetadata();
    
    // Find recording
    const recording = recordings.find(r => 
      r.sessionId === sessionId && r.tutorId === tutorId.toString()
    );

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }

    // Delete from Google Drive
    const bot = new MeetRecordingBot();
    bot.oauth2Client.setCredentials({
      access_token: tutor.googleTokens.accessToken,
      refresh_token: tutor.googleTokens.refreshToken,
      expiry_date: tutor.googleTokens.expiryDate
    });

    const { google } = require('googleapis');
    const drive = google.drive({ version: 'v3', auth: bot.oauth2Client });
    
    await drive.files.delete({
      fileId: recording.fileId
    });

    // Remove from metadata
    recordings = recordings.filter(r => r.sessionId !== sessionId);
    await saveRecordingsMetadata(recordings);

    // Update LiveClass
    await LiveClass.findOneAndUpdate(
      { sessionId },
      {
        $unset: { replayUrl: "", replayFileId: "" },
        $set: { recordingStatus: 'deleted' }
      }
    );

    res.json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting replay:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete replay'
    });
  }
};

/**
 * Stream video file for playback
 * GET /api/replays/stream/:filename
 */
exports.streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user._id;
    
    console.log('🎥 Streaming video:', filename);
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    // Construct video path
    const videoPath = path.join(__dirname, '../uploads/replays', filename);
    
    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    // Get file stats
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Parse range header for video seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = require('fs').createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range, send entire video
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      require('fs').createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('❌ Error streaming video:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stream video'
    });
  }
};

/**
 * Get all replays for a specific course
 * GET /api/replays/course/:courseId
 */
exports.getCourseReplays = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const Replay = require('../models/Replay');
    const Course = require('../models/Course');
    
    console.log('📋 Fetching replays for course:', courseId);
    
    // Verify user has access to this course (enrolled or tutor)
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    const isEnrolled = course.enrolledStudents.some(
      studentId => studentId.toString() === userId.toString()
    );
    const isTutor = course.tutor.toString() === userId.toString();
    
    if (!isEnrolled && !isTutor) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this course'
      });
    }
    
    // Get all replays for this course
    const replays = await Replay.find({
      course: courseId,
      status: 'ready'
    })
    .populate('tutor', 'name email')
    .sort({ uploadDate: -1 });
    
    res.json({
      success: true,
      count: replays.length,
      replays
    });
  } catch (error) {
    console.error('❌ Error fetching course replays:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch course replays'
    });
  }
};

module.exports = exports;

