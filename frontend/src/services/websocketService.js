import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.token = null;
    this.messageQueue = [];
  }

  connect(token) {
    // If already connecting or connected with the same token, skip
    if (this.socket && (this.socket.connected || this.socket.connecting)) {
      if (this.token === token) {
        console.log('🔌 Socket already connected/connecting with same token, skipping reconnection');
        return;
      } else {
        console.log('🔌 Token changed, disconnecting and reconnecting');
        this.disconnect();
      }
    }

    this.token = token;
    const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    console.log('🔌 Attempting to connect to Socket.IO server:', serverUrl);
    console.log('🔌 Token available:', !!token);
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      query: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      forceNew: true // Force new connection
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket.id);
      console.log('Socket.IO connection details:', {
        id: this.socket.id,
        connected: this.socket.connected,
        transport: this.socket.io.engine.transport.name
      });
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Send any queued messages
      if (this.messageQueue && this.messageQueue.length > 0) {
        console.log(`Sending ${this.messageQueue.length} queued messages`);
        this.messageQueue.forEach(({ type, data }) => {
          this.socket.emit(type, data);
        });
        this.messageQueue = [];
      }
      
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      console.error('Connection error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      this.emit('error', error);
    });

    // Handle incoming messages
    this.socket.on('chat_message', (data) => {
      this.emit('chat_message', data);
    });

    this.socket.on('typing', (data) => {
      this.emit('typing', data);
    });

    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('live_session_update', (data) => {
      this.emit('live_session_update', data);
    });

    this.socket.on('mentorship_request', (data) => {
      this.emit('mentorship_request', data);
    });

    this.socket.on('payment_update', (data) => {
      this.emit('payment_update', data);
    });

    // Live class specific events
    this.socket.on('participants-list', (data) => {
      this.emit('participants-list', data);
    });

    this.socket.on('user-joined', (data) => {
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.emit('user-left', data);
    });

    this.socket.on('chat-message', (data) => {
      this.emit('chat-message', data);
    });

    this.socket.on('hand-raise-update', (data) => {
      this.emit('hand-raise-update', data);
    });

    // Live class events removed - Live class functionality deleted
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  sendMessage(messageData) {
    console.log('📤 WebsocketService: Sending chat message:', messageData);
    this.send('chat_message', messageData);
  }

  send(type, data) {
    console.log('📤 WebsocketService: Sending message:', { type, data, connected: this.socket?.connected });
    if (this.socket && this.socket.connected) {
      this.socket.emit(type, data);
      console.log('✅ WebsocketService: Message sent successfully');
    } else {
      console.warn('Socket.IO is not connected - message queued for when connection is established');
      // Queue the message for when connection is established
      if (!this.messageQueue) {
        this.messageQueue = [];
      }
      this.messageQueue.push({ type, data });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Specific methods for different features
  sendNotification(notification) {
    this.send('notification', notification);
  }

  sendChatMessage(message) {
    this.send('chat_message', message);
  }

  joinLiveSession(sessionId) {
    this.send('join_session', { sessionId });
  }

  leaveLiveSession(sessionId) {
    this.send('leave_session', { sessionId });
  }

  sendSessionMessage(sessionId, message) {
    this.send('session_message', { sessionId, message });
  }

  // Chat-specific methods
  joinConversation(conversationId) {
    console.log('🔗 WebsocketService: Joining conversation room:', conversationId);
    this.send('join_conversation', { conversationId });
  }

  leaveConversation(conversationId) {
    this.send('leave_conversation', { conversationId });
  }

  sendTyping(conversationId, isTyping) {
    this.send('typing', { conversationId, isTyping });
  }

  markMessageRead(messageId) {
    this.send('mark_message_read', { messageId });
  }

  // Utility methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket ? this.socket.id : null,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;