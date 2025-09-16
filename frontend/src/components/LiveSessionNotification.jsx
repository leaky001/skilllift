import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheckCircle, 
  FaClock, 
  FaCalendarAlt,
  FaVideo,
  FaMapMarkerAlt,
  FaLink,
  FaCopy,
  FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '../../services/toastService.jsx';

const LiveSessionNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose(notification.id);
    }, 300);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard!');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'live_session_confirmation':
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'live_session_reminder':
        return <FaClock className="text-blue-500 text-xl" />;
      case 'live_session_started':
        return <FaVideo className="text-red-500 text-xl" />;
      default:
        return <FaBell className="text-gray-500 text-xl" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'live_session_confirmation':
        return 'bg-green-50 border-green-200';
      case 'live_session_reminder':
        return 'bg-blue-50 border-blue-200';
      case 'live_session_started':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatSessionTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString()
    };
  };

  const getTimeUntilSession = (startTime) => {
    const now = new Date();
    const sessionTime = new Date(startTime);
    const diff = sessionTime - now;
    
    if (diff <= 0) return 'Session has started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    return 'Starting now';
  };

  const sessionData = notification.data;
  const sessionTime = sessionData?.sessionStartTime ? formatSessionTime(sessionData.sessionStartTime) : null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 ${getNotificationColor(notification.type)} z-50`}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getNotificationIcon(notification.type)}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-700 mb-4">
              {notification.message}
            </p>

            {/* Session Details */}
            {sessionData && (
              <div className="space-y-3">
                {/* Session Info */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Session Details
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-gray-400 text-xs" />
                      <span className="text-xs text-gray-600">
                        {sessionTime?.date} at {sessionTime?.time}
                      </span>
                    </div>

                    {sessionData.meetingPlatform && (
                      <div className="flex items-center space-x-2">
                        <FaVideo className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-600">
                          Platform: {sessionData.meetingPlatform}
                        </span>
                      </div>
                    )}

                    {sessionData.location && (
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-600">
                          Location: {sessionData.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Join Live Class Button */}
                {sessionData._id && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaLink className="text-blue-500 text-xs" />
                        <span className="text-xs text-blue-700 font-medium">
                          Join Live Class
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = `/learner/live-classes/${sessionData._id}/room`}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                    >
                      Click here to join the live class
                    </button>
                  </div>
                )}

                {/* Meeting Credentials */}
                {(sessionData.meetingId || sessionData.meetingPassword) && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                      Meeting Credentials
                    </h5>
                    <div className="space-y-1">
                      {sessionData.meetingId && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Meeting ID:</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-900 font-mono">
                              {sessionData.meetingId}
                            </span>
                            <button
                              onClick={() => copyToClipboard(sessionData.meetingId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                      {sessionData.meetingPassword && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Password:</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-900 font-mono">
                              {sessionData.meetingPassword}
                            </span>
                            <button
                              onClick={() => copyToClipboard(sessionData.meetingPassword)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Time Remaining */}
                {sessionData.sessionStartTime && (
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-yellow-500 text-xs" />
                      <span className="text-xs text-yellow-700 font-medium">
                        {getTimeUntilSession(sessionData.sessionStartTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {sessionData.meetingLink && (
                    <a
                      href={sessionData.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                    >
                      Join Session
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveSessionNotification;
