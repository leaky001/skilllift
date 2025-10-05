import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const SharedLiveClassRoom = () => {
  const { liveClassId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [liveClass, setLiveClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [streamToken, setStreamToken] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  
  // Manual role override for testing
  const forceRole = (role) => {
    setIsHost(role === 'host');
    console.log('🎯 Manual role override:', role);
  };

  useEffect(() => {
    initializeLiveClass();
  }, [liveClassId]);

  const initializeLiveClass = async () => {
    try {
      setIsLoading(true);
      console.log('🎯 Initializing shared live class:', liveClassId);

      // Get live class details
      const response = await liveClassService.getLiveClass(liveClassId);
      const liveClassData = response.data;
      
      console.log('🎯 Live class data:', liveClassData);
      console.log('🎯 User object:', user);
      console.log('🎯 User ID:', user._id);
      console.log('🎯 User role:', user.role);
      setLiveClass(liveClassData);

      // Check if user is the tutor (host) or learner
      const tutorId = liveClassData.tutorId._id || liveClassData.tutorId;
      const userIsHost = tutorId.toString() === user._id.toString();
      
      // Fallback: if ID comparison fails, check user role
      const isHostByRole = user.role === 'tutor';
      const finalIsHost = userIsHost || isHostByRole;
      
      console.log('🎯 Setting isHost to:', finalIsHost);
      setIsHost(finalIsHost);

      console.log('🎯 Role Detection Debug:', {
        userIsHost,
        isHostByRole,
        finalIsHost,
        tutorId: tutorId,
        userId: user._id,
        tutorIdString: tutorId.toString(),
        userIdString: user._id.toString(),
        userRole: user.role,
        comparison: tutorId.toString() === user._id.toString(),
        liveClassTutorId: liveClassData.tutorId
      });

      // If live class is active, join automatically
      if (liveClassData.status === 'live') {
        await joinLiveClass();
      }

    } catch (error) {
      console.error('Error initializing live class:', error);
      setError('Failed to load live class');
      toast.error('Failed to load live class');
    } finally {
      setIsLoading(false);
    }
  };

  const joinLiveClass = async () => {
    try {
      setIsJoining(true);
      console.log('🎯 Joining live class as:', isHost ? 'Host' : 'Learner');
      console.log('🎯 Current isHost state:', isHost);
      console.log('🎯 User role:', user.role);

      // Use the single joinLiveClass method for all users
      // The backend will determine the user's role and permissions
      const response = await liveClassService.joinLiveClass(liveClassId);

      console.log('🎯 Join response:', response);
      
      setStreamToken(response.data.streamToken);
      setCurrentCallId(response.data.callId);
      setIsInCall(true);
      
      toast.success(`Successfully joined the live class as ${isHost ? 'host' : 'participant'}!`);
      console.log('🎯 Using call ID:', response.data.callId);

    } catch (error) {
      console.error('Error joining live class:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        toast.error('You are not enrolled in this course or do not have permission to join');
      } else if (error.response?.status === 404) {
        toast.error('Live class not found');
      } else if (error.response?.status === 400) {
        toast.error('Live class is not currently active');
      } else {
        toast.error(error.response?.data?.message || 'Failed to join live class');
      }
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

  const handleBack = () => {
    if (isHost) {
      navigate('/tutor/live-classes');
    } else {
      navigate('/learner/live-classes');
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If user is in a call, show the video component in FULL SCREEN
  if (isInCall && currentCallId && streamToken) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-primary-950" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100vh',
          zIndex: 9999,
          backgroundColor: '#1E1B4B',
          margin: 0,
          padding: 0,
          overflow: 'auto'
        }}
      >
        {/* Minimal Header */}
        <div className="bg-primary-800 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-primary-300 hover:text-white transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-white text-lg font-semibold">{liveClass?.title}</h1>
              <p className="text-primary-300 text-xs">
                Call ID: {currentCallId} • Role: {isHost ? 'Host' : 'Student'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(liveClass?.status)}`}>
              {liveClass?.status}
            </span>
            <button
              onClick={handleLeaveCall}
              className="bg-error-600 text-white px-3 py-1 rounded-lg hover:bg-error-700 flex items-center space-x-1 text-sm transition-colors"
            >
              <FaTimes className="text-sm" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Full Screen Video Call */}
        <div style={{ height: 'calc(100vh - 60px)', width: '100%' }}>
          <StreamVideoCall
            callId={currentCallId}
            streamToken={streamToken}
            isHost={isHost}
            onCallEnd={handleLeaveCall}
            settings={liveClass?.settings || {}}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-lg text-text-secondary">Loading live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-error-800 mb-2">Error Loading Live Class</h2>
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-error-600 text-white px-4 py-2 rounded-lg hover:bg-error-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light flex items-center justify-center">
        <div className="text-center">
          <FaVideo className="text-6xl text-primary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Live Class Not Found</h2>
          <p className="text-text-secondary mb-4">The live class you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleBack}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{liveClass.title}</h1>
              <p className="text-text-secondary">{liveClass.description}</p>
            </div>
          </div>
          
          {/* Debug Role Buttons */}
          <div className="bg-accent-100 border border-accent-400 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-accent-800 mb-2">Debug Role Detection</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => forceRole('host')}
                className="bg-secondary-600 text-white px-3 py-1 rounded text-sm hover:bg-secondary-700 transition-colors"
              >
                Force Host (Tutor)
              </button>
              <button
                onClick={() => forceRole('participant')}
                className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
              >
                Force Participant (Learner)
              </button>
              <span className="text-sm text-text-secondary self-center">
                Current: {isHost ? 'Host' : 'Participant'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Class Card */}
        <div className="bg-background-surface rounded-lg shadow-sm border border-primary-200 overflow-hidden">
          {/* Course Image */}
          <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
            <FaVideo className="text-6xl text-white opacity-80" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)}`}>
                {liveClass.status}
              </span>
              <div className="text-sm text-text-secondary">
                <span className="font-medium">Role:</span> {isHost ? 'Host (Tutor)' : 'Participant (Learner)'}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-text-secondary">
                <FaCalendarAlt className="mr-2" />
                {formatDate(liveClass.scheduledDate)}
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <FaClock className="mr-2" />
                {liveClass.duration || 60} minutes
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <FaUsers className="mr-2" />
                {liveClass.attendees?.length || 0} participants
              </div>
            </div>

            {/* Join Button */}
            <div className="flex justify-center">
              {liveClass.status === 'live' ? (
                <button
                  onClick={joinLiveClass}
                  disabled={isJoining}
                  className="bg-secondary-600 text-white px-8 py-3 rounded-lg hover:bg-secondary-700 flex items-center space-x-2 font-medium transition-colors disabled:opacity-50"
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
              ) : (
                <div className="text-center">
                  <button
                    disabled
                    className="bg-primary-300 text-primary-500 px-8 py-3 rounded-lg cursor-not-allowed flex items-center space-x-2 font-medium"
                  >
                    <FaVideo />
                    <span>Live Class Not Active</span>
                  </button>
                  <p className="text-text-secondary text-sm mt-2">
                    The live class is not currently active. Please wait for the tutor to start it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedLiveClassRoom;
