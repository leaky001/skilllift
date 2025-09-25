import apiService from '../services/api';

// ===== DASHBOARD STATS =====
export const getDashboardStats = async () => {
  try {
    const response = await apiService.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ===== USER MANAGEMENT =====
export const getAllUsers = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await apiService.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await apiService.put(`/admin/users/${userId}/status`, { accountStatus: status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiService.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiService.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getRecentUsers = async (limit = 10) => {
  try {
    const response = await apiService.get(`/admin/users/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw error;
  }
};

// ===== COURSE MANAGEMENT =====
export const getPendingCourses = async () => {
  try {
    const response = await apiService.get('/admin/courses/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending courses:', error);
    throw error;
  }
};

export const approveCourse = async (courseId) => {
  try {
    const response = await apiService.put(`/admin/courses/${courseId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving course:', error);
    throw error;
  }
};

export const rejectCourse = async (courseId, rejectionReason) => {
  try {
    const response = await apiService.put(`/admin/courses/${courseId}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting course:', error);
    throw error;
  }
};

export const getAllCourses = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// ===== TRANSACTION MANAGEMENT =====
export const getRecentTransactions = async (limit = 10) => {
  try {
    const response = await apiService.get(`/admin/transactions/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
};

export const getAllTransactions = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getTransactionStats = async () => {
  try {
    const response = await apiService.get('/admin/transactions/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
};

// ===== RATING MANAGEMENT =====
export const getPendingRatings = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/ratings/pending', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending ratings:', error);
    throw error;
  }
};

export const getAllRatings = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/ratings', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};

export const approveRating = async (ratingId) => {
  try {
    const response = await apiService.put(`/admin/ratings/${ratingId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving rating:', error);
    throw error;
  }
};

export const rejectRating = async (ratingId, rejectionReason) => {
  try {
    const response = await apiService.put(`/admin/ratings/${ratingId}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting rating:', error);
    throw error;
  }
};

export const flagRating = async (ratingId, flagReason) => {
  try {
    const response = await apiService.put(`/admin/ratings/${ratingId}/flag`, { flagReason });
    return response.data;
  } catch (error) {
    console.error('Error flagging rating:', error);
    throw error;
  }
};

export const getRatingStatistics = async () => {
  try {
    const response = await apiService.get('/admin/ratings/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching rating statistics:', error);
    throw error;
  }
};

// ===== COMPLAINT MANAGEMENT =====
export const getComplaints = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/complaints', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

export const getComplaintById = async (complaintId) => {
  try {
    const response = await apiService.get(`/admin/complaints/${complaintId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching complaint:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (complaintId, status) => {
  try {
    const response = await apiService.put(`/admin/complaints/${complaintId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

export const resolveComplaint = async (complaintId, resolution) => {
  try {
    const response = await apiService.put(`/admin/complaints/${complaintId}/resolve`, { resolution });
    return response.data;
  } catch (error) {
    console.error('Error resolving complaint:', error);
    throw error;
  }
};

// ===== ENROLLMENT MANAGEMENT =====
export const getAllEnrollments = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/enrollments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

export const getEnrollmentStats = async () => {
  try {
    const response = await apiService.get('/admin/enrollments/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment stats:', error);
    throw error;
  }
};

// ===== CERTIFICATE MANAGEMENT =====
export const getAllCertificates = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/certificates', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

export const getCertificateStats = async () => {
  try {
    const response = await apiService.get('/admin/certificates/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    throw error;
  }
};

// ===== ASSIGNMENT MANAGEMENT =====
export const getAllAssignments = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

export const getAssignmentSubmissions = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/assignments/submissions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    throw error;
  }
};

// ===== NOTIFICATION MANAGEMENT =====
export const getAdminNotifications = async () => {
  try {
    const response = await apiService.get('/admin/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiService.put(`/admin/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// ===== ANALYTICS =====
export const getPlatformAnalytics = async (period = '30d') => {
  try {
    const response = await apiService.get(`/admin/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    throw error;
  }
};

export const getUserAnalytics = async (period = '30d') => {
  try {
    const response = await apiService.get(`/admin/analytics/users?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

export const getCourseAnalytics = async (period = '30d') => {
  try {
    const response = await apiService.get(`/admin/analytics/courses?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

export const getRevenueAnalytics = async (period = '30d') => {
  try {
    const response = await apiService.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

// ===== REPORTS =====
export const generateUserReport = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/reports/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error generating user report:', error);
    throw error;
  }
};

export const generateCourseReport = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/reports/courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error generating course report:', error);
    throw error;
  }
};

export const generateRevenueReport = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/reports/revenue', { params });
    return response.data;
  } catch (error) {
    console.error('Error generating revenue report:', error);
    throw error;
  }
};

export const exportData = async (type, format = 'csv') => {
  try {
    const response = await apiService.get(`/admin/export/${type}?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

// ===== SYSTEM SETTINGS =====
export const getSystemSettings = async () => {
  try {
    const response = await apiService.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

export const updateSystemSettings = async (settings) => {
  try {
    const response = await apiService.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

// ===== TUTOR PERFORMANCE =====
export const getTutorPerformance = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/tutors/performance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor performance:', error);
    throw error;
  }
};

export const getTutorStats = async (tutorId) => {
  try {
    const response = await apiService.get(`/admin/tutors/${tutorId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor stats:', error);
    throw error;
  }
};

// ===== LEARNER ACTIVITY =====
export const getLearnerActivity = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/learners/activity', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching learner activity:', error);
    throw error;
  }
};

export const getLearnerStats = async (learnerId) => {
  try {
    const response = await apiService.get(`/admin/learners/${learnerId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learner stats:', error);
    throw error;
  }
};

// ===== PAYMENT MANAGEMENT =====
export const getPaymentStats = async () => {
  try {
    const response = await apiService.get('/admin/payments/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

export const getAllPayments = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/payments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const refundPayment = async (paymentId, reason) => {
  try {
    const response = await apiService.post(`/admin/payments/${paymentId}/refund`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

// ===== LIVE SESSION MANAGEMENT =====
// Removed - Live class functionality deleted

// ===== MENTORSHIP MANAGEMENT =====
export const getAllMentorships = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/mentorships', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    throw error;
  }
};

export const getMentorshipStats = async () => {
  try {
    const response = await apiService.get('/admin/mentorships/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship stats:', error);
    throw error;
  }
};

export default {
  // Dashboard
  getDashboardStats,
  
  // Users
  getAllUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getRecentUsers,
  
  // Courses
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAllCourses,
  
  // Transactions
  getRecentTransactions,
  getAllTransactions,
  getTransactionStats,
  
  // Ratings
  getPendingRatings,
  getAllRatings,
  approveRating,
  rejectRating,
  flagRating,
  getRatingStatistics,
  
  // Complaints
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  resolveComplaint,
  
  // Enrollments
  getAllEnrollments,
  getEnrollmentStats,
  
  // Certificates
  getAllCertificates,
  getCertificateStats,
  
  // Assignments
  getAllAssignments,
  getAssignmentSubmissions,
  
  // Notifications
  getAdminNotifications,
  markNotificationAsRead,
  
  // Analytics
  getPlatformAnalytics,
  getUserAnalytics,
  getCourseAnalytics,
  getRevenueAnalytics,
  
  // Reports
  generateUserReport,
  generateCourseReport,
  generateRevenueReport,
  exportData,
  
  // Settings
  getSystemSettings,
  updateSystemSettings,
  
  // Tutor Performance
  getTutorPerformance,
  getTutorStats,
  
  // Learner Activity
  getLearnerActivity,
  getLearnerStats,
  
  // Payments
  getPaymentStats,
  getAllPayments,
  refundPayment,
  
  // Live Sessions
  getAllLiveSessions,
  getLiveSessionStats,
  
  // Mentorships
  getAllMentorships,
  getMentorshipStats
};
