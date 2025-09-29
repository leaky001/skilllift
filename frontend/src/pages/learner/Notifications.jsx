import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaEnvelope, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaInfoCircle, 
  FaTimes, 
  FaFilter, 
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaBookOpen,
  FaVideo,
  FaPlay,
  FaClipboard,
  FaGraduationCap,
  FaTrophy,
  FaCalendarAlt,
  FaStar,
  FaClock,
  FaCheck
} from 'react-icons/fa';
import { getMyNotifications, markNotificationAsRead } from '../../services/learnerService';
import { showSuccess, showError } from '../../services/toastService';

const LearnerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRead, setShowRead] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load notifications from API
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getMyNotifications({ limit: 100, unreadOnly: false });
      if (response.success) {
        setNotifications(Array.isArray(response.data.notifications) ? response.data.notifications : []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      showSuccess('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showError('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      payment_confirmation: FaCheckCircle,
      live_class_scheduled: FaVideo,
      live_class_started: FaPlay,
      assignment_created: FaClipboard,
      assignment_published: FaClipboard,
      course_available: FaGraduationCap,
      course_reviewed: FaStar,
      review_approved: FaCheckCircle,
      enrollment_confirmed: FaBookOpen,
      assignment_due: FaClipboard,
      course_update: FaInfoCircle
    };
    return iconMap[type] || FaBell;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-blue-600 bg-blue-50'
    };
    return colorMap[priority] || 'text-gray-600 bg-gray-50';
  };

  const formatTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const filteredNotifications = (notifications || []).filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReadStatus = showRead || !notification.isRead;
    
    return matchesFilter && matchesSearch && matchesReadStatus;
  });

  const unreadCount = (notifications || []).filter(notif => !notif.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBell className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  notifications.forEach(notif => {
                    if (!notif.isRead) {
                      handleMarkAsRead(notif._id);
                    }
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="payment_confirmation">Payments</option>
                <option value="live_class_scheduled">Live Classes Scheduled</option>
                <option value="live_class_started">Live Classes Started</option>
                <option value="assignment_created">Assignments Created</option>
                <option value="assignment_published">Assignments Published</option>
                <option value="course_available">New Courses Available</option>
                <option value="course_reviewed">Course Reviews</option>
                <option value="review_approved">Review Approvals</option>
                <option value="enrollment_confirmed">Enrollments</option>
                <option value="assignment_due">Assignment Due</option>
                <option value="course_update">Course Updates</option>
              </select>

              <button
                onClick={() => setShowRead(!showRead)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showRead 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-blue-600 text-white'
                }`}
              >
                {showRead ? <FaEyeSlash /> : <FaEye />}
                <span className="ml-2">{showRead ? 'Hide Read' : 'Show Read'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaBell className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You\'re all caught up! New notifications will appear here.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              
              return (
                <div
                  key={`learner-notification-${notification._id}`}
                  className={`bg-white rounded-xl shadow-md border-l-4 ${
                    notification.priority === 'high' ? 'border-l-red-500' :
                    notification.priority === 'medium' ? 'border-l-amber-500' :
                    notification.priority === 'low' ? 'border-l-blue-500' :
                    'border-l-slate-300'
                  } ${!notification.isRead ? '' : 'opacity-75'} hover:shadow-lg transition-shadow`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.priority === 'high' ? 'bg-red-100' :
                        notification.priority === 'medium' ? 'bg-amber-100' :
                        notification.priority === 'low' ? 'bg-blue-100' :
                        'bg-slate-100'
                      } flex-shrink-0`}>
                        <IconComponent className={`text-lg ${
                          notification.priority === 'high' ? 'text-red-600' :
                          notification.priority === 'medium' ? 'text-amber-600' :
                          notification.priority === 'low' ? 'text-blue-600' :
                          'text-slate-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-slate-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h4>
                            <p className="text-slate-600 text-sm mt-1">
                              {notification.message}
                            </p>
                          
                          {/* Special handling for assignment notifications */}
                          {(notification.type === 'assignment_created' || notification.type === 'assignment_published') && notification.data?.dueDate && (
                            <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <p className="text-sm text-orange-800 font-medium mb-2">📝 Assignment Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm text-orange-700">
                                <div>
                                  <strong>Due Date:</strong><br />
                                  {new Date(notification.data.dueDate).toLocaleString()}
                                </div>
                                <div>
                                  <strong>Points:</strong><br />
                                  {notification.data.points}
                                </div>
                                <div>
                                  <strong>Type:</strong><br />
                                  {notification.data.assignmentType || 'Assignment'}
                                </div>
                                <div>
                                  <strong>Course:</strong><br />
                                  {notification.data.courseTitle}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Special handling for course availability notifications */}
                          {notification.type === 'course_available' && notification.data?.courseTitle && (
                            <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-green-800 font-medium mb-2">🎓 Course Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                                <div>
                                  <strong>Category:</strong><br />
                                  {notification.data.courseCategory}
                                </div>
                                <div>
                                  <strong>Level:</strong><br />
                                  {notification.data.courseLevel}
                                </div>
                                <div>
                                  <strong>Price:</strong><br />
                                  ${notification.data.coursePrice}
                                </div>
                                <div>
                                  <strong>Tutor:</strong><br />
                                  {notification.data.tutorName}
                                </div>
                                <div className="col-span-2">
                                  <strong>Description:</strong><br />
                                  {notification.data.courseDescription}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Special handling for live class notifications */}
                          {notification.type === 'live_class_started' && notification.data?.joinUrl && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800 font-medium mb-2">🎥 Live Class Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                                <div>
                                  <strong>Class:</strong><br />
                                  {notification.data.liveClassTitle || 'Live Class'}
                                </div>
                                <div>
                                  <strong>Course:</strong><br />
                                  {notification.data.courseTitle || 'Course'}
                                </div>
                                <div>
                                  <strong>Session ID:</strong><br />
                                  {notification.data.sessionId ? notification.data.sessionId.substring(0, 8) + '...' : 'N/A'}
                                </div>
                                <div>
                                  <strong>Status:</strong><br />
                                  <span className="text-red-600 font-semibold">LIVE NOW</span>
                                </div>
                              </div>
                              <div className="mt-3">
                                <button
                                  onClick={() => {
                                    // Mark as read first
                                    handleMarkAsRead(notification._id);
                                    // Navigate to live class
                                    window.location.href = notification.data.joinUrl;
                                  }}
                                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                  <FaVideo className="mr-2" />
                                  Join Live Class Now
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Special handling for review notifications */}
                          {notification.type === 'course_reviewed' && notification.data?.courseTitle && (
                            <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm text-yellow-800 font-medium mb-2">⭐ Review Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm text-yellow-700">
                                <div>
                                  <strong>Course:</strong><br />
                                  {notification.data.courseTitle}
                                </div>
                                <div>
                                  <strong>Rating:</strong><br />
                                  {notification.data.rating}/5 stars
                                </div>
                                <div>
                                  <strong>Reviewer:</strong><br />
                                  {notification.data.reviewerName}
                                </div>
                                <div>
                                  <strong>Review Title:</strong><br />
                                  {notification.data.reviewTitle}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Special handling for live class notifications */}
                          {(notification.type === 'live_class_scheduled' || notification.type === 'live_class_started') && notification.data?.liveClassId && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800 font-medium mb-2">🎥 Join Live Class:</p>
                              <button
                                onClick={() => window.location.href = `/tutor/live-classes/${notification.data.liveClassId}/room`}
                                className="text-sm text-blue-600 hover:text-blue-800 underline block mb-2"
                              >
                                Click here to join the live class
                              </button>
                              {notification.data.scheduledDate && (
                                <p className="text-sm text-blue-700 mt-1">
                                  <strong>Scheduled:</strong> {new Date(notification.data.scheduledDate).toLocaleString()}
                                </p>
                              )}
                              {notification.data.duration && (
                                <p className="text-sm text-blue-700">
                                  <strong>Duration:</strong> {notification.data.duration} minutes
                                </p>
                              )}
                            </div>
                          )}
                          
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center space-x-1">
                                <FaClock />
                                <span>{formatTime(notification.createdAt)}</span>
                              </span>
                              
                              {notification.courseTitle && (
                                <span className="flex items-center space-x-1">
                                  <FaBookOpen />
                                  <span>{notification.courseTitle}</span>
                                </span>
                              )}
                              
                              {notification.priority === 'high' && (
                                <span className="flex items-center space-x-1 text-red-600 font-medium">
                                  <FaExclamationTriangle />
                                  <span>High Priority</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-3">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                                title="Mark as read"
                              >
                                <FaCheck className="text-sm" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerNotifications;