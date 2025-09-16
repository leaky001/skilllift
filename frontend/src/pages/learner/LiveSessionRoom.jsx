import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash,
  FaDesktop,
  FaComments,
  FaPoll,
  FaUsers,
  FaCog,
  FaTimes,
  FaExpand,
  FaCompress,
  FaShare,
  FaRecordVinyl,
  FaStop,
  FaPlay,
  FaPause,
  FaHandPaper,
  FaHandPaperSlash,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaCrown,
  FaBell,
  FaBellSlash
} from 'react-icons/fa';
import LiveChat from '../../components/LiveChat';
import ScreenSharing from '../../components/ScreenSharing';
import LivePolls from '../../components/LivePolls';
import { showError, showSuccess } from '../../services/toastService.jsx';
import { getLiveSessionDetails, markAttendance } from '../../services/liveClassService';

const LiveSessionRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('learner'); // 'tutor' or 'learner'
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Media controls
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'polls', 'participants'
  const [showSettings, setShowSettings] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Session data
  const [participants, setParticipants] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    loadSessionDetails();
    startSessionTimer();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await getLiveSessionDetails(sessionId);
      if (response.success) {
        setSession(response.data);
        setIsActive(response.data.status === 'live');
      } else {
        showError('Failed to load session details');
        navigate('/learner/live-classes');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      showError('Error loading session details');
      navigate('/learner/live-classes');
    } finally {
      setLoading(false);
    }
  };

  const startSessionTimer = () => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleJoinSession = async () => {
    try {
      await markAttendance(sessionId, 'join');
      showSuccess('Successfully joined the session!');
    } catch (error) {
      console.error('Error joining session:', error);
      showError('Failed to join session');
    }
  };

  const handleLeaveSession = async () => {
    try {
      await markAttendance(sessionId, 'leave');
      showSuccess('Session left successfully');
      navigate('/learner/live-classes');
    } catch (error) {
      console.error('Error leaving session:', error);
      showError('Failed to leave session');
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    showSuccess(videoEnabled ? 'Video disabled' : 'Video enabled');
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    showSuccess(audioEnabled ? 'Audio disabled' : 'Audio enabled');
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    showSuccess(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started');
  };

  const toggleRecording = () => {
    if (userRole !== 'tutor') {
      showError('Only tutors can record sessions');
      return;
    }
    setIsRecording(!isRecording);
    showSuccess(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    showSuccess(isHandRaised ? 'Hand lowered' : 'Hand raised');
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    showSuccess(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Session not found</p>
          <button
            onClick={() => navigate('/learner/live-classes')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/learner/live-classes')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
            
            <div>
              <h1 className="text-xl font-semibold">{session.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <FaClock className="text-xs" />
                  <span>{formatTime(sessionTime)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaUsers className="text-xs" />
                  <span>{participants.length} participants</span>
                </span>
                {session.status === 'live' && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-lg transition-colors ${
                notificationsEnabled ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {notificationsEnabled ? <FaBell className="text-sm" /> : <FaBellSlash className="text-sm" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
            >
              {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
            >
              <FaCog className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video/Screen Share Area */}
          <div className="flex-1 bg-black relative">
            {isScreenSharing ? (
              <ScreenSharing 
                sessionId={sessionId} 
                userRole={userRole} 
                isActive={isActive} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <FaVideo className="text-6xl mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No active video stream</p>
                  <p className="text-sm text-gray-500">Tutor will start the session soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Video Toggle */}
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    videoEnabled ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {videoEnabled ? <FaVideo className="text-lg" /> : <FaVideoSlash className="text-lg" />}
                </button>

                {/* Audio Toggle */}
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    audioEnabled ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {audioEnabled ? <FaMicrophone className="text-lg" /> : <FaMicrophoneSlash className="text-lg" />}
                </button>

                {/* Screen Share */}
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full transition-colors ${
                    isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
                  }`}
                >
                  <FaDesktop className="text-lg" />
                </button>

                {/* Hand Raise */}
                <button
                  onClick={toggleHandRaise}
                  className={`p-3 rounded-full transition-colors ${
                    isHandRaised ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-white'
                  }`}
                >
                  {isHandRaised ? <FaHandPaper className="text-lg" /> : <FaHandPaperSlash className="text-lg" />}
                </button>

                {/* Recording (Tutor Only) */}
                {userRole === 'tutor' && (
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
                    }`}
                  >
                    {isRecording ? <FaStop className="text-lg" /> : <FaRecordVinyl className="text-lg" />}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Session Controls */}
                {userRole === 'tutor' && (
                  <div className="flex items-center space-x-2">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                      <FaPlay className="text-sm mr-2" />
                      Start Session
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                      <FaStop className="text-sm mr-2" />
                      End Session
                    </button>
                  </div>
                )}

                {/* Leave Session */}
                <button
                  onClick={handleLeaveSession}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Leave Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FaComments className="inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'polls' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FaPoll className="inline mr-2" />
              Polls
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'participants' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Participants
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <LiveChat 
                sessionId={sessionId} 
                userRole={userRole} 
                isActive={isActive} 
              />
            )}
            
            {activeTab === 'polls' && (
              <div className="h-full overflow-y-auto p-4">
                <LivePolls 
                  sessionId={sessionId} 
                  userRole={userRole} 
                  isActive={isActive} 
                />
              </div>
            )}
            
            {activeTab === 'participants' && (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{participant.name}</span>
                          {participant.role === 'tutor' && (
                            <FaCrown className="text-yellow-500 text-xs" />
                          )}
                          {participant.isHandRaised && (
                            <FaHandPaper className="text-yellow-500 text-xs" />
                          )}
                        </div>
                        <span className="text-gray-400 text-sm">{participant.role}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {participant.isSpeaking && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                        {participant.isMuted && (
                          <FaMicrophoneSlash className="text-red-500 text-xs" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Video Quality</span>
                <select className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Audio Quality</span>
                <select className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Notifications</span>
                <button
                  onClick={toggleNotifications}
                  className={`px-3 py-1 rounded text-sm ${
                    notificationsEnabled ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {notificationsEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionRoom;
