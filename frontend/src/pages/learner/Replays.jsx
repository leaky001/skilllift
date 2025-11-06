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
          let videoUrl = replayData.fileUrl;
          
          // Handle different types of replays
          if (replayData.type === 'google_meet') {
            // For Google Meet recordings, use the Google Drive URL directly
            videoUrl = replayData.fileUrl;
            console.log('🎥 Opening Google Meet recording:', videoUrl);
          } else {
            // For automated bot recordings, use the fileUrl directly (already has /api/replays/stream/)
            videoUrl = `http://localhost:5000${replayData.fileUrl}`;
            console.log('🎥 Opening automated bot replay:', videoUrl);
          }
          
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
          let downloadUrl = replayData.fileUrl;
          
          // Handle different types of replays
          if (replayData.type === 'google_meet') {
            // For Google Meet recordings, use the Google Drive URL directly
            downloadUrl = replayData.fileUrl;
            console.log('📥 Downloading Google Meet recording:', downloadUrl);
          } else {
            // For automated bot recordings, use the fileUrl directly
            downloadUrl = `http://localhost:5000${replayData.fileUrl}`;
            console.log('📥 Downloading automated bot replay:', downloadUrl);
          }
          
          link.href = downloadUrl;
          link.download = replayData.fileName || `${replay.title}.mp4`;
          link.target = '_blank'; // Open in new tab for Google Drive links
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Class Replays</h1>
          <p className="text-slate-600 text-lg">Watch recorded live sessions from your enrolled courses</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search replays by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white font-medium"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-md">
                <FaFilter className="text-primary-600" />
              </div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white font-medium"
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
          <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-md border border-slate-100">
            <FaSpinner className="animate-spin mr-3 text-primary-600 h-6 w-6" />
            <span className="text-slate-600 font-medium">Loading replays...</span>
          </div>
        )}

        {/* Replays Grid */}
        {!loading && replays.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <FaVideo className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No replays found</h3>
            <p className="text-slate-600 font-medium">
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
                  className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <FaVideo className="mx-auto h-12 w-12 mb-2 opacity-90" />
                        <p className="text-sm font-semibold opacity-90 px-4">{replay.title}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                      <button
                        onClick={() => handlePlayReplay(replay)}
                        className="w-16 h-16 bg-white bg-opacity-95 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <FaPlay className="text-primary-600 text-xl ml-1" />
                      </button>
                    </div>
                    {replay.duration && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                        {replay.duration}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                        {replay.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-1 font-medium">{replay.courseTitle}</p>
                      <p className="text-sm text-slate-500 font-medium">by {replay.tutorName}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center font-medium">
                          <FaEye className="mr-1.5 text-primary-600" />
                          {replay.views} views
                        </div>
                        <div className="flex items-center font-medium">
                          <FaCalendarAlt className="mr-1.5 text-primary-600" />
                          {formatDate(replay.uploadedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePlayReplay(replay)}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        <FaPlay className="mr-2" />
                        Watch
                      </button>
                      <button
                        onClick={() => handleDownloadReplay(replay)}
                        className="flex items-center justify-center px-4 py-2.5 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
                      >
                        <FaDownload className="mr-2" />
                        Download
                      </button>
                    </div>

                    {replay.fileSize && (
                      <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 font-medium">
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
            <div className="flex items-center space-x-2 bg-white rounded-xl shadow-md border border-slate-100 p-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, current: prev.current - 1 }));
                  loadReplays();
                }}
                disabled={pagination.current === 1}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-slate-700 font-semibold bg-slate-50 rounded-xl border border-slate-200">
                Page {pagination.current} of {pagination.pages}
              </span>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, current: prev.current + 1 }));
                  loadReplays();
                }}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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