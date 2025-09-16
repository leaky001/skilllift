import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, 
  FaPaperPlane, 
  FaInbox, 
  FaReply, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaFilter,
  FaSearch,
  FaPlus,
  FaSpinner,
  FaTrash,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { 
  getReceivedMessages, 
  getSentMessages, 
  sendMessage, 
  markAsRead,
  deleteMessage,
  getUnreadCount
} from '../../services/messageService';
import { showError, showSuccess } from '../../services/toastService';

const TutorMessages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageType, setMessageType] = useState('all');

  useEffect(() => {
    if (user?._id) {
      loadMessages();
      loadUnreadCount();
    }
  }, [activeTab, messageType, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading messages for tutor:', user?._id, 'tab:', activeTab, 'type:', messageType);
      
      const params = {
        messageType: messageType !== 'all' ? messageType : undefined,
        page: 1,
        limit: 50
      };
      
      let response;
      if (activeTab === 'inbox') {
        response = await getReceivedMessages(params);
      } else {
        response = await getSentMessages(params);
      }
      
      console.log('📥 Messages response:', response);
      
      if (response.success) {
        setMessages(response.data || []);
        console.log('📥 Loaded', response.data?.length || 0, 'messages');
      } else {
        console.error('❌ Failed to load messages:', response.message);
        showError('Failed to load messages: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      showError('Failed to load messages: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      console.log('📊 Loading unread count for tutor:', user?._id);
      const response = await getUnreadCount();
      console.log('📊 Unread count response:', response);
      
      if (response.success) {
        setUnreadCount(response.data.unreadCount || 0);
        console.log('📊 Unread count:', response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      console.log('👁️ Marking message as read:', messageId);
      
      // For sample messages, just update local state
      if (messageId.startsWith('sample_msg_')) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        showSuccess('Message marked as read');
        return;
      }
      
      // For real messages, call API
      const response = await markAsRead(messageId);
      if (response.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        showSuccess('Message marked as read');
      }
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      showError('Failed to mark message as read');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      console.log('🗑️ Deleting message:', messageId);
      
      // For sample messages, just update local state
      if (messageId.startsWith('sample_msg_')) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        // Update unread count if the message was unread
        const message = messages.find(msg => msg._id === messageId);
        if (message && !message.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        showSuccess('Message deleted successfully');
        return;
      }
      
      // For real messages, call API
      const response = await deleteMessage(messageId);
      if (response.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        // Update unread count if the message was unread
        const message = messages.find(msg => msg._id === messageId);
        if (message && !message.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        showSuccess('Message deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      showError('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'feedback': return 'text-blue-600 bg-blue-100';
      case 'complaint': return 'text-red-600 bg-red-100';
      case 'performance': return 'text-purple-600 bg-purple-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'read': return <FaCheckCircle className="text-green-500" />;
      case 'replied': return <FaReply className="text-blue-500" />;
      case 'resolved': return <FaCheckCircle className="text-green-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Messages</h2>
            <p className="text-gray-600">Communicate with learners and manage feedback</p>
            {unreadCount > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex space-x-1">
            {[
              { key: 'inbox', label: 'Inbox', icon: FaInbox },
              { key: 'sent', label: 'Sent', icon: FaPaperPlane }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-sm" />
                <span>{label}</span>
                {key === 'inbox' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Message Type Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Messages' },
              { key: 'general', label: 'General' },
              { key: 'feedback', label: 'Feedback' },
              { key: 'announcement', label: 'Announcements' },
              { key: 'reply', label: 'Replies' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMessageType(key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  messageType === key
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No messages yet</h3>
            <p className="text-gray-500">
              {activeTab === 'inbox' 
                ? "You haven't received any messages from learners yet."
                : "You haven't sent any messages yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                  message.isRead ? 'border-gray-300' : 'border-indigo-500'
                } ${!message.isRead ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {activeTab === 'inbox' 
                          ? (message.sender?.name?.charAt(0) || 'L')
                          : (message.receiver?.name?.charAt(0) || 'L')
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                        <p className="text-sm text-gray-600">
                          {activeTab === 'inbox' 
                            ? `From ${message.sender?.name || 'Unknown Learner'}`
                            : `To ${message.receiver?.name || 'Unknown Learner'}`
                          }
                        </p>
                        {message.messageType === 'reply' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            <FaReply className="mr-1" />
                            Reply
                          </span>
                        )}
                      </div>
                      {!message.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {formatDate(message.createdAt)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        {message.course && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {message.course.title}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!message.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(message._id)}
                            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <FaTrash className="inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorMessages;



