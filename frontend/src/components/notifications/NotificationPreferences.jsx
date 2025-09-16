import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FaBell, 
  FaEnvelope, 
  FaSms, 
  FaDesktop, 
  FaSave, 
  FaCheckCircle,
  FaTimes,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa';

const NotificationPreferences = () => {
  const { notificationPreferences, updateNotificationPreferences, requestNotificationPermission } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [preferences, setPreferences] = useState(notificationPreferences);

  const notificationTypes = [
    {
      id: 'liveClassReminders',
      title: 'Live Class Reminders',
      description: 'Get notified before your live classes start',
      icon: '🎥',
      channels: ['push', 'email', 'sms', 'inApp']
    },
    {
      id: 'assignmentReminders',
      title: 'Assignment Reminders',
      description: 'Get notified when assignments are due',
      icon: '📝',
      channels: ['push', 'email', 'sms', 'inApp']
    },
    {
      id: 'courseUpdates',
      title: 'Course Updates',
      description: 'Get notified when new content is added to your courses',
      icon: '📚',
      channels: ['push', 'email', 'inApp']
    },
    {
      id: 'paymentReminders',
      title: 'Payment Reminders',
      description: 'Get notified about payment due dates',
      icon: '💳',
      channels: ['email', 'sms', 'inApp']
    },
    {
      id: 'systemUpdates',
      title: 'System Updates',
      description: 'Get notified about platform maintenance and updates',
      icon: '🔧',
      channels: ['email', 'inApp']
    }
  ];

  const channels = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: FaEnvelope,
      color: 'text-blue-600'
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: FaSms,
      color: 'text-green-600'
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: FaBell,
      color: 'text-purple-600'
    },
    {
      id: 'inApp',
      title: 'In-App Notifications',
      description: 'Receive notifications within the app',
      icon: FaDesktop,
      color: 'text-orange-600'
    }
  ];

  const handlePreferenceChange = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateNotificationPreferences(preferences);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPushPermission = async () => {
    await requestNotificationPermission();
  };

  const getChannelStatus = (channelId) => {
    const isEnabled = preferences[channelId];
    const isPush = channelId === 'push';
    
    if (isPush && isEnabled) {
      return Notification.permission === 'granted' ? 'enabled' : 'permission-required';
    }
    
    return isEnabled ? 'enabled' : 'disabled';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'enabled':
        return <FaCheckCircle className="text-green-500" />;
      case 'permission-required':
        return <FaInfoCircle className="text-yellow-500" />;
      case 'disabled':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaTimes className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'enabled':
        return 'Enabled';
      case 'permission-required':
        return 'Permission Required';
      case 'disabled':
        return 'Disabled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Notification Preferences</h1>
        <p className="text-neutral-600">
          Customize how you receive notifications from SkillLift
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
        >
          <FaCheckCircle className="text-green-500 mr-2" />
          <span className="text-green-700">Notification preferences updated successfully!</span>
        </motion.div>
      )}

      {/* Notification Channels */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
          <FaCog className="mr-2" />
          Notification Channels
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((channel) => {
            const status = getChannelStatus(channel.id);
            
            return (
              <div key={channel.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <channel.icon className={`text-xl mr-3 ${channel.color}`} />
                    <div>
                      <h3 className="font-semibold text-neutral-900">{channel.title}</h3>
                      <p className="text-sm text-neutral-600">{channel.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <span className="ml-2 text-sm text-neutral-600">
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[channel.id]}
                      onChange={(e) => handlePreferenceChange(channel.id, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-neutral-700">Enable {channel.title}</span>
                  </label>
                  
                  {channel.id === 'push' && preferences.push && status === 'permission-required' && (
                    <button
                      onClick={handleRequestPushPermission}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Grant Permission
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Notification Types</h2>
        
        <div className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{type.title}</h3>
                    <p className="text-sm text-neutral-600">{type.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Available channels: {type.channels.join(', ')}
                    </p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[type.id]}
                    onChange={(e) => handlePreferenceChange(type.id, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-neutral-700">Enable</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isLoading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              Save Preferences
            </>
          )}
        </motion.button>
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FaInfoCircle className="mr-2" />
          About Notifications
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Push notifications require browser permission</li>
          <li>• SMS notifications may incur charges from your carrier</li>
          <li>• Email notifications are sent to your registered email address</li>
          <li>• In-app notifications appear within the SkillLift platform</li>
          <li>• You can change these preferences at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationPreferences;
