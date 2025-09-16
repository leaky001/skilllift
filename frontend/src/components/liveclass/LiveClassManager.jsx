import React, { useState, useEffect, useRef } from 'react';

import { 
  FaVideo, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideoSlash,
  FaUsers,
  FaChatBubble,
  FaShare,
  FaRecord,
  FaStop,
  FaPlay,
  FaPause,
  FaDownload,
  FaCog,
  FaBell,
  FaHandPaper,
  FaComments,
  FaFileAlt,
  FaLink,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import apiService from '../../services/api';

const LiveClassManager = ({ 
  classId, 
  userId, 
  isHost = false,
  onSessionEnd 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);

  const [sessionInfo, setSessionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);

  // Zoom SDK integration
  const [zoomClient, setZoomClient] = useState(null);
  const [meetingNumber, setMeetingNumber] = useState('');

  useEffect(() => {
    initializeSession();
    return () => {
      cleanupSession();
    };
  }, [classId]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      
      // Get session details
      const response = await apiService.get(`/classes/${classId}`);
      if (response.data.success) {
        setSessionInfo(response.data.data);
        setMeetingNumber(response.data.data.meetingId);
        
        // Initialize Zoom client
        await initializeZoomClient();
      }
    } catch (error) {
      console.error('Error initializing session:', error);
              showError('Failed to initialize live session');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeZoomClient = async () => {
    try {
      // Load Zoom Web SDK
      const ZoomMtg = window.ZoomMtg;
      
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();
      
      // Set language
      ZoomMtg.i18n.load('en-US');
      ZoomMtg.i18n.reload('en-US');

      // Set up event handlers
      ZoomMtg.inMeetingServiceListener('onUserJoin', handleUserJoin);
      ZoomMtg.inMeetingServiceListener('onUserLeave', handleUserLeave);
      ZoomMtg.inMeetingServiceListener('onChatMessage', handleChatMessage);
      ZoomMtg.inMeetingServiceListener('onRecordingChange', handleRecordingChange);

      setZoomClient(ZoomMtg);
    } catch (error) {
      console.error('Error initializing Zoom client:', error);
              showError('Failed to initialize video client');
    }
  };

  const joinMeeting = async () => {
    try {
      if (!zoomClient) {
        showError('Video client not initialized');
        return;
      }

      const signature = await generateSignature();
      
      zoomClient.init({
        leaveUrl: window.location.origin,
        success: () => {
          zoomClient.join({
            signature: signature,
            meetingNumber: meetingNumber,
            userName: sessionInfo?.userName || 'User',
            apiKey: process.env.REACT_APP_ZOOM_API_KEY,
            passWord: sessionInfo?.password || '',
            role: isHost ? 1 : 0, // 1 for host, 0 for attendee
            success: (success) => {
              console.log('Joined meeting successfully:', success);
              setIsConnected(true);
              showSuccess('🎥 Joined live session successfully!');
            },
            error: (error) => {
              console.error('Failed to join meeting:', error);
              showError('Failed to join live session');
            }
          });
        },
        error: (error) => {
          console.error('Failed to initialize meeting:', error);
          showError('Failed to initialize meeting');
        }
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
              showError('Failed to join meeting');
    }
  };

  const generateSignature = async () => {
    try {
      const response = await apiService.post('/classes/generate-signature', {
        meetingNumber,
        role: isHost ? 1 : 0
      });
      return response.data.signature;
    } catch (error) {
      console.error('Error generating signature:', error);
      throw new Error('Failed to generate meeting signature');
    }
  };

  const leaveMeeting = () => {
    if (zoomClient) {
      zoomClient.leaveMeeting();
      setIsConnected(false);
              showInfo('👋 Left the live session');
      onSessionEnd?.();
    }
  };

  const toggleMute = () => {
    if (zoomClient) {
      if (isMuted) {
        zoomClient.unmute();
        setIsMuted(false);
        showInfo('🔊 Microphone unmuted');
      } else {
        zoomClient.mute();
        setIsMuted(true);
        showInfo('🔇 Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (zoomClient) {
      if (isVideoOn) {
        zoomClient.stopVideo();
        setIsVideoOn(false);
        showInfo('📹 Video turned off');
      } else {
        zoomClient.startVideo();
        setIsVideoOn(true);
        showInfo('📹 Video turned on');
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await zoomClient.stopShareScreen();
        setIsScreenSharing(false);
        showInfo('🖥️ Screen sharing stopped');
      } else {
        await zoomClient.shareScreen();
        setIsScreenSharing(true);
        showInfo('🖥️ Screen sharing started');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
              showError('Failed to toggle screen sharing');
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isHost) {
        showError('Only hosts can control recording');
        return;
      }

      if (isRecording) {
        await zoomClient.stopRecording();
        setIsRecording(false);
        showInfo('⏹️ Recording stopped');
      } else {
        await zoomClient.startRecording();
        setIsRecording(true);
        showInfo('⏺️ Recording started');
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
             showError('Failed to toggle recording');
    }
  };

  const raiseHand = () => {
    // Implement raise hand functionality
         showInfo('✋ Hand raised');
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        classId,
        userId,
        message: newMessage,
        timestamp: new Date().toISOString()
      };

      // Send to backend
      await apiService.post('/classes/chat', messageData);

      // Add to local state
      setChatMessages(prev => [...prev, {
        ...messageData,
        userName: sessionInfo?.userName || 'You'
      }]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
             showError('Failed to send message');
    }
  };

  // Event handlers
  const handleUserJoin = (data) => {
    setParticipants(prev => [...prev, data]);
         showInfo(`👋 ${data.userName} joined the session`);
  };

  const handleUserLeave = (data) => {
    setParticipants(prev => prev.filter(p => p.userId !== data.userId));
         showInfo(`👋 ${data.userName} left the session`);
  };

  const handleChatMessage = (data) => {
    setChatMessages(prev => [...prev, data]);
  };

  const handleRecordingChange = (data) => {
    setIsRecording(data.isRecording);
  };

  const cleanupSession = () => {
    if (zoomClient && isConnected) {
      zoomClient.leaveMeeting();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            {sessionInfo?.title || 'Live Session'}
          </h1>
          <div className="flex items-center space-x-2 text-sm">
            <FaUsers className="text-gray-400" />
            <span>{participants.length + 1} participants</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isHost && (
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? <FaStop /> : <FaRecord />}
            </button>
          )}
          
          <button
            onClick={leaveMeeting}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
            title="Leave Session"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {!isConnected ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white">
                <FaVideo className="text-6xl mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-semibold mb-2">Join Live Session</h2>
                <p className="text-gray-400 mb-6">
                  Click the button below to join the live class
                </p>
                <button
                  onClick={joinMeeting}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Join Session
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full relative">
              {/* Main Video */}
              <div className="h-full bg-black">
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                />
              </div>
              
              {/* Local Video */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>

              {/* Screen Share */}
              {isScreenSharing && (
                <div className="absolute top-4 left-4 w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-primary-500">
                  <video
                    ref={screenShareRef}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                  />
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    Screen Share
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setShowChat(true)}
              className={`flex-1 p-3 text-sm font-medium transition-colors ${
                showChat 
                  ? 'text-white border-b-2 border-primary-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaChatBubble className="inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setShowChat(false)}
              className={`flex-1 p-3 text-sm font-medium transition-colors ${
                !showChat 
                  ? 'text-white border-b-2 border-primary-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Participants
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showChat ? (
              <div className="h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-primary-400">
                        {msg.userName}:
                      </span>
                      <span className="text-white ml-2">{msg.message}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      {participant.userName?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm">{participant.userName}</span>
                    {participant.isHost && (
                      <span className="text-xs bg-primary-500 px-2 py-1 rounded">Host</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      {isConnected && (
        <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              !isVideoOn 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={!isVideoOn ? 'Turn on video' : 'Turn off video'}
          >
            {!isVideoOn ? <FaVideoSlash /> : <FaVideo />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-primary-600 hover:bg-primary-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <FaShare />
          </button>

          <button
            onClick={raiseHand}
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title="Raise hand"
          >
            <FaHandPaper />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors"
            title={showChat ? 'Hide chat' : 'Show chat'}
          >
            <FaComments />
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveClassManager;
