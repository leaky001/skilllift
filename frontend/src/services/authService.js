import { apiService } from './api';

export const authService = {
  // User registration
  register: async (userData) => {
    const response = await apiService.post('/auth/register', userData);
    return response.data;
  },

  // User login
  login: async (credentials) => {
    const response = await apiService.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token and user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // User logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiService.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await apiService.put('/auth/profile', userData);
    const { user } = response.data;
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await apiService.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiService.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await apiService.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (verificationData) => {
    const response = await apiService.post('/auth/verify-email', verificationData);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await apiService.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
