import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaVideo, 
  FaMicrophone, 
  FaHandPaper, 
  FaSignOutAlt, 
  FaUser, 
  FaClock, 
  FaComments, 
  FaQuestionCircle, 
  FaUsers, 
  FaSmile, 
  FaPaperPlane,
  FaGraduationCap,
  FaWifi,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import websocketService from '../../services/websocketService';

const LiveSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Socket.IO connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [messages, setMessages] = useState([
    // Test messages to verify chat is working
    {
      id: 1,
      userName: 'Sarah Johnson',
      message: 'Welcome to the live class!',
      timestamp: new Date(),
      isOwn: false
    },
    {
      id: 2,
      userName: 'You',
      message: 'Hello everyone!',
      timestamp: new Date(),
      isOwn: true
    }
  ]);
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'tutor' },
    { id: 2, name: 'You', role: 'learner' }
  ]);

  // Auto-scroll to bottom of chat
  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const initializeSocket = async () => {
      if (!token) {
        console.log('❌ No token available for Socket.IO connection');
        return;
      }

      try {
        setIsConnecting(true);
        setWsError(null);

        // Connect to Socket.IO
        await websocketService.connect(token);
        
        // Set up event listeners
        websocketService.on('connect', () => {
          console.log('✅ Socket.IO connected in LiveSession');
          setIsConnected(true);
          setIsConnecting(false);
        });

        websocketService.on('disconnect', () => {
          console.log('❌ Socket.IO disconnected in LiveSession');
          setIsConnected(false);
        });

        websocketService.on('error', (error) => {
          console.error('❌ Socket.IO error in LiveSession:', error);
          setWsError(error.message);
          setIsConnecting(false);
        });

        // Listen for live class chat messages
        websocketService.on('live-class-chat', (data) => {
          console.log('💬 Received live class chat message:', data);
          setMessages(prev => [...prev, {
            id: data.id,
            userName: data.senderName,
            message: data.message,
            timestamp: data.timestamp,
            isOwn: data.senderId === user._id
          }]);
        });

        // Join the live class room
        const roomId = sessionId || 'demo_session';
        websocketService.socket.emit('join-live-class', { 
          classId: roomId,
          userId: user._id,
          userName: user.name,
          userRole: user.role 
        });

      } catch (error) {
        console.error('❌ Error initializing Socket.IO:', error);
        setWsError(error.message);
        setIsConnecting(false);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      websocketService.removeAllListeners();
    };
  }, [token, sessionId, user]);

  // Debug Socket.IO connection
  useEffect(() => {
    console.log('🔍 LiveSession Debug:', {
      sessionId,
      isConnected,
      isConnecting,
      wsError,
      messagesCount: messages.length,
      participantsCount: participants.length,
      token: !!token,
      user: !!user
    });
  }, [sessionId, isConnected, isConnecting, wsError, messages, participants, token, user]);

  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        // TODO: Replace with actual API call
        setSessionData({
          title: "React development 101- Live Session",
          tutor: {
            name: "Sarah Johnson",
            role: "Senior Developer",
            avatar: "SJ"
          },
          startTime: "12 mins ago",
          participants: participants.length + 1
        });
      } catch (error) {
        console.error('Error loading session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData(); // Always load session data, not just when sessionId exists
  }, [sessionId, participants.length]);

  const qaMessages = [
    {
      id: 1,
      name: "David Chen",
      question: "How do we handle state management in React?",
      time: "2:30 PM",
      answered: false
    },
    {
      id: 2,
      name: "Lisa Wang",
      question: "What's the difference between useState and useReducer?",
      time: "2:32 PM",
      answered: true
    }
  ];

  const handleSendMessage = () => {
    if (message.trim() && isConnected && websocketService.socket) {
      const roomId = sessionId || 'demo_session';
      
      // Send message via Socket.IO
      websocketService.socket.emit('live-class-chat', {
        classId: roomId,
        message: message.trim(),
        messageType: 'text'
      });
      
      // Add message to local state immediately
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        userName: user.name,
        message: message.trim(),
        timestamp: new Date(),
        isOwn: true
      }]);
      
      setMessage('');
    }
  };

  const handleLeaveSession = () => {
    if (websocketService.socket) {
      const roomId = sessionId || 'demo_session';
      websocketService.socket.emit('leave-live-class', { classId: roomId });
    }
    websocketService.disconnect();
    navigate('/learner/live-classes');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        {/* Left side - Logo and Session Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-gray-900">SkillLift</span>
          </div>
          <div className="text-gray-600">•</div>
          <h1 className="text-lg font-semibold text-gray-900">
            React development 101- Live Session
          </h1>
        </div>

        {/* Right side - Tutor Info and Time */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <FaWifi className="text-sm" />
                <span className="text-sm">Connected</span>
              </div>
            ) : isConnecting ? (
              <div className="flex items-center space-x-1 text-yellow-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                <span className="text-sm">Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <FaExclamationTriangle className="text-sm" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600 text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{sessionData?.tutor?.name || 'Tutor'}</p>
              <p className="text-xs text-gray-500">{sessionData?.tutor?.role || 'Tutor'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <FaClock className="text-sm" />
            <span className="text-sm">{sessionData?.startTime || 'Session'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Video Stream */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Video Stream Area */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full h-full max-w-4xl bg-gray-200 rounded-lg flex flex-col items-center justify-center">
              <FaVideo className="text-6xl text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-600 mb-2">Live Video Stream</p>
              <p className="text-sm text-gray-500">HD Quality. 1080p</p>
            </div>
            
            {/* Leave Class Button */}
            <button 
              onClick={handleLeaveSession}
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Leave Class</span>
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mute Button */}
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <FaMicrophone className="text-lg" />
                </button>

                {/* Video Button */}
                <button 
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full transition-colors ${
                    !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <FaVideo className="text-lg" />
                </button>

                {/* Raise Hand Button */}
                <button 
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`p-3 rounded-full transition-colors ${
                    isHandRaised ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <FaHandPaper className="text-lg" />
                </button>
              </div>

              {/* Participant Count */}
              <div className="text-sm text-gray-600">
                {sessionData?.participants || participants.length + 1} Participants
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat/Q&A/People */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaComments className="text-sm" />
                <span>Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'qa'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaQuestionCircle className="text-sm" />
                <span>Q&A</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'people'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaUsers className="text-sm" />
                <span>People</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                {/* Messages Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaComments className="text-2xl text-primary-600" />
                      </div>
                      <p className="text-lg font-medium mb-2">Welcome to the chat!</p>
                      <p className="text-sm">Start the conversation and connect with your classmates</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isOwn 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium">
                              {msg.userName}
                            </span>
                            <span className="text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        disabled={!isConnected}
                      />
                      {!isConnected && (
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500">Connecting...</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || !isConnected}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <FaPaperPlane className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="p-4 space-y-4">
                {qaMessages.map((qa) => (
                  <div key={qa.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {qa.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {qa.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{qa.question}</p>
                    {qa.answered && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Answered
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'people' && (
              <div className="p-4 space-y-3">
                {participants.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <FaUsers className="text-4xl mx-auto mb-2" />
                    <p>No participants yet</p>
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-600 text-sm" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Message Input (only for chat tab) */}
          {activeTab === 'chat' && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <FaSmile className="text-lg" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="p-2 text-primary-600 hover:text-primary-700"
                >
                  <FaPaperPlane className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
