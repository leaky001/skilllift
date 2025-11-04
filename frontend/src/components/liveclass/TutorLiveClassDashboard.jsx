import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlay, FaStop, FaGoogle, FaVideo, FaClock, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import socketService from '../../services/socketService';

const TutorLiveClassDashboard = ({ courseId, courseTitle }) => {
  const { user, getToken } = useAuth();
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [customMeetLink, setCustomMeetLink] = useState('');
  const [useCustomLink, setUseCustomLink] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    checkGoogleConnection();
    getCurrentSession();
    
    // Poll for session updates every 3 seconds to detect Google Meet session end quickly
    const pollInterval = setInterval(() => {
      getCurrentSession();
    }, 3000);
    
    // Listen for WebSocket notifications
    const token = getToken();
    if (token) {
      const socket = socketService.connect(token);
      
      if (socket) {
        // Listen for live class ended notifications
        socket.on('notification', (notification) => {
          console.log('🔔 Tutor received notification:', notification);
          
          if (notification.type === 'live_class_ended' && 
              notification.data && 
              notification.data.courseId === courseId) {
            console.log('🎯 Live class auto-ended notification received!');
            toast.info('Live class has ended automatically');
            setCurrentSession(null);
            setIsCompleted(true);
            
            // Refresh to show completed state
            getCurrentSession();
          }
        });
      }
    }
    
    return () => {
      clearInterval(pollInterval);
      socketService.disconnect();
    };
  }, [courseId]);

  const checkGoogleConnection = async () => {
    try {
      const response = await apiService.get('/auth/profile');
      const data = response.data;
      console.log('🔍 Profile data:', data);
      console.log('🔍 User object:', data.data);
      console.log('🔍 Google tokens:', data.data?.googleTokens);
      
      // Check if user and googleTokens exist
      if (data.data && data.data.googleTokens && data.data.googleTokens.accessToken) {
        setIsGoogleConnected(true);
        console.log('✅ Google connection found');
      } else {
        setIsGoogleConnected(false);
        console.log('❌ No Google connection found');
        console.log('❌ User exists:', !!data.data);
        console.log('❌ GoogleTokens exists:', !!data.data?.googleTokens);
        console.log('❌ AccessToken exists:', !!data.data?.googleTokens?.accessToken);
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setIsGoogleConnected(false);
    }
  };

  const getCurrentSession = async () => {
    try {
      const response = await apiService.get(`/google-meet/live/current/${courseId}`);
      
      console.log('🔍 getCurrentSession response:', response.data);
      
      if (response.data.status === 'active') {
        setCurrentSession(response.data.session);
        setIsCompleted(false); // Reset completed state when active
        // Clear any stored completion state
        localStorage.removeItem(`liveClass_completed_${courseId}`);
      } else if (response.data.status === 'ended') {
        console.log('🔚 Session auto-ended:', response.data.session);
        setCurrentSession(null);
        setIsCompleted(true);
        
        // Store completion state
        const completionData = {
          courseId,
          completedAt: new Date().toISOString(),
          sessionId: response.data.session?.sessionId
        };
        localStorage.setItem(`liveClass_completed_${courseId}`, JSON.stringify(completionData));
        
        toast.info('Live class has ended automatically');
      } else if (response.data.status === 'no_session') {
        // Check if there's a recently completed session (within last 5 minutes)
        if (response.data.recentlyCompleted) {
          console.log('🎯 Recently completed session detected from backend');
          setCurrentSession(null);
          setIsCompleted(true);
          
          // Store completion state
          const completionData = {
            courseId,
            completedAt: response.data.lastSession?.endTime || new Date().toISOString(),
            sessionId: response.data.lastSession?.sessionId
          };
          localStorage.setItem(`liveClass_completed_${courseId}`, JSON.stringify(completionData));
        } else {
          // Check localStorage for recent completion (within 5 minutes)
          const storedCompletion = localStorage.getItem(`liveClass_completed_${courseId}`);
          if (storedCompletion) {
            const completionData = JSON.parse(storedCompletion);
            const completedTime = new Date(completionData.completedAt);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            
            if (completedTime >= fiveMinutesAgo) {
              console.log('🎯 Recently completed session detected from localStorage');
              setCurrentSession(null);
              setIsCompleted(true);
              return; // Keep showing completed state
            } else {
              // Older than 5 minutes, remove from localStorage
              localStorage.removeItem(`liveClass_completed_${courseId}`);
            }
          }
          
          setCurrentSession(null);
          setIsCompleted(false);
        }
      } else {
        setCurrentSession(null);
        
        // Check localStorage before resetting
        const storedCompletion = localStorage.getItem(`liveClass_completed_${courseId}`);
        if (storedCompletion) {
          const completionData = JSON.parse(storedCompletion);
          const completedTime = new Date(completionData.completedAt);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          
          if (completedTime >= fiveMinutesAgo) {
            console.log('🎯 Keeping completed state from localStorage');
            setIsCompleted(true);
            return;
          } else {
            localStorage.removeItem(`liveClass_completed_${courseId}`);
          }
        }
        
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('Error getting current session:', error);
      setCurrentSession(null);
      // Don't reset isCompleted on error - might be temporary network issue
    }
  };

  const connectGoogleAccount = async () => {
    try {
      const response = await apiService.get('/google-meet/auth/google/url');
      const data = response.data;
      
      // Open Google OAuth in popup
      const popup = window.open(
        data.authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkClosed);
            console.log('🔄 OAuth popup closed, checking connection...');
            checkGoogleConnection();
          }
        } catch (error) {
          // Handle Cross-Origin-Opener-Policy errors
          console.log('🔄 Popup check blocked by CORS policy, checking connection anyway...');
          clearInterval(checkClosed);
          setTimeout(() => {
            checkGoogleConnection();
          }, 2000);
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting Google account:', error);
      toast.error('Failed to connect Google account');
    }
  };

  const startLiveClass = async () => {
    if (!isGoogleConnected && !useCustomLink) {
      toast.error('Please connect your Google account or provide a custom Meet link');
      return;
    }

    if (useCustomLink && !customMeetLink.trim()) {
      toast.error('Please provide a valid Meet link');
      return;
    }

    setIsStarting(true);
    try {
      console.log('🤖 Starting live class - automated bot will handle recording');
      console.log('🔍 Frontend: About to make request to /google-meet/live/start');
      console.log('🔍 Frontend: Request data:', { courseId, customMeetLink: useCustomLink ? customMeetLink : null });
      console.log('🔍 Frontend: User info:', { 
        userId: user?._id, 
        userRole: user?.role, 
        userName: user?.name,
        isGoogleConnected,
        useCustomLink
      });
      console.log('🔍 Frontend: Course ID type:', typeof courseId);
      console.log('🔍 Frontend: Course ID value:', courseId);
      console.log('🔍 Frontend: Course ID length:', courseId?.length);
      
      const response = await apiService.post('/google-meet/live/start', {
        courseId,
        customMeetLink: useCustomLink ? customMeetLink : null
      });

      console.log('🔍 Frontend: Response received:', response);
      console.log('🔍 Frontend: Response status:', response.status);
      console.log('🔍 Frontend: Response data:', response.data);

      if (response.data.success) {
        setCurrentSession(response.data.session);
        
        // Check if it's an existing session
        if (response.data.message === 'Live class is already active') {
          toast.success('Live class is already active! Opening existing session...');
        } else {
          toast.success('🤖 Live class started! Automated recording bot is running...');
        }
        
        // Open Meet link in new tab
        window.open(response.data.session.meetLink, '_blank');
      } else {
        console.log('❌ Frontend: Response indicates failure:', response.data);
        toast.error(response.data.error || 'Failed to start live class');
      }
    } catch (error) {
      console.error('Error starting live class:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // More specific error messages
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || error.response.data?.details || 'Invalid request';
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to start live classes for this course.');
      } else if (error.response?.status === 404) {
        toast.error('Course not found. Please refresh and try again.');
      } else if (error.response?.status === 500) {
        const errorMessage = error.response.data?.error || 'Server error occurred';
        toast.error(`Server error: ${errorMessage}`);
      } else if (error.response?.status === 503) {
        toast.error('Service temporarily unavailable. Please try again in a few moments.');
      } else {
        toast.error('Failed to start live class. Please check your connection and try again.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const clearActiveSession = async () => {
    try {
      console.log('🔍 Clearing active session...');
      const response = await apiService.post('/google-meet/live/end', {
        sessionId: currentSession.sessionId
      });
      
      if (response.data.success) {
        setCurrentSession(null);
        toast.success('Active session cleared. You can now start a new live class.');
      }
    } catch (error) {
      console.error('Error clearing session:', error);
      toast.error('Failed to clear session');
    }
  };

  const disconnectGoogleAccount = async () => {
    try {
      console.log('🔍 Disconnecting Google account...');
      
      // Call backend to remove Google tokens
      const response = await apiService.post('/google-meet/auth/disconnect');
      
      if (response.data.success) {
        setIsGoogleConnected(false);
        toast.success('Google account disconnected successfully!');
      }
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
      toast.error('Failed to disconnect Google account');
    }
  };

  const endLiveClass = async () => {
    if (!currentSession) return;

    try {
      console.log('🔍 Ending live class for user:', user);
      console.log('🔍 User role:', user?.role);
      console.log('🔍 Session ID:', currentSession.sessionId);
      
      const response = await apiService.post('/google-meet/live/end', {
        sessionId: currentSession.sessionId
      });

      const data = response.data;

      if (data.success) {
        console.log('✅ Live class ended successfully');
        setCurrentSession(null);
        setIsCompleted(true);
        
        // Store completion state in localStorage with timestamp
        const completionData = {
          courseId,
          completedAt: new Date().toISOString(),
          sessionId: currentSession.sessionId
        };
        localStorage.setItem(`liveClass_completed_${courseId}`, JSON.stringify(completionData));
        
        toast.success('🤖 Live class ended! Recording is being saved and will be available in Replay section soon!');
        
        // Force a session check after 1 second to confirm the ended state
        setTimeout(() => {
          getCurrentSession();
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to end live class');
      }
    } catch (error) {
      console.error('Error ending live class:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to end this live class.');
      } else {
        toast.error('Failed to end live class');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Live Class Management</h2>
        <div className="flex items-center space-x-2">
          <FaVideo className="text-blue-500" />
          <span className="text-sm text-gray-600">{courseTitle}</span>
        </div>
      </div>

      {/* Google Account Connection */}
      {!isGoogleConnected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaGoogle className="text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Connect Google Account</h3>
                <p className="text-sm text-yellow-700">
                  Connect your Google account to enable automated recording bot
                </p>
              </div>
            </div>
            <button
              onClick={connectGoogleAccount}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Connect Google
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaGoogle className="text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">✅ Google Account Connected</h3>
                <p className="text-sm text-green-700">
                  Automated recording bot is ready! Recordings will be saved locally and available in Replay section.
                </p>
              </div>
            </div>
            <button
              onClick={disconnectGoogleAccount}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect Google
            </button>
          </div>
        </div>
      )}

      {/* Current Session Status */}
      {currentSession ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 rounded-full p-2">
                <FaPlay className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">🤖 Live Class Active (Bot Recording)</h3>
                <p className="text-sm text-green-700">
                  Started at {new Date(currentSession.startTime).toLocaleString()}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <FaUsers className="text-green-600" />
                    <span className="text-sm text-green-700">
                      {currentSession.enrolledLearners} learners enrolled
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaClock className="text-green-600" />
                    <span className="text-sm text-green-700">
                      {Math.floor((Date.now() - new Date(currentSession.startTime)) / 60000)} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <a
                href={currentSession.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Join Meeting
              </a>
              <button
                onClick={clearActiveSession}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Clear Session
              </button>
              <button
                onClick={endLiveClass}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaStop className="inline mr-2" />
                End Class
              </button>
            </div>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500 rounded-full p-2">
                <FaVideo className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-800">🤖 Live Class Completed</h3>
                <p className="text-sm text-purple-700">
                  Recording saved successfully! It's now available in the Replay section for your learners to watch.
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <FaClock className="text-purple-600" />
                    <span className="text-sm text-purple-700">
                      Completed at {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentSession(null);
                  // Clear localStorage
                  localStorage.removeItem(`liveClass_completed_${courseId}`);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start New Class
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Start New Session */
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-4">Start New Live Class</h3>
          
          {/* Custom Meet Link Option */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useCustomLink}
                onChange={(e) => setUseCustomLink(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Use custom Google Meet link</span>
            </label>
          </div>

          {useCustomLink && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Meet Link
              </label>
              <input
                type="url"
                value={customMeetLink}
                onChange={(e) => setCustomMeetLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={startLiveClass}
            disabled={isStarting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Starting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FaPlay />
                <span>🤖 Start Live Class (Auto-Record)</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">🤖 Automated Recording Bot:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• ✅ Connect your Google account for automatic recording</li>
          <li>• ✅ Bot automatically joins your Google Meet</li>
          <li>• ✅ Records in HD (1920x1080, 30fps)</li>
          <li>• ✅ Automatically saves to Replay section when class ends</li>
          <li>• ✅ Learners get notified and can watch immediately</li>
          <li>• ⚡ No manual work required - everything is automated!</li>
        </ul>
      </div>
    </div>
  );
};

export default TutorLiveClassDashboard;
