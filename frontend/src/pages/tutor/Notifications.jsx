import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBell, 
  FaEnvelope, 
  FaPhone, 
  FaThumbtack, 
  FaTrash, 
  FaCheck, 
  FaTimes,
  FaEye,
  FaFilter,
  FaSearch,
  FaCog,
  FaUser,
  FaDollarSign,
  FaBookOpen,
  FaVideo,
  FaStar,
  FaExclamation,
  FaInfo,
  FaClock,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaGraduationCap,
  FaCreditCard,
  FaCertificate,
  FaTicketAlt,
  FaComments,
  FaShieldAlt,
  FaBullhorn
} from 'react-icons/fa';
import { 
  getTutorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../services/tutorService';
import { showSuccess, showError } from '../../services/toastService.jsx';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications data
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getTutorNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      showError('Error loading notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        showSuccess('Notification marked as read');
        loadNotifications(); // Reload data
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showError('Error marking notification as read. Please try again.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success) {
        showSuccess('All notifications marked as read');
        loadNotifications(); // Reload data
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('Error marking all notifications as read. Please try again.');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // You can implement delete notification API call here
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== notificationId));
      showSuccess('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification');
    }
  };

  // Default data for loading state
  const defaultNotifications = [
    {
      id: 1,
      type: 'course_sale',
      title: 'New Course Enrollment',
      message: 'Emma Wilson enrolled in your "Advanced Makeup Artistry" course',
      timestamp: '2 minutes ago',
      isRead: false,
      isPinned: false,
      priority: 'high',
      icon: FaBookOpen,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100'
    }
  ];

  // Use real data or default for loading
  const displayNotifications = loading ? defaultNotifications : notifications;

  const notificationTypes = [
    { key: 'all', label: 'All Notifications', count: notifications.length },
    { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { key: 'pinned', label: 'Pinned', count: notifications.filter(n => n.isPinned).length },
    { key: 'urgent', label: 'Urgent', count: notifications.filter(n => n.priority === 'urgent').length }
  ];

  const getFilteredNotifications = () => {
    let filtered = displayNotifications;
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(n => n.isPinned);
    } else if (activeTab === 'urgent') {
      filtered = filtered.filter(n => n.priority === 'urgent');
    }
    
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-amber-500';
      case 'medium': return 'border-l-indigo-500';
      case 'low': return 'border-l-slate-500';
      default: return 'border-l-slate-300';
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'FaBell': FaBell,
      'FaCheckCircle': FaCheckCircle,
      'FaTimesCircle': FaTimesCircle,
      'FaInfoCircle': FaInfoCircle,
      'FaExclamationTriangle': FaExclamationTriangle,
      'FaFileAlt': FaFileAlt,
      'FaDollarSign': FaDollarSign,
      'FaBookOpen': FaBookOpen,
      'FaGraduationCap': FaGraduationCap,
      'FaUser': FaUser,
      'FaCreditCard': FaCreditCard,
      'FaCalendarAlt': FaCalendarAlt,
      'FaVideo': FaVideo,
      'FaCertificate': FaCertificate,
      'FaTicketAlt': FaTicketAlt,
      'FaComments': FaComments,
      'FaShieldAlt': FaShieldAlt,
      'FaCog': FaCog,
      'FaBullhorn': FaBullhorn,
      'FaExclamation': FaExclamation,
      'FaInfo': FaInfo,
      'FaClock': FaClock,
      'FaStar': FaStar,
      'FaEye': FaEye,
      'FaSearch': FaSearch,
      'FaFilter': FaFilter,
      'FaEnvelope': FaEnvelope,
      'FaPhone': FaPhone,
      'FaTimes': FaTimes,
      'FaCheck': FaCheck,
      'FaThumbtack': FaThumbtack,
      'FaTrash': FaTrash,
      'FaSpinner': FaSpinner
    };
    
    return iconMap[iconName] || FaBell;
  };

  const NotificationCard = ({ notification }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
        notification.isRead ? 'opacity-75' : ''
      } hover:shadow-lg transition-shadow`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.iconBg || 'bg-indigo-100'} flex-shrink-0`}>
            {(() => {
              const IconComponent = getIconComponent(notification.icon);
              return <IconComponent className={`${notification.iconColor || 'text-indigo-600'} text-lg`} />;
            })()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-semibold text-slate-900 ${notification.isRead ? '' : 'font-bold'}`}>
                  {notification.title || 'Notification'}
                </h4>
                <p className="text-slate-600 text-sm mt-1">{notification.message || 'No message'}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <FaClock />
                    <span>{notification.timestamp || notification.createdAt || 'Just now'}</span>
                  </span>
                  {(notification.priority === 'urgent') && (
                    <span className="flex items-center space-x-1 text-red-600 font-medium">
                      <FaExclamation />
                      <span>Urgent</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-3">
                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification._id || notification.id)}
                    className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                    title="Mark as read"
                  >
                    <FaCheck className="text-sm" />
                  </button>
                )}
                <button 
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                  title={notification.isPinned ? 'Unpin' : 'Pin'}
                >
                  <FaThumbtack className={`text-sm ${notification.isPinned ? 'text-amber-500' : ''}`} />
                </button>
                <button 
                  onClick={() => handleDeleteNotification(notification._id || notification.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete notification"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const NotificationSettings = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Notification Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <FaTimes className="text-slate-600 text-xl" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <FaEnvelope className="text-indigo-500" />
                <span>Email Notifications</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Course Enrollments</p>
                    <p className="text-sm text-slate-600">Get notified when students enroll in your courses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Live Class Reminders</p>
                    <p className="text-sm text-slate-600">Reminders before your scheduled live classes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Payment Notifications</p>
                    <p className="text-sm text-slate-600">Get notified when payments are received</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Course Reviews</p>
                    <p className="text-sm text-slate-600">Notifications for new course reviews and ratings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <FaBell className="text-emerald-500" />
                <span>Push Notifications</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Urgent Notifications</p>
                    <p className="text-sm text-slate-600">Immediate alerts for urgent matters</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Live Class Alerts</p>
                    <p className="text-sm text-slate-600">Real-time notifications during live classes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <FaPhone className="text-amber-500" />
                <span>SMS Notifications</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Critical Alerts</p>
                    <p className="text-sm text-slate-600">SMS for critical system notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Frequency Settings */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Frequency</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Daily Digest</p>
                    <p className="text-sm text-slate-600">Receive a summary of all notifications once daily</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Quiet Hours</p>
                    <p className="text-sm text-slate-600">Silence notifications during specified hours</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowSettings(false)}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:from-indigo-400 hover:to-indigo-500 transition-all duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-600 mt-1">Stay updated with your platform activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <FaCog />
                <span>Settings</span>
              </button>
              <button className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-400 transition-colors flex items-center space-x-2">
                <FaCheck />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-slate-400" />
              <select className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option>All Types</option>
                <option>Course Sales</option>
                <option>Live Classes</option>
                <option>Payments</option>
                <option>Reviews</option>
                <option>Mentorship</option>
                <option>System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          {notificationTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setActiveTab(type.key)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === type.key
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{type.label}</span>
                {type.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === type.key ? 'bg-white text-indigo-500' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {type.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <FaSpinner className="mx-auto h-16 w-16 text-slate-300 animate-spin" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Loading notifications...</h3>
              <p className="text-slate-500">Please wait while we fetch your notifications.</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard key={`tutor-notification-${notification._id || notification.id}`} notification={notification} />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <FaBell className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications found</h3>
              <p className="text-slate-500">
                {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
              </p>
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-white text-slate-700 px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors font-medium">
              Load More Notifications
            </button>
          </div>
        )}
      </div>

      {/* Notification Settings Modal */}
      {showSettings && <NotificationSettings />}
    </div>
  );
};

export default Notifications;
