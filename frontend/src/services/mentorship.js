import apiService from './api';

// ===== MENTORSHIP CRUD =====

export const getMentorships = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    throw error;
  }
};

export const getMentorship = async (mentorshipId) => {
  try {
    const response = await apiService.get(`/mentorships/${mentorshipId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship:', error);
    throw error;
  }
};

export const createMentorship = async (mentorshipData) => {
  try {
    const response = await apiService.post('/mentorships', mentorshipData);
    return response.data;
  } catch (error) {
    console.error('Error creating mentorship:', error);
    throw error;
  }
};

export const updateMentorship = async (mentorshipId, updates) => {
  try {
    const response = await apiService.put(`/mentorships/${mentorshipId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating mentorship:', error);
    throw error;
  }
};

export const deleteMentorship = async (mentorshipId) => {
  try {
    const response = await apiService.delete(`/mentorships/${mentorshipId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    throw error;
  }
};

// ===== USER MENTORSHIPS =====

export const getUserMentorships = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships/user?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user mentorships:', error);
    throw error;
  }
};

export const getUserMentorship = async (mentorshipId) => {
  try {
    const response = await apiService.get(`/mentorships/user/${mentorshipId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user mentorship:', error);
    throw error;
  }
};

// ===== MENTORSHIP REQUESTS =====

export const getMentorshipRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships/requests?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    throw error;
  }
};

export const createMentorshipRequest = async (requestData) => {
  try {
    const response = await apiService.post('/mentorships/requests', requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    throw error;
  }
};

export const updateMentorshipRequest = async (requestId, updates) => {
  try {
    const response = await apiService.put(`/mentorships/requests/${requestId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating mentorship request:', error);
    throw error;
  }
};

export const deleteMentorshipRequest = async (requestId) => {
  try {
    const response = await apiService.delete(`/mentorships/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting mentorship request:', error);
    throw error;
  }
};

// ===== MENTORSHIP SESSIONS =====

export const getMentorshipSessions = async (mentorshipId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships/${mentorshipId}/sessions?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship sessions:', error);
    throw error;
  }
};

export const createMentorshipSession = async (mentorshipId, sessionData) => {
  try {
    const response = await apiService.post(`/mentorships/${mentorshipId}/sessions`, sessionData);
    return response.data;
  } catch (error) {
    console.error('Error creating mentorship session:', error);
    throw error;
  }
};

export const updateMentorshipSession = async (sessionId, updates) => {
  try {
    const response = await apiService.put(`/mentorships/sessions/${sessionId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating mentorship session:', error);
    throw error;
  }
};

export const deleteMentorshipSession = async (sessionId) => {
  try {
    const response = await apiService.delete(`/mentorships/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting mentorship session:', error);
    throw error;
  }
};

// ===== MENTORSHIP STATISTICS =====

export const getMentorshipStats = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/mentorships/stats?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship statistics:', error);
    throw error;
  }
};

export const getMentorshipAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships/analytics?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship analytics:', error);
    throw error;
  }
};

export const getMentorshipTrends = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/mentorships/trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship trends:', error);
    throw error;
  }
};

// ===== MENTORSHIP FEEDBACK =====

export const addMentorshipFeedback = async (mentorshipId, feedbackData) => {
  try {
    const response = await apiService.post(`/mentorships/${mentorshipId}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error adding mentorship feedback:', error);
    throw error;
  }
};

export const getMentorshipFeedback = async (mentorshipId) => {
  try {
    const response = await apiService.get(`/mentorships/${mentorshipId}/feedback`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship feedback:', error);
    throw error;
  }
};

export const updateMentorshipFeedback = async (feedbackId, updates) => {
  try {
    const response = await apiService.put(`/mentorships/feedback/${feedbackId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating mentorship feedback:', error);
    throw error;
  }
};

export const deleteMentorshipFeedback = async (feedbackId) => {
  try {
    const response = await apiService.delete(`/mentorships/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting mentorship feedback:', error);
    throw error;
  }
};

// ===== MENTORSHIP SCHEDULING =====

export const scheduleMentorshipSession = async (mentorshipId, scheduleData) => {
  try {
    const response = await apiService.post(`/mentorships/${mentorshipId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling mentorship session:', error);
    throw error;
  }
};

export const rescheduleMentorshipSession = async (sessionId, scheduleData) => {
  try {
    const response = await apiService.put(`/mentorships/sessions/${sessionId}/reschedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error rescheduling mentorship session:', error);
    throw error;
  }
};

export const cancelMentorshipSession = async (sessionId) => {
  try {
    const response = await apiService.put(`/mentorships/sessions/${sessionId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling mentorship session:', error);
    throw error;
  }
};

// ===== MENTORSHIP AVAILABILITY =====

export const setMentorAvailability = async (availabilityData) => {
  try {
    const response = await apiService.post('/mentorships/availability', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Error setting mentor availability:', error);
    throw error;
  }
};

export const getMentorAvailability = async (mentorId) => {
  try {
    const response = await apiService.get(`/mentorships/mentors/${mentorId}/availability`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor availability:', error);
    throw error;
  }
};

export const updateMentorAvailability = async (availabilityId, updates) => {
  try {
    const response = await apiService.put(`/mentorships/availability/${availabilityId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating mentor availability:', error);
    throw error;
  }
};

// ===== MENTORSHIP SEARCH =====

export const searchMentors = async (searchData) => {
  try {
    const response = await apiService.post('/mentorships/search', searchData);
    return response.data;
  } catch (error) {
    console.error('Error searching mentors:', error);
    throw error;
  }
};

export const getMentorProfile = async (mentorId) => {
  try {
    const response = await apiService.get(`/mentorships/mentors/${mentorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    throw error;
  }
};

export const getMentorReviews = async (mentorId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships/mentors/${mentorId}/reviews?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor reviews:', error);
    throw error;
  }
};

// ===== MENTORSHIP PAYMENTS =====

export const processMentorshipPayment = async (mentorshipId, paymentData) => {
  try {
    const response = await apiService.post(`/mentorships/${mentorshipId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing mentorship payment:', error);
    throw error;
  }
};

export const getMentorshipPaymentHistory = async (mentorshipId) => {
  try {
    const response = await apiService.get(`/mentorships/${mentorshipId}/payments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship payment history:', error);
    throw error;
  }
};

export const requestMentorshipRefund = async (mentorshipId, refundData) => {
  try {
    const response = await apiService.post(`/mentorships/${mentorshipId}/refund`, refundData);
    return response.data;
  } catch (error) {
    console.error('Error requesting mentorship refund:', error);
    throw error;
  }
};

// ===== MENTORSHIP REPORTS =====

export const generateMentorshipReport = async (reportData) => {
  try {
    const response = await apiService.post('/mentorships/reports/generate', reportData);
    return response.data;
  } catch (error) {
    console.error('Error generating mentorship report:', error);
    throw error;
  }
};

export const getMentorshipReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/mentorships/reports?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship reports:', error);
    throw error;
  }
};

export const downloadMentorshipReport = async (reportId) => {
  try {
    const response = await apiService.get(`/mentorships/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading mentorship report:', error);
    throw error;
  }
};
