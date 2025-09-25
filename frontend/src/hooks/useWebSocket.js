import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';

const useWebSocket = (roomId = null) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const messageQueueRef = useRef([]);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!user || !token) {
      setError('User not authenticated');
      return;
    }

    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const wsUrl = `${config.websocket.url}?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        
        // Join room if specified
        if (roomId) {
          sendMessage({
            type: 'join_room',
            data: { roomId }
          });
        }

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          sendMessage({
            type: 'ping',
            data: { timestamp: Date.now() }
          });
        }, config.websocket.pingInterval);

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const queuedMessage = messageQueueRef.current.shift();
          wsRef.current.send(JSON.stringify(queuedMessage));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleIncomingMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < config.websocket.maxReconnectAttempts) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, config.websocket.reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [user, token, roomId, isConnecting, isConnected, reconnectAttempts]);

  // Handle incoming messages
  const handleIncomingMessage = useCallback((message) => {
    const { type, payload } = message;

    switch (type) {
      case 'connected':
        console.log('WebSocket connected successfully:', payload);
        break;
        
      case 'chat_message':
        setMessages(prev => [...prev, {
          id: Date.now(),
          userId: payload.userId,
          userName: payload.userName,
          message: payload.message,
          messageType: payload.messageType || 'text',
          timestamp: payload.timestamp,
          isOwn: payload.userId === user?._id
        }]);
        break;
        
      case 'user_joined':
        setParticipants(prev => {
          const newParticipants = [...prev];
          const existingIndex = newParticipants.findIndex(p => p.id === payload.userId);
          if (existingIndex === -1) {
            newParticipants.push({
              id: payload.userId,
              name: payload.userName || 'Unknown User',
              joinedAt: payload.timestamp
            });
          }
          return newParticipants;
        });
        break;
        
      case 'user_left':
        setParticipants(prev => prev.filter(p => p.id !== payload.userId));
        break;
        
      case 'live_session_update':
        // Handle live session updates
        console.log('Live session update:', payload);
        break;
        
      case 'notification':
        // Handle notifications
        console.log('Notification received:', payload);
        break;
        
      case 'pong':
        // Handle ping response
        break;
        
      default:
        console.log('Unknown message type:', type, payload);
    }
  }, [user]);

  // Send message
  const sendMessage = useCallback((message) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Queue message if not connected
      messageQueueRef.current.push(message);
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((message, messageType = 'text') => {
    if (!roomId) {
      console.error('No room ID specified for chat message');
      return false;
    }

    return sendMessage({
      type: 'chat_message',
      data: {
        roomId,
        message,
        messageType
      }
    });
  }, [roomId, sendMessage]);

  // Join room
  const joinRoom = useCallback((newRoomId) => {
    if (roomId) {
      // Leave current room first
      sendMessage({
        type: 'leave_room',
        data: { roomId }
      });
    }

    return sendMessage({
      type: 'join_room',
      data: { roomId: newRoomId }
    });
  }, [roomId, sendMessage]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (roomId) {
      return sendMessage({
        type: 'leave_room',
        data: { roomId }
      });
    }
    return false;
  }, [roomId, sendMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
    }
    
    // Clear intervals
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  }, []);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (user && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    
    // Messages and participants
    messages,
    participants,
    
    // Actions
    sendMessage,
    sendChatMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
    
    // Room info
    currentRoom: roomId
  };
};

export default useWebSocket;
