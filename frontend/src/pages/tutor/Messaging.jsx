import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  getAdminMessages, 
  getSentMessages, 
  sendMessageToLearner, 
  replyToAdmin,
  markAsRead,
  deleteMessage,
  getTutorLearners
} from '../../services/messageService';
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
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowLeft,
  FaPaperPlane,
  FaInbox,
  FaEnvelopeOpen
} from 'react-icons/fa';

const TutorMessaging = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('admin-messages');
  const [adminMessages, setAdminMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeData, setComposeData] = useState({
    receiverId: '',
    subject: '',
    content: '',
    messageType: 'general',
    priority: 'medium'
  });
  const [replyData, setReplyData] = useState({
    content: '',
    messageType: 'tutor_reply'
  });

  // Load messages and learners
  useEffect(() => {
    loadMessages();
    loadLearners();
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      if (activeTab === 'admin-messages') {
        const response = await getAdminMessages({ page: 1, limit: 50 });
        if (response.success) {
          setAdminMessages(response.data);
        }
      } else if (activeTab === 'sent-messages') {
        const response = await getSentMessages({ page: 1, limit: 50 });
        if (response.success) {
          setSentMessages(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLearners = async () => {
    try {
      const response = await getTutorLearners();
      if (response.success) {
        setLearners(response.data);
      }
    } catch (error) {
      console.error('Error loading learners:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-amber-500 bg-amber-50';
      case 'medium':
        return 'border-l-emerald-500 bg-emerald-50';
      case 'low':
        return 'border-l-slate-500 bg-slate-50';
      default:
        return 'border-l-slate-300 bg-slate-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'high':
        return <FaExclamationTriangle className="text-amber-500" />;
      case 'medium':
        return <FaInfoCircle className="text-emerald-500" />;
      case 'low':
        return <FaInfoCircle className="text-slate-500" />;
      default:
        return <FaInfoCircle className="text-slate-400" />;
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId);
      loadMessages(); // Reload to update read status
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      loadMessages(); // Reload to remove deleted message
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReplyToAdmin = async () => {
    try {
      await replyToAdmin({
        originalMessageId: selectedMessage._id,
        ...replyData
      });
      setShowReplyModal(false);
      setReplyData({ content: '', messageType: 'tutor_reply' });
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleSendToLearner = async () => {
    try {
      await sendMessageToLearner(composeData.receiverId, composeData);
      setShowComposeModal(false);
      setComposeData({
        receiverId: '',
        subject: '',
        content: '',
        messageType: 'general',
        priority: 'medium'
      });
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredAdminMessages = adminMessages.filter(message => {
    const matchesSearch = message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'unread' && !message.isRead) ||
                         (filterStatus === 'read' && message.isRead);
    return matchesSearch && matchesStatus;
  });

  const filteredSentMessages = sentMessages.filter(message => {
    const matchesSearch = message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.receiver?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'unread' && !message.isRead) ||
                         (filterStatus === 'read' && message.isRead);
    return matchesSearch && matchesStatus;
  });

  const sortedAdminMessages = [...filteredAdminMessages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'sender':
        return a.sender?.name?.localeCompare(b.sender?.name);
      default:
        return 0;
    }
  });

  const sortedSentMessages = [...filteredSentMessages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'receiver':
        return a.receiver?.name?.localeCompare(b.receiver?.name);
      default:
        return 0;
    }
  });

  const tabs = [
    { 
      id: 'admin-messages', 
      label: 'Messages from Admin', 
      count: adminMessages.length,
      icon: <FaUserTie className="w-4 h-4" />
    },
    { 
      id: 'sent-messages', 
      label: 'Messages to Learners', 
      count: sentMessages.length,
      icon: <FaGraduationCap className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messaging Center</h1>
          <p className="text-slate-600">Communicate with admin and send messages to learners</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaFilter className="text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <FaSort className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="sender">Sort by Sender</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowComposeModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Send Message to Learner</span>
            </button>
          </div>
          <div className="text-sm text-slate-500">
            {activeTab === 'admin-messages' 
              ? `${sortedAdminMessages.length} messages from admin`
              : `${sortedSentMessages.length} messages sent to learners`
            }
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading messages...</p>
            </div>
          ) : activeTab === 'admin-messages' ? (
            sortedAdminMessages.length > 0 ? (
              sortedAdminMessages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(message.priority)} border border-slate-200 overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaUserTie className="text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {message.sender?.name || 'Admin'}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(message.priority)}
                            <span className="text-sm font-medium text-slate-600 capitalize">
                              {message.priority}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">
                          {message.subject}
                        </h4>
                        <p className="text-slate-700 mb-4 line-clamp-3">
                          {message.content}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            message.isRead 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {message.isRead ? (
                              <>
                                <FaCheckCircle className="w-3 h-3 mr-1" />
                                Read
                              </>
                            ) : (
                              <>
                                <FaClock className="w-3 h-3 mr-1" />
                                Unread
                              </>
                            )}
                          </span>
                          {message.messageType && (
                            <span className="text-xs text-slate-500 capitalize">
                              {message.messageType.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!message.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(message._id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Mark as read"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowReplyModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Reply"
                        >
                          <FaReply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaInbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages from admin</h3>
                <p className="text-slate-600">You haven't received any messages from admin yet.</p>
              </div>
            )
          ) : (
            sortedSentMessages.length > 0 ? (
              sortedSentMessages.map((message) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(message.priority)} border border-slate-200 overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <FaGraduationCap className="text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              To: {message.receiver?.name || 'Learner'}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(message.priority)}
                            <span className="text-sm font-medium text-slate-600 capitalize">
                              {message.priority}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">
                          {message.subject}
                        </h4>
                        <p className="text-slate-700 mb-4 line-clamp-3">
                          {message.content}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            message.isRead 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {message.isRead ? (
                              <>
                                <FaCheckCircle className="w-3 h-3 mr-1" />
                                Read by recipient
                              </>
                            ) : (
                              <>
                                <FaClock className="w-3 h-3 mr-1" />
                                Unread by recipient
                              </>
                            )}
                          </span>
                          {message.messageType && (
                            <span className="text-xs text-slate-500 capitalize">
                              {message.messageType.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaEnvelopeOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages sent</h3>
                <p className="text-slate-600">You haven't sent any messages to learners yet.</p>
                <button
                  onClick={() => setShowComposeModal(true)}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Send your first message
                </button>
              </div>
            )
          )}
        </div>

        {/* Compose Modal */}
        {showComposeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Send Message to Learner</h3>
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FaArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Learner
                  </label>
                  <select
                    value={composeData.receiverId}
                    onChange={(e) => setComposeData({ ...composeData, receiverId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Choose a learner...</option>
                    {learners.map((learner) => (
                      <option key={learner._id} value={learner._id}>
                        {learner.name} ({learner.email})
                      </option>
                    ))}
                  </select>
                  {learners.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      No learners found. You need to have learners enrolled in your courses to send messages.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={composeData.messageType}
                    onChange={(e) => setComposeData({ ...composeData, messageType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="feedback">Feedback</option>
                    <option value="reminder">Reminder</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={composeData.priority}
                    onChange={(e) => setComposeData({ ...composeData, priority: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    rows={6}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your message content"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToLearner}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Reply to Admin</h3>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FaArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">{selectedMessage.subject}</h4>
                  <p className="text-slate-700 text-sm">{selectedMessage.content}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Reply
                    </label>
                    <textarea
                      value={replyData.content}
                      onChange={(e) => setReplyData({ ...replyData, content: e.target.value })}
                      rows={6}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your reply"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplyToAdmin}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <FaReply className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorMessaging;
