import React, { useState, useEffect, useRef } from 'react';
import { StreamVideo, StreamVideoClient, Call, CallControls, CallParticipantsList, ParticipantView } from '@stream-io/video-react-sdk';
import { toast } from 'react-toastify';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUsers, FaComments, FaPhoneSlash, FaSpinner } from 'react-icons/fa';

const StreamVideoCall = ({ 
  callId, 
  streamToken, 
  user, 
  isHost = false, 
  onCallEnd 
}) => {
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);

  // Initialize Stream client and call
  useEffect(() => {
    const initializeStream = async () => {
      try {
        console.log('🎥 Initializing Stream video call...', { callId, streamToken, user: user._id, isHost });
        
        // Create Stream client
        const client = new StreamVideoClient({
          apiKey: import.meta.env.VITE_STREAM_API_KEY,
          token: streamToken,
          user: {
            id: user._id.toString(),
            name: user.name,
            image: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
          }
        });

        // Create call
        const streamCall = client.call('default', callId);
        
        // Join the call
        await streamCall.join({ create: true });
        console.log('✅ Joined call successfully');
        
        setCall(streamCall);
        setIsLoading(false);
        
        // Set up event listeners
        setupEventListeners(streamCall);
        
        // Start with camera and microphone enabled
        await startMedia(streamCall);
        
      } catch (error) {
        console.error('❌ Stream initialization failed:', error);
        setError('Failed to initialize video call');
        toast.error('Failed to join video call');
        setIsLoading(false);
      }
    };

    if (callId && streamToken && user) {
      initializeStream();
    }

    return () => {
      if (call) {
        call.leave();
      }
    };
  }, [callId, streamToken, user]);

  // Start media (camera and microphone)
  const startMedia = async (streamCall) => {
    try {
      console.log('🎥 Starting media...');
      
      // Enable camera
      await streamCall.camera.enable();
      console.log('✅ Camera enabled');
      
      // Enable microphone
      await streamCall.microphone.enable();
      console.log('✅ Microphone enabled');
      
      setIsVideoOn(true);
      setIsMuted(false);
      
    } catch (error) {
      console.error('❌ Failed to start media:', error);
      toast.error('Failed to start camera/microphone');
    }
  };

  // Set up event listeners
  const setupEventListeners = (streamCall) => {
    console.log('🎯 Setting up Stream event listeners...');
    
    // Participant events
    streamCall.on('call.session_participant_joined', (event) => {
      console.log('👥 Participant joined:', event.participant);
      updateParticipants(streamCall);
    });

    streamCall.on('call.session_participant_left', (event) => {
      console.log('👥 Participant left:', event.participant);
      updateParticipants(streamCall);
    });

    // Track events
    streamCall.on('call.track_published', (event) => {
      console.log('🎥 Track published:', event);
      updateParticipants(streamCall);
    });

    streamCall.on('call.track_unpublished', (event) => {
      console.log('🎥 Track unpublished:', event);
      updateParticipants(streamCall);
    });

    // Call state updates
    streamCall.on('call.updated', (event) => {
      console.log('🔄 Call updated:', event);
      updateParticipants(streamCall);
    });

    // Initial participant update
    setTimeout(() => {
      updateParticipants(streamCall);
    }, 1000);
  };

  // Update participants list
  const updateParticipants = (streamCall) => {
    try {
      const allParticipants = streamCall.state.participants || [];
      console.log('👥 All participants:', allParticipants);
      
      const participantList = allParticipants.map(participant => ({
        id: participant.user?.id || participant.user_id,
        name: participant.user?.name || participant.name || 'Unknown User',
        isLocal: participant.user?.id === user._id.toString(),
        videoTrack: participant.videoTrack,
        audioTrack: participant.audioTrack,
        isVideoEnabled: participant.videoTrack ? true : false,
        isAudioEnabled: participant.audioTrack ? true : false
      }));
      
      console.log('✅ Updated participant list:', participantList);
      setParticipants(participantList);
      
    } catch (error) {
      console.error('❌ Error updating participants:', error);
    }
  };

  // Control handlers
  const toggleMute = async () => {
    try {
      if (isMuted) {
        await call.microphone.enable();
        setIsMuted(false);
        toast.success('Microphone enabled');
      } else {
        await call.microphone.disable();
        setIsMuted(true);
        toast.success('Microphone muted');
      }
    } catch (error) {
      console.error('❌ Toggle mute failed:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        await call.camera.disable();
        setIsVideoOn(false);
        toast.success('Camera disabled');
      } else {
        await call.camera.enable();
        setIsVideoOn(true);
        toast.success('Camera enabled');
      }
    } catch (error) {
      console.error('❌ Toggle video failed:', error);
      toast.error('Failed to toggle camera');
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (onCallEnd) {
        onCallEnd();
      }
    } catch (error) {
      console.error('❌ Leave call failed:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !call) return;

    try {
      await call.sendReaction({
        type: 'chat_message',
        custom: {
          text: newMessage.trim(),
          senderId: user._id,
          senderName: user.name
        }
      });
      setNewMessage('');
    } catch (error) {
      console.error('❌ Send message failed:', error);
    }
  };

  // Get grid layout based on participant count
  const getGridLayout = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-4 grid-rows-2';
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`grid ${getGridLayout(participants.length)} gap-4 h-full`}>
          {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <ParticipantView
                participant={participant}
                call={call}
                trackType="videoTrack"
                muteAudio={participant.isLocal}
                showParticipantLabel={true}
                showMuteIndicator={true}
                showScreenShareButton={false}
                showCameraButton={false}
                showMicrophoneButton={false}
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {participant.name} {participant.isLocal ? '(You)' : ''}
              </div>
              {participant.isVideoEnabled && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Live
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'} text-white hover:opacity-80 transition-opacity`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-600' : 'bg-red-600'} text-white hover:opacity-80 transition-opacity`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="p-3 rounded-full bg-gray-600 text-white hover:opacity-80 transition-opacity"
          title="Toggle chat"
        >
          <FaComments />
        </button>

        <button
          onClick={handleLeaveCall}
          className="p-3 rounded-full bg-red-600 text-white hover:opacity-80 transition-opacity"
          title="Leave call"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-4 top-4 bottom-20 w-80 bg-gray-800 rounded-lg shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Chat</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.map((message) => (
              <div key={message.id} className="mb-2 text-white text-sm">
                <span className="font-semibold">{message.user?.name}:</span> {message.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendChatMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamVideoCall;
