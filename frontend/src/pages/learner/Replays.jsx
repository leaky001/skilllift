import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { showError, showSuccess } from '../../services/toastService';
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
  FaSearch,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getLearnerReplays, getLearnerCourses, getReplayDetails } from '../../services/learnerReplayService';

const LearnerReplays = () => {
  const { user } = useAuth();
  const [replays, setReplays] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 0,
    total: 0
  });

  useEffect(() => {
    loadReplays();
    loadCourses();
  }, []);

  const loadReplays = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading learner replays...');
      
      const params = {
        page: pagination.current,
        limit: 12,
        search: searchQuery || undefined,
        courseId: selectedCourse !== 'all' ? selectedCourse : undefined
      };

      const response = await getLearnerReplays(params);
      console.log('📹 Replays response:', response);
      
      if (response.success) {
        setReplays(response.data || []);
        setPagination(response.pagination || { current: 1, pages: 0, total: 0 });
        console.log('✅ Replays loaded successfully:', response.data?.length || 0, 'replays');
      } else {
        console.error('❌ Failed to load replays:', response.message);
        setReplays([]);
        showError(response.message || 'Failed to load replays');
      }
    } catch (error) {
      console.error('❌ Error loading replays:', error);
      setReplays([]);
      showError('Error loading replays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      console.log('🔄 Loading enrolled courses...');
      
      const response = await getLearnerCourses();
      console.log('📚 Courses response:', response);
      
      if (response.success) {
        setCourses(response.data || []);
        console.log('✅ Courses loaded successfully:', response.data?.length || 0, 'courses');
      } else {
        console.error('❌ Failed to load courses:', response.message);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Reload replays when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        loadReplays();
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCourse]);

  const handlePlayReplay = async (replay) => {
    try {
      console.log('▶️ Playing replay:', replay.title);
      
      // Fetch replay details to get the file URL
      const response = await getReplayDetails(replay._id);
      
      if (response.success) {
        const replayData = response.data;
        console.log('📹 Replay data:', replayData);
        
        // Open the replay in a new window/tab
        if (replayData.fileUrl) {
          // Construct proper URL for backend server
          // Remove leading slash if present to avoid double slashes
          const cleanFileUrl = replayData.fileUrl.startsWith('/') 
            ? replayData.fileUrl.substring(1) 
            : replayData.fileUrl;
          const videoUrl = `http://localhost:3001/${cleanFileUrl}`;
          console.log('🎥 Opening video URL:', videoUrl);
          window.open(videoUrl, '_blank');
          showSuccess(`Opening replay: ${replay.title}`);
        } else {
          showError('Replay file not available');
        }
      } else {
        showError('Failed to load replay');
      }
      
    } catch (error) {
      console.error('Error playing replay:', error);
      showError('Failed to play replay');
    }
  };

  const handleDownloadReplay = async (replay) => {
    try {
      console.log('📥 Downloading replay:', replay.title);
      
      // Fetch replay details to get the file URL
      const response = await getReplayDetails(replay._id);
      
      if (response.success) {
        const replayData = response.data;
        
        if (replayData.fileUrl) {
          // Create a temporary link to download the file
          const link = document.createElement('a');
          // Construct proper URL for backend server using download endpoint
          // Remove leading slash if present to avoid double slashes
          const cleanFileUrl = replayData.fileUrl.startsWith('/') 
            ? replayData.fileUrl.substring(1) 
            : replayData.fileUrl;
          const downloadUrl = `http://localhost:3001/download/${cleanFileUrl}`;
          console.log('📥 Downloading from URL:', downloadUrl);
          link.href = downloadUrl;
          link.download = replayData.fileName || `${replay.title}.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showSuccess(`Downloading: ${replay.title}`);
        } else {
          showError('Replay file not available for download');
        }
      } else {
        showError('Failed to load replay for download');
      }
      
    } catch (error) {
      console.error('Error downloading replay:', error);
      showError('Failed to download replay');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Replays</h1>
          <p className="text-slate-600">Watch recorded live sessions from your enrolled courses</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search replays by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaFilter className="text-slate-500" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={coursesLoading}
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin mr-3 text-primary-600" />
            <span className="text-slate-600">Loading replays...</span>
          </div>
        )}

        {/* Replays Grid */}
        {!loading && replays.length === 0 ? (
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
          !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replays.map((replay) => (
                <motion.div
                  key={replay._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600">
                      <div className="text-center text-white">
                        <FaVideo className="mx-auto h-12 w-12 mb-2 opacity-80" />
                        <p className="text-sm font-medium opacity-90">{replay.title}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <button
                        onClick={() => handlePlayReplay(replay)}
                        className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        <FaPlay className="text-primary-600 text-xl ml-1" />
                      </button>
                    </div>
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {replay.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                        {replay.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">{replay.courseTitle}</p>
                      <p className="text-sm text-slate-500">by {replay.tutorName}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FaEye className="mr-1" />
                          {replay.views} views
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {formatDate(replay.uploadedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handlePlayReplay(replay)}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <FaPlay className="mr-2" />
                        Watch
                      </button>
                      <button
                        onClick={() => handleDownloadReplay(replay)}
                        className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <FaDownload className="mr-2" />
                        Download
                      </button>
                    </div>

                    {replay.fileSize && (
                      <div className="mt-3 text-xs text-slate-500">
                        File size: {formatFileSize(replay.fileSize)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, current: prev.current - 1 }));
                  loadReplays();
                }}
                disabled={pagination.current === 1}
                className="px-3 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-slate-700">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, current: prev.current + 1 }));
                  loadReplays();
                }}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerReplays;