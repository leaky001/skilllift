import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaVideo, 
  FaPlay, 
  FaMapMarkerAlt,
  FaGlobe,
  FaLink,
  FaCopy,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaFilter,
  FaSearch,
  FaBell,
  FaDownload,
  FaShare
} from 'react-icons/fa';
import { showError } from '../../services/toastService.jsx';
import { getMyLiveClasses } from '../../services/liveClassService';
import { getThumbnailUrl, getPlaceholderImage } from '../../utils/fileUtils';
import LiveClassNotification from '../../components/LiveClassNotification';
import { useAuth } from '../../context/AuthContext';
import websocketService from '../../services/websocketService';

const LearnerLiveClasses = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadLiveClasses();
    
    // Initialize WebSocket connection for real-time updates
    const initializeWebSocket = async () => {
      if (token && user) {
        try {
          console.log('🔌 Initializing WebSocket for LiveClasses...');
          await websocketService.connect(token);
          
          // Listen for live class start events
          websocketService.on('live-class-started', (data) => {
            console.log('🔔 Live class started event received:', data);
            // Refresh the live classes list
            loadLiveClasses();
            
            // Show notification
            const startedClass = liveClasses.find(cls => cls._id === data.classId);
            if (startedClass) {
              setNotification(startedClass);
            }
          });

          // Listen for live class end events
          websocketService.on('live-class-ended', (data) => {
            console.log('🏁 Live class ended event received:', data);
            // Refresh the live classes list to update status
            loadLiveClasses();
          });
          
          console.log('✅ WebSocket initialized for LiveClasses');
        } catch (error) {
          console.error('❌ Error initializing WebSocket:', error);
        }
      }
    };
    
    initializeWebSocket();
    
    // Poll for live class updates every 30 seconds
    const interval = setInterval(() => {
      loadLiveClasses();
    }, 30000);
    
    // Listen for live class start events (if WebSocket is available)
    const handleLiveClassStart = (event) => {
      console.log('📡 Received live class start event:', event.detail);
      loadLiveClasses(); // Refresh the list
    };

    // Listen for live class end events (if WebSocket is available)
    const handleLiveClassEnd = (event) => {
      console.log('📡 Received live class end event:', event.detail);
      loadLiveClasses(); // Refresh the list
    };
    
    window.addEventListener('live-class-started', handleLiveClassStart);
    window.addEventListener('live-class-ended', handleLiveClassEnd);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('live-class-started', handleLiveClassStart);
      window.removeEventListener('live-class-ended', handleLiveClassEnd);
      websocketService.off('live-class-started');
      websocketService.off('live-class-ended');
    };
  }, [token, user]);

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await getMyLiveClasses();
      if (response.success) {
        console.log('📊 Live Classes Data:', response.data);
        console.log('📊 First Class Course Data:', response.data[0]?.courseId);
        
        const newLiveClasses = response.data || [];
        
        // Check for newly started live classes
        const previousLiveClasses = liveClasses;
        const newlyStartedClasses = newLiveClasses.filter(newClass => {
          const isLive = newClass.status === 'live' || newClass.status === 'ongoing';
          const wasNotLive = !previousLiveClasses.find(prevClass => 
            prevClass._id === newClass._id && (prevClass.status === 'live' || prevClass.status === 'ongoing')
          );
          return isLive && wasNotLive;
        });
        
        // Show notification for newly started classes
        if (newlyStartedClasses.length > 0) {
          const latestStartedClass = newlyStartedClasses[0];
          setNotification(latestStartedClass);
          console.log('🔔 Live class started:', latestStartedClass.title);
        }
        
        setLiveClasses(newLiveClasses);
      } else {
        console.error('Failed to load live classes:', response.message);
        showError('Failed to load live classes');
      }
    } catch (error) {
      console.error('Error loading live classes:', error);
      showError('Error loading live classes');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['all', 'upcoming', 'live', 'completed', 'cancelled'];
  const categories = ['all', 'Beauty & Fashion', 'Business', 'Technology', 'Art & Design', 'Health & Wellness'];
  const platforms = {
    'zoom': 'Zoom',
    'google-meet': 'Google Meet',
    'teams': 'Microsoft Teams',
    'physical': 'Physical Location'
  };

  useEffect(() => {
    filterClasses();
  }, [searchQuery, selectedStatus, selectedCategory, liveClasses]);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, selectedStatus, selectedCategory, liveClasses]);

  const filterClasses = () => {
    let filtered = liveClasses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(liveClass =>
        liveClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        liveClass.tutor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        liveClass.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(liveClass => liveClass.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(liveClass => liveClass.category === selectedCategory);
    }

    setFilteredClasses(filtered);
  };

  const formatDate = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Completed';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status) => {
    const colors = {
              'upcoming': 'bg-primary-100 text-primary-800',
        'live': 'bg-success-100 text-success-800',
        'completed': 'bg-neutral-100 text-neutral-800',
        'cancelled': 'bg-error-100 text-error-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'upcoming': FaClock,
      'live': FaVideo,
      'completed': FaCheckCircle,
      'cancelled': FaTimes
    };
    return icons[status] || FaClock;
  };

  const handleJoinClass = (liveClass) => {
    console.log('Join Class button clicked!', liveClass._id);
    console.log('Navigating to:', `/learner/live-classes/${liveClass._id}/room`);
    
    // Use React Router navigation only
    navigate(`/learner/live-classes/${liveClass._id}/room`);
    console.log('Navigation called successfully');
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    // TODO: Show toast notification
  };

  const handleDownloadRecording = (recordingUrl) => {
    // TODO: Implement download logic
    window.open(recordingUrl, '_blank');
  };

  const LiveClassCard = ({ liveClass }) => {
    const StatusIcon = getStatusIcon(liveClass.status);
    const isLive = liveClass.status === 'live' || liveClass.status === 'ongoing';
    
    // Debug logging
    console.log('🔍 Live Class Debug:', {
      id: liveClass._id,
      title: liveClass.title,
      status: liveClass.status,
      isLive: isLive,
      isEnrolled: liveClass.isEnrolled
    });
    
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
          isLive ? 'ring-2 ring-red-500 ring-opacity-50' : ''
        }`}
      >
        <div className="relative">
          <img 
            src={getThumbnailUrl(liveClass.courseId?.thumbnail) || getPlaceholderImage(liveClass.courseId?.category) || '/images/default-course.jpg'} 
            alt={liveClass.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.log('❌ Image failed to load:', e.target.src);
              e.target.src = '/images/default-course.jpg';
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully:', liveClass.courseId?.thumbnail);
            }}
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)} ${
              isLive ? 'animate-pulse' : ''
            }`}>
              <StatusIcon className="inline mr-1" />
              {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
              {isLive && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <span className="ml-1 text-xs font-bold">LIVE</span>
                </span>
              )}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {liveClass.platform || 'Online'}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{liveClass.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{liveClass.description}</p>

          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-500">by</span>
            <span className="text-sm font-medium text-primary-600 ml-1">{liveClass.tutor}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-indigo-500" />
              <span>{liveClass.scheduledDate ? new Date(liveClass.scheduledDate).toLocaleDateString() : 'Date TBD'}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2 text-emerald-500" />
              <span>{liveClass.scheduledDate ? new Date(liveClass.scheduledDate).toLocaleTimeString() : 'Time TBD'} ({liveClass.duration ? `${liveClass.duration}min` : 'TBD'})</span>
            </div>
            <div className="flex items-center">
              <FaUsers className="mr-2 text-indigo-500" />
              <span>Max: {liveClass.maxParticipants || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <FaGlobe className="mr-2 text-indigo-500" />
              <span>{liveClass.platform || 'Online'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedClass(liveClass);
                setShowClassDetails(true);
              }}
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <FaEye className="mr-2" />
              View Details
            </button>
            
            {liveClass.status === 'scheduled' && liveClass.meetingLink && (
              <button
                onClick={() => handleJoinClass(liveClass)}
                className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-colors flex items-center"
              >
                <FaPlay className="mr-2" />
                Join Now
              </button>
            )}
            
            {liveClass.status === 'upcoming' && !liveClass.isEnrolled && (
              <button className="bg-accent-500 text-neutral-900 px-6 py-2 rounded-lg font-bold hover:bg-accent-400 transition-colors">
                Enroll to Join
              </button>
            )}
            
            {liveClass.status === 'live' && liveClass.isEnrolled && (
              <button
                onClick={() => handleJoinClass(liveClass)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
              >
                <FaVideo className="mr-2 animate-bounce" />
                Join Live Now
              </button>
            )}
            
            {liveClass.status === 'completed' && liveClass.recordingUrl && (
              <button
                onClick={() => handleDownloadRecording(liveClass.recordingUrl)}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-600 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Watch Recording
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live Class Notification */}
      {notification && (
        <LiveClassNotification
          liveClass={notification}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
              <p className="text-gray-600 mt-1">Join interactive live sessions with expert tutors</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/learner/live-classes"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center shadow-lg"
              >
                <FaVideo className="mr-2" />
                Browse Live Classes
              </Link>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes, tutors, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent w-80"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-accent-500 text-neutral-900 px-4 py-3 rounded-lg font-medium hover:bg-accent-400 transition-colors flex items-center"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                    setSelectedCategory('all');
                  }}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredClasses.length} of {liveClasses.length} live classes
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
              <option>Date & Time</option>
              <option>Most Popular</option>
              <option>Category</option>
              <option>Status</option>
            </select>
          </div>
        </div>

        {/* Live Classes Grid */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((liveClass, index) => (
              <LiveClassCard key={liveClass._id || liveClass.id || `liveclass-${index}`} liveClass={liveClass} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No live classes found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">{selectedClass.title}</h3>
              <button
                onClick={() => setShowClassDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Details */}
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Class Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-indigo-500 mr-3 w-5" />
                        <span className="text-gray-700">
                          {selectedClass.scheduledDate ? new Date(selectedClass.scheduledDate).toLocaleDateString() : 'Date not set'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="text-emerald-500 mr-3 w-5" />
                        <span className="text-gray-700">
                          Time: {selectedClass.scheduledDate ? new Date(selectedClass.scheduledDate).toLocaleTimeString() : 'Time not set'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="text-amber-500 mr-3 w-5" />
                        <span className="text-gray-700">Duration: {selectedClass.duration ? `${selectedClass.duration} minutes` : 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaUsers className="text-indigo-500 mr-3 w-5" />
                        <span className="text-gray-700">
                          Max Participants: {selectedClass.maxParticipants || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaGlobe className="text-indigo-500 mr-3 w-5" />
                        <span className="text-gray-700">
                          Platform: {selectedClass.platform || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedClass.meetingLink && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Meeting Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedClass.meetingLink}
                              readOnly
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                            />
                            <button
                              onClick={() => handleCopyLink(selectedClass.meetingLink)}
                              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                              <FaCopy className="mr-2" />
                              Copy
                            </button>
                            <button
                              onClick={() => handleJoinClass(selectedClass)}
                              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <FaLink className="mr-2" />
                              Join
                            </button>
                          </div>
                        </div>
                        
                        {selectedClass.meetingId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting ID</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={selectedClass.meetingId}
                                readOnly
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                              />
                              <button
                                onClick={() => handleCopyLink(selectedClass.meetingId)}
                                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                              >
                                <FaCopy className="mr-2" />
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {selectedClass.meetingPassword && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Password</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={selectedClass.meetingPassword}
                                readOnly
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                              />
                              <button
                                onClick={() => handleCopyLink(selectedClass.meetingPassword)}
                                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                              >
                                <FaCopy className="mr-2" />
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Class Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedClass.description || 'No description provided'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <p className="text-gray-700">{selectedClass.type || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <p className="text-gray-700">{selectedClass.level || 'Not specified'}</p>
                      </div>
                      
                      {selectedClass.tags && selectedClass.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedClass.tags.map((tag, index) => (
                              <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Prerequisites</h4>
                    <ul className="space-y-2">
                      {selectedClass.prerequisites && selectedClass.prerequisites.length > 0 ? (
                        selectedClass.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="flex items-center">
                            <FaCheckCircle className="text-emerald-500 mr-2 text-sm" />
                            <span className="text-gray-700">{prerequisite}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">No prerequisites required</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Right Column - Actions & Media */}
                <div>
                  <div className="mb-6">
                    <img 
                      src={getThumbnailUrl(selectedClass.courseId?.thumbnail) || getPlaceholderImage(selectedClass.courseId?.category) || '/images/default-course.jpg'} 
                      alt={selectedClass.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/images/default-course.jpg';
                      }}
                    />
                  </div>

                  {selectedClass.status === 'upcoming' && selectedClass.isEnrolled && (
                            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-success-900 mb-2">You're Enrolled! 🎉</h4>
          <p className="text-success-700 text-sm mb-3">
                        You'll receive a reminder 15 minutes before the class starts.
                      </p>
                      <button
                        onClick={() => handleJoinClass(selectedClass)}
                        className="w-full bg-success-500 text-white py-3 rounded-lg font-bold hover:bg-success-600 transition-colors"
                      >
                        {selectedClass.format === 'physical' ? 'View Location' : 'Join Class'}
                      </button>
                    </div>
                  )}

                  {selectedClass.status === 'upcoming' && !selectedClass.isEnrolled && (
                            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-accent-900 mb-2">Not Enrolled</h4>
          <p className="text-accent-700 text-sm mb-3">
                        Enroll in the course to join this live class.
                      </p>
                      <button className="w-full bg-accent-500 text-neutral-900 py-3 rounded-lg font-bold hover:bg-accent-400 transition-colors">
                        Enroll in Course
                      </button>
                    </div>
                  )}

                  {selectedClass.status === 'live' && selectedClass.isEnrolled && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <h4 className="font-bold text-red-900 mb-2">Live Now! 🔴</h4>
                      <p className="text-red-700 text-sm mb-3">
                        This class is currently live. Click join to participate.
                      </p>
                      <button
                        onClick={() => handleJoinClass(selectedClass)}
                        className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
                      >
                        Join Live Class
                      </button>
                    </div>
                  )}

                  {selectedClass.status === 'completed' && selectedClass.recordingUrl && (
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-primary-900 mb-2">Recording Available</h4>
          <p className="text-primary-700 text-sm mb-3">
                        Missed the class? Watch the recording anytime.
                      </p>
                      <button
                        onClick={() => handleDownloadRecording(selectedClass.recordingUrl)}
                        className="w-full bg-primary-500 text-white py-3 rounded-lg font-bold hover:bg-primary-600 transition-colors"
                      >
                        <FaDownload className="mr-2" />
                        Watch Recording
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <FaBell className="mr-2" />
                      Set Reminder
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <FaShare className="mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerLiveClasses;
