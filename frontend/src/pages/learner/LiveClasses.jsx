import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { liveClassService } from '../../services/liveClassService';
import { toast } from 'react-toastify';
import { 
  FaVideo, 
  FaBook, 
  FaUsers, 
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaArrowRight,
  FaSpinner,
  FaStop
} from 'react-icons/fa';

const LearnerLiveClasses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLiveClasses();
    
    // Refresh live classes every 30 seconds to get updated status
    const interval = setInterval(() => {
      loadLiveClasses();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await liveClassService.getLiveClasses();
      setLiveClasses(response.data || []);
    } catch (error) {
      console.error('Error loading live classes:', error);
      setError('Failed to load live classes');
      toast.error('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLiveClass = async (liveClass) => {
    if (liveClass.status === 'live') {
      try {
        console.log('🎯 Learner joining live class:', liveClass._id);
        const response = await liveClassService.joinLiveClass(liveClass._id);
        console.log('🎯 Join response:', response);
        
        // Navigate to full screen live class
        navigate(`/live-class/${liveClass._id}`, {
          state: {
            liveClass: {
              ...liveClass,
              callId: response.data.callId,
              streamToken: response.data.streamToken
            },
            streamToken: response.data.streamToken,
            callId: response.data.callId,
            sessionId: response.data.sessionId
          }
        });
        
        toast.success('Successfully joined the live class!');
      } catch (error) {
        console.error('Error joining live class:', error);
        toast.error(error.response?.data?.message || 'Failed to join live class');
      }
    } else {
      toast.info('Live class is not active yet');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-green-600" />
            <span className="ml-3 text-lg text-gray-600">Loading live classes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Live Classes</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadLiveClasses}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Classes</h1>
              <p className="text-gray-600">Join live classes from your enrolled courses</p>
            </div>
            <button
              onClick={loadLiveClasses}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
              title="Refresh live classes"
            >
              <FaSpinner className="text-sm" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Classes Grid */}
        {liveClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Live Classes Available</h3>
            <p className="text-gray-500 mb-4">
              There are no live classes available at the moment. Check back later or contact your tutors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((liveClass) => (
              <div key={liveClass._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <FaBook className="text-6xl text-white opacity-80" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)}`}>
                      {liveClass.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {liveClass.attendees?.length || 0} participants
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {liveClass.title || 'Live Class'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {liveClass.description || 'Join this live class to learn and interact with your tutor and fellow learners.'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-2" />
                      {formatDate(liveClass.scheduledDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      {liveClass.duration || 60} minutes
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinLiveClass(liveClass)}
                    disabled={liveClass.status !== 'live'}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      liveClass.status === 'live'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaPlay className="mr-2" />
                    {liveClass.status === 'live' ? 'Join Live Class' : 'Not Available'}
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerLiveClasses;
