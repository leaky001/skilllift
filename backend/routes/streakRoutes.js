const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const {
  updateLearnerStreak,
  getLearnerStreak,
  getStreakLeaderboard,
  maintainStreaks,
  getActivityPoints
} = require('../services/streakTrackingService');

// @desc    Track learning activity and update streak
// @route   POST /api/streaks/track-activity
// @access  Private
router.post('/track-activity', protect, asyncHandler(async (req, res) => {
  try {
    const { activityType, activityData } = req.body;
    const learnerId = req.user._id;
    
    // Validate activity type
    const validActivityTypes = ['course_progress', 'assignment_submit', 'live_class_attend', 'replay_watch', 'quiz_complete', 'forum_post'];
    if (!validActivityTypes.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity type'
      });
    }
    
    // Update streak
    const result = await updateLearnerStreak(learnerId, activityType, activityData);
    
    res.status(200).json({
      success: true,
      data: result.streakData,
      message: 'Activity tracked and streak updated successfully'
    });
    
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track activity',
      error: error.message
    });
  }
}));

// @desc    Get learner streak data
// @route   GET /api/streaks/:learnerId
// @access  Private
router.get('/:learnerId', protect, asyncHandler(async (req, res) => {
  try {
    const { learnerId } = req.params;
    
    // Check if user is accessing their own streak or is admin
    if (req.user._id.toString() !== learnerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const result = await getLearnerStreak(learnerId);
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error getting learner streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get learner streak',
      error: error.message
    });
  }
}));

// @desc    Get streak leaderboard
// @route   GET /api/streaks/leaderboard
// @access  Private
router.get('/leaderboard', protect, asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await getStreakLeaderboard(parseInt(limit));
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error getting streak leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streak leaderboard',
      error: error.message
    });
  }
}));

// @desc    Get current user's streak
// @route   GET /api/streaks/my-streak
// @access  Private
router.get('/my-streak', protect, asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    
    const result = await getLearnerStreak(learnerId);
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error getting user streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user streak',
      error: error.message
    });
  }
}));

// @desc    Get activity points for different activity types
// @route   GET /api/streaks/activity-points
// @access  Private
router.get('/activity-points', protect, asyncHandler(async (req, res) => {
  try {
    const activityPoints = {
      'course_progress': getActivityPoints('course_progress'),
      'assignment_submit': getActivityPoints('assignment_submit'),
      'live_class_attend': getActivityPoints('live_class_attend'),
      'replay_watch': getActivityPoints('replay_watch'),
      'quiz_complete': getActivityPoints('quiz_complete'),
      'forum_post': getActivityPoints('forum_post')
    };
    
    res.status(200).json({
      success: true,
      data: activityPoints,
      message: 'Activity points retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting activity points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity points',
      error: error.message
    });
  }
}));

// @desc    Maintain streaks (admin only - run daily)
// @route   POST /api/streaks/maintain
// @access  Private (Admin)
router.post('/maintain', protect, authorize('admin'), asyncHandler(async (req, res) => {
  try {
    await maintainStreaks();
    
    res.status(200).json({
      success: true,
      message: 'Streaks maintained successfully'
    });
    
  } catch (error) {
    console.error('Error maintaining streaks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to maintain streaks',
      error: error.message
    });
  }
}));

module.exports = router;
