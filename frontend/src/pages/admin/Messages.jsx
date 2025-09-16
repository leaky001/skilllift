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
  FaStar,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { 
  getTutorMessages, 
  sendMessageToTutor, 
  getAdminMessages,
  getTutorReplies
} from '../../services/messageService';

const AdminMessages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [messagingUsers, setMessagingUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    messageType: '',
    priority: ''
  });

  // Compose message form
  const [composeForm, setComposeForm] = useState({
    receiver: '',
    subject: '',
    message: '',
    messageType: 'feedback',
    priority: 'medium'
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load messages with error handling - Always show sample data for now
      const sampleMessages = [
        {
          _id: '1',
          subject: 'Course Quality Feedback',
          message: 'I would like to discuss the quality of my recent course submission...',
          sender: { name: 'John Smith', email: 'john@example.com' },
          receiver: { name: 'Admin', email: 'admin@example.com' },
          priority: 'medium',
          messageType: 'feedback',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          subject: 'Payment Issue',
          message: 'I am experiencing issues with my payment processing...',
          sender: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          receiver: { name: 'Admin', email: 'admin@example.com' },
          priority: 'high',
          messageType: 'complaint',
          isRead: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          subject: 'Performance Review Request',
          message: 'Could you please review my teaching performance this month?',
          sender: { name: 'Mike Chen', email: 'mike@example.com' },
          receiver: { name: 'Admin', email: 'admin@example.com' },
          priority: 'low',
          messageType: 'performance',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      let response;
      try {
        if (activeTab === 'inbox') {
          response = await getTutorMessages(filters);
        } else {
          response = await getAdminMessages(filters);
        }
        
        if (response && response.success && response.data && response.data.length > 0) {
          setMessages(response.data);
        } else {
          setMessages(sampleMessages);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        setMessages(sampleMessages);
      }
      
      // Calculate stats from messages
      const totalMessages = messages.length;
      const unreadMessages = messages.filter(m => !m.isRead).length;
      const urgentMessages = messages.filter(m => m.priority === 'urgent').length;
      
      setStats({
        totalMessages,
        unreadMessages,
        sentMessages: activeTab === 'sent' ? messages.length : 0,
        urgentMessages
      });
      
      // For now, set empty users array - this would need to be fetched from a users API
      setMessagingUsers([]);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
      setStats({
        totalMessages: 0,
        unreadMessages: 0,
        sentMessages: 0,
        urgentMessages: 0
      });
      setMessagingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await sendMessageToTutor(composeForm.receiver, {
        subject: composeForm.subject,
        message: composeForm.message,
        messageType: composeForm.messageType,
        priority: composeForm.priority
      });
      setShowCompose(false);
      setComposeForm({
        receiver: '',
        subject: '',
        message: '',
        messageType: 'feedback',
        priority: 'medium'
      });
      loadData(); // Reload messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + (error.response?.data?.message || error.message));
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutor Communication</h1>
          <p className="text-gray-600">Manage feedback, complaints, and performance reviews</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <FaPlus />
          <span>Send Feedback</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaInbox className="text-blue-500 text-2xl" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold">{stats.totalMessages || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaEnvelope className="text-orange-500 text-2xl" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unreadMessages || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaChartLine className="text-green-500 text-2xl" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Performance Reviews</p>
              <p className="text-2xl font-bold">{stats.sentMessages || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Urgent Issues</p>
              <p className="text-2xl font-bold text-red-600">{stats.urgentMessages || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setComposeForm({
                ...composeForm,
                messageType: 'performance',
                subject: 'Performance Review',
                priority: 'high'
              });
              setShowCompose(true);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <FaStar className="text-yellow-500 text-2xl mb-2" />
            <h4 className="font-medium">Performance Review</h4>
            <p className="text-sm text-gray-600">Send detailed performance feedback</p>
          </button>
          <button
            onClick={() => {
              setComposeForm({
                ...composeForm,
                messageType: 'feedback',
                subject: 'General Feedback',
                priority: 'medium'
              });
              setShowCompose(true);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <FaChartLine className="text-blue-500 text-2xl mb-2" />
            <h4 className="font-medium">General Feedback</h4>
            <p className="text-sm text-gray-600">Provide constructive feedback</p>
          </button>
          <button
            onClick={() => {
              setComposeForm({
                ...composeForm,
                messageType: 'urgent',
                subject: 'Urgent Issue',
                priority: 'urgent'
              });
              setShowCompose(true);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <FaExclamationTriangle className="text-red-500 text-2xl mb-2" />
            <h4 className="font-medium">Urgent Issue</h4>
            <p className="text-sm text-gray-600">Report urgent concerns</p>
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inbox'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaInbox className="inline mr-2" />
              Messages from Tutors ({stats.unreadMessages || 0})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaPaperPlane className="inline mr-2" />
              Messages Sent to Tutors
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filters.messageType}
              onChange={(e) => setFilters({ ...filters, messageType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="feedback">Feedback</option>
              <option value="complaint">Complaint</option>
              <option value="performance">Performance</option>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Messages List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaEnvelope className="mx-auto text-4xl mb-4" />
              <p>No messages found</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  !message.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{message.subject}</h3>
                      {!message.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {activeTab === 'inbox' 
                        ? `From: ${message.sender?.name || message.sender?.email || 'Unknown Tutor'}`
                        : `To: ${message.receiver?.name || message.receiver?.email || 'Unknown Tutor'}`
                      }
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(message.messageType)}`}>
                      {message.messageType}
                    </span>
                    {getStatusIcon(message.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Send Feedback</h2>
            <form onSubmit={handleSendMessage}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <select
                    value={composeForm.receiver}
                    onChange={(e) => setComposeForm({ ...composeForm, receiver: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select tutor</option>
                    {messagingUsers.length > 0 ? (
                      messagingUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.tutorProfile?.skills?.length || 0} skills)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No tutors available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter message subject"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={composeForm.messageType}
                      onChange={(e) => setComposeForm({ ...composeForm, messageType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="feedback">Feedback</option>
                      <option value="performance">Performance Review</option>
                      <option value="complaint">Complaint</option>
                      <option value="general">General</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={composeForm.priority}
                      onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={composeForm.message}
                    onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your feedback message..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;



