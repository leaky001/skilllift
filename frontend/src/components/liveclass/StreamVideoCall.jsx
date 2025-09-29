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
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isFullScreen, setIsFullScreen] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current || client || call) {
      console.log('🎥 Stream already initialized, skipping...');
      return;
    }
    
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

        // Check if Stream API key is configured
        const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!streamApiKey || streamApiKey === 'your_stream_api_key_here') {
          throw new Error('Stream.io API key not configured. Please set VITE_STREAM_API_KEY in your environment variables.');
        }

        // Initialize Stream Video client (use getOrCreateInstance to avoid duplicates)
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: streamApiKey,
          user: streamUser,
          token: streamToken,
        });

        setClient(streamClient);

        // Create call with the specific callId - use 'default' for proper permissions
        const streamCall = streamClient.call('default', callId);
        
        // Join the call - create if host, join if participant
        try {
          await streamCall.join({ 
            create: isHost,
            data: {
              custom: {
                isHost: isHost,
                settings: settings
              }
            }
          });
        } catch (joinError) {
          console.log('🎥 First join attempt failed:', joinError.message);
          
          if (isHost && joinError.message.includes("Can't find call")) {
            console.log('🎥 Host creating call first...');
            await streamCall.join({ 
              create: true,
              data: {
                custom: {
                  isHost: isHost,
                  settings: settings
                }
              }
            });
          } else {
            throw joinError;
          }
        }

        setCall(streamCall);
        
        // Remove any existing event listeners to prevent duplicates
        streamCall.off('call.session_participant_joined');
        streamCall.off('call.session_participant_left');
        streamCall.off('call.track_published');
        streamCall.off('call.track_unpublished');
        streamCall.off('call.updated');
        
        // Set up event listeners
        streamCall.on('call.session_participant_joined', (event) => {
          console.log('🎥 Participant joined:', event.participant);
          console.log('🎥 Participant data:', JSON.stringify(event.participant, null, 2));
          
          setParticipants(prev => {
            // Check if this is the current user (host) - don't add them as participant
            const participantId = event.participant.user?.id || event.participant.user_id;
            const currentUserId = user._id.toString();
            // Convert both to strings for comparison
            const participantIdStr = participantId ? participantId.toString() : '';
            const currentUserIdStr = currentUserId.toString();
            
            if (participantIdStr === currentUserIdStr) {
              console.log('🎥 Ignoring self-join event for host:', participantIdStr);
              return prev;
            }
            
            // Check if participant already exists to avoid duplicates
            const exists = prev.some(p => (p.user?.id || p.user_id) === participantId);
            
            if (!exists) {
              const newParticipant = {
                ...event.participant,
                name: event.participant.user?.name || event.participant.name || 'Unknown User',
                user_id: participantId
              };
              console.log('🎥 Adding new participant:', newParticipant);
              return [...prev, newParticipant];
            } else {
              console.log('🎥 Participant already exists, skipping:', participantId);
              return prev;
            }
          });
          // Switch to grid view when someone joins
          setIsFullScreen(false);
          if (onParticipantJoined) onParticipantJoined(event.participant);
        });

        streamCall.on('call.session_participant_left', (event) => {
          console.log('🎥 Participant left:', event.participant);
          const participantId = event.participant.user?.id || event.participant.user_id;
          setParticipants(prev => prev.filter(p => (p.user?.id || p.user_id) !== participantId));
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(participantId);
            return newMap;
          });
          if (onParticipantLeft) onParticipantLeft(event.participant);
        });

        // Listen for participant video tracks
        streamCall.on('call.track_published', (event) => {
          console.log('🎥 Track published:', event);
          console.log('🎥 Track details:', JSON.stringify(event, null, 2));
          console.log('🎥 Track kind:', event.track?.kind);
          console.log('🎥 Track enabled:', event.track?.enabled);
          console.log('🎥 Track mediaStreamTrack:', event.track?.mediaStreamTrack);
          console.log('🎥 Participant user ID:', event.participant?.user?.id || event.participant?.user_id);

          if (event.participant && (event.participant.user?.id || event.participant.user_id) !== user._id.toString()) {
            if (event.track && event.track.kind === 'video') {
              const participantId = event.participant.user?.id || event.participant.user_id;
              setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.set(participantId, event.track);
                console.log('🎥 Added video track for participant:', participantId);
                console.log('🎥 Track object:', event.track);
                console.log('🎥 Track mediaStreamTrack:', event.track.mediaStreamTrack);
                console.log('🎥 Track readyState:', event.track.mediaStreamTrack?.readyState);
                return newMap;
              });
            }
          }
        });

        streamCall.on('call.track_unpublished', (event) => {
          console.log('🎥 Track unpublished:', event);
          if (event.participant && (event.participant.user?.id || event.participant.user_id) !== user._id.toString()) {
            const participantId = event.participant.user?.id || event.participant.user_id;
            setRemoteStreams(prev => {
              const newMap = new Map(prev);
              newMap.delete(participantId);
              console.log('🎥 Removed video track for participant:', participantId);
              return newMap;
            });
          }
        });

        // Listen for participant state changes to get video tracks
        streamCall.on('call.participant_updated', (event) => {
          console.log('🎥 Participant updated:', event);
          if (event.participant && (event.participant.user?.id || event.participant.user_id) !== user._id.toString()) {
            if (event.participant.videoTrack) {
              const participantId = event.participant.user?.id || event.participant.user_id;
              setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.set(participantId, event.participant.videoTrack);
                console.log('🎥 Updated video track for participant:', participantId);
                return newMap;
              });
            }
          }
        });

        // Listen for call state changes to update participants
        streamCall.on('call.updated', (event) => {
          console.log('🎥 Call updated:', event);
          if (event.call && event.call.state && event.call.state.participants) {
            // Filter out the current user from participants list and deduplicate
            const otherParticipants = event.call.state.participants
              .filter(p => {
                const participantId = p.user?.id || p.user_id;
                const currentUserId = user._id.toString();
                // Convert both to strings for comparison
                const participantIdStr = participantId ? participantId.toString() : '';
                const currentUserIdStr = currentUserId.toString();
                return participantIdStr !== currentUserIdStr;
              })
              .map(participant => ({
                ...participant,
                name: participant.user?.name || participant.name || 'Unknown User',
                user_id: participant.user?.id || participant.user_id
              }))
              .filter((participant, index, self) => 
                // Remove duplicates based on user_id
                index === self.findIndex(p => p.user_id === participant.user_id)
              );
            setParticipants(otherParticipants);
            console.log('🎥 Updated participants from call.updated (deduplicated):', otherParticipants);
          }
        });

        // Listen for chat messages - try different event names
        streamCall.on('call.session_message_received', (event) => {
          console.log('💬 Chat message received:', event);
          setChatMessages(prev => [...prev, {
            id: event.message.id || Date.now(),
            text: event.message.text,
            user: event.message.user,
            timestamp: event.message.created_at || new Date().toISOString()
          }]);
        });

        // Listen for reactions (which might include messages)
        streamCall.on('call.reaction_received', (event) => {
          console.log('💬 Reaction received:', event);
          console.log('💬 Reaction type:', event.reaction?.type);
          console.log('💬 Reaction custom:', event.reaction?.custom);
          
          if (event.reaction && event.reaction.type === 'chat_message' && event.reaction.custom) {
            const message = {
              id: event.reaction.id || Date.now(),
              text: event.reaction.custom.text,
              user: {
                id: event.reaction.custom.senderId || event.reaction.custom.user?.id || event.reaction.user?.id,
                name: event.reaction.custom.senderName || event.reaction.custom.user?.name || event.reaction.user?.name
              },
              timestamp: event.reaction.created_at || new Date().toISOString()
            };
            console.log('💬 Adding reaction message to chat:', message);
            setChatMessages(prev => [...prev, message]);
          } else if (event.reaction && event.reaction.custom && event.reaction.custom.text) {
            // Fallback for other reaction types
            setChatMessages(prev => [...prev, {
              id: event.reaction.id || Date.now(),
              text: event.reaction.custom.text,
              user: event.reaction.custom.user || event.reaction.user,
              timestamp: event.reaction.created_at || new Date().toISOString()
            }]);
          }
        });

        // Listen for call updates (which might include custom messages)
        streamCall.on('call.updated', (event) => {
          console.log('💬 Call updated:', event);
          console.log('💬 Call custom data:', event.call?.custom);
          console.log('💬 Call custom chatMessages:', event.call?.custom?.chatMessages);
          console.log('💬 Call custom lastMessage:', event.call?.custom?.lastMessage);
          console.log('💬 Call custom senderId:', event.call?.custom?.senderId);
          console.log('💬 Call custom senderName:', event.call?.custom?.senderName);
          
          if (event.call && event.call.custom) {
            // Check for chat messages in custom data
            if (event.call.custom.chatMessages) {
              console.log('💬 Received chat messages from call.update:', event.call.custom.chatMessages);
              setChatMessages(event.call.custom.chatMessages);
            }
            
            // Check for last message
            if (event.call.custom.lastMessage) {
              console.log('💬 Received last message from call.update:', event.call.custom.lastMessage);
              setChatMessages(prev => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(msg => msg.id === event.call.custom.lastMessage.id);
                if (!exists) {
                  console.log('💬 Adding new message to chat:', event.call.custom.lastMessage);
                  return [...prev, event.call.custom.lastMessage];
                }
                console.log('💬 Message already exists, skipping');
                return prev;
              });
            }
          } else {
            console.log('💬 No custom data in call.updated event');
          }
        });

        // Listen for call state updates (alternative method)
        streamCall.on('call.state.updated', (event) => {
          console.log('💬 Call state updated:', event);
          if (event.call && event.call.custom) {
            if (event.call.custom.chatMessages) {
              console.log('💬 Received chat messages from call.state.update:', event.call.custom.chatMessages);
              setChatMessages(event.call.custom.chatMessages);
            }
            if (event.call.custom.lastMessage) {
              console.log('💬 Received last message from call.state.update:', event.call.custom.lastMessage);
              setChatMessages(prev => {
                const exists = prev.some(msg => msg.id === event.call.custom.lastMessage.id);
                if (!exists) {
                  return [...prev, event.call.custom.lastMessage];
                }
                return prev;
              });
            }
          }
        });

        // Also try alternative chat event listeners
        streamCall.on('call.message_received', (event) => {
          console.log('💬 Alternative chat message received:', event);
          setChatMessages(prev => [...prev, {
            id: event.message.id || Date.now(),
            text: event.message.text,
            user: event.message.user,
            timestamp: event.message.created_at || new Date().toISOString()
          }]);
        });

        // Start local camera
        await startLocalCamera();
        
        // Set up periodic chat sync to ensure messages are shared
        const chatSyncInterval = setInterval(async () => {
          if (call && chatMessages.length > 0) {
            try {
              // Try multiple sync methods
              await call.update({
                custom: {
                  chatMessages: chatMessages,
                  lastSync: Date.now(),
                  syncMethod: 'call.update'
                }
              });
              console.log('💬 Chat sync completed via call.update');
            } catch (error) {
              console.log('💬 call.update sync failed, trying call.state.update:', error);
              try {
                await call.state.update({
                  custom: {
                    chatMessages: chatMessages,
                    lastSync: Date.now(),
                    syncMethod: 'call.state.update'
                  }
                });
                console.log('💬 Chat sync completed via call.state.update');
              } catch (stateError) {
                console.log('💬 call.state.update sync failed:', stateError);
              }
            }
          }
        }, 3000); // Sync every 3 seconds (more frequent)
        
        // Store interval for cleanup
        streamCall.chatSyncInterval = chatSyncInterval;
        
        // Get initial participants (excluding current user)
        const allParticipants = streamCall.state.participants || [];
        console.log('🎥 All participants from call:', allParticipants);
        console.log('🎥 Current user ID:', user._id.toString());
        
        // More aggressive filtering - try multiple ID fields
        const initialParticipants = allParticipants
          .filter(p => {
            const participantId = p.user?.id || p.user_id || p.id;
            const currentUserId = user._id.toString();
            // Convert both to strings for comparison
            const participantIdStr = participantId ? participantId.toString() : '';
            const currentUserIdStr = currentUserId.toString();
            const isNotCurrentUser = participantIdStr !== currentUserIdStr;
            
            // Also check by name as fallback
            const participantName = p.user?.name || p.name;
            const currentUserName = user.name;
            const isNotCurrentUserByName = participantName !== currentUserName;
            
            console.log('🎥 Filtering participant:', {
              participantId,
              participantIdStr,
              currentUserId,
              currentUserIdStr,
              isNotCurrentUser,
              participantName,
              currentUserName,
              isNotCurrentUserByName,
              participant: p
            });
            
            // Must pass both ID and name checks
            return isNotCurrentUser && isNotCurrentUserByName;
          })
          .map(participant => ({
            ...participant,
            name: participant.user?.name || participant.name || 'Unknown User',
            user_id: participant.user?.id || participant.user_id
          }))
          .filter((participant, index, self) => 
            // Remove duplicates based on user_id
            index === self.findIndex(p => p.user_id === participant.user_id)
          );

        // FORCE EMPTY ARRAY FOR HOST - NO MATTER WHAT
        if (isHost) {
          console.log('🎥 HOST DETECTED - FORCING EMPTY PARTICIPANTS ARRAY');
          console.log('🎥 Initial participants before clearing:', initialParticipants);
          setParticipants([]);
        } else {
          setParticipants(initialParticipants);
        }
        
        console.log('🎥 Initial participants (deduplicated):', initialParticipants);
        console.log('🎥 Total participants (including you):', allParticipants.length);
        console.log('🎥 Final participants array length:', isHost && initialParticipants.length === 0 ? 0 : initialParticipants.length);
        
        // Process initial participants for video tracks
        initialParticipants.forEach(participant => {
          console.log('🎥 Processing initial participant:', participant);
          if (participant.videoTrack) {
            setRemoteStreams(prev => {
              const newMap = new Map(prev);
              newMap.set(participant.user_id, participant.videoTrack);
              console.log('🎥 Added initial video track for participant:', participant.user_id);
              return newMap;
            });
          }
        });
        
        setIsLoading(false);
        console.log('🎥 Stream video call initialized successfully');
        toast.success('Video call connected successfully!');

      } catch (error) {
        console.error('🎥 Error initializing Stream video call:', error);
        setError(`Failed to initialize video call: ${error.message}`);
        setIsLoading(false);
        toast.error('Failed to connect to video call');
      }
    };

    initializeStream();

    // Cleanup on unmount
    return () => {
      initializedRef.current = false;
      if (call) {
        call.leave().catch(console.error);
        // Ensure all event listeners are removed on unmount
        call.off('call.session_participant_joined');
        call.off('call.session_participant_left');
        call.off('call.track_published');
        call.off('call.track_unpublished');
        call.off('call.participant_updated');
        call.off('call.updated');
      }
      if (client) {
        client.disconnectUser().catch(console.error);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [callId, streamToken, user, isHost]);

  // Debug participant changes and remove duplicates
  useEffect(() => {
    console.log('🎥 Participants updated:', participants);
    console.log('🎥 Remote streams:', Array.from(remoteStreams.keys()));
    console.log('🎥 Participant count:', participants.length);
    console.log('🎥 Is Host:', isHost);
    console.log('🎥 User ID:', user._id);
    console.log('🎥 Participants user IDs:', participants.map(p => p.user_id));
    
    // FORCE EMPTY PARTICIPANTS ARRAY FOR HOST ALONE
    if (isHost && participants.length > 0) {
      console.log('🎥 HOST DETECTED WITH PARTICIPANTS - FORCING EMPTY ARRAY');
      console.log('🎥 Current participants:', participants);
      
      // Check if any participant is actually the host
      const hasHostInParticipants = participants.some(p => {
        const participantId = p.user?.id || p.user_id || p.id;
        const participantName = p.user?.name || p.name;
        const currentUserId = user._id.toString();
        const currentUserName = user.name;
        
        const isHostById = participantId?.toString() === currentUserId;
        const isHostByName = participantName === currentUserName;
        
        console.log('🎥 Checking participant:', {
          participantId,
          participantName,
          currentUserId,
          currentUserName,
          isHostById,
          isHostByName,
          isHost: isHostById || isHostByName
        });
        
        return isHostById || isHostByName;
      });
      
      if (hasHostInParticipants) {
        console.log('🎥 HOST FOUND IN PARTICIPANTS - CLEARING ARRAY');
        setParticipants([]);
        return;
      }
      
      // If no host found, filter normally
      const filteredParticipants = participants.filter(p => {
        const participantId = p.user?.id || p.user_id || p.id;
        const participantName = p.user?.name || p.name;
        const currentUserId = user._id.toString();
        const currentUserName = user.name;
        
        const isNotCurrentUser = participantId?.toString() !== currentUserId;
        const isNotCurrentUserByName = participantName !== currentUserName;
        
        if (!isNotCurrentUser || !isNotCurrentUserByName) {
          console.log('🎥 Removing duplicate host from participants:', p);
        }
        
        return isNotCurrentUser && isNotCurrentUserByName;
      });
      
      if (filteredParticipants.length !== participants.length) {
        console.log('🎥 Filtered out duplicates, updating participants array');
        setParticipants(filteredParticipants);
      }
    }
  }, [participants, remoteStreams, isHost, user._id]);

  // Debug chat messages
  useEffect(() => {
    console.log('💬 Chat messages updated:', chatMessages);
    console.log('💬 Chat messages count:', chatMessages.length);
    console.log('💬 Chat messages content:', chatMessages.map(msg => msg.text));
  }, [chatMessages]);

  // Auto-switch to grid view when participants join
  useEffect(() => {
    console.log('🎥 Participant count changed:', participants.length);
    if (participants.length > 0) {
      setIsFullScreen(false);
    } else {
      setIsFullScreen(true);
    }
  }, [participants.length]);

  // Handle initial participants and their video tracks
  useEffect(() => {
    if (call && participants.length > 0) {
      console.log('🎥 Processing initial participants for video tracks...');
      participants.forEach(participant => {
        if (participant.user_id !== user._id.toString() && participant.videoTrack) {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.set(participant.user_id, participant.videoTrack);
            console.log('🎥 Added initial video track for participant:', participant.user_id);
            return newMap;
          });
        }
      });
    }
  }, [call, participants, user._id]);

  const startLocalCamera = async () => {
    try {
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
      console.log('🎥 Local camera started successfully');
      
      // Enable camera in Stream call
      if (call) {
        await call.camera.enable();
        await call.microphone.enable();
      }
      
    } catch (error) {
      console.error('🎥 Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const toggleMute = async () => {
    if (call) {
      try {
        if (isMuted) {
          await call.microphone.enable();
          setIsMuted(false);
          console.log('🎤 Microphone enabled');
        } else {
          await call.microphone.disable();
          setIsMuted(true);
          console.log('🎤 Microphone disabled');
        }
      } catch (error) {
        console.error('Error toggling microphone:', error);
        toast.error('Failed to toggle microphone');
      }
    }
  };

  const toggleVideo = async () => {
    if (call) {
      try {
        if (isVideoOn) {
          await call.camera.disable();
          setIsVideoOn(false);
        } else {
          await call.camera.enable();
          setIsVideoOn(true);
        }
      } catch (error) {
        console.error('Error toggling camera:', error);
      }
    }
  };

  const sendChatMessage = async () => {
    if (call && newMessage.trim()) {
      try {
        const messageText = newMessage.trim();
        
        // Create a simple message object
        const message = {
          id: Date.now(),
          text: messageText,
          user: {
            id: user._id.toString(),
            name: user.name
          },
          timestamp: new Date().toISOString()
        };

        // Try different Stream.io methods for real-time messaging
        try {
          // Method 1: Try using call.update with custom data for messages
          const currentMessages = [...chatMessages, message];
          await call.update({
            custom: {
              chatMessages: currentMessages,
              lastMessage: message,
              senderId: user._id.toString(),
              senderName: user.name,
              timestamp: Date.now()
            }
          });
          console.log('💬 Message sent via call.update:', messageText);
        } catch (updateError) {
          console.log('💬 call.update failed, trying sendReaction:', updateError);
          
          // Method 2: Try using sendReaction for messages
          try {
            await call.sendReaction({
              type: 'chat_message',
              custom: {
                ...message,
                senderId: user._id.toString(),
                senderName: user.name
              }
            });
            console.log('💬 Message sent via sendReaction:', messageText);
          } catch (reactionError) {
            console.log('💬 sendReaction failed, trying alternative methods:', reactionError);
            
            // Method 3: Try using call.state.update for custom data
            try {
              await call.state.update({
                custom: {
                  chatMessages: [...chatMessages, message],
                  lastMessage: message
                }
              });
              console.log('💬 Message sent via call.state.update:', messageText);
            } catch (stateError) {
              console.log('💬 call.state.update failed, using local state only:', stateError);
              
              // Method 4: Just add to local state (fallback)
              console.log('💬 Using local state fallback for message');
            }
          }
        }

        // Add message to local state immediately
        setChatMessages(prev => {
          const newMessages = [...prev, message];
          console.log('💬 Updated chat messages:', newMessages);
          console.log('💬 Chat messages count:', newMessages.length);
          console.log('💬 New message added:', message);
          return newMessages;
        });
        setNewMessage('');
        toast.success('Message sent!');
        
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (client) {
        await client.disconnectUser();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (onCallEnd) onCallEnd();
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to video call...</p>
          <p className="text-gray-300 text-sm mt-2">Call ID: {callId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl mb-2">Video Call Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-white text-xl mb-2">Initializing...</h2>
          <p className="text-gray-300">Setting up video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-primary-950 overflow-auto">
      <StreamVideo client={client}>
        <div className="h-full w-full flex flex-col">
          {/* Minimal Header */}
          <div className="bg-primary-800 text-white p-2 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h1 className="text-lg font-bold">Live Class</h1>
                  <span className="text-xs text-primary-200">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1 hover:bg-primary-700 rounded text-sm transition-colors"
                title={isFullScreen ? "Switch to Grid View" : "Switch to Full Screen"}
              >
                {isFullScreen ? '⊞' : '⛶'}
              </button>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                    className="p-1 hover:bg-primary-700 rounded text-sm transition-colors"
                title="Show Participants"
              >
                👥
              </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="p-1 hover:bg-primary-700 rounded text-sm transition-colors"
                    title="Show Chat"
                  >
                    💬
                  </button>
            </div>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 flex">
            <div className="flex-1 relative bg-primary-900">
              {/* Video Display */}
              <div className="h-full">
                {!localStream ? (
                  // No video streams - show waiting message
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎥</div>
                      <h2 className="text-2xl font-bold mb-2">Waiting for participants...</h2>
                      <p className="text-primary-200 mb-4">Call ID: {callId}</p>
                      <p className="text-sm text-primary-300">
                        {isHost ? 'You are the Host' : 'You are a Student'}
                      </p>
                    </div>
                  </div>
                ) : isFullScreen && participants.length === 0 ? (
                  // Full screen when alone
                  <div className="h-full w-full">
                    <div className="relative w-full h-full bg-primary-800 overflow-hidden">
                      <video
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        ref={(video) => {
                          if (video && localStream) {
                            video.srcObject = localStream;
                          }
                        }}
                      />
                      <div className="absolute bottom-4 left-4 text-white text-sm bg-primary-900 bg-opacity-80 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <div className="font-medium">You ({user.name})</div>
                        <div className="text-xs">
                          {isHost ? 'Host' : 'Student'} • {isMuted ? 'Muted' : 'Unmuted'} • {isVideoOn ? 'Video On' : 'Video Off'}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 text-white text-sm bg-primary-900 bg-opacity-80 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold">Live Class</div>
                          <div className="text-xs">Call ID: {callId}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : participants.length === 0 ? (
                  // Host alone - full screen
                  <div className="h-full w-full">
                    <div className="relative w-full h-full bg-primary-800 overflow-hidden">
                      <video
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        ref={(video) => {
                          if (video && localStream) {
                            video.srcObject = localStream;
                          }
                        }}
                      />
                      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                        <div className="font-medium">👑 Host ({user.name})</div>
                        <div className="text-xs">
                          {isHost ? 'Host' : 'Student'} • {isMuted ? 'Muted' : 'Unmuted'} • {isVideoOn ? 'Video On' : 'Video Off'}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold">Live Class</div>
                          <div className="text-xs">Call ID: {callId}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Grid layout when others join
                  <div className="h-full w-full flex">
                    {/* Host Video - Left Side */}
                    {localStream && (
                      <div className="w-1/2 h-full p-2">
                        <div className="relative bg-primary-800 rounded-lg overflow-hidden border-2 border-primary-500 shadow-lg h-full">
                          <video
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            ref={(video) => {
                              if (video && localStream) {
                                video.srcObject = localStream;
                              }
                            }}
                          />
                          <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                            👑 Host ({user.name}) {isMuted ? '🔇' : '🎤'} {isVideoOn ? '📹' : '📷'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Participants Grid - Right Side */}
                    <div className="w-1/2 h-full p-2">
                      <div className="grid grid-cols-1 gap-2 h-full">
                        {/* Remote Participants with Video */}
                        {Array.from(remoteStreams.entries()).map(([userId, track]) => {
                          const participant = participants.find(p => (p.user?.id || p.user_id) === userId);
                          console.log('🎥 Rendering remote participant:', userId, participant, track);
                          console.log('🎥 Track details for rendering:', {
                            trackKind: track?.kind,
                            trackEnabled: track?.enabled,
                            trackReadyState: track?.mediaStreamTrack?.readyState,
                            trackId: track?.mediaStreamTrack?.id,
                            trackLabel: track?.mediaStreamTrack?.label
                          });
                          return (
                            <div key={userId} className="relative bg-primary-800 rounded-lg overflow-hidden border-2 border-secondary-400 shadow-lg">
                              <video
                                autoPlay
                                playsInline
                                muted={false}
                                className="w-full h-full object-cover"
                                ref={(video) => {
                                  if (video && track && track.mediaStreamTrack) {
                                    try {
                                      // Create a new MediaStream with the track
                                      const stream = new MediaStream([track.mediaStreamTrack]);
                                      video.srcObject = stream;
                                      console.log('🎥 Set video srcObject for participant:', userId);
                                      console.log('🎥 Video element:', video);
                                      console.log('🎥 Stream tracks:', stream.getTracks());
                                      console.log('🎥 Video readyState:', video.readyState);
                                      console.log('🎥 Video videoWidth:', video.videoWidth);
                                      console.log('🎥 Video videoHeight:', video.videoHeight);
                                    } catch (error) {
                                      console.error('🎥 Error setting video srcObject:', error);
                                    }
                                  } else {
                                    console.log('🎥 No track or mediaStreamTrack for participant:', userId);
                                  }
                                }}
                              />
                              <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                                {participant?.name || participant?.user?.name || 'Student'} 📹
                              </div>
                            </div>
                          );
                        })}

                        {/* Placeholder for participants without video */}
                        {participants.filter(p => !remoteStreams.has(p.user?.id || p.user_id)).map((participant, index) => (
                          <div key={`no-video-${participant.user?.id || participant.user_id || index}`} className="relative bg-primary-800 rounded-lg overflow-hidden border-2 border-primary-500 shadow-lg flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-4xl mb-2">👤</div>
                              <p className="text-sm font-medium">{participant.name || participant.user?.name || 'Student'}</p>
                              <p className="text-xs text-primary-300">Camera off</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
                )}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'} text-white hover:opacity-80 transition-colors`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-600' : 'bg-red-600'} text-white hover:opacity-80 transition-colors`}
                  title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoOn ? '📹' : '📷'}
                </button>
                <button
                  onClick={handleLeaveCall}
                  className="p-3 rounded-full bg-red-600 text-white hover:opacity-80 transition-colors"
                  title={isHost ? 'End call' : 'Leave call'}
                >
                  📞
                </button>
              </div>
            </div>

                {/* Participants List */}
                {showParticipants && (
                  <div className="w-80 bg-primary-800 border-l border-primary-700">
                    <div className="p-4 border-b border-primary-700">
                      <h3 className="text-white font-semibold">
                        Participants ({participants.length})
                      </h3>
                    </div>
                    <div className="p-4 space-y-2">
                      {/* Host/Current User */}
                      <div className="text-white text-sm bg-primary-700 p-2 rounded border-l-4 border-primary-500">
                        <p className="font-medium">You ({user.name})</p>
                        <p className="text-xs text-primary-300">
                          {isHost ? 'Host' : 'Student'} • {isMuted ? 'Muted' : 'Unmuted'} • {isVideoOn ? 'Video On' : 'Video Off'}
                        </p>
                      </div>
                      {/* Other Participants */}
                      {participants.map((participant, index) => (
                        <div key={participant.user_id || index} className="text-white text-sm bg-primary-700 p-2 rounded border-l-4 border-secondary-500">
                          <p className="font-medium">{participant.name || 'Unknown User'}</p>
                          <p className="text-xs text-primary-300">Student</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

            {/* Chat Panel */}
            {showChat && (
              <div className="w-80 bg-primary-800 border-l border-primary-700 flex flex-col">
                <div className="p-4 border-b border-primary-700">
                  <h3 className="text-white font-semibold">Chat</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                  {console.log('💬 Rendering chat messages:', chatMessages.length, 'messages')}
                  {chatMessages.length === 0 ? (
                    <div className="text-primary-400 text-sm">No messages yet</div>
                  ) : (
                    chatMessages.map((message) => {
                      console.log('💬 Rendering message:', message);
                      return (
                        <div key={message.id} className="text-white text-sm">
                          <div className="font-medium text-primary-400">{message.user.name}</div>
                          <div className="text-primary-300">{message.text}</div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-primary-700">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => {
                        const testMessage = {
                          id: Date.now(),
                          text: 'Test message from debug button',
                          user: {
                            id: user._id.toString(),
                            name: user.name
                          },
                          timestamp: new Date().toISOString()
                        };
                        console.log('💬 Adding test message:', testMessage);
                        setChatMessages(prev => [...prev, testMessage]);
                      }}
                      className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
                    >
                      Test Chat
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-primary-700 text-white px-3 py-2 rounded-lg border border-primary-600 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </StreamVideo>
    </div>
  );
};

export default StreamVideoCall;