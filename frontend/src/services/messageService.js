import api from './api';

// Send message to learner
export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get received messages for learner
export const getReceivedMessages = async (params = {}) => {
  try {
    const response = await api.get('/messages/received', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching received messages:', error);
    throw error;
  }
};

// Get sent messages for tutor
export const getSentMessages = async (params = {}) => {
  try {
    const response = await api.get('/messages/sent', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    throw error;
  }
};

// Mark message as read
export const markAsRead = async (messageId) => {
  try {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/messages/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Get learners for tutor
export const getTutorLearners = async () => {
  try {
    const response = await api.get('/messages/tutor-learners');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor learners:', error);
    throw error;
  }
};

// Get tutors for learner
export const getLearnerTutors = async () => {
  try {
    const response = await api.get('/messages/learner-tutors');
    return response.data;
  } catch (error) {
    console.error('Error fetching learner tutors:', error);
    throw error;
  }
};

// Send message from tutor to learner
export const sendMessageToLearner = async (messageData) => {
  try {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message to learner:', error);
    throw error;
  }
};

// Send message from admin to tutor
export const sendMessageToTutor = async (tutorId, messageData) => {
  try {
    const response = await api.post('/messages/admin-to-tutor', {
      tutorId,
      ...messageData
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to tutor:', error);
    throw error;
  }
};

// Reply to admin message (Tutor to Admin)
export const replyToAdmin = async (replyData) => {
  try {
    const response = await api.post('/messages/tutor-to-admin', replyData);
    return response.data;
  } catch (error) {
    console.error('Error sending reply to admin:', error);
    throw error;
  }
};

// Get messages from admin for tutor
export const getAdminMessages = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);

    const response = await api.get(`/messages/admin-messages?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    throw error;
  }
};

// Get messages from tutors for admin
export const getTutorMessages = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);

    const response = await api.get(`/messages/tutor-messages?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor messages:', error);
    throw error;
  }
};

// Reply to a message (Learner to Tutor)
export const replyToMessage = async (replyData) => {
  try {
    const response = await api.post('/messages/reply', replyData);
    return response.data;
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
};

// Legacy functions for existing Messages.jsx files
export const getInbox = async (filters = {}) => {
  try {
    const response = await api.get('/messages/received', { params: filters });
    return { data: { messages: response.data.data || [] } };
  } catch (error) {
    console.error('Error fetching inbox:', error);
    throw error;
  }
};

export const getMessagingUsers = async () => {
  try {
    // This would typically fetch users that the current user can message
    // For now, return empty array to prevent errors
    return { data: [] };
  } catch (error) {
    console.error('Error fetching messaging users:', error);
    throw error;
  }
};

export const getMessageStats = async () => {
  try {
    // This would typically fetch message statistics
    // For now, return empty stats to prevent errors
    return { data: { total: 0, unread: 0, sent: 0 } };
  } catch (error) {
    console.error('Error fetching message stats:', error);
    throw error;
  }
};

// Real-time chat functions
export const getConversation = async (conversationId) => {
  try {
    const response = await api.get(`/chat/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const createConversation = async (participantId) => {
  try {
    const response = await api.post('/chat/conversation', { participantId });
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const sendChatMessage = async (messageData) => {
  try {
    const response = await api.post('/chat/chat', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const sendFileMessage = async (formData) => {
  try {
    const response = await api.post('/chat/send-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending file message:', error);
    throw error;
  }
};

export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await api.put(`/chat/conversation/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

export const getOnlineUsers = async () => {
  try {
    const response = await api.get('/chat/online-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching online users:', error);
    throw error;
  }
};

// Default export for backward compatibility
const messageService = {
  sendMessage,
  getReceivedMessages,
  getSentMessages,
  markAsRead,
  getUnreadCount,
  deleteMessage,
  replyToMessage,
  getInbox,
  getMessagingUsers,
  getMessageStats,
  // Real-time chat functions
  getConversation,
  getConversations,
  createConversation,
  sendChatMessage,
  sendFileMessage,
  markConversationAsRead,
  getOnlineUsers
};

export default messageService;