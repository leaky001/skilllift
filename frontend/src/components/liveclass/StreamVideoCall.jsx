import React, { useState, useEffect, useRef } from 'react';
import { 
  StreamVideo, 
  StreamVideoClient
} from '@stream-io/video-react-sdk';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const StreamVideoCall = ({ 
  callId, 
  streamToken, 
  isHost = false, 
  onCallEnd,
  onParticipantJoined,
  onParticipantLeft,
  settings = {}
}) => {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  // Simplified state management
  const [participants, setParticipants] = useState([]);
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const initializedRef = useRef(false);

  // Initialize Stream client and call
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeStream = async () => {
      try {
        if (!callId || !streamToken || !user) {
          setError('Missing required parameters for video call');
          setIsLoading(false);
          return;
        }

        console.log('🎥 Initializing Stream video call...', { 
          callId, 
          isHost, 
          userId: user._id,
          userName: user.name 
        });

        // Create Stream user object
        const streamUser = {
          id: user._id.toString(),
          name: user.name,
          image: user.profilePicture || undefined,
        };

        // Get Stream API key
        let streamApiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!streamApiKey || streamApiKey === 'your_stream_api_key_here') {
          streamApiKey = 'j86qtfj4kzaf'; // Fallback key
        }

        // Initialize Stream Video client
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: streamApiKey,
          user: streamUser,
          token: streamToken,
          options: {
            timeout: 15000,
            loggerLevel: 'warn',
            connectionTimeout: 15000,
            retryTimeout: 3000,
            maxRetries: 5,
            rtcConfig: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
              ],
              iceCandidatePoolSize: 10
            },
            enableReconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000
          }
        });

        setClient(streamClient);

        // Create call
        const newStreamCall = streamClient.call('default', callId);
        setCall(newStreamCall);

        // Check media device support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error('Your browser does not support camera/microphone access');
          return;
        }

        // Request permissions with better error handling
        try {
          // First, try to get any available media devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log('🎥 Available media devices:', devices);
          
          // Try to get user media with fallback options
          let stream = null;
          try {
            // Try with video and audio first
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: { width: 1280, height: 720 }, 
              audio: true 
            });
            console.log('✅ Media permissions granted with video and audio');
          } catch (videoError) {
            console.warn('⚠️ Video+Audio failed, trying audio only:', videoError.message);
            try {
              // Try with audio only
              stream = await navigator.mediaDevices.getUserMedia({ 
                video: false, 
                audio: true 
              });
              console.log('✅ Media permissions granted with audio only');
            } catch (audioError) {
              console.warn('⚠️ Audio only failed, trying video only:', audioError.message);
              try {
                // Try with video only
                stream = await navigator.mediaDevices.getUserMedia({ 
                  video: { width: 1280, height: 720 }, 
                  audio: false 
                });
                console.log('✅ Media permissions granted with video only');
              } catch (videoOnlyError) {
                console.error('❌ All media permission attempts failed:', videoOnlyError.message);
                throw videoOnlyError;
              }
            }
          }
          
          // Stop the test stream immediately
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ Test stream stopped');
          }
          
        } catch (permissionError) {
          console.error('❌ Media permission denied:', permissionError);
          
          // Provide specific error messages based on error type
          if (permissionError.name === 'NotReadableError') {
            toast.error('Camera/microphone is being used by another application. Please close other apps and try again.');
          } else if (permissionError.name === 'NotAllowedError') {
            toast.error('Camera/microphone access denied. Please allow permissions and refresh the page.');
          } else if (permissionError.name === 'NotFoundError') {
            toast.error('No camera/microphone found. Please connect a device and try again.');
          } else {
            toast.error(`Media access failed: ${permissionError.message}`);
          }
          
          // Don't return here, continue with Stream initialization
          console.log('⚠️ Continuing without media permissions for now...');
        }

        // Join the call
        await newStreamCall.join({ create: true });
        console.log('✅ Joined call successfully');

        // Start local camera
        await startLocalCamera();

        // Set up event listeners
        setupEventListeners(newStreamCall);

        setIsLoading(false);

      } catch (error) {
        console.error('❌ Stream initialization failed:', error);
        setError(error.message);
        setIsLoading(false);
        toast.error('Failed to initialize video call: ' + error.message);
      }
    };

    initializeStream();
    
    // Cleanup function
    return () => {
      if (call) {
        // Clear sync interval
        if (call._syncInterval) {
          clearInterval(call._syncInterval);
          console.log('✅ Cleared sync interval');
        }
        
        call.leave();
        console.log('✅ Left call and cleaned up');
      }
    };
  }, [callId, streamToken, user, isHost]);

  // Start local camera with better error handling
  const startLocalCamera = async () => {
    try {
      console.log('🎥 Starting local camera...');
      
      // First, stop any existing streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        console.log('🔄 Stopped existing local stream');
      }
      
      // Wait a moment for device to be released
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to get media with fallback options
      let stream = null;
      try {
        // Try with video and audio first
        stream = await navigator.mediaDevices.getUserMedia({
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
        console.log('✅ Camera started with video and audio');
      } catch (videoError) {
        console.warn('⚠️ Video+Audio failed, trying video only:', videoError.message);
        try {
          // Try with video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          });
          console.log('✅ Camera started with video only');
        } catch (videoOnlyError) {
          console.warn('⚠️ Video only failed, trying audio only:', videoOnlyError.message);
          try {
            // Try with audio only
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: {
                echoCancellation: true,
                noiseSuppression: true
              }
            });
            console.log('✅ Camera started with audio only');
          } catch (audioOnlyError) {
            console.error('❌ All camera attempts failed:', audioOnlyError.message);
            throw audioOnlyError;
          }
        }
      }
      
      if (stream) {
        setLocalStream(stream);
        console.log('✅ Local camera started successfully');
        
        // Enable camera in Stream call
        if (call) {
          try {
            await call.camera.enable();
            console.log('✅ Stream camera enabled');
            
            // Also try to publish video track explicitly
            try {
              const videoTrack = stream.getVideoTracks()[0];
              if (videoTrack) {
                await call.publishVideoTrack(videoTrack);
                console.log('✅ Video track published explicitly');
              }
            } catch (publishError) {
              console.warn('⚠️ Could not publish video track explicitly:', publishError);
            }
          } catch (streamError) {
            console.warn('⚠️ Could not enable Stream.io camera:', streamError);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Camera start failed:', error);
      
      // Provide specific error messages
      if (error.name === 'NotReadableError') {
        toast.error('Camera/microphone is being used by another application. Please close other apps and try again.');
      } else if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera/microphone found. Please connect a device and try again.');
      } else {
        toast.error(`Failed to start camera: ${error.message}`);
      }
      
      // Don't throw error, continue without camera
      console.log('⚠️ Continuing without camera...');
    }
  };

  // Set up event listeners
  const setupEventListeners = (streamCall) => {
    console.log('🎯 Setting up Stream event listeners...');
    
    // Participant join events - Enhanced for better reliability
    streamCall.on('call.session_participant_joined', (event) => {
      console.log('👥 Participant joined event:', event);
      const participant = event.participant;
      const participantId = participant.user?.id || participant.user_id;
      
      console.log('🔍 Processing participant join:', {
        participantId,
        participantName: participant.user?.name || participant.name,
        currentUserId: user._id.toString(),
        isNotCurrentUser: participantId && participantId.toString() !== user._id.toString()
      });
      
      if (participantId && participantId.toString() !== user._id.toString()) {
        const newParticipant = {
          id: participantId,
          name: participant.user?.name || participant.name || 'Unknown User',
          user_id: participantId
        };
        
        setParticipants(prev => {
          const exists = prev.some(p => p.id === participantId);
          if (!exists) {
            console.log('✅ Adding new participant:', newParticipant);
            console.log('✅ Updated participants list:', [...prev, newParticipant]);
            return [...prev, newParticipant];
          } else {
            console.log('⚠️ Participant already exists:', participantId);
            return prev;
          }
        });
        
        // Also trigger a manual sync after adding participant
        setTimeout(() => {
          console.log('🔄 Manual sync after participant join...');
          const currentParticipants = streamCall.state.participants || [];
          const otherParticipants = currentParticipants
            .filter(p => {
              const pId = p.user?.id || p.user_id;
              return pId && pId.toString() !== user._id.toString();
            })
            .map(p => ({
              id: p.user?.id || p.user_id,
              name: p.user?.name || p.name || 'Unknown User',
              user_id: p.user?.id || p.user_id
            }));
          console.log('✅ Manual sync result:', otherParticipants);
          setParticipants(otherParticipants);
        }, 1000);
      }
    });

    // Participant leave events
    streamCall.on('call.session_participant_left', (event) => {
      console.log('👥 Participant left:', event);
      const participantId = event.participant.user?.id || event.participant.user_id;
      
      if (participantId && participantId.toString() !== user._id.toString()) {
        setParticipants(prev => {
          const filtered = prev.filter(p => p.id !== participantId);
          console.log('✅ Removed participant:', participantId);
          return filtered;
        });
        
        // Also remove video track
        setVideoTracks(prev => {
          const newMap = new Map(prev);
          newMap.delete(participantId);
          return newMap;
        });
      }
    });

    // Video track events - Enhanced handling
    streamCall.on('call.track_published', (event) => {
      console.log('🎥 Track published event:', event);
      const participantId = event.participant.user?.id || event.participant.user_id || event.participant.userId;
      
      console.log('🔍 Processing track published:', {
        participantId,
        trackKind: event.track.kind,
        currentUserId: user._id.toString(),
        isNotCurrentUser: participantId && participantId.toString() !== user._id.toString(),
        participantName: event.participant.user?.name || event.participant.name
      });
      
      if (participantId && participantId.toString() !== user._id.toString() && event.track.kind === 'video') {
        setVideoTracks(prev => {
          const newMap = new Map(prev);
          newMap.set(participantId, event.track);
          console.log('✅ Video track stored for:', participantId);
          console.log('✅ Updated video tracks map:', Array.from(newMap.keys()));
          return newMap;
        });
        console.log('✅ Video track published for:', participantId);
      }
    });

    streamCall.on('call.track_unpublished', (event) => {
      console.log('🎥 Track unpublished:', event);
      const participantId = event.participant.user?.id || event.participant.user_id;
      
      if (participantId && participantId.toString() !== user._id.toString()) {
        setVideoTracks(prev => {
          const newMap = new Map(prev);
          newMap.delete(participantId);
          return newMap;
        });
        console.log('✅ Video track unpublished for:', participantId);
      }
    });

    // Call state updates (fallback for participant management)
    streamCall.on('call.updated', (event) => {
      console.log('🔄 Call updated:', event);
      if (event.call && event.call.state && event.call.state.participants) {
        const callParticipants = event.call.state.participants || [];
        console.log('👥 All participants in call:', callParticipants);
        
        const otherParticipants = callParticipants
          .filter(p => {
            const participantId = p.user?.id || p.user_id;
            const isNotCurrentUser = participantId && participantId.toString() !== user._id.toString();
            console.log('🔍 Checking participant:', {
              participantId,
              currentUserId: user._id.toString(),
              isNotCurrentUser
            });
            return isNotCurrentUser;
          })
          .map(p => ({
            id: p.user?.id || p.user_id,
            name: p.user?.name || p.name || 'Unknown User',
            user_id: p.user?.id || p.user_id
          }))
          .filter((p, index, self) => 
            index === self.findIndex(participant => participant.id === p.id)
          );
        
        console.log('✅ Processed participants:', otherParticipants);
        setParticipants(otherParticipants);
      }
    });

    // Chat events
    streamCall.on('call.session_message_received', (event) => {
      console.log('💬 Chat message received:', event);
      setChatMessages(prev => [...prev, {
        id: event.message.id || Date.now(),
        text: event.message.text,
        user: event.message.user,
        timestamp: event.message.created_at || new Date().toISOString()
      }]);
    });

    // Initial participant sync - Enhanced detection
    const syncParticipants = () => {
      console.log('🔄 Syncing participants...');
      
      // Try multiple ways to get participants
      let currentParticipants = [];
      
      // Method 1: From call state
      if (streamCall.state && streamCall.state.participants) {
        currentParticipants = streamCall.state.participants;
        console.log('👥 Participants from call.state:', currentParticipants);
      }
      
      // Method 2: From call object directly
      if (streamCall.participants) {
        currentParticipants = streamCall.participants;
        console.log('👥 Participants from call.participants:', currentParticipants);
      }
      
      // Method 3: From call state.participants (alternative)
      if (streamCall.state && streamCall.state.participants) {
        const stateParticipants = Object.values(streamCall.state.participants);
        if (stateParticipants.length > 0) {
          currentParticipants = stateParticipants;
          console.log('👥 Participants from state.participants object:', currentParticipants);
        }
      }
      
      console.log('👥 Final participants array:', currentParticipants);
      
      const otherParticipants = currentParticipants
        .filter(p => {
          const participantId = p.user?.id || p.user_id || p.userId;
          const isNotCurrentUser = participantId && participantId.toString() !== user._id.toString();
          console.log('🔍 Checking participant for sync:', {
            participantId,
            currentUserId: user._id.toString(),
            isNotCurrentUser,
            participantName: p.user?.name || p.name,
            participantObject: p
          });
          return isNotCurrentUser;
        })
        .map(p => ({
          id: p.user?.id || p.user_id || p.userId,
          name: p.user?.name || p.name || 'Unknown User',
          user_id: p.user?.id || p.user_id || p.userId
        }));
      
      console.log('✅ Participants synced:', otherParticipants);
      setParticipants(otherParticipants);
      
      // Also log the call state for debugging
      console.log('🔍 Full call state:', streamCall.state);
      console.log('🔍 Call object keys:', Object.keys(streamCall));
    };

    // Multiple sync attempts to catch all participants
    setTimeout(syncParticipants, 1000);  // First attempt
    setTimeout(syncParticipants, 3000);  // Second attempt
    setTimeout(syncParticipants, 5000);  // Third attempt
    
    // Periodic sync every 10 seconds to ensure participants stay in sync
    const syncInterval = setInterval(syncParticipants, 10000);
    
    // Store interval for cleanup
    streamCall._syncInterval = syncInterval;
  };

  // Video participant component
  const VideoParticipant = ({ participant, videoTrack, isLocal = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
      console.log('🎥 VideoParticipant effect:', {
        participantId: participant.id,
        participantName: participant.name,
        hasVideoTrack: !!videoTrack,
        isLocal,
        videoTrackType: videoTrack?.type || 'none'
      });

      if (videoRef.current && videoTrack) {
        try {
          let stream = null;
          
          if (videoTrack.mediaStreamTrack) {
            // Direct MediaStreamTrack
            stream = new MediaStream([videoTrack.mediaStreamTrack]);
            console.log('✅ Using MediaStreamTrack for:', participant.name);
          } else if (videoTrack.attach) {
            // Stream.io track object
            stream = videoTrack.attach();
            console.log('✅ Using Stream.io track for:', participant.name);
          } else if (videoTrack.getMediaStream) {
            // Alternative method
            stream = videoTrack.getMediaStream();
            console.log('✅ Using getMediaStream for:', participant.name);
          }
          
          if (stream) {
            videoRef.current.srcObject = stream;
            console.log('✅ Video stream attached for:', participant.name);
          } else {
            console.warn('⚠️ Could not create stream for:', participant.name);
          }
        } catch (error) {
          console.error('❌ Error attaching video stream:', error);
        }
      }
    }, [videoTrack, participant.id, participant.name, isLocal]);

    return (
      <div className="relative bg-gray-800 rounded-lg overflow-hidden min-h-[200px]">
        {videoTrack ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover"
            onLoadedData={() => console.log('✅ Video loaded for:', participant.name)}
            onError={(e) => console.error('❌ Video error for:', participant.name, e)}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm">{participant.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {isLocal ? 'Your video is off' : 'Video is off'}
              </p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {participant.name} {isLocal ? '(You)' : ''}
        </div>
        {videoTrack && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Live
          </div>
        )}
      </div>
    );
  };

  // Control handlers
  const toggleMute = async () => {
    try {
      if (isMuted) {
        await call.microphone.enable();
        setIsMuted(false);
      } else {
        await call.microphone.disable();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('❌ Toggle mute failed:', error);
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        await call.camera.disable();
        setIsVideoOn(false);
      } else {
        await call.camera.enable();
        setIsVideoOn(true);
      }
    } catch (error) {
      console.error('❌ Toggle video failed:', error);
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
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
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare all participants including local user
  const allParticipants = [
    { id: user._id, name: user.name, isLocal: true },
    ...participants
  ];

  console.log('🎯 Rendering participants:', {
    totalCount: allParticipants.length,
    localUser: user.name,
    otherParticipants: participants.map(p => ({ id: p.id, name: p.name })),
    videoTracksCount: videoTracks.size,
    videoTracksKeys: Array.from(videoTracks.keys())
  });

  // Dynamic grid layout based on participant count
  const getGridLayout = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Video Area */}
      <div className="flex-1 p-4">
        <div className={`grid ${getGridLayout(allParticipants.length)} gap-4 h-full`}>
          {allParticipants.map(participant => (
            <VideoParticipant
              key={participant.id}
              participant={participant}
              videoTrack={participant.isLocal 
                ? (localStream ? { mediaStreamTrack: localStream.getVideoTracks()[0] } : null)
                : videoTracks.get(participant.id)
              }
              isLocal={participant.isLocal}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        {/* Manual refresh participants button */}
        <button
          onClick={() => {
            console.log('🔄 Manual participant refresh triggered');
            if (call) {
              // Try multiple ways to get participants
              let currentParticipants = [];
              
              // Method 1: From call state
              if (call.state && call.state.participants) {
                currentParticipants = call.state.participants;
                console.log('👥 Participants from call.state:', currentParticipants);
              }
              
              // Method 2: From call object directly
              if (call.participants) {
                currentParticipants = call.participants;
                console.log('👥 Participants from call.participants:', currentParticipants);
              }
              
              // Method 3: From call state.participants (alternative)
              if (call.state && call.state.participants) {
                const stateParticipants = Object.values(call.state.participants);
                if (stateParticipants.length > 0) {
                  currentParticipants = stateParticipants;
                  console.log('👥 Participants from state.participants object:', currentParticipants);
                }
              }
              
              console.log('👥 Final participants array for refresh:', currentParticipants);
              
              const otherParticipants = currentParticipants
                .filter(p => {
                  const participantId = p.user?.id || p.user_id || p.userId;
                  return participantId && participantId.toString() !== user._id.toString();
                })
                .map(p => ({
                  id: p.user?.id || p.user_id || p.userId,
                  name: p.user?.name || p.name || 'Unknown User',
                  user_id: p.user?.id || p.user_id || p.userId
                }));
              
              console.log('✅ Manual refresh result:', otherParticipants);
              setParticipants(otherParticipants);
              toast.info(`Refreshed participants: ${otherParticipants.length} found`);
              
              // Also log call state for debugging
              console.log('🔍 Full call state for debugging:', call.state);
              console.log('🔍 Call object keys:', Object.keys(call));
            }
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm"
          title="Refresh participants list"
        >
          🔄 Refresh
        </button>
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded ${isMuted ? 'bg-red-500' : 'bg-gray-600'} text-white`}
        >
          {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded ${isVideoOn ? 'bg-gray-600' : 'bg-red-500'} text-white`}
        >
          {isVideoOn ? '📹 Video On' : '📹 Video Off'}
        </button>
        
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="px-4 py-2 rounded bg-gray-600 text-white"
        >
          👥 Participants ({participants.length + 1})
        </button>
        
        <button
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 rounded bg-gray-600 text-white"
        >
          💬 Chat
        </button>
        
        <button
          onClick={handleLeaveCall}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          📞 Leave Call
        </button>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">
              Participants ({participants.length + 1})
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Video Tracks: {videoTracks.size}
            </p>
          </div>
          <div className="p-4 space-y-2">
            {/* Local user */}
            <div className="text-white text-sm bg-gray-700 p-2 rounded border-l-4 border-blue-500">
              <p className="font-medium">You ({user.name})</p>
              <p className="text-xs text-gray-300">
                {isHost ? 'Host' : 'Student'} • {isMuted ? 'Muted' : 'Unmuted'} • {isVideoOn ? 'Video On' : 'Video Off'}
              </p>
              <p className="text-xs text-gray-400">
                ID: {user._id}
              </p>
            </div>
            {/* Other participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="text-white text-sm bg-gray-700 p-2 rounded border-l-4 border-green-500">
                <p className="font-medium">{participant.name}</p>
                <p className="text-xs text-gray-300">
                  Student • {videoTracks.has(participant.id) ? 'Video On' : 'Video Off'}
                </p>
                <p className="text-xs text-gray-400">
                  ID: {participant.id}
                </p>
              </div>
            ))}
            
            {/* Debug info */}
            <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">Debug Info:</p>
              <p>Call ID: {callId}</p>
              <p>Stream Token: {streamToken ? 'Present' : 'Missing'}</p>
              <p>Call State: {call ? 'Connected' : 'Disconnected'}</p>
              <p>Local Stream: {localStream ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Chat</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-gray-400 text-sm">No messages yet</div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className="text-white text-sm">
                  <div className="font-medium text-blue-400">
                    {message.user.name}
                  </div>
                  <div className="text-gray-300">
                    {message.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
              />
              <button
                onClick={sendChatMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded"
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