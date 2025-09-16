const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get user notifications
// @route   GET /api/notifications/my-notifications
// @access  Private
router.get('/my-notifications', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, read } = req.query;
    
    console.log('🔔 Fetching notifications for user:', userId);
    
    // Build query
    let query = { recipient: userId };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (read !== undefined) {
      query.isRead = read === 'true';
    }
    
    // Get notifications from database
    const notifications = await Notification.find(query)
      .populate('sender', 'name email avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      },
      message: 'Notifications retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
}));

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'week' } = req.query;
    
    console.log('📊 Fetching notification stats for user:', userId, 'period:', period);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get notifications from database for this period
    const periodNotifications = await Notification.find({
      recipient: userId,
      createdAt: { $gte: startDate }
    });
    
    // Calculate statistics
    const total = periodNotifications.length;
    const unread = periodNotifications.filter(notif => !notif.isRead).length;
    const read = total - unread;
    
    // Group by type
    const byType = periodNotifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {});
    
    // Group by day for chart data
    const byDay = {};
    periodNotifications.forEach(notif => {
      const day = new Date(notif.createdAt).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });
    
    const chartData = Object.entries(byDay).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('📊 Stats calculated:', { total, unread, read, byType });

    res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        read,
        byType,
        chartData,
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      },
      message: 'Notification statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    console.log('👁️ Marking notification as read:', notificationId, 'for user:', userId);
    
    const notification = await Notification.findOne({ 
      _id: notificationId, 
      recipient: userId 
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
}));

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('👁️ Marking all notifications as read for user:', userId);
    
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.status(200).json({
      success: true,
      data: { count: result.modifiedCount },
      message: `${result.modifiedCount} notifications marked as read`
    });

  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
}));

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    console.log('🗑️ Deleting notification:', notificationId, 'for user:', userId);
    
    const notification = await Notification.findOneAndDelete({ 
      _id: notificationId, 
      recipient: userId 
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
}));

module.exports = router;