import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPaperPlane, 
  FaSmile, 
  FaImage, 
  FaMicrophone, 
  FaStop,
  FaUser,
  FaCrown,
  FaEllipsisV,
  FaFlag,
  FaBan
} from 'react-icons/fa';
import { showError, showSuccess } from '../../services/toastService.jsx';

const LiveChat = ({ sessionId, userRole, isActive = true }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock data for demonstration
  const mockMessages = [
    {
      id: 1,
      userId: 'tutor-1',
      userName: 'John Doe',
      userRole: 'tutor',
      message: 'Welcome everyone to today\'s session!',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: 2,
      userId: 'learner-1',
      userName: 'Alice Smith',
      userRole: 'learner',
      message: 'Hi! Excited to learn today',
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    },
    {
      id: 3,
      userId: 'learner-2',
      userName: 'Bob Johnson',
      userRole: 'learner',
      message: 'Can you explain the last concept again?',
      timestamp: new Date(Date.now() - 120000),
      type: 'text'
    }
  ];

  useEffect(() => {
    // Load initial messages
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isActive) return;

    try {
      const messageData = {
        id: Date.now(),
        userId: 'current-user',
        userName: 'You',
        userRole: userRole,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };

      // Add message to local state
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');

      // TODO: Send to backend/WebSocket
      // await sendMessageToServer(sessionId, messageData);

      showSuccess('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceMessage = () => {
    if (!isRecording) {
      setIsRecording(true);
      // TODO: Start voice recording
      showSuccess('Voice recording started');
    } else {
      setIsRecording(false);
      // TODO: Stop and send voice message
      showSuccess('Voice message sent!');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Upload file and send as message
      showSuccess('File uploaded successfully!');
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageBubbleClass = (message) => {
    const isOwnMessage = message.userId === 'current-user';
    const baseClass = 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg';
    
    if (message.userRole === 'tutor') {
      return `${baseClass} bg-yellow-100 text-yellow-900`;
    } else if (isOwnMessage) {
      return `${baseClass} bg-blue-500 text-white ml-auto`;
    } else {
      return `${baseClass} bg-gray-100 text-gray-900`;
    }
  };

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.userId === 'current-user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="flex items-start space-x-2">
        {message.userId !== 'current-user' && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600 text-sm" />
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              {message.userName}
            </span>
            {message.userRole === 'tutor' && (
              <FaCrown className="text-yellow-500 text-xs" />
            )}
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          <div className={getMessageBubbleClass(message)}>
            {message.type === 'text' && (
              <p className="text-sm">{message.message}</p>
            )}
            {message.type === 'image' && (
              <img src={message.message} alt="Shared image" className="max-w-full rounded" />
            )}
            {message.type === 'voice' && (
              <div className="flex items-center space-x-2">
                <FaMicrophone className="text-sm" />
                <span className="text-sm">Voice message</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-gray-900">Live Chat</h3>
            <span className="text-sm text-gray-500">
              {messages.length} messages
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isActive && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Active
              </span>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              <FaEllipsisV className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUsers.join(', ')} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        {!isActive && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            Chat is currently disabled for this session.
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          {/* File Upload */}
          <label className="cursor-pointer text-gray-400 hover:text-gray-600">
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!isActive}
            />
            <FaImage className="text-lg" />
          </label>

          {/* Voice Message */}
          <button
            onClick={handleVoiceMessage}
            disabled={!isActive}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'text-gray-400 hover:text-gray-600'
            } ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? <FaStop className="text-lg" /> : <FaMicrophone className="text-lg" />}
          </button>

          {/* Emoji Picker */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!isActive}
            className={`text-gray-400 hover:text-gray-600 ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaSmile className="text-lg" />
          </button>

          {/* Message Input */}
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isActive ? "Type your message..." : "Chat is disabled"}
              disabled={!isActive}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isActive}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="text-lg" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mt-2 p-2 bg-gray-50 rounded border">
            <div className="grid grid-cols-8 gap-1">
              {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏', '😊', '😎', '🤗', '😴'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;
