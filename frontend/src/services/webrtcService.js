/**
 * Enhanced WebRTC Service for Multi-Participant Video Chat
 * Similar to Google Meet functionality
 */

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.peerConnections = new Map(); // Store multiple peer connections
    this.remoteStreams = new Map(); // Store remote video streams
    this.socket = null;
    this.roomId = null;
    this.userId = null;
    this.isHost = false;
    
    // Configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
    
    // Event callbacks
    this.onLocalStream = null;
    this.onRemoteStream = null;
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onError = null;
  }

  /**
   * Initialize WebRTC service
   */
  async initialize(socket, roomId, userId, isHost = false) {
    this.socket = socket;
    this.roomId = roomId;
    this.userId = userId;
    this.isHost = isHost;

    // Setup socket event listeners
    this.setupSocketListeners();
    
    // Get user media
    await this.getUserMedia();
    
    console.log('🎥 WebRTC Service initialized:', { roomId, userId, isHost });
  }

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Notify about local stream
      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }
      
      console.log('🎥 Local stream obtained:', {
        videoTracks: this.localStream.getVideoTracks().length,
        audioTracks: this.localStream.getAudioTracks().length
      });
      
      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      if (this.onError) {
        this.onError('Failed to access camera/microphone: ' + error.message);
      }
      throw error;
    }
  }

  /**
   * Setup Socket.IO event listeners for signaling
   */
  setupSocketListeners() {
    // Handle new participant joining
    this.socket.on('participant-joined', async (data) => {
      console.log('👥 Participant joined:', data);
      if (data.userId !== this.userId) {
        await this.createPeerConnection(data.userId);
      }
      if (this.onParticipantJoined) {
        this.onParticipantJoined(data);
      }
    });

    // Handle participant leaving
    this.socket.on('participant-left', (data) => {
      console.log('👥 Participant left:', data);
      this.closePeerConnection(data.userId);
      if (this.onParticipantLeft) {
        this.onParticipantLeft(data);
      }
    });

    // Handle WebRTC offers
    this.socket.on('webrtc-offer', async (data) => {
      console.log('📞 Received offer from:', data.from);
      await this.handleOffer(data.from, data.offer);
    });

    // Handle WebRTC answers
    this.socket.on('webrtc-answer', async (data) => {
      console.log('📞 Received answer from:', data.from);
      await this.handleAnswer(data.from, data.answer);
    });

    // Handle ICE candidates
    this.socket.on('webrtc-ice-candidate', async (data) => {
      console.log('🧊 Received ICE candidate from:', data.from);
      await this.handleIceCandidate(data.from, data.candidate);
    });

    // Handle screen share offers
    this.socket.on('screen-share-offer', async (data) => {
      console.log('🖥️ Received screen share offer from:', data.from);
      await this.handleScreenShareOffer(data.from, data.offer);
    });
  }

  /**
   * Create peer connection with another participant
   */
  async createPeerConnection(participantId) {
    try {
      const peerConnection = new RTCPeerConnection(this.rtcConfig);
      
      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('📺 Received remote stream from:', participantId);
        const remoteStream = event.streams[0];
        this.remoteStreams.set(participantId, remoteStream);
        
        if (this.onRemoteStream) {
          this.onRemoteStream(participantId, remoteStream);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('webrtc-ice-candidate', {
            roomId: this.roomId,
            to: participantId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`🔗 Connection state with ${participantId}:`, peerConnection.connectionState);
      };

      this.peerConnections.set(participantId, peerConnection);
      
      // If we're the host or joining an existing room, create offer
      if (this.isHost || this.peerConnections.size > 1) {
        await this.createOffer(participantId);
      }
      
      console.log('✅ Peer connection created with:', participantId);
    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      if (this.onError) {
        this.onError('Failed to establish connection: ' + error.message);
      }
    }
  }

  /**
   * Create and send offer
   */
  async createOffer(participantId) {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (!peerConnection) return;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.socket.emit('webrtc-offer', {
        roomId: this.roomId,
        to: participantId,
        offer: offer
      });

      console.log('📞 Offer sent to:', participantId);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(from, offer) {
    try {
      let peerConnection = this.peerConnections.get(from);
      
      if (!peerConnection) {
        await this.createPeerConnection(from);
        peerConnection = this.peerConnections.get(from);
      }

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit('webrtc-answer', {
        roomId: this.roomId,
        to: from,
        answer: answer
      });

      console.log('📞 Answer sent to:', from);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(from, answer) {
    try {
      const peerConnection = this.peerConnections.get(from);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
        console.log('📞 Answer received from:', from);
      }
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(from, candidate) {
    try {
      const peerConnection = this.peerConnections.get(from);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
        console.log('🧊 ICE candidate added from:', from);
      }
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
    }
  }

  /**
   * Toggle video track
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('📹 Video toggled:', videoTrack.enabled);
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle audio track
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio toggled:', audioTrack.enabled);
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      
      this.peerConnections.forEach((peerConnection, participantId) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      console.log('🖥️ Screen sharing started');
      return screenStream;
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      if (this.onError) {
        this.onError('Failed to start screen sharing: ' + error.message);
      }
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare() {
    try {
      // Get original video track
      const originalStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const originalVideoTrack = originalStream.getVideoTracks()[0];

      // Replace screen share track with original video track
      this.peerConnections.forEach((peerConnection, participantId) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(originalVideoTrack);
        }
      });

      console.log('🖥️ Screen sharing stopped');
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
    }
  }

  /**
   * Close peer connection
   */
  closePeerConnection(participantId) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
      this.remoteStreams.delete(participantId);
      console.log('🔌 Peer connection closed with:', participantId);
    }
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    // Close all peer connections
    this.peerConnections.forEach((peerConnection, participantId) => {
      peerConnection.close();
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    console.log('🧹 WebRTC Service cleaned up');
  }

  /**
   * Get connection statistics
   */
  async getStats() {
    const stats = {};
    
    for (const [participantId, peerConnection] of this.peerConnections) {
      try {
        const connectionStats = await peerConnection.getStats();
        stats[participantId] = {
          connectionState: peerConnection.connectionState,
          iceConnectionState: peerConnection.iceConnectionState,
          stats: connectionStats
        };
      } catch (error) {
        console.error('Error getting stats for', participantId, error);
      }
    }
    
    return stats;
  }
}

// Export singleton instance
export default new WebRTCService();
