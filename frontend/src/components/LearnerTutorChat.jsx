import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaSmile, 
  FaUserTie,
  FaGraduationCap,
  FaCheckDouble,
  FaClock
} from 'react-icons/fa';
import { showError, showSuccess } from '../services/toastService.jsx';
import websocketService from '../services/websocketService';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const LearnerTutorChat = ({ 
  conversationId, 
  otherUser, 
  onClose,
  onTypingChange
}) => {
  const { user, getToken } = useAuth();
  
  // Safety checks for required props
  if (!conversationId) {
    console.error('❌ LearnerTutorChat: conversationId is required');
    return <div className="p-4 text-red-500">Error: Conversation ID is required</div>;
  }
  
  if (!otherUser || !otherUser._id) {
    console.error('❌ LearnerTutorChat: otherUser is required');
    return <div className="p-4 text-red-500">Error: Other user information is required</div>;
  }
  
  if (!user || !user._id) {
    console.error('❌ LearnerTutorChat: user is not authenticated');
    return <div className="p-4 text-red-500">Error: User not authenticated</div>;
  }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState('offline');
  const [otherUserLastSeen, setOtherUserLastSeen] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const processedMessageIds = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  // Notification function for incoming messages
  const showIncomingMessageNotification = (data) => {
    // Show toast notification
    showSuccess(`New message from ${data.senderName}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`);
    
    // Show browser notification if available
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`New message from ${data.senderName}`, {
          body: data.content,
          icon: '/favicon.ico',
          tag: `message-${data.id}`
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`New message from ${data.senderName}`, {
              body: data.content,
              icon: '/favicon.ico',
              tag: `message-${data.id}`
            });
          }
        });
      }
    }
  };

  const loadMessages = async () => {
    try {
      console.log('📨 Loading messages for conversation:', conversationId);
      
      const response = await apiService.get(`/chat/conversation/${conversationId}`);
      console.log('📨 Loaded messages data:', response.data);
      
      // Handle different response structures
      let messages = [];
      if (response.data.success && response.data.data && response.data.data.messages) {
        messages = response.data.data.messages;
      } else if (response.data.messages) {
        messages = response.data.messages;
      } else if (response.data.data && response.data.data.messages) {
        messages = response.data.data.messages;
      } else if (Array.isArray(response.data)) {
        messages = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        messages = response.data.data;
      }
        
      console.log('📨 Raw messages array:', messages);
      console.log('📨 First message structure:', messages[0]);
      
      // Ensure all messages have required properties and sort by creation date
      const validMessages = messages
        .filter(msg => {
          const isValid = msg && 
            msg._id && 
            msg.sender && 
            msg.content &&
            msg.content.trim() !== '';
          
          if (!isValid) {
            console.warn('⚠️ Invalid message found:', msg);
          }
          
          return isValid;
        })
        .map(msg => ({
          _id: msg._id,
          sender: msg.sender._id || msg.sender,
          receiver: msg.receiver._id || msg.receiver,
          content: msg.content,
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
          conversation: msg.conversation || conversationId,
          senderName: msg.sender?.name || 'Unknown',
          senderRole: msg.sender?.role || 'user'
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      console.log(`📨 Loaded ${validMessages.length} valid messages out of ${messages.length} total`);
      console.log('📨 Sample formatted message:', validMessages[0]);
      
      setMessages(validMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      console.error('Error details:', {
        conversationId,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      });
      showError('Error loading messages. Please try again.');
    }
  };

  const handleIncomingMessage = (data) => {
    console.log('📨 Received Socket.IO message:', data);
    console.log('📨 Current conversationId:', conversationId);
    console.log('📨 Message conversationId:', data.conversationId);
    console.log('📨 Current user ID:', user?._id);
    console.log('📨 Message sender ID:', data.senderId);
    console.log('📨 Message ID:', data.id);
    console.log('📨 Processed IDs:', Array.from(processedMessageIds.current));
    
    if (data.conversationId === conversationId) {
      // Check if we've already processed this exact message ID
      if (processedMessageIds.current.has(data.id)) {
        console.log('📨 Message already processed, skipping duplicate:', data.id);
        return;
      }
      
      // Mark this message ID as processed
      processedMessageIds.current.add(data.id);
      
      // Additional check for content-based duplicates (within 5 seconds)
      const contentDuplicate = messages.some(msg => 
        msg.sender === data.senderId && 
        msg.content === data.content && 
        Math.abs(new Date(msg.createdAt).getTime() - new Date(data.timestamp).getTime()) < 5000
      );
      
      if (contentDuplicate) {
        console.log('📨 Content-based duplicate detected, skipping:', data.content);
        return;
      }
      
      const newMessage = {
        _id: data.id,
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content,
        createdAt: data.timestamp,
        conversation: data.conversationId,
        senderName: data.senderName,
        senderRole: data.senderRole
      };
      
      console.log('📨 Adding new message to state:', newMessage);
      setMessages(prev => {
        const updated = [...prev, newMessage];
        console.log('📨 Updated messages array length:', updated.length);
        return updated;
      });
      
      // Show notification for incoming messages (not from current user)
      if (data.senderId !== user?._id) {
        showIncomingMessageNotification(data);
      }
      
      // Show success toast for sent messages
      if (data.senderId === user?._id) {
        showSuccess('Message sent successfully!');
        setIsSending(false);
      }
    } else {
      console.log('📨 Message not for current conversation, ignoring');
    }
  };

  const handleTyping = (data) => {
    console.log('⌨️ Received typing event:', data);
    if (data.conversationId === conversationId) {
      console.log('⌨️ Setting typing users:', data.users);
      setTypingUsers(data.users || []);
      
      // Notify parent component about typing status
      if (onTypingChange) {
        onTypingChange(data.users && data.users.length > 0);
      }
    }
  };

  const handleUserOnline = (data) => {
    console.log('👤 User came online:', data);
    if (data.userId === otherUser._id) {
      setIsOnline(true);
      setOtherUserStatus(data.status || 'online');
      setOtherUserLastSeen(data.lastSeen || new Date());
    }
  };

  const handleUserOffline = (data) => {
    console.log('👤 User went offline:', data);
    if (data.userId === otherUser._id) {
      setIsOnline(false);
      setOtherUserStatus('offline');
      setOtherUserLastSeen(data.lastSeen || new Date());
    }
  };

  // Handle online users list
  const handleOnlineUsers = (users) => {
    console.log('👥 Online users received:', users);
    setOnlineUsers(users);
    
    // Check if the other user is online
    const otherUserPresence = users.find(u => u.userId === otherUser._id);
    if (otherUserPresence) {
      setIsOnline(true);
      setOtherUserStatus(otherUserPresence.status || 'online');
      setOtherUserLastSeen(otherUserPresence.lastSeen);
    } else {
      setIsOnline(false);
      setOtherUserStatus('offline');
    }
  };

  // Handle conversation partners status
  const handleConversationPartnersStatus = (partners) => {
    console.log('👥 Conversation partners status:', partners);
    const otherUserPresence = partners.find(p => p.userId === otherUser._id);
    if (otherUserPresence) {
      setIsOnline(otherUserPresence.isOnline);
      setOtherUserStatus(otherUserPresence.status || 'offline');
      setOtherUserLastSeen(otherUserPresence.lastSeen);
    }
  };

  // Handle user presence updates
  const handleUserPresenceUpdated = (data) => {
    console.log('📱 User presence updated:', data);
    if (data.userId === otherUser._id) {
      setOtherUserStatus(data.status || 'online');
      setOtherUserLastSeen(data.lastSeen || new Date());
    }
  };

  // Handle Socket.IO connection
  const handleConnected = () => {
    // Listen for chat messages
    websocketService.on('chat_message', handleIncomingMessage);
    websocketService.on('typing', handleTyping);
    websocketService.on('user_online', handleUserOnline);
    websocketService.on('user_offline', handleUserOffline);
    websocketService.on('online_users', handleOnlineUsers);
    websocketService.on('conversation_partners_status', handleConversationPartnersStatus);
    websocketService.on('user_presence_updated', handleUserPresenceUpdated);
    
    // Join conversation room
    console.log('🔗 Learner attempting to join conversation room:', conversationId);
    websocketService.joinConversation(conversationId);
    
    // Load existing messages
    loadMessages();
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = getToken();
    if (token) {
      websocketService.connect(token);
      
      // If already connected, set up immediately
      if (websocketService.isConnected) {
        handleConnected();
      } else {
        // Wait for connection
        websocketService.on('connected', handleConnected);
      }
    }

    return () => {
      websocketService.off('chat_message', handleIncomingMessage);
      websocketService.off('typing', handleTyping);
      websocketService.off('user_online', handleUserOnline);
      websocketService.off('user_offline', handleUserOffline);
      websocketService.off('connected', handleConnected);
      websocketService.leaveConversation(conversationId);
      // Clear processed message IDs when component unmounts
      processedMessageIds.current.clear();
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);

  // Heartbeat to keep connection alive and update presence
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (websocketService.isConnected) {
        websocketService.ping();
        // Update presence to show user is active in chat
        websocketService.updatePresence('online', 'in_chat');
      }
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);

  // Clear processed message IDs when conversation changes
  useEffect(() => {
    processedMessageIds.current.clear();
    console.log('📨 Cleared processed message IDs for new conversation:', conversationId);
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const token = getToken();
    console.log('📤 Sending message data:', { conversationId, content: newMessage.trim(), receiverId: otherUser._id });
    console.log('📤 Token available:', !!token);
    console.log('📤 User ID:', user?._id);
    console.log('📤 Other user ID:', otherUser._id);

    try {
      setIsSending(true);
      // Clear input immediately to prevent double-sending
      const messageContent = newMessage.trim();
      setNewMessage('');
      
      const messageData = {
        conversationId,
        content: messageContent,
        receiverId: otherUser._id
      };
      
      // Send via WebSocket for real-time messaging
      console.log('📤 Sending message via WebSocket:', {
        conversationId,
        content: messageContent,
        receiverId: otherUser._id,
        messageType: 'text',
        websocketConnected: websocketService.isConnected
      });
      
      if (websocketService.isConnected) {
        websocketService.sendMessage({
          conversationId,
          content: messageContent,
          receiverId: otherUser._id,
          messageType: 'text'
        });
        console.log('✅ Message sent via WebSocket');
      } else {
        console.log('⚠️ WebSocket not connected, sending via API fallback');
        // Fallback to API if WebSocket is not connected
        const response = await apiService.post('/chat/chat', {
          conversationId,
          content: messageContent,
          receiverId: otherUser._id
        });
        console.log('✅ Message sent via API fallback:', response.data);
        showSuccess('Message sent successfully!');
      }
      
      // Success message will be shown when we receive the message back
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Send message error details:', {
        conversationId,
        content: messageContent,
        receiverId: otherUser._id,
        errorMessage: error.message,
        errorResponse: error.response?.data
      });
      showError('Failed to send message. Please try again.');
      setIsSending(false);
    }
  };

  const handleTypingStart = () => {
    if (websocketService.isConnected) {
      console.log('⌨️ Starting to type...');
      if (!isTyping) {
        setIsTyping(true);
        websocketService.send('typing', { conversationId, isTyping: true });
      }
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 3000);
    }
  };

  const handleTypingStop = () => {
    if (isTyping && websocketService.isConnected) {
      console.log('⌨️ Stopped typing...');
      setIsTyping(false);
      websocketService.send('typing', { conversationId, isTyping: false });
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeen.toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  // Get status text
  const getStatusText = (status, isOnline) => {
    if (!isOnline) return 'Offline';
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Online';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with Online Status */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            {/* Online indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser?.name || 'Tutor'}</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${getStatusColor(otherUserStatus)}`}>
                {getStatusText(otherUserStatus, isOnline)}
              </span>
              {!isOnline && otherUserLastSeen && (
                <span className="text-xs text-gray-500">
                  • Last seen {formatLastSeen(otherUserLastSeen)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FaUserTie className="text-4xl mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Start a conversation with {otherUser?.name || 'your tutor'}</p>
            <p className="text-sm mt-2">Ask questions about your courses or get help!</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Conversation ID: {conversationId}</p>
              <p>Other User: {otherUser?.name || 'Unknown'}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Total messages: {messages.length}</p>
                <p>Valid messages: {messages.filter(m => m && m._id && m.content && m.sender).length}</p>
                <p>User ID: {user?._id}</p>
                <p>Other User ID: {otherUser?._id}</p>
              </div>
            )}
            
            {messages
              .filter(message => {
                // More comprehensive message validation
                const isValid = message && 
                  message._id && 
                  message.content && 
                  message.content.trim() !== '' &&
                  message.sender;
                
                if (!isValid) {
                  console.warn('⚠️ Invalid message filtered out:', message);
                } else {
                  console.log('✅ Valid message:', {
                    id: message._id,
                    sender: message.sender,
                    content: message.content.substring(0, 20) + '...',
                    createdAt: message.createdAt
                  });
                }
                
                return isValid;
              })
              .map((message, index) => {
            const isOwnMessage = message.sender === user?._id;
            const showDate = index === 0 || 
              formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

            console.log('🎨 Rendering message:', {
              id: message._id,
              isOwnMessage,
              showDate,
              content: message.content.substring(0, 20) + '...'
            });

            return (
              <div key={message._id || `msg-${index}`}>
                {showDate && (
                  <div className="text-center text-xs text-gray-500 py-2">
                    {formatDate(message.createdAt)}
                  </div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isOwnMessage 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-900 shadow-sm rounded-bl-md border border-gray-100'
                  }`}>
                    <p className="text-sm leading-relaxed break-words">
                      {message.content || 'Message content unavailable'}
                    </p>
                    <div className={`flex items-center justify-end mt-2 text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="mr-1">{formatTime(message.createdAt || new Date())}</span>
                      {isOwnMessage && (
                        <FaCheckDouble className="text-xs" />
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTypingStart();
              }}
              onBlur={handleTypingStop}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTypingStop();
                }
              }}
              placeholder={`Message ${otherUser?.name || 'your tutor'}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
        
        {/* Simple Purpose Statement */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          💬 Ask questions about your courses and get help from your tutor
        </div>
        
        {/* Debug Information */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          WebSocket: {websocketService.isConnected ? '✅ Connected' : '❌ Disconnected'} | 
          Messages: {messages.length} | 
          Processed IDs: {processedMessageIds.current.size}
        </div>
      </div>
    </div>
  );
};

export default LearnerTutorChat;
