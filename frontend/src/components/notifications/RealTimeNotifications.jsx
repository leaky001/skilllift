import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaTimes, 
  FaCheck, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaEnvelope,
  FaCreditCard,
  FaGraduationCap,
  FaUserCheck,
  FaFileAlt,
  FaPlay,
  FaPause,
  FaCog,
  FaVolumeUp,
  FaVolumeMute,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { useAuth } from '../../context/AuthContext';
import apiService, { getTabId, getStorageKey } from '../../services/api';

const RealTimeNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    courseUpdates: true,
    payments: true,

    assignments: true,
    liveClasses: true,
    mentorship: true,
    sound: true,
    desktop: true
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Only initialize if user is authenticated and token exists
    if (user && user._id) {
      // Check if token exists before making requests
      const token = sessionStorage.getItem(getStorageKey('token'));
      if (token) {
        console.log('✅ Token found, initializing notifications...');
        initializeWebSocket();
        fetchNotifications();
      } else {
        console.log('⚠️ No token found, skipping notification initialization. User may not be logged in yet.');
      }
    } else {
      console.log('⚠️ User not authenticated, skipping notification initialization');
    }

    return () => {
      cleanupWebSocket();
    };
  }, [user]);

  // Initialize WebSocket (Currently disabled - WebSocket server not implemented)
  const initializeWebSocket = () => {
    console.log('⚠️ WebSocket connection disabled - WebSocket server not implemented in backend yet');
    console.log('📡 Notifications will work through regular API polling instead');
    
    // Set connected to false since WebSocket is disabled
    setIsConnected(false);
    
    // Set up polling for notifications instead
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds
    
    // Store interval ID for cleanup
    wsRef.current = { close: () => clearInterval(pollInterval) };
    
    // Initial fetch
    fetchNotifications();
    
    return;
    
    // TODO: Implement WebSocket server in backend
    // try {
    //   // Check if user is authenticated
    //   const token = localStorage.getItem('token') || localStorage.getItem('skilllift_user');
    //   if (!token || !user?._id) {
    //     console.log('⚠️ No authentication token or user ID found, skipping WebSocket initialization');
    //     return;
    //   }

    //   const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    //   wsRef.current = new WebSocket(`${wsUrl}/notifications?userId=${user._id}&token=${token}`);

    //   wsRef.current.onopen = () => {
    //     console.log('WebSocket connected');
    //     setIsConnected(true);
    //     if (reconnectTimeoutRef.current) {
    //       clearTimeout(reconnectTimeoutRef.current);
    //       reconnectTimeoutRef.current = null;
    //     }
    //   };

    //   wsRef.current.onmessage = (event) => {
    //     try {
    //       const data = JSON.parse(event.data);
    //       handleWebSocketMessage(data);
    //     } catch (error) {
    //       console.error('Error parsing WebSocket message:', error);
    //     }
    //   };

    //   wsRef.current.onclose = () => {
    //     console.log('WebSocket disconnected');
    //     setIsConnected(false);
    //     scheduleReconnect();
    //   };

    //   wsRef.current.onerror = (error) => {
    //     console.error('WebSocket error:', error);
    //     setIsConnected(false);
    //   };
    // } catch (error) {
    //   console.error('Error initializing WebSocket:', error);
    //   scheduleReconnect();
    // }
  };

  // Schedule reconnection (Currently disabled)
  const scheduleReconnect = () => {
    console.log('⚠️ WebSocket reconnection disabled - WebSocket server not implemented');
    return;
    
    // TODO: Implement WebSocket server in backend
    // if (reconnectTimeoutRef.current) return;
    // 
    // reconnectTimeoutRef.current = setTimeout(() => {
    //   console.log('Attempting to reconnect...');
    //   initializeWebSocket();
    // }, 5000);
  };

  // Cleanup WebSocket (Currently disabled)
  const cleanupWebSocket = () => {
    console.log('⚠️ WebSocket cleanup disabled - WebSocket server not implemented');
    
    // Clean up polling interval if it exists
    if (wsRef.current && wsRef.current.close) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    return;
    
    // TODO: Implement WebSocket server in backend
    // if (wsRef.current) {
    //   wsRef.current.close();
    //   wsRef.current = null;
    // }
    // if (reconnectTimeoutRef.current) {
    //   clearTimeout(reconnectTimeoutRef.current);
    //   reconnectTimeoutRef.current = null;
    // }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'notification':
        handleNewNotification(data.notification);
        break;
      case 'live-class-started':
        // Handle direct live class start broadcast
        console.log('🎥 Live class started broadcast received:', data);
        handleLiveClassStarted(data);
        break;
      case 'notification_update':
        handleNotificationUpdate(data.notification);
        break;
      case 'notification_delete':
        handleNotificationDelete(data.notificationId);
        break;
      case 'ping':
        // Respond to ping to keep connection alive
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'pong' }));
        }
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  // Handle live class started broadcast
  const handleLiveClassStarted = (data) => {
    console.log('🎥 Processing live class started broadcast:', data);
    
    // Create a notification object from the broadcast
    const notification = {
      _id: `live_${data.classId}_${Date.now()}`,
      type: 'live_class_started',
      title: '🚀 Live Class Started!',
      message: data.message || `Live class has started! Click to join now.`,
      data: {
        liveClassId: data.classId,
        sessionId: data.sessionId,
        joinUrl: data.joinUrl,
        actionType: data.actionType,
        actionText: data.actionText
      },
      priority: 'high',
      isActionable: true,
      createdAt: new Date().toISOString()
    };

    // Add to notifications list
    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    setUnreadCount(prev => prev + 1);

    // Show desktop notification
    if (notificationSettings.desktop) {
      showDesktopNotification(notification);
    }

    // Play sound if enabled
    if (notificationSettings.sound && !isMuted) {
      playNotificationSound();
    }

    // Show in-app notification with click action
    showInfo(notification.message, {
      position: 'top-right',
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClick: () => {
        // Navigate to live class when clicked
        navigate(data.joinUrl);
      }
    });
  };

  // Handle new notification
  const handleNewNotification = (notification) => {
    // Check if notification type is enabled
    if (!isNotificationTypeEnabled(notification.type)) {
      return;
    }

    // Add to notifications list
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
    setUnreadCount(prev => prev + 1);

    // Show toast notification with action button for live classes
    if (notificationSettings.desktop) {
      showDesktopNotification(notification);
    }

    // Play sound if enabled
    if (notificationSettings.sound && !isMuted) {
      playNotificationSound();
    }

    // Show in-app notification with action for live classes
    if (notification.type === 'live_class_started' && notification.data?.joinUrl) {
      showInfo(notification.message, {
        position: 'top-right',
        autoClose: 10000, // Longer duration for live class notifications
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => {
          // Navigate to live class when clicked
          navigate(notification.data.joinUrl);
        }
      });
    } else {
      showInfo(notification.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Handle notification update
  const handleNotificationUpdate = (updatedNotification) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === updatedNotification._id ? updatedNotification : notif
      )
    );
  };

  // Handle notification deletion
  const handleNotificationDelete = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  // Check if notification type is enabled
  const isNotificationTypeEnabled = (type) => {
    const typeMap = {
      'course_update': 'courseUpdates',
      'payment': 'payments',
      'payment_received': 'payments',
      'assignment': 'assignments',
      'live_class': 'liveClasses',
      'mentorship': 'mentorship'
    };

    const settingKey = typeMap[type];
    return settingKey ? notificationSettings[settingKey] : true;
  };

  // Show desktop notification
  const showDesktopNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title || 'SkillLift Notification', {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification._id,
        requireInteraction: false,
        silent: true
      });
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API instead of loading external files
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  // Fetch existing notifications
  const fetchNotifications = async () => {
    // Don't fetch if user is not authenticated
    if (!user || !user._id) {
      console.log('⚠️ User not authenticated, skipping notification fetch');
      return;
    }

    // Check if token exists before making request
    const token = sessionStorage.getItem(getStorageKey('token'));
    if (!token) {
      console.log('⚠️ No authentication token found, skipping notification fetch');
      return;
    }

    try {
      // Use the API service which handles authentication automatically
      console.log('🔄 Fetching notifications via API service...');

      const response = await apiService.get('/notifications/my-notifications', {
        params: { limit: 20, unreadOnly: false }
      });
      
      console.log('✅ Notifications API response:', response.data);
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
        console.log('✅ Notifications loaded successfully:', response.data.data.notifications?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      
      // If it's a 401 error, the API service will handle token clearing
      if (error.response?.status === 401) {
        console.log('🔐 Authentication expired, API service will handle token clearing');
        // Clear notifications on auth failure
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      // Don't crash the component on notification errors
      console.log('⚠️ Continuing with empty notifications due to fetch error');
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate to notifications page based on user role
    const notificationPath = user?.role === 'tutor' ? '/tutor/notifications' : 
                            user?.role === 'admin' ? '/admin/notifications' : 
                            '/learner/notifications';
    navigate(notificationPath);
    setIsOpen(false);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      console.log('⚠️ Failed to mark notification as read, continuing...');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiService.put('/notifications/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Update unread count if notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (key, value) => {
    try {
      const newSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(newSettings);
      
      // Save to backend
      await apiService.put('/users/notification-settings', newSettings);
      
      showSuccess('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showError('Failed to update notification settings');
    }
  };

  // Request desktop notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showSuccess('Desktop notifications enabled!');
        updateNotificationSettings('desktop', true);
      } else {
        showError('Desktop notifications blocked');
        updateNotificationSettings('desktop', false);
      }
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_update':
        return FaGraduationCap;
      case 'course_available':
        return FaGraduationCap;
      case 'course_reviewed':
        return FaStar;
      case 'review_approved':
        return FaCheckCircle;
      case 'tutor_reviewed':
        return FaStar;
      case 'payment':
      case 'payment_received':
        return FaCreditCard;
      case 'assignment':
      case 'assignment_created':
      case 'assignment_published':
      case 'assignment_due':
        return FaFileAlt;
      case 'live_class':
      case 'live_class_scheduled':
      case 'live_class_started':
        return FaPlay;
      case 'mentorship':
        return FaEnvelope;
      default:
        return FaInfoCircle;
    }
  };

  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
      case 'payment_received':
        return 'text-emerald-600 bg-emerald-100';
      case 'assignment':
      case 'assignment_created':
      case 'assignment_published':
      case 'assignment_due':
        return 'text-amber-600 bg-amber-100';
      case 'live_class':
      case 'live_class_scheduled':
      case 'live_class_started':
        return 'text-indigo-600 bg-indigo-100';
      case 'course_update':
      case 'course_available':
        return 'text-emerald-600 bg-emerald-100';
      case 'course_reviewed':
        return 'text-amber-600 bg-amber-100';
      case 'review_approved':
        return 'text-emerald-600 bg-emerald-100';
      case 'tutor_reviewed':
        return 'text-indigo-600 bg-indigo-100';
      case 'mentorship':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={isConnected ? 'Connected' : 'Disconnected'} />

        {/* Notifications Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Settings"
                  >
                    <FaCog />
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 transition-colors ${
                      isMuted ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-gray-200 p-4 space-y-3"
                >
                  <h4 className="font-medium text-gray-900">Notification Preferences</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(notificationSettings).map(([key, value]) => {
                      if (key === 'sound' || key === 'desktop') return null;
                      
                      return (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNotificationSettings(key, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.sound}
                        onChange={(e) => updateNotificationSettings('sound', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Sound</span>
                    </label>

                    <button
                      onClick={requestNotificationPermission}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Enable Desktop Notifications
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaBell className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClasses = getNotificationColor(notification.type);
                      
                      return (
                        <motion.div
                          key={`realtime-${notification._id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                              <Icon className="text-sm" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              
                              {/* Special handling for assignment notifications */}
                              {(notification.type === 'assignment_created' || notification.type === 'assignment_published') && notification.data?.dueDate && (
                                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                  <p className="text-xs text-amber-800 font-medium mb-1">📝 Assignment Details:</p>
                                  <p className="text-xs text-amber-700 mb-1">
                                    <strong>Due:</strong> {new Date(notification.data.dueDate).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-amber-700 mb-1">
                                    <strong>Points:</strong> {notification.data.points}
                                  </p>
                                  <p className="text-xs text-amber-700">
                                    <strong>Type:</strong> {notification.data.assignmentType || 'Assignment'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Special handling for course availability notifications */}
                              {notification.type === 'course_available' && notification.data?.courseTitle && (
                                <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <p className="text-xs text-emerald-800 font-medium mb-1">🎓 Course Details:</p>
                                  <p className="text-xs text-emerald-700 mb-1">
                                    <strong>Category:</strong> {notification.data.courseCategory}
                                  </p>
                                  <p className="text-xs text-emerald-700 mb-1">
                                    <strong>Level:</strong> {notification.data.courseLevel}
                                  </p>
                                  <p className="text-xs text-emerald-700 mb-1">
                                    <strong>Price:</strong> ${notification.data.coursePrice}
                                  </p>
                                  <p className="text-xs text-emerald-700">
                                    <strong>Tutor:</strong> {notification.data.tutorName}
                                  </p>
                                </div>
                              )}
                              
                              {/* Special handling for review notifications */}
                              {notification.type === 'course_reviewed' && notification.data?.courseTitle && (
                                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                  <p className="text-xs text-amber-800 font-medium mb-1">⭐ Review Details:</p>
                                  <p className="text-xs text-amber-700 mb-1">
                                    <strong>Course:</strong> {notification.data.courseTitle}
                                  </p>
                                  <p className="text-xs text-amber-700 mb-1">
                                    <strong>Rating:</strong> {notification.data.rating}/5 stars
                                  </p>
                                  <p className="text-xs text-amber-700 mb-1">
                                    <strong>Reviewer:</strong> {notification.data.reviewerName}
                                  </p>
                                  <p className="text-xs text-amber-700">
                                    <strong>Title:</strong> {notification.data.reviewTitle}
                                  </p>
                                </div>
                              )}
                              
                              {/* Special handling for tutor review notifications (Admin) */}
                              {notification.type === 'tutor_reviewed' && notification.data?.tutorName && (
                                <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                                  <p className="text-xs text-indigo-800 font-medium mb-1">📊 Tutor Review Details:</p>
                                  <p className="text-xs text-indigo-700 mb-1">
                                    <strong>Tutor:</strong> {notification.data.tutorName}
                                  </p>
                                  <p className="text-xs text-indigo-700 mb-1">
                                    <strong>Course:</strong> {notification.data.courseTitle}
                                  </p>
                                  <p className="text-xs text-indigo-700 mb-1">
                                    <strong>Rating:</strong> {notification.data.rating}/5 stars
                                  </p>
                                  <p className="text-xs text-indigo-700 mb-1">
                                    <strong>Reviewer:</strong> {notification.data.reviewerName}
                                  </p>
                                  <p className="text-xs text-indigo-700">
                                    <strong>Status:</strong> {notification.data.isNegative ? '⚠️ Negative Review' : '✅ Positive Review'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Special handling for live class notifications */}
                              {(notification.type === 'live_class_scheduled' || notification.type === 'live_class_started') && notification.data?.liveClassId && (
                                <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                                  <p className="text-xs text-indigo-800 font-medium mb-1">Join Live Class:</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/learner/live-classes/${notification.data.liveClassId}/room`);
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                  >
                                    Click here to join the live class
                                  </button>
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Mark as read"
                                >
                                  <FaCheck className="text-xs" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Delete"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const notificationPath = user?.role === 'tutor' ? '/tutor/notifications' : 
                                              user?.role === 'admin' ? '/admin/notifications' : 
                                              '/learner/notifications';
                      navigate(notificationPath);
                      setIsOpen(false);
                    }}
                    className="w-full text-center text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default RealTimeNotifications;
