import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaHandPaper, 
  FaComments, 
  FaUsers, 
  FaQuestionCircle,
  FaPaperPlane,
  FaTimes,
  FaShare,
  FaStop,
  FaRecordVinyl,
  FaCog,
  FaExpand,
  FaCompress,
  FaDesktop,
  FaUserPlus,
  FaUserMinus,
  FaVolumeUp,
  FaVolumeMute,
  FaPhoneSlash
} from 'react-icons/fa';
import { showSuccess, showError } from '../services/toastService.jsx';
import { apiService } from '../services/api';
import websocketService from '../services/websocketService';
import webrtcService from '../services/webrtcService';
import { useAuth } from '../context/AuthContext';
import '../styles/EnhancedVideoChat.css';

const EnhancedVideoChat = ({ classId, isHost = false }) => {
  const { user, token } = useAuth();
  
  // Refs
  const localVideoRef = useRef(null);
  const videoGridRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // State
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('video');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video layout states
  const [videoLayout, setVideoLayout] = useState('grid'); // 'grid', 'speaker', 'spotlight'
  const [speakerView, setSpeakerView] = useState(null); // ID of speaker in speaker view
  
  // Initialize video chat
  useEffect(() => {
    initializeVideoChat();
    return () => {
      cleanup();
    };
  }, [classId]);

  const initializeVideoChat = async () => {
    try {
      setIsLoading(true);
      console.log('🎥 Initializing video chat:', { classId, isHost, userName: user.name, userId: user._id });
      
      // Connect to WebSocket
      if (!websocketService.isConnected) {
        console.log('🔌 Connecting to WebSocket...');
        await websocketService.connect(token);
        console.log('✅ WebSocket connected');
      } else {
        console.log('✅ WebSocket already connected');
      }
      
      // Join the live class room
      console.log('🚪 Joining live class room:', classId);
      websocketService.socket.emit('join-live-class', { 
        classId, 
        userId: user._id, 
        userName: user.name,
        userRole: user.role 
      });
      console.log('📤 Join live class event sent');
      
      // Initialize WebRTC service
      console.log('🎬 Initializing WebRTC service...');
      await webrtcService.initialize(
        websocketService.socket, 
        classId, 
        user._id, 
        isHost
      );
      console.log('✅ WebRTC service initialized');
      
      // Setup WebRTC event handlers
      setupWebRTCHandlers();
      
      // Setup WebSocket event handlers
      setupWebSocketHandlers();
      
      setIsLoading(false);
      showSuccess('Video chat initialized successfully!');
      console.log('🎉 Video chat initialization complete');
      
    } catch (error) {
      console.error('❌ Error initializing video chat:', error);
      setError('Failed to initialize video chat: ' + error.message);
      setIsLoading(false);
    }
  };

  const setupWebRTCHandlers = () => {
    // Handle local stream
    webrtcService.onLocalStream = (stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    // Handle remote streams
    webrtcService.onRemoteStream = (participantId, stream) => {
      setParticipants(prev => {
        const updated = prev.map(p => 
          p.id === participantId 
            ? { ...p, stream, isConnected: true }
            : p
        );
        return updated;
      });
    };

    // Handle participant joined
    webrtcService.onParticipantJoined = (data) => {
      setParticipants(prev => {
        const exists = prev.find(p => p.id === data.userId);
        if (!exists) {
          return [...prev, {
            id: data.userId,
            name: data.userName,
            role: data.userRole,
            stream: null,
            isConnected: false,
            isVideoOn: true,
            isAudioOn: true,
            isHandRaised: false
          }];
        }
        return prev;
      });
    };

    // Handle participant left
    webrtcService.onParticipantLeft = (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
      webrtcService.closePeerConnection(data.userId);
    };

    // Handle errors
    webrtcService.onError = (errorMessage) => {
      showError(errorMessage);
    };
  };

  const setupWebSocketHandlers = () => {
    const socket = websocketService.socket;

    // Handle participants list
    socket.on('participants-list', (participantsList) => {
      console.log('👥 Received participants list:', participantsList);
      console.log('👥 Current user role:', isHost ? 'tutor' : 'learner');
      console.log('👥 Current user ID:', user._id);
      console.log('👥 Participants count:', participantsList.length);
      
      // Filter out the current user from the participants list since they're shown separately
      const otherParticipants = participantsList.filter(p => p.id !== user._id);
      console.log('👥 Other participants:', otherParticipants);
      
      setParticipants(otherParticipants.map(p => ({
        ...p,
        stream: null,
        isConnected: false,
        isVideoOn: true,
        isAudioOn: true,
        isHandRaised: false
      })));
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      setChatMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    // Handle hand raise updates
    socket.on('hand-raise-update', (data) => {
      setParticipants(prev => prev.map(p => 
        p.id === data.userId 
          ? { ...p, isHandRaised: data.isRaised }
          : p
      ));
    });

    // Handle user joined
    socket.on('user-joined', (data) => {
      console.log('🎉 User joined event received:', data);
      console.log('🎉 Current participants before update:', participants.length);
      
      // Don't show notification for self
      if (data.user.id !== user._id) {
        showSuccess(`${data.user.name} joined the class`);
      }
      
      // Add the new participant to the list (excluding self)
      setParticipants(prev => {
        const exists = prev.find(p => p.id === data.user.id);
        if (!exists && data.user.id !== user._id) {
          console.log('🎉 Adding new participant:', data.user);
          return [...prev, {
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
            stream: null,
            isConnected: false,
            isVideoOn: true,
            isAudioOn: true,
            isHandRaised: false
          }];
        }
        console.log('🎉 Participant already exists or is self, not adding');
        return prev;
      });
    });

    // Handle user left
    socket.on('user-left', (data) => {
      console.log('👋 User left event received:', data);
      
      // Don't show notification for self
      if (data.userId !== user._id) {
        showSuccess(`${data.userName} left the class`);
      }
      
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
    });
  };

  // Video controls
  const toggleVideo = () => {
    const newState = webrtcService.toggleVideo();
    setIsVideoOn(newState);
  };

  const toggleAudio = () => {
    const newState = webrtcService.toggleAudio();
    setIsAudioOn(newState);
  };

  const toggleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    
    websocketService.socket.emit('hand-raise', {
      classId,
      isRaised: newState
    });
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webrtcService.stopScreenShare();
        setIsScreenSharing(false);
        showSuccess('Screen sharing stopped');
      } else {
        await webrtcService.startScreenShare();
        setIsScreenSharing(true);
        showSuccess('Screen sharing started');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      showError('Failed to toggle screen sharing');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    showSuccess(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Chat functions
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      classId,
      content: newMessage.trim(),
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role,
      timestamp: new Date().toISOString()
    };

    websocketService.socket.emit('chat-message', messageData);
    setNewMessage('');
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Layout functions
  const switchToSpeakerView = (participantId) => {
    setVideoLayout('speaker');
    setSpeakerView(participantId);
  };

  const switchToGridView = () => {
    setVideoLayout('grid');
    setSpeakerView(null);
  };

  const spotlightParticipant = (participantId) => {
    setVideoLayout('spotlight');
    setSpeakerView(participantId);
  };

  // Cleanup
  const cleanup = () => {
    webrtcService.cleanup();
    if (websocketService.socket) {
      websocketService.socket.emit('leave-live-class', { classId });
    }
  };

  // Render video grid
  const renderVideoGrid = () => {
    const allParticipants = [
      {
        id: user._id,
        name: user.name,
        role: user.role,
        stream: webrtcService.localStream,
        isLocal: true,
        isVideoOn,
        isAudioOn
      },
      ...participants.map(p => ({
        ...p,
        isLocal: false
      }))
    ];

    if (videoLayout === 'speaker' && speakerView) {
      const speaker = allParticipants.find(p => p.id === speakerView);
      const others = allParticipants.filter(p => p.id !== speakerView);
      
      return (
        <div className="speaker-layout">
          <div className="main-speaker">
            <video
              ref={speaker?.isLocal ? localVideoRef : null}
              autoPlay
              muted={speaker?.isLocal}
              className="main-video"
            />
            <div className="speaker-info">
              <span className="speaker-name">{speaker?.name}</span>
              {speaker?.isHandRaised && <FaHandPaper className="hand-icon" />}
            </div>
          </div>
          <div className="other-participants">
            {others.map(participant => (
              <div key={participant.id} className="participant-tile">
                <video
                  autoPlay
                  muted={participant.isLocal}
                  className="participant-video"
                />
                <div className="participant-info">
                  <span>{participant.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="video-grid">
        {allParticipants.map(participant => (
          <div key={participant.id} className="video-tile">
            <video
              ref={participant.isLocal ? localVideoRef : null}
              autoPlay
              muted={participant.isLocal}
              className="participant-video"
              onClick={() => switchToSpeakerView(participant.id)}
            />
            <div className="participant-overlay">
              <div className="participant-info">
                <span className="participant-name">{participant.name}</span>
                <div className="participant-controls">
                  {!participant.isVideoOn && <FaVideoSlash />}
                  {!participant.isAudioOn && <FaMicrophoneSlash />}
                  {participant.isHandRaised && <FaHandPaper className="hand-icon" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Initializing video chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`enhanced-video-chat ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Main Video Area */}
      <div className="video-container">
        {renderVideoGrid()}
        
        {/* Video Controls Overlay */}
        <div className="video-controls-overlay">
          <div className="controls-left">
            <button
              onClick={toggleVideo}
              className={`control-btn ${!isVideoOn ? 'disabled' : ''}`}
            >
              {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
            <button
              onClick={toggleAudio}
              className={`control-btn ${!isAudioOn ? 'disabled' : ''}`}
            >
              {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button
              onClick={toggleScreenShare}
              className={`control-btn ${isScreenSharing ? 'active' : ''}`}
            >
              <FaDesktop />
            </button>
          </div>
          
          <div className="controls-center">
            <button
              onClick={toggleHandRaise}
              className={`control-btn ${isHandRaised ? 'active' : ''}`}
            >
              <FaHandPaper />
            </button>
            {isHost && (
              <button
                onClick={toggleRecording}
                className={`control-btn ${isRecording ? 'active' : ''}`}
              >
                <FaRecordVinyl />
              </button>
            )}
          </div>
          
          <div className="controls-right">
            <button
              onClick={toggleFullscreen}
              className="control-btn"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="control-btn"
            >
              <FaCog />
            </button>
            <button
              onClick={cleanup}
              className="control-btn leave-btn"
            >
              <FaPhoneSlash />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="chat-sidebar">
        {/* Tabs */}
        <div className="sidebar-tabs">
          <button
            onClick={() => setActiveTab('video')}
            className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
          >
            <FaUsers /> Participants ({participants.length + 1})
            {process.env.NODE_ENV === 'development' && (
              <span className="text-xs ml-1">({participants.length} others)</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <FaComments /> Chat
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          >
            <FaQuestionCircle /> Q&A
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'video' && (
            <div className="participants-list">
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Total participants: {participants.length + 1}</p>
                  <p>Current user: {user.name} ({user._id})</p>
                  <p>Is Host: {isHost ? 'Yes' : 'No'}</p>
                  <p><strong>Participants Array:</strong></p>
                  <pre className="text-xs overflow-auto max-h-20">
                    {JSON.stringify(participants, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="participant-item local">
                <div className="participant-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="participant-details">
                  <span className="participant-name">{user.name} (You)</span>
                  <div className="participant-status">
                    {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                    {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  </div>
                </div>
              </div>
              
              {participants.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p>No other participants yet</p>
                  <p className="text-xs">Waiting for others to join...</p>
                </div>
              ) : (
                participants.map((participant, index) => (
                    <div key={participant.id} className="participant-item">
                      <div className="participant-avatar">
                        {(participant.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="participant-details">
                        <span className="participant-name">{participant.name || 'Unknown User'}</span>
                        <div className="participant-status">
                          {participant.isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                          {participant.isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                          {participant.isHandRaised && <FaHandPaper className="hand-icon" />}
                        </div>
                      </div>
                      {isHost && (
                        <div className="participant-actions">
                          <button
                            onClick={() => spotlightParticipant(participant.id)}
                            className="action-btn"
                            title="Spotlight"
                          >
                            <FaShare />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((message, index) => (
                  <div key={index} className="chat-message">
                    <div className="message-header">
                      <span className="sender-name">{message.senderName}</span>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button
                  onClick={sendMessage}
                  className="send-btn"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="questions-container">
              <p className="text-center text-gray-500">
                Q&A feature coming soon...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-modal"
          >
            <div className="settings-content">
              <h3>Settings</h3>
              <div className="settings-section">
                <label>Video Layout</label>
                <div className="layout-options">
                  <button
                    onClick={switchToGridView}
                    className={`layout-btn ${videoLayout === 'grid' ? 'active' : ''}`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setVideoLayout('speaker')}
                    className={`layout-btn ${videoLayout === 'speaker' ? 'active' : ''}`}
                  >
                    Speaker View
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedVideoChat;
