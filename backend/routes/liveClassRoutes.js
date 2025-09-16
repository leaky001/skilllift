const express = require('express');
const router = express.Router();
const {
  createLiveClass,
  getTutorLiveClasses,
  getLiveClass,
  getLiveClassById,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  getLearnerLiveClasses,
  debugLiveClass,
  canJoinLiveClass
} = require('../controllers/liveClassController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Live class CRUD operations
router.route('/')
  .post(authorize('tutor'), createLiveClass)
  .get(authorize('tutor'), getTutorLiveClasses);

router.route('/:id')
  .get(getLiveClassById);

// Live class management
router.post('/:id/start', authorize('tutor'), startLiveClass);
router.post('/:id/end', authorize('tutor'), endLiveClass);
router.get('/:id/debug', authorize('tutor'), debugLiveClass);
router.get('/:id/can-join', canJoinLiveClass);

// Replay management
router.post('/:liveClassId/replays', async (req, res) => {
  try {
    const { liveClassId } = req.params;
    const { title, course, description, type, status, visibility, tags, topic, isFeatured } = req.body;
    
    if (!title || !course || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Title, course, and topic are required'
      });
    }
    
    // Create comprehensive replay record
    const replay = {
      _id: `replay_${Date.now()}`,
      liveClassId: liveClassId,
      courseId: course,
      title: title,
      course: course,
      description: description || '',
      type: type || 'live-recording',
      status: status || 'draft',
      visibility: visibility || 'course-only',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      topic: topic,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      recordingUrl: 'https://example.com/uploaded-video.mp4', // In real app, this would be the uploaded file URL
      thumbnail: 'https://example.com/uploaded-thumbnail.jpg', // In real app, this would be the uploaded thumbnail URL
      transcript: 'https://example.com/uploaded-transcript.txt', // In real app, this would be the uploaded transcript URL
      duration: Math.floor(Math.random() * 120) + 30, // Random duration between 30-150 minutes
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} GB`,
      uploadDate: new Date().toISOString(),
      views: 0,
      likes: 0,
      accessCount: 0,
      quality: '1080p',
      subtitles: 'English'
    };
    
    console.log('✅ Replay uploaded successfully:', {
      id: replay._id,
      title: replay.title,
      course: replay.course,
      topic: replay.topic,
      type: replay.type,
      status: replay.status
    });
    
    res.json({
      success: true,
      data: replay,
      message: 'Replay uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload replay',
      error: error.message
    });
  }
});

module.exports = router;
