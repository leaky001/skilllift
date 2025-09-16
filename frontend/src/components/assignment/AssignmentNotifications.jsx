import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { 
  FaBell, 
  FaEnvelope, 
  FaSms, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaExclamationTriangle
} from 'react-icons/fa';

const AssignmentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);





  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get('/notifications/assignment');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignment notifications:', error);
    }
  };

  const notificationTypes = [
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'sms', label: 'SMS', icon: FaSms },
    { id: 'both', label: 'Both', icon: FaBell }
  ];

  const triggerTypes = [
    { id: 'due_date', label: 'Due Date Reminder' },
    { id: 'reminder', label: 'General Reminder' },
    { id: 'overdue', label: 'Overdue Alert' }
  ];



  const toggleNotification = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id 
        ? { ...notification, isActive: !notification.isActive }
        : notification
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'email': return FaEnvelope;
      case 'sms': return FaSms;
      case 'both': return FaBell;
      default: return FaBell;
    }
  };

  const getTriggerColor = (trigger) => {
    switch (trigger) {
      case 'due_date': return 'text-blue-600 bg-blue-100';
      case 'reminder': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Notifications</h2>
          <p className="text-gray-600">Manage email and SMS reminders for assignment due dates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <FaPlus size={16} />
          <span>Create Notification</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBell className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaEnvelope className="text-yellow-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.reduce((sum, n) => sum + n.sentCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaSms className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">SMS Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === 'sms' || n.type === 'both').reduce((sum, n) => sum + n.sentCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification Rules</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div key={`assignment-notification-${notification.id}`} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{notification.assignmentTitle}</h4>
                      <p className="text-sm text-gray-500">{notification.course}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerColor(notification.trigger)}`}>
                          {triggerTypes.find(t => t.id === notification.trigger)?.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.isActive)}`}>
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Sent: {notification.sentCount} times</p>
                      <p className="text-xs text-gray-400">
                        Last: {new Date(notification.lastSent).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleNotification(notification.id)}
                        className={`p-2 rounded-lg ${
                          notification.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {notification.isActive ? <FaCheckCircle size={16} /> : <FaTimes size={16} />}
                      </button>
                      <button
                        onClick={() => setEditingNotification(notification)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pl-12">
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Notification</h3>
            <p className="text-gray-600 mb-4">This feature allows you to set up automatic reminders for assignment due dates.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentNotifications;
