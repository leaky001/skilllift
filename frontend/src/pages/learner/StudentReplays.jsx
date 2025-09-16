import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showError } from '../../services/toastService';
import learnerReplayService from '../../services/learnerReplayService';
import { 
  FaPlay, 
  FaClock, 
  FaVideo, 
  FaCalendarAlt,
  FaBookOpen,
  FaUser,
  FaDownload,
  FaEye,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const StudentReplays = () => {
  const { user } = useAuth();
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    loadReplays();
  }, []);

  const loadReplays = async () => {
    try {
      setLoading(true);
      
      // Use real API call instead of mock data
      const response = await learnerReplayService.getLearnerReplays();
      if (response.success) {
        setReplays(response.data || []);
      } else {
        console.error('Failed to load replays:', response.message);
        showError('Failed to load replays');
        setReplays([]);
      }
    } catch (error) {
      showError('Failed to load replays');
      console.error('Error loading replays:', error);
      setReplays([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReplays = replays.filter(replay => {
    const matchesSearch = replay.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         replay.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || replay.courseTitle === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const courses = [...new Set(replays.map(replay => replay.courseTitle))];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCourseColor = (courseTitle) => {
    const colors = {
      'Web Development Fundamentals': 'primary',
      'React.js Complete Guide': 'secondary',
      'Node.js Backend Development': 'accent',
      'Python for Beginners': 'error'
    };
    return colors[courseTitle] || 'primary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading replays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Class Replays</h1>
          <p className="text-lg text-slate-600">Watch recordings of your live classes</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search replays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64 transition-colors"
                />
              </div>
              
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-slate-500">
              {filteredReplays.length} replay{filteredReplays.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Replays Grid */}
        {filteredReplays.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FaVideo className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No replays found</h3>
            <p className="text-slate-600">
              {searchQuery || selectedCourse !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your tutors haven\'t uploaded any replays yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReplays.map((replay) => (
              <motion.div
                key={replay._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={replay.thumbnail}
                    alt={replay.topic}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <FaPlay className="text-white text-4xl" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getCourseColor(replay.courseTitle) === 'primary' ? 'bg-primary-100 text-primary-800' :
                      getCourseColor(replay.courseTitle) === 'secondary' ? 'bg-secondary-100 text-secondary-800' :
                      getCourseColor(replay.courseTitle) === 'accent' ? 'bg-accent-100 text-accent-800' :
                      'bg-error-100 text-error-800'
                    }`}>
                      {replay.courseTitle.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {replay.topic}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <FaBookOpen className="mr-2 text-primary-600" />
                      {replay.courseTitle}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <FaUser className="mr-2 text-secondary-600" />
                      {replay.tutorName}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <FaCalendarAlt className="mr-2 text-accent-600" />
                      {formatDate(replay.uploadDate)}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <FaClock className="mr-2 text-slate-500" />
                      {replay.duration}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <FaEye className="mr-1" />
                      {replay.views} views
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                        <FaDownload className="mr-1" />
                        Download
                      </button>
                      <button className="px-4 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        <FaPlay className="mr-1" />
                        Watch
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReplays;
