import axios from 'axios';
import { showSuccess, showError, showWarning, showInfo } from './toastService.jsx';
import { config } from '../config/environment';

// Create axios instance with clean configuration
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // Increased from 10s to 30s for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tab-specific storage functions
const getTabId = () => {
  let tabId = sessionStorage.getItem('skilllift_tab_id');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('skilllift_tab_id', tabId);
  }
  return tabId;
};

const getStorageKey = (key) => {
  const tabId = getTabId();
  return `skilllift_${tabId}_${key}`;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from tab-specific sessionStorage
    const token = sessionStorage.getItem(getStorageKey('token'));
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback to user data
      const userData = sessionStorage.getItem(getStorageKey('user'));
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear tab-specific tokens
          console.log('❌ Authentication failed - token invalid');
          sessionStorage.removeItem(getStorageKey('user'));
          sessionStorage.removeItem(getStorageKey('token'));
          
          // Only redirect if not already on auth pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register') && 
              !window.location.pathname.includes('/auth')) {
            // Dispatch a custom event to notify components
            window.dispatchEvent(new CustomEvent('auth-expired'));
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          break;
          
        case 403:
          showError('You do not have permission to perform this action.');
          break;
          
        case 404:
          showError('Resource not found.');
          break;
          
        case 422:
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => showError(err.message || err));
          } else {
            showError(data.message || 'Validation failed.');
          }
          break;
          
        case 500:
          showError('Server error. Please try again later.');
          break;
          
        default:
          if (data?.message) {
            showError(data.message);
          }
      }
    } else if (error.request) {
      // Network error
      showError('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods
export const apiService = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
  
  // Upload file
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
