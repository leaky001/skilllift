import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    // Disconnect existing connection if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    if (!token) {
      console.error('🔌 No token provided for WebSocket connection');
      return null;
    }

    console.log('🔌 Connecting to WebSocket server with token...');
    
    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('🔌 WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export default new SocketService();
