// Simple in-memory notification storage, keyed by userId
const notifications = {}; // Changed from array to object keyed by userId

// Function to add notification for any user
const addNotification = (userId, type, title, message, priority = 'medium', data = {}) => {
  const notification = {
    _id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
    userId: userId,
    type: type,
    title: title,
    message: message,
    read: false,
    priority: priority,
    createdAt: new Date().toISOString(),
    data: data
  };
  
  // Initialize user's notification array if it doesn't exist
  if (!notifications[userId]) {
    notifications[userId] = [];
  }
  
  notifications[userId].unshift(notification);
  console.log('📧 Added notification for user', userId, ':', notification);
  return notification;
};

// Function to get notifications for a user
const getUserNotifications = (userId) => {
  return notifications[userId] || [];
};

// Function to mark notification as read
const markAsRead = (notificationId, userId) => {
  if (!notifications[userId]) return false;
  
  const notification = notifications[userId].find(n => n._id === notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
};

// Function to delete notification
const deleteNotification = (notificationId, userId) => {
  if (!notifications[userId]) return false;
  
  const index = notifications[userId].findIndex(n => n._id === notificationId);
  if (index !== -1) {
    notifications[userId].splice(index, 1);
    return true;
  }
  return false;
};

// Function to get unread count
const getUnreadCount = (userId) => {
  if (!notifications[userId]) return 0;
  return notifications[userId].filter(notif => !notif.read).length;
};

// Function to mark all notifications as read for a user
const markAllAsRead = (userId) => {
  if (!notifications[userId]) return 0;
  
  let count = 0;
  notifications[userId].forEach(notif => {
    if (!notif.read) {
      notif.read = true;
      count++;
    }
  });
  return count;
};

module.exports = {
  addNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  _notificationsStore: notifications // For debugging
};