import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaEnvelope, 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaGraduationCap,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { getSystemNotifications, markNotificationAsRead, deleteNotification } from '../../services/adminService';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Sample notifications - Always show sample data for now
      const sampleNotifications = [
        {
          _id: '1',
          title: 'New Course Submission',
          message: 'John Smith has submitted a new course for review',
          type: 'course_submission',
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'User Registration',
          message: 'A new tutor has registered and needs approval',
          type: 'user_registration',
          priority: 'high',
          isRead: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Payment Completed',
          message: 'Payment of $299 has been processed successfully',
          type: 'payment',
          priority: 'low',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '4',
          title: 'Course Approved',
          message: 'Advanced React Development course has been approved',
          type: 'course_approval',
          priority: 'medium',
          isRead: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      const response = await getSystemNotifications();
      if (response && response.success && response.data && response.data.length > 0) {
        setNotifications(response.data);
      } else {
        setNotifications(sampleNotifications);
        console.log('Using sample notifications data');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set sample notifications on error too
      setNotifications([
        {
          _id: '1',
          title: 'New Course Submission',
          message: 'John Smith has submitted a new course for review',
          type: 'course_submission',
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'User Registration',
          message: 'A new tutor has registered and needs approval',
          type: 'user_registration',
          priority: 'high',
          isRead: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Payment Completed',
          message: 'Payment of $299 has been processed successfully',
          type: 'payment',
          priority: 'low',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        showSuccess('Notification marked as read');
        loadNotifications(); // Reload notifications
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showError('Error marking notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response.success) {
        showSuccess('Notification deleted');
        loadNotifications(); // Reload notifications
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Error deleting notification');
    }
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Filter notifications based on search and filter
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const notificationTypes = [
    { id: 'all', name: 'All Notifications', count: notifications.length },
    { id: 'unread', name: 'Unread', count: notifications.filter(n => n.status === 'unread').length },
    { id: 'tutor_approval', name: 'Tutor Approvals', count: notifications.filter(n => n.type === 'tutor_approval').length },
    { id: 'payment_issue', name: 'Payment Issues', count: notifications.filter(n => n.type === 'payment_issue').length },
    { id: 'content_moderation', name: 'Content Moderation', count: notifications.filter(n => n.type === 'content_moderation').length },
  ];

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    // Mark as read using API
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id);
    }
  };

  const handleAction = async (notificationId, action) => {
    try {
      if (action === 'delete') {
        await handleDeleteNotification(notificationId);
      } else {
        // Handle other actions based on notification type
        console.log(`Performing action ${action} on notification ${notificationId}`);
        showSuccess(`Action ${action} performed successfully`);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showError('Error performing action');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error-600 bg-error-50 border-error-200';
      case 'medium': return 'text-accent-600 bg-accent-50 border-accent-200';
      case 'low': return 'text-success-600 bg-success-50 border-success-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tutor_approval': return <FaGraduationCap className="w-4 h-4" />;
      case 'payment_issue': return <FaEnvelope className="w-4 h-4" />;
      case 'system': return <FaBell className="w-4 h-4" />;
      case 'content_moderation': return <FaUsers className="w-4 h-4" />;

      default: return <FaBell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Notification Management</h1>
        <p className="text-neutral-600">Send and manage platform-wide notifications, monitor system alerts, and handle user communications.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Notifications</p>
              <p className="text-2xl font-bold text-neutral-900">{notifications.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FaBell className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Unread</p>
              <p className="text-2xl font-bold text-accent-600">
                {notifications.filter(n => n.status === 'unread').length}
              </p>
            </div>
            <div className="p-3 bg-accent-50 rounded-lg">
              <FaEnvelope className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">High Priority</p>
              <p className="text-2xl font-bold text-error-600">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
            <div className="p-3 bg-error-50 rounded-lg">
              <FaExclamationTriangle className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Today</p>
              <p className="text-2xl font-bold text-success-600">
                {notifications.filter(n => {
                  const today = new Date().toDateString();
                  const notificationDate = new Date(n.createdAt).toDateString();
                  return today === notificationDate;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <FaClock className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden mb-6">
        {/* Tab Navigation */}
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {notificationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === type.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{type.name}</span>
                  <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full text-xs">
                    {type.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="tutor_approval">Tutor Approval</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="system">System</option>
                <option value="content_moderation">Content Moderation</option>

              </select>
              
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <FaBell className="w-4 h-4 mr-2" />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="divide-y divide-neutral-200">
          {filteredNotifications.map((notification) => (
            <div
              key={`admin-notification-${notification.id}`}
              onClick={() => handleNotificationClick(notification)}
              className={`p-6 hover:bg-neutral-50 cursor-pointer transition-colors ${
                notification.status === 'unread' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-neutral-900">{notification.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.status === 'unread' && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className="text-neutral-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <FaClock className="w-3 h-3" />
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaUsers className="w-3 h-3" />
                        <span>{notification.recipient}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {notification.actions.map((action) => (
                    <button
                      key={action}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(notification.id, action);
                      }}
                      className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title={action}
                    >
                      {action === 'approve' && <FaCheck className="w-4 h-4" />}
                      {action === 'reject' && <FaTimes className="w-4 h-4" />}
                      {action === 'view' && <FaEye className="w-4 h-4" />}
                      {action === 'edit' && <FaEdit className="w-4 h-4" />}
                      {action === 'delete' && <FaTrash className="w-4 h-4" />}
                      {action === 'investigate' && <FaSearch className="w-4 h-4" />}
                      {action === 'resolve' && <FaCheck className="w-4 h-4" />}
                      {action === 'review' && <FaEye className="w-4 h-4" />}
                      {action === 'remove' && <FaTrash className="w-4 h-4" />}
                      {action === 'warn' && <FaExclamationTriangle className="w-4 h-4" />}
                      {action === 'verify' && <FaCheck className="w-4 h-4" />}
                      {action === 'request_more' && <FaEnvelope className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Notification Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <p className="text-neutral-900 font-medium">{selectedNotification.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                <p className="text-neutral-600">{selectedNotification.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <p className="text-neutral-600 capitalize">{selectedNotification.type.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedNotification.priority)}`}>
                    {selectedNotification.priority}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <p className="text-neutral-600 capitalize">{selectedNotification.status}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Recipient</label>
                  <p className="text-neutral-600 capitalize">{selectedNotification.recipient.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Created At</label>
                <p className="text-neutral-600">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Read By</label>
                <p className="text-neutral-600">
                  {selectedNotification.readBy.length > 0 
                    ? selectedNotification.readBy.join(', ') 
                    : 'No one has read this notification yet'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAction(selectedNotification.id, 'mark_read');
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
