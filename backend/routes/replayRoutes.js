/**
 * Replay Routes
 * Routes for automated recording and replay management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const replayController = require('../controllers/replayController');

/**
 * @route   POST /api/replay/start
 * @desc    Start automated recording for a live session
 * @access  Private (Tutor only)
 */
router.post('/start', protect, replayController.startRecording);

/**
 * @route   POST /api/replay/stop
 * @desc    Stop recording and upload to Drive
 * @access  Private (Tutor only)
 */
router.post('/stop', protect, replayController.stopRecording);

/**
 * @route   POST /api/replay/upload
 * @desc    Upload a local recording file to Google Drive
 * @access  Private (Tutor only)
 */
router.post('/upload', protect, replayController.uploadRecording);

/**
 * @route   GET /api/replay/list
 * @desc    Get all replay recordings (optionally filtered by course)
 * @access  Private (Tutor only)
 */
router.get('/list', protect, replayController.listReplays);

/**
 * @route   GET /api/replay/:sessionId
 * @desc    Get specific replay by session ID
 * @access  Private (Tutor only)
 */
router.get('/:sessionId', protect, replayController.getReplay);

/**
 * @route   DELETE /api/replay/:sessionId
 * @desc    Delete a replay recording from Drive and metadata
 * @access  Private (Tutor only)
 */
router.delete('/:sessionId', protect, replayController.deleteReplay);

/**
 * @route   GET /api/replays/stream/:filename
 * @desc    Stream a video file for playback
 * @access  Private (Enrolled learners + tutor)
 */
router.get('/stream/:filename', protect, replayController.streamVideo);

/**
 * @route   GET /api/replays/course/:courseId
 * @desc    Get all replays for a specific course
 * @access  Private (Enrolled learners + tutor)
 */
router.get('/course/:courseId', protect, replayController.getCourseReplays);

module.exports = router;

