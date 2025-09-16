import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { showSuccess, showError, showWarning, showInfo } from '../services/toastService.jsx';
import * as notificationService from '../services/notificationService';
import * as tutorService from '../services/tutorService';
import * as learnerService from '../services/learnerService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  
  // Check if AuthContext is available
  if (!authContext) {
    console.error('NotificationProvider must be used within AuthProvider');
    return <>{children}</>;
  }
  
  const { user, isAuthenticated } = authContext;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = async (params = {}) => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      let response;
      
      // Always use the general notifications API for all users
      // This avoids role-specific API issues
      response = await notificationService.getMyNotifications(params);
      
      if (response.success) {
        setNotifications(response.data.notifications || response.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        console.log('🔐 Authentication expired, user will be redirected');
        // Don't show error toast for auth issues
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('⚠️ Notification fetch timed out, will retry on next interval');
      } else if (error.response?.status >= 500) {
        console.log('⚠️ Server error, notifications temporarily unavailable');
      } else {
        console.log('⚠️ Notification fetch failed, continuing without notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch role-specific notifications
  const fetchRoleNotifications = async (params = {}) => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      // Use general notifications API instead of role-specific
      const response = await notificationService.getMyNotifications(params);
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching role notifications:', error);
      
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('⚠️ Role notification fetch timed out, will retry on next interval');
      } else {
        console.log('⚠️ Role notification fetch failed, continuing without notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification statistics
  const fetchNotificationStats = async (period = 'week') => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await notificationService.getNotificationStats(period);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      console.log('⚠️ Notification stats fetch failed, continuing without stats');
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated || !user) return;

    try {
      let response;
      
      // Use role-specific service
      if (user.role === 'tutor') {
        response = await tutorService.markNotificationAsRead(notificationId);
      } else if (user.role === 'learner') {
        response = await learnerService.markNotificationAsRead(notificationId);
      } else {
        response = await notificationService.markNotificationAsRead(notificationId);
      }
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        showSuccess('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showError('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !user) return;

    try {
      let response;
      
      // Use role-specific service
      if (user.role === 'tutor') {
        response = await tutorService.markAllNotificationsAsRead();
      } else if (user.role === 'learner') {
        response = await learnerService.markAllNotificationsAsRead();
      } else {
        response = await notificationService.markAllNotificationsAsRead();
      }
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        showSuccess('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.filter(n => n._id !== notificationId)
        );
        setUnreadCount(prev => 
          Math.max(0, prev - (notifications.find(n => n._id === notificationId)?.read ? 0 : 1))
        );
        showSuccess('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification');
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
      // Show toast for new notifications
      showInfo(notification.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Delete all notifications
      const deletePromises = notifications.map(n => 
        notificationService.deleteNotification(n._id)
      );
      await Promise.all(deletePromises);
      
      setNotifications([]);
      setUnreadCount(0);
      showSuccess('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showError('Failed to clear notifications');
    }
  };

  // Get notification settings
  const getNotificationSettings = async () => {
    if (!isAuthenticated || !user) return null;

    try {
      // TODO: Implement notification settings API when available
      return {
        email: true,
        push: true,
        sms: false,
        courseUpdates: true,
        assignmentDeadlines: true,
        gradingUpdates: true,
        systemMessages: true,
        liveSessionReminders: true,
        paymentReminders: true
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings) => {
    if (!isAuthenticated || !user) return false;

    try {
      // TODO: Implement notification settings API when available
      showSuccess('Notification settings updated');
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showError('Failed to update notification settings');
      return false;
    }
  };

  // Create notification (for testing or manual creation)
  const createNotification = async (notificationData) => {
    if (!isAuthenticated || !user) return;

    try {
      // This would be used for creating specific types of notifications
      // The actual implementation depends on the notification type
      showSuccess('Notification created');
    } catch (error) {
      console.error('Error creating notification:', error);
      showError('Failed to create notification');
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchNotificationStats();
    }
  }, [isAuthenticated, user]);

  // Auto-refresh notifications every 30 seconds with better error handling
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds for better real-time experience

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const value = {
    notifications,
    loading,
    unreadCount,
    stats,
    fetchNotifications,
    fetchRoleNotifications,
    fetchNotificationStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearAllNotifications,
    getNotificationSettings,
    updateNotificationSettings,
    createNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
