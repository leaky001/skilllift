import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaVideo, FaTimes, FaPlay, FaBell } from 'react-icons/fa';
import { liveClassService } from '../../services/liveClassService';

const LiveClassNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for live class notifications
    const handleLiveClassNotification = (event) => {
      const notification = event.detail;
      console.log('Received live class notification:', notification);
      
      if (notification.type === 'live_class_started') {
        showLiveClassAlert(notification);
      }
    };

    // Listen for WebSocket live class events
    const handleWebSocketNotification = (event) => {
      console.log('WebSocket live class event:', event);
      if (event.type === 'live-class-started') {
        showLiveClassAlert(event.detail);
      }
    };

    // Add event listeners
    window.addEventListener('live-class-notification', handleLiveClassNotification);
    window.addEventListener('live-class-started', handleWebSocketNotification);

    // Cleanup
    return () => {
      window.removeEventListener('live-class-notification', handleLiveClassNotification);
      window.removeEventListener('live-class-started', handleWebSocketNotification);
    };
  }, [user]);

  const showLiveClassAlert = (notificationData) => {
    const {
      classId,
      callId,
      title,
      tutorName,
      courseId,
      courseTitle
    } = notificationData;

    // Show toast notification
    toast.info(
      <div className="p-2">
        <div className="flex items-center space-x-2 mb-2">
          <FaVideo className="text-blue-500" />
          <span className="font-semibold">Live Class Started!</span>
        </div>
        <p className="text-sm">{title}</p>
        <p className="text-xs text-gray-600">by {tutorName}</p>
      </div>,
      {
        position: 'top-right',
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        onClick: () => handleJoinLiveClass(classId, callId, courseId)
      }
    );

    // Show persistent notification
    setNotifications(prev => [
      ...prev,
      {
        id: classId,
        title,
        tutorName,
        courseTitle,
        courseId,
        callId,
        timestamp: new Date()
      }
    ]);
    setIsVisible(true);
  };

  const handleJoinLiveClass = async (classId, callId, courseId) => {
    try {
      // Navigate to the live class room
      navigate(`/learner/courses/${courseId}/live-class`);
      
      // Close notification
      handleCloseNotification(classId);
      
      toast.success('Redirecting to live class...');
    } catch (error) {
      console.error('Error joining live class:', error);
      toast.error('Failed to join live class');
    }
  };

  const handleCloseNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notifications.length <= 1) {
      setIsVisible(false);
    }
  };

  const handleDismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 animate-slide-in-right"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaVideo className="text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Live Class Started!</h3>
                <button
                  onClick={() => handleCloseNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
              
              <p className="text-sm text-gray-800 font-medium mb-1">
                {notification.title}
              </p>
              
              <p className="text-xs text-gray-600 mb-2">
                by {notification.tutorName} • {notification.courseTitle}
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleJoinLiveClass(notification.id, notification.callId, notification.courseId)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                >
                  <FaPlay className="w-2 h-2" />
                  <span>Join Now</span>
                </button>
                
                <button
                  onClick={() => handleCloseNotification(notification.id)}
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {notifications.length > 1 && (
        <div className="text-center">
          <button
            onClick={handleDismissAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Dismiss All
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveClassNotification;
