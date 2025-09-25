import apiService from './api';

// Helper function to handle rate limiting with retry
const handleRateLimit = async (apiCall, maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        // Wait before retrying (exponential backoff with jitter)
        const baseDelay = Math.pow(2, i) * 500; // 500ms, 1s, 2s, 4s, 8s
        const jitter = Math.random() * 500; // Add random jitter
        const delay = baseDelay + jitter;
        console.log(`Rate limited, retrying in ${Math.round(delay)}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// ===== TUTOR DASHBOARD & STATISTICS =====

export const getTutorDashboardStats = async () => {
  try {
    return await handleRateLimit(() => apiService.get('/tutor/dashboard/stats'));
  } catch (error) {
    console.error('Error fetching tutor dashboard stats:', error);
    throw error;
  }
};

export const getTutorRecentLearners = async (limit = 10) => {
  try {
    return await handleRateLimit(() => apiService.get(`/tutor/dashboard/recent-learners?limit=${limit}`));
  } catch (error) {
    console.error('Error fetching recent learners:', error);
    throw error;
  }
};

export const getTutorUpcomingSessions = async () => {
  try {
    return await handleRateLimit(() => apiService.get('/tutor/dashboard/upcoming-sessions'));
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    throw error;
  }
};

export const getTutorRecentNotifications = async (limit = 10) => {
  try {
    return await handleRateLimit(() => apiService.get(`/tutor/dashboard/notifications?limit=${limit}`));
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    throw error;
  }
};

export const getTutorCoursePerformance = async (period = 'month') => {
  try {
    return await handleRateLimit(() => apiService.get(`/tutor/dashboard/course-performance?period=${period}`));
  } catch (error) {
    console.error('Error fetching course performance:', error);
    throw error;
  }
};

export const getTutorEarnings = async (period = 'month') => {
  try {
    return await handleRateLimit(() => apiService.get(`/tutor/dashboard/earnings?period=${period}`));
  } catch (error) {
    console.error('Error fetching earnings:', error);
    throw error;
  }
};

// ===== TUTOR LEARNER MANAGEMENT =====

export const getTutorLearners = async (params = {}) => {
  try {
    const response = await apiService.get('/tutor/learners', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor learners:', error);
    throw error;
  }
};

export const getTutorLearner = async (learnerId) => {
  try {
    const response = await apiService.get(`/tutor/learners/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor learner:', error);
    throw error;
  }
};

export const getTutorLearnerProgress = async (learnerId, courseId) => {
  try {
    const response = await apiService.get(`/tutor/learners/${learnerId}/courses/${courseId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learner progress:', error);
    throw error;
  }
};

export const getTutorLearnerAssignments = async (learnerId, courseId) => {
  try {
    const response = await apiService.get(`/tutor/learners/${learnerId}/courses/${courseId}/assignments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learner assignments:', error);
    throw error;
  }
};

export const sendMessageToLearner = async (learnerId, message) => {
  try {
    const response = await apiService.post(`/tutor/learners/${learnerId}/message`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending message to learner:', error);
    throw error;
  }
};

// ===== TUTOR COURSE MANAGEMENT =====

export const createCourse = async (courseData) => {
  try {
    const response = await apiService.post('/courses', courseData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // Increase timeout to 60 seconds for file uploads
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await apiService.put(`/courses/${courseId}`, courseData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // Increase timeout to 60 seconds for file uploads
    });
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/tutor/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await apiService.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getTutorCourses = async (params = {}) => {
  try {
    console.log('🔄 getTutorCourses called with params:', params);
    console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3002/api');
    
    const response = await apiService.get('/courses/tutor/my-courses', { params });
    console.log('✅ getTutorCourses response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ getTutorCourses error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
};

export const getTutorCourse = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/tutor/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor course:', error);
    throw error;
  }
};

export const publishCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
};

export const archiveCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving course:', error);
    throw error;
  }
};

export const restoreCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring course:', error);
    throw error;
  }
};

// ===== TUTOR ASSIGNMENT MANAGEMENT =====

export const createAssignment = async (assignmentData) => {
  try {
    const response = await apiService.post('/assignments', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await apiService.delete(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

export const getTutorAssignments = async (params = {}) => {
  try {
    const response = await apiService.get('/assignments/tutor/my-assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor assignments:', error);
    throw error;
  }
};

export const publishAssignment = async (assignmentId) => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing assignment:', error);
    throw error;
  }
};

export const archiveAssignment = async (assignmentId) => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving assignment:', error);
    throw error;
  }
};

export const duplicateAssignment = async (assignmentId) => {
  try {
    const response = await apiService.post(`/assignments/${assignmentId}/duplicate`);
    return response.data;
  } catch (error) {
    console.error('Error duplicating assignment:', error);
    throw error;
  }
};

