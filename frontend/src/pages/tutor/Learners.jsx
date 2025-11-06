import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap,
  FaChartLine,
  FaClock,
  FaStar,
  FaUserGraduate,
  FaSpinner,
  FaVideo,
  FaTimes,
  FaPaperPlane,
  FaCalendarAlt,
  FaBookOpen,
  FaCertificate,
  FaComments,
  FaUser,
  FaMapMarkerAlt,
  FaBirthdayCake
} from 'react-icons/fa';
import { getTutorLearners } from '../../services/tutorService';
import { showError, showSuccess } from '../../services/toastService.jsx';
import { sendMessage } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

const TutorLearners = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state for messaging and calling
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [callDuration, setCallDuration] = useState(0);

  // Load learners data
  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      const response = await getTutorLearners();
      if (response.success) {
        setLearners(response.data || []);
      } else {
        showError('Failed to load learners');
      }
    } catch (error) {
      console.error('Error loading learners:', error);
      showError('Error loading learners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Default learners data for loading state
  const defaultLearners = [
    {
      id: 1,
      name: 'Muiz Abass',
      email: 'muiz.abass@gmail.com',
      phone: '+234 801 234 5678',
      status: 'active',
      enrolledDate: '2024-01-15',
      coursesEnrolled: 3,
      lastActive: '2 hours ago',
      progress: 75,
      rating: 4.8,
      avatar: 'MA'
    },
    {
      id: 2,
      name: 'Mistura Rokibat',
      email: 'mistura.rokibat@gmail.com',
      phone: '+234 802 345 6789',
      status: 'active',
      enrolledDate: '2024-01-20',
      coursesEnrolled: 2,
      lastActive: '1 day ago',
      progress: 45,
      rating: 4.9,
      avatar: 'MR'
    },
    {
      id: 3,
      name: 'Ridwan Idris',
      email: 'ridwan.idris@gmail.com',
      phone: '+234 803 456 7890',
      status: 'inactive',
      enrolledDate: '2023-12-10',
      coursesEnrolled: 1,
      lastActive: '1 week ago',
      progress: 20,
      rating: 4.7,
      avatar: 'RI'
    },
    {
      id: 4,
      name: 'Rodiyat Kabir',
      email: 'rodiyat.kabir@gmail.com',
      phone: '+234 804 567 8901',
      status: 'active',
      enrolledDate: '2024-02-01',
      coursesEnrolled: 4,
      lastActive: '30 minutes ago',
      progress: 90,
      rating: 5.0,
      avatar: 'RK'
    },
    {
      id: 5,
      name: 'Abdullah Sofiyat',
      email: 'abdullah.sofiyat@gmail.com',
      phone: '+234 805 678 9012',
      status: 'active',
      enrolledDate: '2024-01-25',
      coursesEnrolled: 2,
      lastActive: '3 hours ago',
      progress: 60,
      rating: 4.6,
      avatar: 'AS'
    }
  ];

  const displayLearners = loading ? defaultLearners : learners;
  
  const filteredLearners = displayLearners.filter(learner => {
    const matchesSearch = learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         learner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || learner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success-500';
    if (progress >= 60) return 'bg-secondary-500';
    if (progress >= 40) return 'bg-accent-500';
    return 'bg-neutral-300';
  };

  // Messaging functions
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedLearner) return;
    
    try {
      setSendingMessage(true);
      console.log('📤 Sending message to', selectedLearner.name, ':', messageText);
      
      // Send actual message via API
      const messageData = {
        receiverId: selectedLearner._id || selectedLearner.id,
        subject: `Message from ${user?.name || 'Your Tutor'}`,
        content: messageText.trim(),
        messageType: 'general',
        priority: 'medium'
      };

      console.log('📤 Message data:', messageData);
      console.log('👨‍🎓 Selected learner:', selectedLearner);

      const response = await sendMessage(messageData);
      
      if (response.success) {
        showSuccess(`Message sent to ${selectedLearner.name} successfully!`);
        setMessageText('');
        setShowMessageModal(false);
      } else {
        showError(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const openMessageModal = (learner) => {
    setSelectedLearner(learner);
    setShowMessageModal(true);
    setMessageText('');
  };

  // Calling functions
  const handleStartCall = async (learner) => {
    setSelectedLearner(learner);
    setShowCallModal(true);
    setCallStatus('calling');
    
    // Simulate calling process
    setTimeout(() => {
      setCallStatus('connected');
      startCallTimer();
    }, 3000);
  };

  const startCallTimer = () => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Store timer reference for cleanup
    window.callTimer = timer;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (window.callTimer) {
      clearInterval(window.callTimer);
    }
    
    setTimeout(() => {
      setShowCallModal(false);
      setCallStatus('idle');
      setCallDuration(0);
    }, 2000);
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">My Learners</h1>
          <p className="text-slate-600 text-lg">Manage and track your students' progress</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-3 bg-white rounded-xl shadow-md border border-slate-100 p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <FaUserGraduate className="text-primary-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Learners</p>
              <p className="text-3xl font-bold text-primary-600">{learners.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaGraduationCap className="text-primary-600 text-xl" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm text-slate-600 font-medium">Active Learners</p>
              <p className="text-3xl font-bold text-slate-900">
                {learners.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaChartLine className="text-secondary-600 text-xl" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm text-slate-600 font-medium">Avg Progress</p>
              <p className="text-3xl font-bold text-slate-900">
                {Math.round(learners.reduce((acc, l) => acc + l.progress, 0) / learners.length)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaStar className="text-amber-600 text-xl" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm text-slate-600 font-medium">Avg Rating</p>
              <p className="text-3xl font-bold text-slate-900">
                {Math.round(learners.reduce((acc, l) => acc + l.rating, 0) / learners.length * 10) / 10}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaClock className="text-emerald-600 text-xl" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm text-slate-600 font-medium">Recent Activity</p>
              <p className="text-3xl font-bold text-slate-900">
                {learners.filter(l => l.lastActive.includes('hour') || l.lastActive.includes('minute')).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaFilter className="text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Learners List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLearners.map((learner) => (
                <tr key={learner.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {learner.avatar}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{learner.name}</div>
                        <div className="text-sm text-slate-600">{learner.email}</div>
                        <div className="text-xs text-slate-500">{learner.coursesEnrolled} courses</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(learner.status)}`}>
                      {learner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-slate-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(learner.progress)}`}
                          style={{ width: `${learner.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{learner.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {learner.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaStar className="text-amber-500 text-sm mr-1" />
                      <span className="text-sm font-semibold text-slate-900">{learner.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLearner(learner)}
                        className="text-primary-600 hover:text-primary-700 p-2 rounded-xl hover:bg-primary-50 transition-all duration-200"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openMessageModal(learner)}
                        className="text-primary-600 hover:text-primary-700 p-2 rounded-xl hover:bg-primary-50 transition-all duration-200"
                        title="Send Message"
                      >
                        <FaEnvelope className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStartCall(learner)}
                        className="text-primary-600 hover:text-primary-700 p-2 rounded-xl hover:bg-primary-50 transition-all duration-200"
                        title="Start Video Call"
                      >
                        <FaVideo className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Enhanced Learner Details Modal */}
      {selectedLearner && !showMessageModal && !showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Student Profile</h3>
                <button
                  onClick={() => setSelectedLearner(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {selectedLearner.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">{selectedLearner.name}</h4>
                    <div className="space-y-1">
                      <p className="text-slate-600 flex items-center">
                        <FaEnvelope className="mr-2 text-primary-600" />
                        {selectedLearner.email}
                      </p>
                      <p className="text-slate-600 flex items-center">
                        <FaPhone className="mr-2 text-secondary-600" />
                        {selectedLearner.phone}
                      </p>
                      <p className="text-slate-600 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-accent-600" />
                        Lagos, Nigeria
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedLearner.status)}`}>
                      {selectedLearner.status}
                    </span>
                    <div className="mt-2 flex items-center">
                      <FaStar className="text-accent-500 mr-1" />
                      <span className="font-semibold">{selectedLearner.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-primary-600 mr-2" />
                      <p className="text-sm text-slate-500">Enrolled</p>
                    </div>
                    <p className="font-semibold text-slate-900">{selectedLearner.enrolledDate}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaBookOpen className="text-secondary-600 mr-2" />
                      <p className="text-sm text-slate-500">Courses</p>
                    </div>
                    <p className="font-semibold text-slate-900">{selectedLearner.coursesEnrolled}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaClock className="text-accent-600 mr-2" />
                      <p className="text-sm text-slate-500">Last Active</p>
                    </div>
                    <p className="font-semibold text-slate-900">{selectedLearner.lastActive}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaCertificate className="text-success-600 mr-2" />
                      <p className="text-sm text-slate-500">Certificates</p>
                    </div>
                    <p className="font-semibold text-slate-900">2</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h5 className="text-lg font-semibold text-slate-900 mb-4">Learning Progress</h5>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-600">Overall Progress</span>
                        <span className="text-sm font-semibold text-slate-900">{selectedLearner.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getProgressColor(selectedLearner.progress)}`}
                          style={{ width: `${selectedLearner.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Course Progress */}
                    <div className="space-y-3">
                      <h6 className="font-medium text-slate-900">Course Progress</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Web Development Fundamentals</span>
                          <span className="text-sm font-semibold text-slate-900">85%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-success-500" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">React.js Complete Guide</span>
                          <span className="text-sm font-semibold text-slate-900">60%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-secondary-500" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedLearner(null)}
                  >
                    Close
                  </button>
                  <button 
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors flex items-center"
                    onClick={() => openMessageModal(selectedLearner)}
                  >
                    <FaComments className="mr-2" />
                    Send Message
                  </button>
                  <button 
                    className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors flex items-center"
                    onClick={() => handleStartCall(selectedLearner)}
                  >
                    <FaVideo className="mr-2" />
                    Start Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessageModal && selectedLearner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedLearner.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Send Message</h3>
                    <p className="text-slate-600">to {selectedLearner.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Quick Message Templates */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quick Messages</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button
                      onClick={() => setMessageText("Hi! I noticed you missed today's live class. Would you like to schedule a makeup session?")}
                      className="p-3 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      📚 Missed class reminder
                    </button>
                    <button
                      onClick={() => setMessageText("Great progress on your assignments! Keep up the excellent work! 🎉")}
                      className="p-3 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      🎉 Progress encouragement
                    </button>
                    <button
                      onClick={() => setMessageText("I'm available for a 1-on-1 session if you need help with any concepts. Let me know!")}
                      className="p-3 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      💬 1-on-1 session offer
                    </button>
                    <button
                      onClick={() => setMessageText("Your assignment submission was outstanding! You're really mastering this topic.")}
                      className="p-3 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      ⭐ Assignment feedback
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    rows={6}
                  />
                  <p className="text-xs text-slate-500 mt-1">{messageText.length}/500 characters</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    onClick={() => setShowMessageModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    className="px-6 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showCallModal && selectedLearner && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedLearner.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Video Call</h3>
                    <p className="text-slate-600">with {selectedLearner.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleEndCall}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center space-y-6">
                {/* Call Status */}
                {callStatus === 'calling' && (
                  <div className="space-y-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto animate-pulse">
                      {selectedLearner.avatar}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-2">Calling {selectedLearner.name}...</h4>
                      <p className="text-slate-600">Waiting for them to answer</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleEndCall}
                        className="px-6 py-3 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors flex items-center"
                      >
                        <FaPhone className="mr-2 rotate-90" />
                        End Call
                      </button>
                    </div>
                  </div>
                )}

                {callStatus === 'connected' && (
                  <div className="space-y-4">
                    <div className="bg-slate-100 rounded-xl p-8">
                      <div className="w-48 h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-6xl mx-auto mb-4">
                        {selectedLearner.avatar}
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-2">Connected!</h4>
                      <p className="text-slate-600 mb-4">Call duration: {formatCallDuration(callDuration)}</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center">
                        <FaVideo className="mr-2" />
                        Mute Video
                      </button>
                      <button className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center">
                        <FaPhone className="mr-2" />
                        Mute Audio
                      </button>
                      <button
                        onClick={handleEndCall}
                        className="px-6 py-3 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors flex items-center"
                      >
                        <FaPhone className="mr-2 rotate-90" />
                        End Call
                      </button>
                    </div>
                  </div>
                )}

                {callStatus === 'ended' && (
                  <div className="space-y-4">
                    <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold text-4xl mx-auto">
                      <FaPhone className="rotate-90" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-2">Call Ended</h4>
                      <p className="text-slate-600">Duration: {formatCallDuration(callDuration)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorLearners;
