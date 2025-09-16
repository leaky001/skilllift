import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, 
  FaReply, 
  FaTrash, 
  FaEye, 
  FaEyeSlash, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaPlus,
  FaUserTie,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowLeft,
  FaPaperPlane,
  FaInbox,
  FaEnvelopeOpen,
  FaUsers,
  FaCalendarAlt
} from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { 
  replyToAdmin,
  getAdminMessages,
  markAsRead,
  deleteMessage
} from '../../services/messageService';

const TutorAdminMessaging = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyData, setReplyData] = useState({
    content: '',
    priority: 'medium'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await getAdminMessages();
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      showError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyData.content) {
      showError('Please enter your reply');
      return;
    }

    try {
      const response = await replyToAdmin(selectedMessage._id, {
        content: replyData.content,
        priority: replyData.priority
      });

      if (response.success) {
        showSuccess('Reply sent successfully!');
        setShowReplyModal(false);
        setReplyData({ content: '', priority: 'medium' });
        setSelectedMessage(null);
        loadMessages();
      } else {
        showError(response.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showError('Failed to send reply');
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await markAsRead(messageId);
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        showSuccess('Message deleted successfully');
        loadMessages();
      } catch (error) {
        console.error('Error deleting message:', error);
        showError('Failed to delete message');
      }
    }
  };

  const openReplyModal = (message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || message.messageType === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'unread':
        return b.isRead - a.isRead;
      default:
        return 0;
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'feedback': return <FaCheckCircle className="text-emerald-500" />;
      case 'announcement': return <FaInfoCircle className="text-indigo-500" />;
      case 'general': return <FaEnvelope className="text-slate-500" />;
      case 'admin_message': return <FaShieldAlt className="text-indigo-500" />;
      case 'reply': return <FaReply className="text-amber-500" />;
      default: return <FaEnvelope className="text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <FaShieldAlt className="mr-3 text-indigo-600" />
                Admin Communication
              </h1>
              <p className="mt-2 text-slate-600">
                Communicate with administrators and receive important updates
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FaInbox className="inline mr-2" />
                Messages from Admin
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FaEnvelopeOpen className="inline mr-2" />
                Replies Sent to Admin
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="admin_message">Admin Message</option>
            <option value="announcement">Announcement</option>
            <option value="feedback">Feedback</option>
            <option value="reply">Reply</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="unread">Unread First</option>
          </select>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading messages...</p>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FaEnvelope className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sortedMessages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getMessageTypeIcon(message.messageType)}
                        <h3 className={`font-semibold ${message.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                          {message.subject}
                        </h3>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-2 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <FaShieldAlt className="mr-1" />
                          {message.sender?.name || 'Admin'}
                        </span>
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!message.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(message._id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Mark as read"
                        >
                          <FaEye />
                        </button>
                      )}
                      <button
                        onClick={() => openReplyModal(message)}
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Reply to message"
                      >
                        <FaReply />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete message"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Modal */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Reply to Admin</h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Original Message */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedMessage.subject}</h3>
                <p className="text-slate-600 text-sm">{selectedMessage.content}</p>
                <div className="mt-2 text-xs text-slate-500">
                  From: {selectedMessage.sender?.name || 'Admin'} • {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </div>

              <form onSubmit={handleReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={replyData.priority}
                    onChange={(e) => setReplyData({ ...replyData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Reply *
                  </label>
                  <textarea
                    value={replyData.content}
                    onChange={(e) => setReplyData({ ...replyData, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your reply..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorAdminMessaging;
