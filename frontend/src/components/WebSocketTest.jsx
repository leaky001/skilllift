import React from 'react';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketTest = () => {
  const {
    isConnected,
    isConnecting,
    error,
    messages,
    participants,
    sendChatMessage,
    sendMessage
  } = useWebSocket('test-room');

  const handleTestMessage = () => {
    sendChatMessage('Hello from WebSocket test!');
  };

  const handlePing = () => {
    sendMessage({
      type: 'ping',
      data: { timestamp: Date.now() }
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">WebSocket Test</h2>
      
      {/* Connection Status */}
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <div className="space-y-2">
          <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p>Connecting: {isConnecting ? '🔄 Yes' : '❌ No'}</p>
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Test Controls</h3>
        <div className="space-x-2">
          <button
            onClick={handleTestMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Send Test Message
          </button>
          <button
            onClick={handlePing}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Send Ping
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Messages ({messages.length})</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                <strong>{msg.userName}:</strong> {msg.message}
                <br />
                <small className="text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
        <div className="space-y-1">
          {participants.length === 0 ? (
            <p className="text-gray-500">No participants yet</p>
          ) : (
            participants.map((participant, index) => (
              <div key={index} className="text-sm">
                {participant.name} - Joined: {new Date(participant.joinedAt).toLocaleTimeString()}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;
