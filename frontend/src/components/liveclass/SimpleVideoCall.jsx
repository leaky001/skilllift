import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

// SIMPLE VIDEO CALL COMPONENT - Direct approach with WebRTC
const SimpleVideoCall = ({ 
  callId, 
  streamToken, 
  user, 
  isHost = false, 
  onCallEnd 
}) => {
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const videoRefs = useRef({});
  const localVideoRef = useRef(null);

  // Initialize local camera and set up video element
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        console.log('🎥 SIMPLE: Initializing camera...');
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
        
        // Add local participant
        setParticipants([{
          id: user._id.toString(),
          name: user.name,
          isLocal: true,
          stream: stream
        }]);
        
        console.log('✅ SIMPLE: Camera initialized successfully');
        toast.success('Camera connected successfully!');
      } catch (error) {
        console.error('❌ SIMPLE: Camera initialization failed:', error);
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

  // Add test participants for demonstration
  const addTestParticipants = () => {
    const testParticipants = [
      { id: 'test1', name: 'muiz', isLocal: false },
      { id: 'test2', name: 'pawpaw', isLocal: false }
    ];
    
    setParticipants(prev => {
      const existing = prev.filter(p => !p.id.startsWith('test'));
      return [...existing, ...testParticipants];
    });
    
    toast.success('Test participants added');
  };

  // Force refresh video elements
  const forceRefreshVideo = () => {
    console.log('🔄 Force refreshing video elements...');
    
    // Refresh local video
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play();
    }
    
    // Refresh all video refs
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && videoRef.srcObject) {
        videoRef.play();
      }
    });
    
    toast.success('Video elements refreshed!');
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
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className={`grid ${getGridLayout(participants.length)} gap-4 h-full`}>
          {participants.map((participant, index) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
              {/* Video Element - FORCE DISPLAY */}
              <video
                ref={el => {
                  if (el) {
                    videoRefs.current[participant.id] = el;
                    if (participant.isLocal && localStream) {
                      el.srcObject = localStream;
                      el.play().catch(console.error);
                    }
                  }
                }}
                autoPlay
                playsInline
                muted={participant.isLocal}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2
                }}
                className="w-full h-full"
                onLoadedMetadata={() => {
                  console.log('🎥 Video metadata loaded for:', participant.name);
                }}
                onPlay={() => {
                  console.log('▶️ Video playing for:', participant.name);
                }}
                onError={(e) => {
                  console.error('❌ Video error for:', participant.name, e);
                }}
              />
              
              {/* Fallback Avatar - Only show if no video */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-700 z-1"
                style={{ zIndex: participant.isLocal && localStream ? 0 : 1 }}
              >
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
                <div className={`text-white text-xs px-2 py-1 rounded font-bold ${
                  participant.isLocal && localStream ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  📹 {participant.isLocal && localStream ? 'CAMERA' : 'NO CAMERA'}
                </div>
                <div className={`text-white text-xs px-2 py-1 rounded font-bold ${
                  participant.isLocal && !isMuted ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  🎤 {participant.isLocal && !isMuted ? 'AUDIO' : 'MUTED'}
                </div>
              </div>
              
              {/* Participant Info */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-10">
                {participant.name} {participant.isLocal ? '(You)' : ''}
              </div>
              
              <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-70 px-1 rounded z-10">
                {participant.id}
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
          onClick={addTestParticipants}
          className="p-3 rounded-full bg-blue-600 text-white hover:opacity-80 transition-opacity"
          title="Add test participants"
        >
          👥
        </button>

        <button
          onClick={forceRefreshVideo}
          className="p-3 rounded-full bg-green-600 text-white hover:opacity-80 transition-opacity"
          title="Force refresh video"
        >
          🔄
        </button>

        <button
          onClick={onCallEnd}
          className="p-3 rounded-full bg-red-600 text-white hover:opacity-80 transition-opacity"
          title="Leave call"
        >
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );
};

export default SimpleVideoCall;
