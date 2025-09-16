import { apiService } from './api';

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    const response = await apiService.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiService.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await apiService.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiService.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await apiService.delete(`/users/${userId}`);
    return response.data;
  },

  // Update user role (admin only)
  updateUserRole: async (userId, roleData) => {
    const response = await apiService.patch(`/users/${userId}/role`, roleData);
    return response.data;
  },

  // Block/Unblock user (admin only)
  toggleUserStatus: async (userId, status) => {
    const response = await apiService.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    const response = await apiService.get('/users/stats');
    return response.data;
  },

  // Search users (admin only)
  searchUsers: async (searchTerm, filters = {}) => {
    const response = await apiService.get('/users/search', {
      params: { q: searchTerm, ...filters }
    });
    return response.data;
  },

  // Bulk operations (admin only)
  bulkUpdateUsers: async (userIds, updateData) => {
    const response = await apiService.post('/users/bulk-update', {
      userIds,
      updateData
    });
    return response.data;
  },

  // Export users (admin only)
  exportUsers: async (filters = {}) => {
    const response = await apiService.get('/users/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get user activity log (admin only)
  getUserActivity: async (userId, params = {}) => {
    const response = await apiService.get(`/users/${userId}/activity`, { params });
    return response.data;
  },

  // Send notification to user (admin only)
  sendUserNotification: async (userId, notificationData) => {
    const response = await apiService.post(`/users/${userId}/notifications`, notificationData);
    return response.data;
  },
};

export default userService;
