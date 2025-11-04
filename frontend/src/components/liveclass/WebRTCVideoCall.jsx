import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import AutoRecorder from './AutoRecorder';

// WEBSOCKET-BASED VIDEO CALL - Real participant connection
const WebRTCVideoCall = ({ 
  callId, 
  streamToken, 
  user, 
  isHost = false, 
  onCallEnd,
  sessionId,
  courseId,
  courseTitle 
}) => {
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const videoRefs = useRef({});
  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peersRef = useRef({});

  // Expose functions to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testVideoCall = {
        testConnection,
        forceVideoRefresh,
        forceCameraInit,
        getParticipants: () => participants,
        getRemoteStreams: () => remoteStreams,
        getConnectionStatus: () => connectionStatus,
        getWebSocketState: () => wsRef.current?.readyState,
        getPeerConnections: () => Object.keys(peersRef.current),
        getLocalStream: () => localStream
      };
    }
  }, [participants, remoteStreams, connectionStatus, localStream]);

  // WebSocket connection for signaling
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log('🔌 Connecting to WebSocket for signaling...');
        // Use the same host as the main app, but different port
        const wsUrl = `ws://${window.location.hostname}:3001/ws/call/${callId}`;
        console.log('🔌 WebSocket URL:', wsUrl);
        console.log('🔌 Hostname:', window.location.hostname);
        console.log('🔌 Port:', window.location.port);
        
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setConnectionStatus('connected');
          toast.success('Connected to video call server!');
          
          // Send join message
          ws.send(JSON.stringify({
            type: 'join',
            userId: user._id.toString(),
            userName: user.name,
            isHost: isHost
          }));
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('📨 Received message:', message);
          
          handleSignalingMessage(message);
        };

        ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              console.log('🔄 Attempting to reconnect...');
              connectWebSocket();
            }
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setConnectionStatus('error');
          toast.error('Failed to connect to video call server');
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [callId, user, isHost]);

  // Handle signaling messages
  const handleSignalingMessage = (message) => {
    switch (message.type) {
      case 'user-joined':
        handleUserJoined(message);
        break;
      case 'user-left':
        handleUserLeft(message);
        break;
      case 'offer':
        handleOffer(message);
        break;
      case 'answer':
        handleAnswer(message);
        break;
      case 'ice-candidate':
        handleIceCandidate(message);
        break;
      case 'participants':
        updateParticipantsList(message.participants, message.totalParticipants);
        break;
    }
  };

  // Handle user joined
  const handleUserJoined = (message) => {
    console.log('👤 User joined:', message.userName);
    toast.success(`${message.userName} joined the call`);
    
    // Create peer connection for new user
    createPeerConnection(message.userId, message.userName, true);
  };

  // Handle user left
  const handleUserLeft = (message) => {
    console.log('👤 User left:', message.userName);
    toast.info(`${message.userName} left the call`);
    
    // Close peer connection
    if (peersRef.current[message.userId]) {
      peersRef.current[message.userId].close();
      delete peersRef.current[message.userId];
    }
    
    // Remove from remote streams
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[message.userId];
      return newStreams;
    });
  };

  // Create peer connection
  const createPeerConnection = (userId, userName, isInitiator) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎥 Received remote stream from:', userName);
      console.log('🎥 Stream tracks:', event.streams[0].getTracks());
      
      const remoteStream = event.streams[0];
      setRemoteStreams(prev => ({
        ...prev,
        [userId]: remoteStream
      }));
      
      // Force update video element
      setTimeout(() => {
        const videoElement = document.querySelector(`video[data-participant="${userId}"]`);
        if (videoElement) {
          videoElement.srcObject = remoteStream;
          videoElement.play().catch(console.error);
          console.log('🎥 Video element updated for:', userName);
        }
      }, 100);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: 'ice-candidate',
          targetUserId: userId,
          candidate: event.candidate
        }));
      }
    };

    peersRef.current[userId] = peerConnection;

    if (isInitiator) {
      // Create offer
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          wsRef.current?.send(JSON.stringify({
            type: 'offer',
            targetUserId: userId,
            offer: peerConnection.localDescription
          }));
        })
        .catch(console.error);
    }
  };

  // Handle offer
  const handleOffer = (message) => {
    console.log('📞 Received offer from:', message.fromUserId);
    
    // Create peer connection if it doesn't exist
    if (!peersRef.current[message.fromUserId]) {
      console.log('🔗 Creating peer connection for offer from:', message.fromUserId);
      createPeerConnection(message.fromUserId, message.fromUserName || 'Unknown', false);
    }
    
    const peerConnection = peersRef.current[message.fromUserId];
    if (peerConnection) {
      peerConnection.setRemoteDescription(message.offer)
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
          console.log('📞 Sending answer to:', message.fromUserId);
          wsRef.current?.send(JSON.stringify({
            type: 'answer',
            targetUserId: message.fromUserId,
            answer: peerConnection.localDescription
          }));
        })
        .catch(error => {
          console.error('❌ Error handling offer:', error);
        });
    }
  };

  // Handle answer
  const handleAnswer = (message) => {
    const peerConnection = peersRef.current[message.fromUserId];
    if (peerConnection) {
      peerConnection.setRemoteDescription(message.answer)
        .catch(console.error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = (message) => {
    console.log('🧊 Received ICE candidate from:', message.fromUserId);
    const peerConnection = peersRef.current[message.fromUserId];
    if (peerConnection) {
      peerConnection.addIceCandidate(message.candidate)
        .catch(error => {
          console.error('❌ Error adding ICE candidate:', error);
        });
    } else {
      console.warn('⚠️ No peer connection found for ICE candidate from:', message.fromUserId);
    }
  };

  // Update participants list
  const updateParticipantsList = (participantsList, totalParticipants) => {
    console.log('👥 Updating participants list:', participantsList);
    console.log('👥 Total participants:', totalParticipants);
    setParticipants(participantsList);
  };

  // Initialize local camera
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        console.log('🎥 Initializing camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        setLocalStream(stream);
        
        // Set up local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        
        console.log('✅ Camera initialized successfully');
        toast.success('Camera connected successfully!');
      } catch (error) {
        console.error('❌ Camera initialization failed:', error);
        toast.error('Failed to access camera. Please check permissions.');
      }
    };

    if (user) {
      initializeCamera();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone enabled' : 'Microphone muted');
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        toast.success(videoTrack.enabled ? 'Camera enabled' : 'Camera disabled');
      }
    }
  };

  // Test WebSocket connection
  const testConnection = () => {
    console.log('🧪 Testing WebSocket connection...');
    console.log('🔌 Current WebSocket state:', wsRef.current?.readyState);
    console.log('👥 Current participants:', participants);
    console.log('📹 Remote streams:', Object.keys(remoteStreams));
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      toast.success('WebSocket is connected!');
    } else {
      toast.error('WebSocket is not connected. Attempting to reconnect...');
      connectWebSocket();
    }
  };

  // Force video stream refresh
  const forceVideoRefresh = () => {
    console.log('🔄 Force refreshing all video streams...');
    
    // Refresh local video
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play();
    }
    
    // Refresh remote videos
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      const videoElement = document.querySelector(`video[data-participant="${userId}"]`);
      if (videoElement && stream) {
        videoElement.srcObject = stream;
        videoElement.play().catch(console.error);
        console.log('🎥 Refreshed video for user:', userId);
      }
    });
    
    toast.success('Video streams refreshed!');
  };

  // Force camera initialization
  const forceCameraInit = async () => {
    console.log('🎥 Force initializing camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setIsVideoOn(true);
      setIsMuted(false);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play();
      }
      
      toast.success('Camera initialized successfully!');
    } catch (error) {
      console.error('❌ Error initializing camera:', error);
      toast.error('Failed to initialize camera: ' + error.message);
    }
  };

  // Get grid layout
  const getGridLayout = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-3 grid-rows-2';
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Connection Status */}
      <div className="bg-gray-800 p-2 text-center">
        <span className={`text-sm font-medium ${
          connectionStatus === 'connected' ? 'text-green-400' :
          connectionStatus === 'connecting' ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {connectionStatus === 'connected' ? '🟢 Connected' :
           connectionStatus === 'connecting' ? '🟡 Connecting...' :
           '🔴 Disconnected'}
        </span>
        <span className="text-white text-sm ml-4">
          Participants: {participants.length} | Call ID: {callId}
        </span>
        {connectionStatus === 'error' && (
          <div className="text-red-400 text-xs mt-1">
            WebSocket server not running. Start with: npm run ws
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`grid ${getGridLayout(participants.length + 1)} gap-4 h-full`}>
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              className="w-full h-full"
            />
            
            {/* Local Participant Info */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {user.name} (You)
            </div>
            
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              <div className={`text-white text-xs px-2 py-1 rounded font-bold ${
                localStream ? 'bg-green-600' : 'bg-red-600'
              }`}>
                📹 {localStream ? 'CAMERA' : 'NO CAMERA'}
              </div>
              <div className={`text-white text-xs px-2 py-1 rounded font-bold ${
                !isMuted ? 'bg-green-600' : 'bg-red-600'
              }`}>
                🎤 {!isMuted ? 'AUDIO' : 'MUTED'}
              </div>
            </div>
          </div>

          {/* Remote Participants */}
          {participants.map((participant) => (
            <div key={participant.userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                data-participant={participant.userId}
                ref={el => {
                  if (el) {
                    // Set up video element
                    el.autoplay = true;
                    el.playsInline = true;
                    el.muted = false;
                    
                    // Update stream when available
                    if (remoteStreams[participant.userId]) {
                      el.srcObject = remoteStreams[participant.userId];
                      el.play().catch(console.error);
                      console.log('🎥 Video element set for:', participant.userName);
                    }
                  }
                }}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: remoteStreams[participant.userId] ? 2 : 1
                }}
                className="w-full h-full"
                onLoadedMetadata={() => {
                  console.log('🎥 Video metadata loaded for:', participant.userName);
                }}
                onPlay={() => {
                  console.log('▶️ Video playing for:', participant.userName);
                }}
                onError={(e) => {
                  console.error('❌ Video error for:', participant.userName, e);
                }}
              />
              
              {/* Fallback Avatar - Only show if no video stream */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-700"
                style={{ zIndex: remoteStreams[participant.userId] ? 0 : 1 }}
              >
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {participant.userName ? participant.userName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              </div>
              
              {/* Remote Participant Info */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-10">
                {participant.userName}
              </div>
              
              <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
                <div className={`text-white text-xs px-2 py-1 rounded font-bold ${
                  remoteStreams[participant.userId] ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  📹 {remoteStreams[participant.userId] ? 'CAMERA' : 'NO CAMERA'}
                </div>
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">
                  🎤 AUDIO
                </div>
              </div>
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
          onClick={testConnection}
          className="p-3 rounded-full bg-blue-600 text-white hover:opacity-80 transition-opacity"
          title="Test connection"
        >
          🧪
        </button>

        <button
          onClick={forceVideoRefresh}
          className="p-3 rounded-full bg-green-600 text-white hover:opacity-80 transition-opacity"
          title="Refresh video streams"
        >
          🔄
        </button>

        <button
          onClick={forceCameraInit}
          className="p-3 rounded-full bg-purple-600 text-white hover:opacity-80 transition-opacity"
          title="Force initialize camera"
        >
          📹
        </button>

        <button
          onClick={onCallEnd}
          className="p-3 rounded-full bg-red-600 text-white hover:opacity-80 transition-opacity"
          title="Leave call"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* Auto-Recorder - Only for hosts/tutors */}
      {isHost && localStream && sessionId && courseId && courseTitle && (
        <AutoRecorder
          stream={localStream}
          sessionId={sessionId}
          courseId={courseId}
          courseTitle={courseTitle}
          onRecordingComplete={(recordingUrl) => {
            console.log('✅ Recording complete:', recordingUrl);
            toast.success('Recording uploaded successfully!');
          }}
        />
      )}
    </div>
  );
};

export default WebRTCVideoCall;
