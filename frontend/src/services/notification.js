import apiService from './api';

// ===== NOTIFICATION CRUD =====

export const getNotifications = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getUserNotifications = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/notifications/user?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

export const getNotification = async (notificationId) => {
  try {
    const response = await apiService.get(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await apiService.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const updateNotification = async (notificationId, updates) => {
  try {
    const response = await apiService.put(`/notifications/${notificationId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiService.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// ===== NOTIFICATION STATUS =====

export const markAsRead = async (notificationId) => {
  try {
    const response = await apiService.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await apiService.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const markAsUnread = async (notificationId) => {
  try {
    const response = await apiService.put(`/notifications/${notificationId}/unread`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
};

export const archiveNotification = async (notificationId) => {
  try {
    const response = await apiService.put(`/notifications/${notificationId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving notification:', error);
    throw error;
  }
};

export const unarchiveNotification = async (notificationId) => {
  try {
    const response = await apiService.put(`/notifications/${notificationId}/unarchive`);
    return response.data;
  } catch (error) {
    console.error('Error unarchiving notification:', error);
    throw error;
  }
};

// ===== NOTIFICATION PREFERENCES =====

export const getNotificationPreferences = async () => {
  try {
    const response = await apiService.get('/notifications/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await apiService.put('/notifications/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

export const resetNotificationPreferences = async () => {
  try {
    const response = await apiService.post('/notifications/preferences/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    throw error;
  }
};

// ===== NOTIFICATION STATISTICS =====

export const getNotificationStats = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/notifications/stats?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    throw error;
  }
};

export const getNotificationAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/notifications/analytics?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification analytics:', error);
    throw error;
  }
};

export const getNotificationTrends = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/notifications/trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification trends:', error);
    throw error;
  }
};

// ===== NOTIFICATION TEMPLATES =====

export const getNotificationTemplates = async () => {
  try {
    const response = await apiService.get('/notifications/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    throw error;
  }
};

export const createNotificationTemplate = async (templateData) => {
  try {
    const response = await apiService.post('/notifications/templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification template:', error);
    throw error;
  }
};

export const updateNotificationTemplate = async (templateId, updates) => {
  try {
    const response = await apiService.put(`/notifications/templates/${templateId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating notification template:', error);
    throw error;
  }
};

export const deleteNotificationTemplate = async (templateId) => {
  try {
    const response = await apiService.delete(`/notifications/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification template:', error);
    throw error;
  }
};

// ===== BULK NOTIFICATIONS =====

export const sendBulkNotification = async (bulkData) => {
  try {
    const response = await apiService.post('/notifications/bulk', bulkData);
    return response.data;
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    throw error;
  }
};

export const getBulkNotificationStatus = async (bulkId) => {
  try {
    const response = await apiService.get(`/notifications/bulk/${bulkId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bulk notification status:', error);
    throw error;
  }
};

export const cancelBulkNotification = async (bulkId) => {
  try {
    const response = await apiService.delete(`/notifications/bulk/${bulkId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling bulk notification:', error);
    throw error;
  }
};

// ===== NOTIFICATION CHANNELS =====

export const getNotificationChannels = async () => {
  try {
    const response = await apiService.get('/notifications/channels');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification channels:', error);
    throw error;
  }
};

export const updateChannelSettings = async (channelId, settings) => {
  try {
    const response = await apiService.put(`/notifications/channels/${channelId}`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating channel settings:', error);
    throw error;
  }
};

export const testChannel = async (channelId) => {
  try {
    const response = await apiService.post(`/notifications/channels/${channelId}/test`);
    return response.data;
  } catch (error) {
    console.error('Error testing channel:', error);
    throw error;
  }
};

// ===== NOTIFICATION SUBSCRIPTIONS =====

export const subscribeToNotifications = async (subscriptionData) => {
  try {
    const response = await apiService.post('/notifications/subscribe', subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    throw error;
  }
};

export const unsubscribeFromNotifications = async (subscriptionId) => {
  try {
    const response = await apiService.delete(`/notifications/subscribe/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    throw error;
  }
};

export const getNotificationSubscriptions = async () => {
  try {
    const response = await apiService.get('/notifications/subscriptions');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification subscriptions:', error);
    throw error;
  }
};

// ===== NOTIFICATION REPORTS =====

export const getNotificationReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/notifications/reports?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification reports:', error);
    throw error;
  }
};

export const generateNotificationReport = async (reportData) => {
  try {
    const response = await apiService.post('/notifications/reports/generate', reportData);
    return response.data;
  } catch (error) {
    console.error('Error generating notification report:', error);
    throw error;
  }
};

export const downloadNotificationReport = async (reportId) => {
  try {
    const response = await apiService.get(`/notifications/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading notification report:', error);
    throw error;
  }
};
