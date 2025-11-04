import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlay, FaVideo, FaClock, FaUser, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import apiService from '../../services/api';

const LearnerLiveClassDashboard = ({ courseId, courseTitle }) => {
  const { user, getToken } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [replayClasses, setReplayClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    getCurrentSession();
    getReplayClasses();
    
    // Connect to WebSocket for real-time updates
    const token = getToken();
    if (token) {
      const socket = socketService.connect(token);
      
      if (socket) {
        // Listen for live class started notifications
        socket.on('notification', (notification) => {
          console.log('🔔 Received notification:', notification);
          
          if (notification.type === 'live_class_started' && 
              notification.data && 
              notification.data.courseId === courseId) {
            console.log('🎯 Live class started notification received!');
            toast.success('Live class has started!');
            
            // Refresh session data immediately
            getCurrentSession();
          }
        });
        
        // Listen for live class ended notifications
        socket.on('live_class_ended', (data) => {
          console.log('🔔 Live class ended:', data);
          if (data.courseId === courseId) {
            toast.info('Live class has ended');
            setCurrentSession(null);
            setJustCompleted(true);
            // Begin polling replays immediately after completion
            getReplayClasses();
          }
        });

        // Listen for when replay becomes available
        socket.on('notification', (notification) => {
          if (notification?.type === 'replay_ready' &&
              notification?.data?.courseId === courseId) {
            toast.success('Replay is ready!');
            getReplayClasses();
            setJustCompleted(false);
          }
        });
      }
    }
    
    // Poll for session updates every 3 seconds to detect Google Meet session end quickly
    const pollInterval = setInterval(() => {
      getCurrentSession();
    }, 3000);
    
    // Cleanup interval and socket on unmount
    return () => {
      clearInterval(pollInterval);
      socketService.disconnect();
    };
  }, [courseId]);

  const getCurrentSession = async () => {
    try {
      setIsCheckingSession(true);
      console.log('🔍 Checking for active session for course:', courseId);
      
      const response = await apiService.get(`/google-meet/live/current/${courseId}`);
      const data = response.data;
      
      console.log('📡 Session check response:', data);
      
      if (data.status === 'active') {
        console.log('✅ Active session found:', data.session);
        setCurrentSession(data.session);
      } else if (data.status === 'ended') {
        console.log('🔚 Session ended:', data.session);
        setCurrentSession(null);
        setJustCompleted(true);
        toast.info('Live class has ended');
        // Refresh replays to show the new recording
        getReplayClasses();
      } else {
        console.log('ℹ️ No active session found');
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('❌ Error getting current session:', error);
      console.error('❌ Error response:', error.response?.data);
      setCurrentSession(null);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const getReplayClasses = async () => {
    try {
      const response = await apiService.get(`/google-meet/live/replays/${courseId}`);
      const data = response.data;
      
      if (data.success) {
        setReplayClasses(data.replays);
      }
    } catch (error) {
      console.error('Error getting replay classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinLiveClass = () => {
    if (currentSession?.meetLink) {
      window.open(currentSession.meetLink, '_blank');
    }
  };

  const watchReplay = (recordingUrl) => {
    window.open(recordingUrl, '_blank');
  };

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Current Live Session */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Live Class</h2>
          <div className="flex items-center space-x-2">
            <FaVideo className="text-blue-500" />
            <span className="text-sm text-gray-600">{courseTitle}</span>
          </div>
        </div>

        {currentSession ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 rounded-full p-3">
                  <FaPlay className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 text-lg">Live Class in Progress</h3>
                  <p className="text-sm text-green-700">
                    Hosted by {currentSession.tutorName}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <FaClock className="text-green-600" />
                      <span className="text-sm text-green-700">
                        Started {new Date(currentSession.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaUser className="text-green-600" />
                      <span className="text-sm text-green-700">Your Tutor</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={joinLiveClass}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FaPlay />
                <span>Join Live Class</span>
                <FaExternalLinkAlt className="text-sm" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {isCheckingSession ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <FaClock className="text-gray-400 text-2xl" />
              )}
              <h3 className="text-xl font-medium text-gray-600">
                {isCheckingSession
                  ? 'Checking for updates...'
                  : justCompleted
                    ? 'Class completed — processing replay'
                    : 'Waiting for Tutor'}
              </h3>
            </div>
            <p className="text-gray-500">
              {isCheckingSession
                ? 'Checking if your tutor has started the live class...'
                : justCompleted
                  ? 'Please wait a moment while we prepare the replay.'
                  : 'Your tutor hasn\'t started the live class yet. You\'ll be notified when it begins.'}
            </p>
            {isCheckingSession && (
              <div className="mt-4 text-sm text-blue-600">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Real-time updates enabled</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Replay Classes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Replay Classes</h2>
          <div className="flex items-center space-x-2">
            <FaVideo className="text-purple-500" />
            <span className="text-sm text-gray-600">Past Recordings</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading replay classes...</span>
          </div>
        ) : replayClasses.length > 0 ? (
          <div className="grid gap-4">
            {replayClasses.map((replay) => (
              <div
                key={replay.sessionId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <FaVideo className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Live Class Recording
                      </h3>
                      <p className="text-sm text-gray-600">
                        Hosted by {replay.tutorName}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <FaClock className="text-gray-400 text-xs" />
                          <span className="text-xs text-gray-500">
                            {new Date(replay.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaVideo className="text-gray-400 text-xs" />
                          <span className="text-xs text-gray-500">
                            {formatDuration(replay.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => watchReplay(replay.recordingUrl)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <FaPlay />
                    <span>Watch Replay</span>
                    <FaExternalLinkAlt className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaVideo className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Replay Classes Yet</h3>
            <p className="text-gray-500">
              Replay classes will appear here after your tutor records live sessions.
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You'll receive a notification when your tutor starts a live class</li>
          <li>• Click "Join Live Class" to open the Google Meet session</li>
          <li>• Past recordings will be available as "Replay Classes"</li>
          <li>• Make sure you have a stable internet connection for the best experience</li>
        </ul>
      </div>
    </div>
  );
};

export default LearnerLiveClassDashboard;
