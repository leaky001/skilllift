const WebSocket = require('ws');

// Test WebSocket server connection
const testWebSocket = () => {
  console.log('🧪 Testing WebSocket server connection...');
  
  const ws = new WebSocket('ws://localhost:3001/ws/call/test-call');
  
  ws.on('open', () => {
    console.log('✅ WebSocket server is running and accessible!');
    ws.close();
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket server error:', error.message);
    console.log('💡 Make sure to run: node websocket-server.js');
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });
};

testWebSocket();
