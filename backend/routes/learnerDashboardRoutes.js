const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const LiveClass = require('../models/LiveClass');
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
    case 'live_class_scheduled':
      return 'live-class';
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
    case 'live_class_scheduled':
      return data?.liveClassId ? `/learner/live-classes/${data.liveClassId}` : '/learner/live-classes';
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
router.get('/upcoming-sessions', protect, authorize('learner'), asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    const { limit = 5 } = req.query;
    
    console.log('📅 Fetching upcoming sessions for learner:', learnerId);
    
    // Get learner's enrolled courses
    const enrollments = await Enrollment.find({ learner: learnerId })
      .populate('course', 'title')
      .select('course');
    
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course._id);
    
    if (enrolledCourseIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No enrolled courses found'
      });
    }
    
    // Get upcoming live sessions for enrolled courses
    const upcomingSessions = await LiveClass.find({
      course: { $in: enrolledCourseIds },
      startTime: { $gte: new Date() },
      status: { $in: ['scheduled', 'ready'] }
    })
    .populate('course', 'title')
    .populate('tutor', 'name')
    .sort('startTime')
    .limit(parseInt(limit));

    // Format sessions
    const formattedSessions = upcomingSessions.map(session => ({
      id: session._id,
      title: session.title,
      description: session.description,
      instructor: session.tutor?.name || 'Unknown Instructor',
      instructorId: session.tutor?._id,
      date: session.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      time: `${session.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${session.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      duration: Math.round((session.endTime - session.startTime) / (1000 * 60)), // duration in minutes
      status: session.status,
      participants: session.enrolledLearners?.length || 0,
      maxParticipants: session.maxParticipants || 100,
      courseId: session.course?._id,
      courseTitle: session.course?.title || 'Unknown Course',
      meetingLink: session.meetingLink,
      isEnrolled: true
    }));

    res.status(200).json({
      success: true,
      data: formattedSessions,
      message: 'Upcoming sessions retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming sessions',
      error: error.message
    });
  }
}));

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
      type: { $in: ['announcement', 'course_available', 'assignment_created', 'live_class_scheduled', 'replay_uploaded', 'course_approval', 'course_rejection'] }
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
    
    // Get upcoming live sessions from database
    const enrollments = await Enrollment.find({ learner: learnerId })
      .populate('course', 'title')
      .select('course');
    
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course._id);
    
    const upcomingSessions = await LiveClass.find({
      course: { $in: enrolledCourseIds },
      startTime: { $gte: new Date() },
      status: { $in: ['scheduled', 'ready'] }
    })
    .populate('course', 'title')
    .populate('tutor', 'name')
    .sort('startTime')
    .limit(3);

    // Format upcoming sessions
    const formattedSessions = upcomingSessions.map(session => ({
      id: session._id,
      title: session.title,
      date: session.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      time: `${session.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${session.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      instructor: session.tutor?.name || 'Unknown Instructor',
      participants: session.enrolledLearners?.length || 0,
      status: session.status === 'ready' ? 'join' : 'set-reminder',
      courseTitle: session.course?.title || 'Unknown Course'
    }));

    // Get recent announcements from database
    const notifications = await Notification.find({
      recipient: learnerId,
      type: { $in: ['announcement', 'course_available', 'assignment_created', 'live_class_scheduled', 'replay_uploaded', 'course_approval', 'course_rejection'] }
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
      type: { $in: ['announcement', 'course_available', 'assignment_created', 'live_class_scheduled', 'replay_uploaded', 'course_approval', 'course_rejection'] }
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
