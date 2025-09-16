import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  FaShare,
  FaUser,
  FaStar,
  FaDollarSign,
  FaLock
} from 'react-icons/fa';
import { showError, showSuccess } from '../../services/toastService.jsx';
import { getPublicLiveSessions, enrollInLiveSession } from '../../services/liveClassService';

const BrowseLiveSessions = () => {
  const [liveSessions, setLiveSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadPublicSessions();
  }, []);

  const loadPublicSessions = async () => {
    try {
      setLoading(true);
      const response = await getPublicLiveSessions();
      if (response.success) {
        setLiveSessions(response.data || []);
      } else {
        console.error('Failed to load public sessions:', response.message);
        showError('Failed to load live sessions');
      }
    } catch (error) {
      console.error('Error loading public sessions:', error);
      showError('Error loading live sessions');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Web Development', 'Frontend Development', 'Data Science', 'Business', 'Design', 'Marketing'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' }
  ];

  const platforms = {
    'zoom': 'Zoom',
    'google-meet': 'Google Meet',
    'teams': 'Microsoft Teams',
    'physical': 'Physical Location'
  };

  useEffect(() => {
    filterSessions();
  }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, liveSessions]);

  const filterSessions = () => {
    let filtered = liveSessions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(session => session.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(session => session.level === selectedLevel);
    }

    // Price filter
    if (selectedPrice === 'free') {
      filtered = filtered.filter(session => session.price === 0);
    } else if (selectedPrice === 'paid') {
      filtered = filtered.filter(session => session.price > 0);
    }

    setFilteredSessions(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Past';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'ready': 'bg-green-100 text-green-800',
      'live': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleEnroll = async (sessionId) => {
    try {
      setEnrolling(true);
      const response = await enrollInLiveSession(sessionId);
      if (response.success) {
        showSuccess('Successfully enrolled in live session!');
        // Refresh the sessions list
        loadPublicSessions();
      } else {
        showError(response.message || 'Failed to enroll in session');
      }
    } catch (error) {
      console.error('Error enrolling in session:', error);
      showError('Failed to enroll in session. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const LiveSessionCard = ({ session }) => {
    const isEnrolled = session.isEnrolled;
    const isFull = session.enrolledCount >= session.maxStudents;
    
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="relative">
          <img 
            src={session.thumbnail || 'https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Live+Session'} 
            alt={session.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-secondary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {session.meetingPlatform === 'physical' ? 'Physical' : 'Online'}
            </span>
          </div>
          {isEnrolled && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                Enrolled
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{session.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{session.description}</p>

          <div className="flex items-center mb-3">
            <FaUser className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{session.tutor?.name || 'Tutor Name'}</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                {formatDate(session.startTime)}
              </div>
              <div className="flex items-center">
                <FaClock className="mr-1" />
                {formatTime(session.startTime)}
              </div>
              <div className="flex items-center">
                <FaUsers className="mr-1" />
                {session.enrolledCount || 0}/{session.maxStudents}
              </div>
            </div>
            <div className="flex items-center">
              {session.price === 0 ? (
                <span className="text-green-600 font-bold">Free</span>
              ) : (
                <span className="text-gray-900 font-bold">${session.price}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {session.category}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                {session.level}
              </span>
            </div>
            <div className="flex items-center">
              <FaVideo className="text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">{platforms[session.meetingPlatform] || session.meetingPlatform}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleViewDetails(session)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" />
              View Details
            </button>
            
            {!isEnrolled && !isFull && (
              <button
                onClick={() => handleEnroll(session._id)}
                disabled={enrolling}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {enrolling ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Enroll Now
                  </>
                )}
              </button>
            )}
            
            {isEnrolled && (
              <button
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                disabled
              >
                <FaCheckCircle className="mr-2" />
                Enrolled
              </button>
            )}
            
            {isFull && !isEnrolled && (
              <button
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                disabled
              >
                <FaLock className="mr-2" />
                Full
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading live sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Live Sessions</h1>
          <p className="text-gray-600">Discover and enroll in live learning sessions from expert tutors</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions, tutors, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredSessions.length} Live Session{filteredSessions.length !== 1 ? 's' : ''} Found
            </h2>
            <Link
              to="/learner/live-classes"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View My Enrolled Sessions →
            </Link>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later for new sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session) => (
                <LiveSessionCard key={session._id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h2>
                <button
                  onClick={() => setShowSessionDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedSession.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Session Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        {formatDate(selectedSession.startTime)} at {formatTime(selectedSession.startTime)}
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-2" />
                        Duration: {formatDuration(selectedSession.duration)}
                      </div>
                      <div className="flex items-center">
                        <FaUsers className="mr-2" />
                        {selectedSession.enrolledCount || 0}/{selectedSession.maxStudents} enrolled
                      </div>
                      <div className="flex items-center">
                        <FaVideo className="mr-2" />
                        {platforms[selectedSession.meetingPlatform] || selectedSession.meetingPlatform}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tutor Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaUser className="mr-2" />
                        {selectedSession.tutor?.name || 'Tutor Name'}
                      </div>
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-yellow-500" />
                        Expert in {selectedSession.category}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedSession.price === 0 ? 'Free' : `$${selectedSession.price}`}
                  </div>
                  
                  {!selectedSession.isEnrolled && selectedSession.enrolledCount < selectedSession.maxStudents && (
                    <button
                      onClick={() => handleEnroll(selectedSession._id)}
                      disabled={enrolling}
                      className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                  
                  {selectedSession.isEnrolled && (
                    <span className="bg-green-500 text-white px-6 py-3 rounded-lg">
                      Already Enrolled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseLiveSessions;
