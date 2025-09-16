import apiService from './api';

// ===== ENROLLMENT SERVICES =====

// Get learner's enrollments
export const getMyEnrollments = async () => {
  try {
    const response = await apiService.get('/enrollments/my-enrollments');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

// Get learner's live classes
export const getMyLiveClasses = async () => {
  try {
    const response = await apiService.get('/live-classes/learner/classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching live classes:', error);
    throw error;
  }
};

// ===== ASSIGNMENT SERVICES =====

// Get learner's assignments
export const getMyAssignments = async () => {
  try {
    const response = await apiService.get('/assignments/my-assignments');
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

// Get assignment details
export const getAssignmentDetails = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw error;
  }
};

// Get learner's submissions
export const getMySubmissions = async () => {
  try {
    const response = await apiService.get('/assignment-submissions/my-submissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

// ===== NOTIFICATION SERVICES =====

// Get learner's notifications
export const getMyNotifications = async (params = {}) => {
  try {
    const response = await apiService.get('/notifications/my-notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiService.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// ===== COURSE SERVICES =====

// Get course details
export const getCourseDetails = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Get course progress
export const getCourseProgress = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Update course progress
export const updateCourseProgress = async (courseId, lessonId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/progress`, { lessonId });
    return response.data;
  } catch (error) {
    console.error('Error updating course progress:', error);
    throw error;
  }
};

// ===== CERTIFICATE SERVICES =====

// Get learner's certificates
export const getMyCertificates = async () => {
  try {
    const response = await apiService.get('/certificates/my-certificates');
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

// Download certificate
export const downloadCertificate = async (certificateId) => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

// ===== PROFILE SERVICES =====

// Get learner profile
export const getLearnerProfile = async () => {
  try {
    const response = await apiService.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update learner profile
export const updateLearnerProfile = async (profileData) => {
  try {
    const response = await apiService.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// ===== PAYMENT SERVICES =====

// Get payment history
export const getPaymentHistory = async () => {
  try {
    const response = await apiService.get('/payments/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await apiService.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

// ===== SUPPORT SERVICES =====

// Create support ticket
export const createSupportTicket = async (ticketData) => {
  try {
    const response = await apiService.post('/support/tickets', ticketData);
    return response.data;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
};

// Get support tickets
export const getSupportTickets = async () => {
  try {
    const response = await apiService.get('/support/tickets');
    return response.data;
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// Format date and time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

// Get time until deadline
export const getTimeUntilDeadline = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;
  
  if (diff <= 0) return 'Overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  return 'Due now';
};

// Calculate progress percentage
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Get grade color
export const getGradeColor = (grade) => {
  switch (grade) {
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-blue-600';
    case 'C':
      return 'text-yellow-600';
    case 'D':
      return 'text-orange-600';
    case 'F':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
    case 'graded':
    case 'passed':
      return 'text-green-600';
    case 'active':
    case 'submitted':
      return 'text-blue-600';
    case 'pending':
    case 'under-review':
      return 'text-yellow-600';
    case 'failed':
    case 'overdue':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiService.put('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};