const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active connections
const connections = new Map();
const callRooms = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const callId = url.pathname.split('/').pop();
  
  if (!callId) {
    ws.close(1008, 'Call ID required');
    return;
  }
  
  console.log('📞 Connection for call:', callId);
  
  // Store connection
  const connectionId = `${callId}-${Date.now()}`;
  connections.set(connectionId, {
    ws,
    callId,
    userId: null,
    userName: null,
    isHost: false
  });
  
  // Initialize call room if it doesn't exist
  if (!callRooms.has(callId)) {
    callRooms.set(callId, new Set());
  }
  
  // Handle messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 Received message:', message.type);
      
      handleMessage(connectionId, message);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log('🔌 Connection closed:', connectionId);
    handleDisconnection(connectionId);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Handle incoming messages
function handleMessage(connectionId, message) {
  const connection = connections.get(connectionId);
  if (!connection) return;
  
  const { callId, userId } = connection;
  const room = callRooms.get(callId);
  
  switch (message.type) {
    case 'join':
      handleJoin(connectionId, message);
      break;
      
    case 'offer':
    case 'answer':
    case 'ice-candidate':
      handleSignaling(connectionId, message);
      break;
      
    default:
      console.log('❓ Unknown message type:', message.type);
  }
}

// Handle user join
function handleJoin(connectionId, message) {
  const connection = connections.get(connectionId);
  if (!connection) return;
  
  const { callId } = connection;
  const room = callRooms.get(callId);
  
  // Update connection info
  connection.userId = message.userId;
  connection.userName = message.userName;
  connection.isHost = message.isHost;
  
  // Add to room
  room.add(connectionId);
  
  console.log('👤 User joined:', message.userName, 'to call:', callId);
  console.log('👥 Room now has:', room.size, 'participants');
  
  // Get all participants in the room (including the new one)
  const allParticipants = Array.from(room).map(id => {
    const conn = connections.get(id);
    return {
      userId: conn.userId,
      userName: conn.userName,
      isHost: conn.isHost
    };
  });
  
  console.log('👥 All participants:', allParticipants);
  
  // Send updated participant list to ALL participants in the room
  Array.from(room).forEach(id => {
    const conn = connections.get(id);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      // Send participants list (excluding self)
      const otherParticipants = allParticipants.filter(p => p.userId !== conn.userId);
      
      conn.ws.send(JSON.stringify({
        type: 'participants',
        participants: otherParticipants,
        totalParticipants: allParticipants.length
      }));
      
      console.log(`📤 Sent ${otherParticipants.length} participants to ${conn.userName}`);
    }
  });
  
  // Notify others about new user (for WebRTC signaling)
  const otherConnections = Array.from(room).filter(id => id !== connectionId);
  otherConnections.forEach(id => {
    const conn = connections.get(id);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify({
        type: 'user-joined',
        userId: message.userId,
        userName: message.userName,
        isHost: message.isHost
      }));
    }
  });
}

// Handle signaling messages (offer, answer, ice-candidate)
function handleSignaling(connectionId, message) {
  const connection = connections.get(connectionId);
  if (!connection) return;
  
  const { callId } = connection;
  const room = callRooms.get(callId);
  
  // Find target connection
  const targetConnection = Array.from(room).find(id => {
    const conn = connections.get(id);
    return conn && conn.userId === message.targetUserId;
  });
  
  if (targetConnection) {
    const targetConn = connections.get(targetConnection);
    if (targetConn && targetConn.ws.readyState === WebSocket.OPEN) {
      // Forward message to target
      targetConn.ws.send(JSON.stringify({
        ...message,
        fromUserId: connection.userId
      }));
    }
  }
}

// Handle disconnection
function handleDisconnection(connectionId) {
  const connection = connections.get(connectionId);
  if (!connection) return;
  
  const { callId, userId, userName } = connection;
  const room = callRooms.get(callId);
  
  // Remove from room
  room.delete(connectionId);
  
  // Remove connection
  connections.delete(connectionId);
  
  console.log('👤 User left:', userName, 'from call:', callId);
  console.log('👥 Room now has:', room.size, 'participants');
  
  // Get remaining participants
  const remainingParticipants = Array.from(room).map(id => {
    const conn = connections.get(id);
    return {
      userId: conn.userId,
      userName: conn.userName,
      isHost: conn.isHost
    };
  });
  
  // Update participant list for all remaining participants
  Array.from(room).forEach(id => {
    const conn = connections.get(id);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      // Send participants list (excluding self)
      const otherParticipants = remainingParticipants.filter(p => p.userId !== conn.userId);
      
      conn.ws.send(JSON.stringify({
        type: 'participants',
        participants: otherParticipants,
        totalParticipants: remainingParticipants.length
      }));
      
      // Also notify about user leaving
      conn.ws.send(JSON.stringify({
        type: 'user-left',
        userId: userId,
        userName: userName
      }));
    }
  });
  
  // Clean up empty rooms
  if (room.size === 0) {
    callRooms.delete(callId);
    console.log('🧹 Cleaned up empty room:', callId);
  }
}

// Start server
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`🔌 WebSocket URL: ws://localhost:${PORT}/ws/call/{callId}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down WebSocket server...');
  server.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});
