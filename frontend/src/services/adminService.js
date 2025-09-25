import apiService from './api';

// ===== DASHBOARD & STATISTICS =====

export const getDashboardStats = async () => {
  try {
    const response = await apiService.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getPlatformStatistics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/admin/statistics?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    throw error;
  }
};

// Additional analytics functions
export const getUserAnalytics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/admin/analytics/users?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

export const getCourseAnalytics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/admin/analytics/courses?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

export const getRevenueAnalytics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/admin/analytics/revenue?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

export const getEngagementAnalytics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/admin/analytics/engagement?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    throw error;
  }
};

// ===== COURSE MANAGEMENT =====

export const getAllCourses = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/courses/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

export const getCourseForReview = async (courseId) => {
  try {
    const response = await apiService.get(`/admin/courses/${courseId}/review`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course for review:', error);
    throw error;
  }
};

export const approveCourse = async (courseId) => {
  try {
    const response = await apiService.put(`/courses/${courseId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving course:', error);
    throw error;
  }
};

export const rejectCourse = async (courseId, reason) => {
  try {
    const response = await apiService.put(`/courses/${courseId}/reject`, { rejectionReason: reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting course:', error);
    throw error;
  }
};

export const getCourseStatistics = async () => {
  try {
    const response = await apiService.get('/admin/courses/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching course statistics:', error);
    throw error;
  }
};

// ===== USER MANAGEMENT =====

export const getPendingUsers = async () => {
  try {
    const response = await apiService.get('/admin/users/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }
};

export const approveUser = async (userId) => {
  try {
    const response = await apiService.put(`/admin/users/${userId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

export const rejectUser = async (userId, reason) => {
  try {
    const response = await apiService.put(`/admin/users/${userId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

export const getAllUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/users?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
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

export const suspendUser = async (userId, reason) => {
  try {
    const response = await apiService.put(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
};

export const activateUser = async (userId) => {
  try {
    const response = await apiService.put(`/admin/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating user:', error);
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

// ===== PAYMENT & TRANSACTION MANAGEMENT =====

export const getAllPayments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/payments?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    throw error;
  }
};

// Installments removed – no due installments endpoint

export const getAllTransactions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/transactions?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};

export const getTransactionHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/transactions?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

export const getPaymentStatistics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/admin/payments/statistics?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
};

export const approvePayout = async (payoutId) => {
  try {
    const response = await apiService.put(`/admin/payouts/${payoutId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving payout:', error);
    throw error;
  }
};

export const rejectPayout = async (payoutId, reason) => {
  try {
    const response = await apiService.put(`/admin/payouts/${payoutId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting payout:', error);
    throw error;
  }
};

export const getPayoutRequests = async (status = 'pending') => {
  try {
    const response = await apiService.get(`/admin/payouts?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    throw error;
  }
};

// ===== SYSTEM SETTINGS =====

export const getPlatformSettings = async () => {
  try {
    const response = await apiService.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    throw error;
  }
};

export const updatePlatformSettings = async (settings) => {
  try {
    const response = await apiService.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw error;
  }
};

export const resetPlatformSettings = async () => {
  try {
    const response = await apiService.post('/admin/settings/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting platform settings:', error);
    throw error;
  }
};

// ===== NOTIFICATION MANAGEMENT =====

export const getSystemNotifications = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system notifications:', error);
    throw error;
  }
};

export const createSystemNotification = async (notificationData) => {
  try {
    const response = await apiService.post('/admin/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
};

export const updateNotification = async (notificationId, updates) => {
  try {
    const response = await apiService.put(`/admin/notifications/${notificationId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating notification:', error);
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

export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiService.delete(`/admin/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// ===== REPORTING & ANALYTICS =====

export const generateReport = async (reportType, filters = {}) => {
  try {
    const response = await apiService.post('/admin/reports/generate', { reportType, filters });
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const getReportHistory = async () => {
  try {
    const response = await apiService.get('/admin/reports/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching report history:', error);
    throw error;
  }
};

export const downloadReport = async (reportId) => {
  try {
    const response = await apiService.get(`/admin/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

// ===== COMPLAINT MANAGEMENT =====

export const getComplaints = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/complaints?${queryParams}`);
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

export const updateComplaintStatus = async (complaintId, status, resolution) => {
  try {
    const response = await apiService.put(`/admin/complaints/${complaintId}`, { status, resolution });
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

// ===== RECENT DATA FUNCTIONS =====

export const getRecentUsers = async (limit = 10) => {
  try {
    const response = await apiService.get(`/admin/users/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw error;
  }
};

export const getRecentTransactions = async (limit = 10) => {
  try {
    const response = await apiService.get(`/admin/transactions/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
};

export const getAdminNotifications = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/admin/notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
};

// ===== KYC MANAGEMENT =====

export const getPendingKYC = async () => {
  try {
    const response = await apiService.get('/admin/kyc/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending KYC:', error);
    throw error;
  }
};

export const getAllTutorsKYC = async () => {
  try {
    const response = await apiService.get('/admin/kyc/tutors');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutors KYC:', error);
    throw error;
  }
};

export const getKYCStats = async () => {
  try {
    const response = await apiService.get('/admin/kyc/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching KYC stats:', error);
    throw error;
  }
};

export const approveKYC = async (tutorId, notes = '') => {
  try {
    const response = await apiService.put(`/admin/kyc/approve/${tutorId}`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error approving KYC:', error);
    throw error;
  }
};

export const rejectKYC = async (tutorId, reason, notes = '') => {
  try {
    const response = await apiService.put(`/admin/kyc/reject/${tutorId}`, { reason, notes });
    return response.data;
  } catch (error) {
    console.error('Error rejecting KYC:', error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

export const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
    case 'active':
    case 'published':
    case 'completed':
      return 'green';
    case 'pending':
    case 'processing':
      return 'yellow';
    case 'rejected':
    case 'suspended':
    case 'cancelled':
      return 'red';
    case 'draft':
    case 'inactive':
      return 'gray';
    default:
      return 'gray';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'red';
    case 'tutor':
      return 'blue';
    case 'learner':
      return 'green';
    default:
      return 'gray';
  }
};

export const getCourseStatusColor = (status) => {
  switch (status) {
    case 'published':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'rejected':
      return 'red';
    case 'draft':
      return 'gray';
    default:
      return 'gray';
  }
};
