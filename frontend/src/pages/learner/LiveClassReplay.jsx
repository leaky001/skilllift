import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaClock, 
  FaVideo, 
  FaExternalLinkAlt, 
  FaDownload,
  FaComments,
  FaQuestionCircle,
  FaStar,
  FaCalendarAlt,
  FaUser,
  FaGraduationCap,
  FaArrowLeft
} from 'react-icons/fa';
import { getRecordings } from '../../services/liveClassService';
import { showError } from '../../services/toastService';

const LiveClassReplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState(null);

  useEffect(() => {
    loadRecordings();
  }, [id]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const response = await getRecordings(id);
      setLiveClass(response.data.liveClass);
      setRecordings(response.data.recordings);
      
      // Select first recording by default
      if (response.data.recordings.length > 0) {
        setSelectedRecording(response.data.recordings[0]);
      }
    } catch (error) {
      showError(error.message || 'Failed to load recordings');
      console.error('Error loading recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (quality) => {
    switch (quality?.toLowerCase()) {
      case '4k': return 'bg-purple-100 text-purple-800';
      case 'fhd': return 'bg-blue-100 text-blue-800';
      case 'hd': return 'bg-green-100 text-green-800';
      case 'sd': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'google-meet': return '🎥';
      case 'zoom': return '📹';
      case 'teams': return '💼';
      case 'screen-recording': return '🖥️';
      default: return '📺';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recordings...</p>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Class Not Found</h2>
          <p className="text-gray-600 mb-4">The live class you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaVideo className="mr-3 text-blue-600" />
                  {liveClass.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {formatDate(liveClass.scheduledDate)}
                  </span>
                  <span className="flex items-center">
                    <FaClock className="mr-1" />
                    {formatDuration(liveClass.duration)}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {liveClass.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {selectedRecording ? (
                <div>
                  {/* Video Player Area */}
                  <div className="aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <FaPlay className="text-6xl mx-auto mb-4 text-blue-400" />
                      <h3 className="text-xl font-semibold mb-2">{selectedRecording.title}</h3>
                      <p className="text-gray-300 mb-4">Click the link below to watch the recording</p>
                      <a
                        href={selectedRecording.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        Watch Recording
                      </a>
                    </div>
                  </div>

                  {/* Recording Details */}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedRecording.title}
                    </h2>
                    {selectedRecording.description && (
                      <p className="text-gray-600 mb-4">{selectedRecording.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {formatDuration(selectedRecording.duration)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getQualityColor(selectedRecording.quality)}`}>
                        {selectedRecording.quality}
                      </span>
                      <span className="flex items-center">
                        {getSourceIcon(selectedRecording.source)} {selectedRecording.source}
                      </span>
                      <span className="text-xs">
                        Uploaded {formatDate(selectedRecording.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FaVideo className="text-6xl mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">No Recording Selected</h3>
                    <p>Select a recording from the list to view it</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Course Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaGraduationCap className="mr-2 text-blue-600" />
                Course Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold text-gray-900">{liveClass.courseId?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <FaUser className="mr-1" />
                    {liveClass.tutorId?.name}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recordings List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaVideo className="mr-2 text-purple-600" />
                Available Recordings ({recordings.length})
              </h3>

              {recordings.length > 0 ? (
                <div className="space-y-3">
                  {recordings.map((recording, index) => (
                    <div
                      key={recording._id || index}
                      onClick={() => setSelectedRecording(recording)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRecording?._id === recording._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaPlay className="text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                            {recording.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <FaClock className="mr-1" />
                              {formatDuration(recording.duration)}
                            </span>
                            <span className={`px-1 py-0.5 rounded text-xs ${getQualityColor(recording.quality)}`}>
                              {recording.quality}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(recording.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaVideo className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>No recordings available</p>
                  <p className="text-sm">Recordings will appear here once uploaded by the instructor</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 mt-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FaComments className="mr-2" />
                  View Chat History
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FaQuestionCircle className="mr-2" />
                  View Q&A Session
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  <FaStar className="mr-2" />
                  Rate This Session
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClassReplay;
