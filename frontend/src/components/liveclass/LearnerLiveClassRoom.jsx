import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { liveClassService } from '../../services/liveClassService';
import StreamVideoCall from './StreamVideoCall';
import { toast } from 'react-toastify';
import { 
  FaVideo, 
  FaArrowLeft,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

const LearnerLiveClassRoom = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liveClasses, setLiveClasses] = useState([]);
  const [activeLiveClass, setActiveLiveClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [streamToken, setStreamToken] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);

  useEffect(() => {
    loadLiveClasses();
  }, [courseId]);

  const loadLiveClasses = async () => {
    try {
      setIsLoading(true);
      console.log('🎯 Loading live classes for courseId:', courseId, 'Type:', typeof courseId);
      
      // Ensure courseId is a string
      const courseIdString = typeof courseId === 'object' 
        ? courseId._id || courseId 
        : courseId;
      
      console.log('🎯 Using courseIdString:', courseIdString);
      
      const response = await liveClassService.getCourseLiveClasses(courseIdString);
      setLiveClasses(response.data);
      
      // Find active live class
      const activeClass = response.data.find(lc => lc.status === 'live');
      if (activeClass) {
        setActiveLiveClass(activeClass);
      }
    } catch (error) {
      console.error('Error loading live classes:', error);
      setError('Failed to load live classes');
      toast.error('Failed to load live classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLiveClass = async (liveClassId) => {
    try {
      setIsJoining(true);
      console.log('🎯 Learner joining live class:', liveClassId);
      const response = await liveClassService.joinLiveClass(liveClassId);
      console.log('🎯 Join response:', response);
      
      setStreamToken(response.data.streamToken);
      setCurrentCallId(response.data.callId);
      setIsInCall(true);
      toast.success('Successfully joined the live class!');
    } catch (error) {
      console.error('Error joining live class:', error);
      toast.error(error.response?.data?.message || 'Failed to join live class');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    setStreamToken(null);
    setCurrentCallId(null);
    toast.success('Left the live class');
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If user is in a call, show the video component
  if (isInCall && currentCallId && streamToken) {
    return (
      <StreamVideoCall
        callId={currentCallId}
        streamToken={streamToken}
        isHost={false}
        onCallEnd={handleLeaveCall}
        settings={activeLiveClass?.settings || {}}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Live Classes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadLiveClasses}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600">Join live sessions for this course</p>
        </div>
      </div>

      {/* Active Live Class */}
      {activeLiveClass && (
        <div className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-green-800">Live Now</h2>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeLiveClass.title}</h3>
                  <p className="text-gray-600 mb-4">{activeLiveClass.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <FaUsers />
                      <span>{activeLiveClass.attendees?.length || 0} participants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock />
                      <span>Started {formatDate(activeLiveClass.startedAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinLiveClass(activeLiveClass._id)}
                  disabled={isJoining}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isJoining ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      <span>Join Live Class</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Live Classes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
        
        {liveClasses.filter(lc => lc.status === 'scheduled').length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Sessions</h3>
            <p className="text-gray-500">Check back later for scheduled live classes.</p>
          </div>
        ) : (
          liveClasses
            .filter(lc => lc.status === 'scheduled')
            .map((liveClass) => (
              <div key={liveClass._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{liveClass.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)}`}>
                        {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{liveClass.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt />
                        <span>{formatDate(liveClass.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock />
                        <span>{liveClass.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUsers />
                        <span>{liveClass.settings.maxParticipants} max participants</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">Waiting for tutor to start</p>
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2"
                    >
                      <FaVideo />
                      <span>Not Started</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Past Live Classes */}
      {liveClasses.filter(lc => lc.status === 'ended').length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Sessions</h2>
          <div className="space-y-4">
            {liveClasses
              .filter(lc => lc.status === 'ended')
              .map((liveClass) => (
                <div key={liveClass._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{liveClass.title}</h3>
                      <p className="text-sm text-gray-500">
                        Ended {formatDate(liveClass.endedAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)}`}>
                      {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerLiveClassRoom;