export const getAssignmentStats = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    throw error;
  }
};

// ===== TUTOR LIVE SESSIONS =====
// Removed - Live class functionality deleted

// ===== TUTOR PAYMENTS & EARNINGS =====

export const getTutorPayments = async (params = {}) => {
  try {
    const response = await apiService.get('/tutor/payments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor payments:', error);
    throw error;
  }
};

export const getTutorEarningsReport = async (period = 'month') => {
  try {
    const response = await apiService.get(`/tutor/payments/earnings-report?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching earnings report:', error);
    throw error;
  }
};

export const getTutorPaymentHistory = async (params = {}) => {
  try {
    const response = await apiService.get('/tutor/payments/history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

export const requestWithdrawal = async (amount, paymentMethod) => {
  try {
    const response = await apiService.post('/tutor/payments/withdraw', { amount, paymentMethod });
    return response.data;
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    throw error;
  }
};

// ===== TUTOR PROFILE & SETTINGS =====

export const getTutorProfile = async () => {
  try {
    const response = await apiService.get('/tutor/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    throw error;
  }
};

export const updateTutorProfile = async (profileData) => {
  try {
    const response = await apiService.put('/tutor/profile', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    throw error;
  }
};

export const getTutorSettings = async () => {
  try {
    const response = await apiService.get('/tutor/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor settings:', error);
    throw error;
  }
};

export const updateTutorSettings = async (settingsData) => {
  try {
    const response = await apiService.put('/tutor/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error updating tutor settings:', error);
    throw error;
  }
};

// ===== TUTOR ANALYTICS =====

export const getTutorAnalytics = async (period = 'month') => {
  try {
    const response = await apiService.get(`/tutor/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor analytics:', error);
    throw error;
  }
};

export const getTutorCourseAnalytics = async (courseId, period = 'month') => {
  try {
    const response = await apiService.get(`/tutor/analytics/courses/${courseId}?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

export const getTutorLearnerAnalytics = async (period = 'month') => {
  try {
    const response = await apiService.get(`/tutor/analytics/learners?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learner analytics:', error);
    throw error;
  }
};

// ===== TUTOR CERTIFICATES =====

export const getTutorCertificates = async (params = {}) => {
  try {
    const response = await apiService.get('/tutor/certificates', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor certificates:', error);
    throw error;
  }
};

export const generateCertificate = async (learnerId, courseId) => {
  try {
    const response = await apiService.post('/tutor/certificates/generate', { learnerId, courseId });
    return response.data;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

// ===== TUTOR REPLAYS =====

export const getTutorReplays = async (params = {}) => {
  try {
    const response = await apiService.get('/tutor/replays', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor replays:', error);
    throw error;
  }
};


export const updateReplay = async (replayId, updateData) => {
  try {
    const response = await apiService.put(`/tutor/replays/${replayId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating replay:', error);
    throw error;
  }
};

export const deleteReplay = async (replayId) => {
  try {
    const response = await apiService.delete(`/tutor/replays/${replayId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting replay:', error);
    throw error;
  }
};

// ===== TUTOR NOTIFICATIONS =====

export const getTutorNotifications = async (params = {}) => {
  try {
    console.log('🔔 Fetching tutor notifications...');
    const response = await apiService.get('/tutor/notifications', { params });
    console.log('✅ Tutor notifications response:', response.data);
    return response.data;
  } catch (error) {
    console.log('⚠️ Tutor notifications failed, trying general notifications...');
    // Fallback to general notifications if tutor-specific fails
    try {
      const response = await apiService.get('/notifications/my-notifications', { params });
      console.log('✅ General notifications response:', response.data);
      return response.data;
    } catch (fallbackError) {
      console.error('❌ Both tutor and general notifications failed:', fallbackError);
      // Return empty notifications instead of throwing error
      return {
        success: true,
        data: {
          notifications: [],
          unreadCount: 0
        }
      };
    }
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiService.put(`/tutor/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.log('⚠️ Tutor mark as read failed, trying general notifications...');
    // Fallback to general notifications
    try {
      const response = await apiService.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (fallbackError) {
      console.error('Error marking notification as read:', fallbackError);
      throw fallbackError;
    }
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiService.put('/tutor/notifications/read-all');
    return response.data;
  } catch (error) {
    console.log('⚠️ Tutor mark all as read failed, trying general notifications...');
    // Fallback to general notifications
    try {
      const response = await apiService.put('/notifications/read-all');
      return response.data;
    } catch (fallbackError) {
      console.error('Error marking all notifications as read:', fallbackError);
      throw fallbackError;
    }
  }
};
