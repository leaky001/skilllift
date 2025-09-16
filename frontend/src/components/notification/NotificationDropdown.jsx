import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaFilter,
  FaSearch,
  FaCog,
  FaTimes,
  FaExternalLinkAlt,
  FaDownload,
  FaUser,
  FaGraduationCap,
  FaBook,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaVideo,
  FaShieldAlt,
  FaHandshake,
  FaTrophy,
  FaExclamationTriangle,
  FaTools,
  FaTicketAlt,
  FaComments
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { 
  getNotificationIcon, 
  getNotificationColor, 
  formatTimeAgo, 
  getTypeLabel, 
  isActionable, 
  getActionText 
} from '../../services/notificationService';
import { showSuccess, showError } from '../../services/toastService.jsx';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead,
    clearAllNotifications 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on current filter and search
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead) ||
      notification.type === filter;
    
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(notification.type).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle notification actions
  const handleNotificationAction = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      // Handle specific actions based on notification type
      switch (notification.type) {
        case 'course_approval':
        case 'course_rejection':
          // Navigate to course management
          window.location.href = `/tutor/courses/${notification.data.courseId}`;
          break;
        
        case 'enrollment':
          // Navigate to enrolled students
          window.location.href = `/tutor/courses/${notification.data.courseId}/students`;
          break;
        
        case 'payment_received':
          // Navigate to payment details
          window.location.href = `/tutor/payments/${notification.data.paymentId}`;
          break;
        
        case 'assignment_submitted':
          // Navigate to assignment grading
          window.location.href = `/tutor/assignments/${notification.data.assignmentId}/submissions`;
          break;
        
        case 'assignment_graded':
          // Navigate to assignment feedback
          window.location.href = `/learner/assignments/${notification.data.assignmentId}`;
          break;
        
        case 'live_session_reminder':
        case 'live_session_started':
        case 'live_class_started':
          // Navigate to internal live class room
          if (notification.data.liveClassId) {
            window.location.href = `/learner/live-classes/${notification.data.liveClassId}/room`;
          }
          break;
        
        case 'certificate_ready':
          // Download certificate
          window.location.href = `/learner/certificates/${notification.data.certificateId}/download`;
          break;
        
        case 'user_approval':
        case 'user_rejection':
          // Navigate to user management (admin)
          window.location.href = `/admin/users/${notification.data.userId}`;
          break;
        
        case 'kyc_submission':
        case 'kyc_approval':
        case 'kyc_rejection':
          // Navigate to KYC management (admin)
          window.location.href = `/admin/kyc/${notification.data.kycId}`;
          break;
        
        case 'support_ticket':
        case 'support_response':
          // Navigate to support ticket
          window.location.href = `/support/tickets/${notification.data.ticketId}`;
          break;
        
        default:
          // Default action - just mark as read
          break;
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
      showError('Failed to process notification action');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showSuccess('All notifications marked as read');
    } catch (error) {
      showError('Failed to mark all notifications as read');
    }
  };

  // Handle clear all notifications
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      try {
        await clearAllNotifications();
        showSuccess('All notifications cleared');
      } catch (error) {
        showError('Failed to clear notifications');
      }
    }
  };

  // Get filter options based on user role
  const getFilterOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'All Notifications' },
      { value: 'unread', label: 'Unread' },
      { value: 'read', label: 'Read' }
    ];

    const roleSpecificOptions = {
      admin: [
        { value: 'course_submission', label: 'Course Submissions' },
        { value: 'enrollment', label: 'Enrollments' },
        { value: 'payment_received', label: 'Payments' },
        { value: 'user_approval', label: 'User Approvals' },
        { value: 'kyc_submission', label: 'KYC Submissions' },
        { value: 'support_ticket', label: 'Support Tickets' },
        { value: 'system_alert', label: 'System Alerts' }
      ],
      tutor: [
        { value: 'course_approval', label: 'Course Approvals' },
        { value: 'enrollment', label: 'Student Enrollments' },
        { value: 'payment_received', label: 'Payments' },
        { value: 'assignment_submitted', label: 'Assignment Submissions' },
        { value: 'course_completed', label: 'Course Completions' },
        { value: 'live_session_reminder', label: 'Live Session Reminders' }
      ],
      learner: [
        { value: 'enrollment_confirmation', label: 'Enrollment Confirmations' },
        { value: 'assignment_graded', label: 'Assignment Grades' },
        { value: 'course_completed', label: 'Course Completions' },
        { value: 'live_session_reminder', label: 'Live Session Reminders' },
        { value: 'payment_confirmation', label: 'Payment Confirmations' },
        { value: 'certificate_ready', label: 'Certificates' }
      ]
    };

    return [...baseOptions, ...(roleSpecificOptions[user?.role] || [])];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Settings"
                  >
                    <FaCog className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Close"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400 w-4 h-4" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getFilterOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all as read
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <span className="text-gray-500">
                  {filteredNotifications.length} of {notifications.length}
                </span>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={`dropdown-notification-${notification._id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                          getNotificationColor(notification.type) === 'green' ? 'bg-green-100 text-green-600' :
                          getNotificationColor(notification.type) === 'red' ? 'bg-red-100 text-red-600' :
                          getNotificationColor(notification.type) === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {getTypeLabel(notification.type)}
                            </span>
                            
                            {isActionable(notification.type) && (
                              <span className="text-xs text-blue-600 font-medium">
                                {getActionText(notification.type)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center space-x-1">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
