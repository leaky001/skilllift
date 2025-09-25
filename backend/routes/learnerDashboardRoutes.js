const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
// LiveClass model removed - Live class functionality deleted
const Enrollment = require('../models/Enrollment');

// Helper function to map notification types to announcement types
const getAnnouncementType = (notificationType) => {
  switch (notificationType) {
    case 'course_available':
    case 'course_approval':
    case 'course_rejection':
      return 'course';
    case 'assignment_created':
      return 'assignment';
    // live_class_scheduled removed - Live class functionality deleted
    case 'replay_uploaded':
      return 'replay';
    case 'announcement':
    default:
      return 'system';
  }
};

// Helper function to generate action URLs based on notification type
const getActionUrl = (notificationType, data) => {
  switch (notificationType) {
    case 'course_available':
    case 'course_approval':
      return data?.courseId ? `/learner/courses/${data.courseId}` : '/learner/courses';
    case 'assignment_created':
      return data?.assignmentId ? `/learner/assignments/${data.assignmentId}` : '/learner/assignments';
    // live_class_scheduled removed - Live class functionality deleted
    case 'replay_uploaded':
      return '/learner/replays';
    default:
      return null;
  }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};


// @desc    Get upcoming live classes for learner
// @route   GET /api/learner/upcoming-sessions
// @access  Private (Learner)
// Removed - Live class functionality deleted

// @desc    Get recent announcements for learner
// @route   GET /api/learner/announcements
// @access  Private (Learner)
router.get('/announcements', protect, authorize('learner'), asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    const { limit = 5, unreadOnly = false } = req.query;
    
    console.log('🔔 Fetching announcements for learner:', learnerId);
    
    // Build query for notifications that are announcements
    let query = { 
      recipient: learnerId,
      type: { $in: ['announcement', 'course_available', 'assignment_created', 'replay_uploaded', 'course_approval', 'course_rejection'] }
    };
    
    // Filter unread only if requested
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    // Get notifications from database
    const notifications = await Notification.find(query)
      .populate('sender', 'name email avatar')
      .sort('-createdAt')
      .limit(parseInt(limit));

    // Format notifications as announcements
    const recentAnnouncements = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: getAnnouncementType(notification.type),
      priority: notification.priority || 'medium',
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      readAt: notification.readAt,
      sender: notification.sender?.name || 'System',
      actionUrl: getActionUrl(notification.type, notification.data)
    }));

    res.status(200).json({
      success: true,
      data: recentAnnouncements,
      message: 'Recent announcements retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message
    });
  }
}));

// @desc    Mark announcement as read
// @route   PUT /api/learner/announcements/:id/read
// @access  Private (Learner)
router.put('/announcements/:id/read', protect, authorize('learner'), asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    const { id } = req.params;
    
    console.log('👁️ Marking announcement as read:', id, 'for learner:', learnerId);
    
    // Find and update the notification in database
    const notification = await Notification.findOne({
      _id: id,
      recipient: learnerId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification,
      message: 'Announcement marked as read'
    });

  } catch (error) {
    console.error('Error marking announcement as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark announcement as read',
      error: error.message
    });
  }
}));

// @desc    Get learner dashboard summary
// @route   GET /api/learner/dashboard-summary
// @access  Private (Learner)
router.get('/dashboard-summary', protect, authorize('learner'), asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    
    console.log('📊 Fetching dashboard summary for learner:', learnerId);
    
    // Get upcoming live sessions from database - Removed live class functionality
    const enrollments = await Enrollment.find({ learner: learnerId })
      .populate('course', 'title')
      .select('course');
    
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course._id);
    
    // Live class sessions removed - Live class functionality deleted
    const formattedSessions = [];

    // Get recent announcements from database
    const notifications = await Notification.find({
      recipient: learnerId,
      type: { $in: ['announcement', 'course_available', 'assignment_created', 'replay_uploaded', 'course_approval', 'course_rejection'] }
    })
    .populate('sender', 'name email avatar')
    .sort('-createdAt')
    .limit(3);

    // Format notifications as announcements
    const recentAnnouncements = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: getAnnouncementType(notification.type),
      priority: notification.priority || 'medium',
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      readAt: notification.readAt,
      sender: notification.sender?.name || 'System',
      actionUrl: getActionUrl(notification.type, notification.data),
      time: getTimeAgo(notification.createdAt)
    }));

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: learnerId,
      isRead: false,
      type: { $in: ['announcement', 'course_available', 'assignment_created', 'replay_uploaded', 'course_approval', 'course_rejection'] }
    });

    res.status(200).json({
      success: true,
      data: {
        upcomingSessions: formattedSessions,
        recentAnnouncements,
        unreadAnnouncements: unreadCount,
        totalAnnouncements: notifications.length
      },
      message: 'Dashboard summary retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message
    });
  }
}));

module.exports = router;
