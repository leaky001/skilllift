import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaFilter, 
  FaSearch, 
  FaCog,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaExternalLinkAlt,
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
  FaComments,
  FaChartBar,
  FaCalendarAlt,
  FaEnvelope,
  FaMobile,
  FaDesktop
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
  getNotificationIcon, 
  getNotificationColor, 
  formatTimeAgo, 
  getTypeLabel, 
  isActionable, 
  getActionText,
  getPriorityLabel,
  getNotificationStats
} from '../services/notificationService';
import { showSuccess, showError } from '../services/toastService.jsx';

const NotificationManagement = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead,
    clearAllNotifications,
    fetchNotificationStats,
    stats
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [period, setPeriod] = useState('week');

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.isRead) ||
      (activeTab === 'read' && notification.isRead) ||
      notification.type === activeTab;
    
    const matchesFilter = filter === 'all' || 
      notification.type === filter ||
      notification.priority === filter;
    
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(notification.type).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesFilter && matchesSearch;
  });

  // Handle notification actions
  const handleNotificationAction = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      // Handle specific actions based on notification type
      switch (notification.type) {
        case 'course_approval':
        case 'course_rejection':
          window.location.href = `/tutor/courses/${notification.data.courseId}`;
          break;
        
        case 'enrollment':
          window.location.href = `/tutor/courses/${notification.data.courseId}/students`;
          break;
        
        case 'payment_received':
          window.location.href = `/tutor/payments/${notification.data.paymentId}`;
          break;
        
        case 'assignment_submitted':
          window.location.href = `/tutor/assignments/${notification.data.assignmentId}/submissions`;
          break;
        
        case 'assignment_graded':
          window.location.href = `/learner/assignments/${notification.data.assignmentId}`;
          break;
        
        case 'live_session_reminder':
        case 'live_session_started':
        case 'live_class_started':
          if (notification.data.liveClassId) {
            window.location.href = `/learner/live-classes/${notification.data.liveClassId}/room`;
          }
          break;
        
        case 'certificate_ready':
          window.location.href = `/learner/certificates/${notification.data.certificateId}/download`;
          break;
        
        case 'user_approval':
        case 'user_rejection':
          window.location.href = `/admin/users/${notification.data.userId}`;
          break;
        
        case 'kyc_submission':
        case 'kyc_approval':
        case 'kyc_rejection':
          window.location.href = `/admin/kyc/${notification.data.kycId}`;
          break;
        
        case 'support_ticket':
        case 'support_response':
          window.location.href = `/support/tickets/${notification.data.ticketId}`;
          break;
        
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
      showError('Failed to process notification action');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      showError('Please select notifications first');
      return;
    }

    try {
      switch (action) {
        case 'mark-read':
          await Promise.all(selectedNotifications.map(id => markAsRead(id)));
          showSuccess(`${selectedNotifications.length} notifications marked as read`);
          break;
        
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
            await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
            showSuccess(`${selectedNotifications.length} notifications deleted`);
          }
          break;
        
        default:
          break;
      }
      setSelectedNotifications([]);
    } catch (error) {
      showError('Failed to perform bulk action');
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

  // Handle clear all
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

  // Get tab options based on user role
  const getTabOptions = () => {
    const baseTabs = [
      { value: 'all', label: 'All', count: notifications.length },
      { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
      { value: 'read', label: 'Read', count: notifications.filter(n => n.isRead).length }
    ];

    const roleSpecificTabs = {
      admin: [
        { value: 'course_submission', label: 'Course Submissions', count: notifications.filter(n => n.type === 'course_submission').length },
        { value: 'enrollment', label: 'Enrollments', count: notifications.filter(n => n.type === 'enrollment').length },
        { value: 'payment_received', label: 'Payments', count: notifications.filter(n => n.type === 'payment_received').length },
        { value: 'user_approval', label: 'User Approvals', count: notifications.filter(n => n.type === 'user_approval').length },
        { value: 'kyc_submission', label: 'KYC', count: notifications.filter(n => n.type.includes('kyc')).length },
        { value: 'support_ticket', label: 'Support', count: notifications.filter(n => n.type.includes('support')).length }
      ],
      tutor: [
        { value: 'course_approval', label: 'Course Approvals', count: notifications.filter(n => n.type === 'course_approval').length },
        { value: 'enrollment', label: 'Student Enrollments', count: notifications.filter(n => n.type === 'enrollment').length },
        { value: 'payment_received', label: 'Payments', count: notifications.filter(n => n.type === 'payment_received').length },
        { value: 'assignment_submitted', label: 'Assignments', count: notifications.filter(n => n.type === 'assignment_submitted').length },
        { value: 'course_completed', label: 'Course Completions', count: notifications.filter(n => n.type === 'course_completed').length },
        { value: 'live_session_reminder', label: 'Live Sessions', count: notifications.filter(n => n.type.includes('live_session')).length }
      ],
      learner: [
        { value: 'enrollment_confirmation', label: 'Enrollment Confirmations', count: notifications.filter(n => n.type === 'enrollment_confirmation').length },
        { value: 'assignment_graded', label: 'Assignment Grades', count: notifications.filter(n => n.type === 'assignment_graded').length },
        { value: 'course_completed', label: 'Course Completions', count: notifications.filter(n => n.type === 'course_completed').length },
        { value: 'live_session_reminder', label: 'Live Sessions', count: notifications.filter(n => n.type.includes('live_session')).length },
        { value: 'payment_confirmation', label: 'Payment Confirmations', count: notifications.filter(n => n.type === 'payment_confirmation').length },
        { value: 'certificate_ready', label: 'Certificates', count: notifications.filter(n => n.type === 'certificate_ready').length }
      ]
    };

    return [...baseTabs, ...(roleSpecificTabs[user?.role] || [])];
  };

  // Get filter options
  const getFilterOptions = () => [
    { value: 'all', label: 'All Types' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'urgent', label: 'Urgent Priority' }
  ];

  // Handle notification selection
  const handleNotificationSelect = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  // Load stats when period changes
  useEffect(() => {
    if (showStats) {
      fetchNotificationStats(period);
    }
  }, [period, showStats]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
              <p className="mt-2 text-gray-600">
                Manage and track all your notifications across the platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaCog className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notification Statistics</h3>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaBell className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-blue-600">Total Notifications</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalNotifications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaEye className="w-6 h-6 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm text-yellow-600">Unread</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.unreadNotifications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaCheck className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-green-600">Read</p>
                        <p className="text-2xl font-bold text-green-900">{stats.totalNotifications - stats.unreadNotifications}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FaChartBar className="w-6 h-6 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-purple-600">Types</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.stats?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading statistics...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getFilterOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center space-x-2 mr-4">
                    <button
                      onClick={() => handleBulkAction('mark-read')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Mark Read ({selectedNotifications.length})
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete ({selectedNotifications.length})
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark All Read
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {getTabOptions().map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.value
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.value
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <FaBell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'all' || activeTab !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={`management-notification-${notification._id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => handleNotificationSelect(notification._id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      getNotificationColor(notification.type) === 'green' ? 'bg-green-100 text-green-600' :
                      getNotificationColor(notification.type) === 'red' ? 'bg-red-100 text-red-600' :
                      getNotificationColor(notification.type) === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-lg font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              notification.priority === 'low' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getPriorityLabel(notification.priority)}
                            </span>
                          </div>
                          
                          <p className="mt-1 text-gray-600">
                            {notification.message}
                          </p>
                          
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{getTypeLabel(notification.type)}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            {notification.sender && (
                              <>
                                <span>•</span>
                                <span>From: {notification.sender.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {isActionable(notification.type) && (
                            <button
                              onClick={() => handleNotificationAction(notification)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {getActionText(notification.type)}
                            </button>
                          )}
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Select All ({selectedNotifications.length} of {filteredNotifications.length})
                    </span>
                  </label>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
