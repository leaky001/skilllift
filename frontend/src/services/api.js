import axios from 'axios';
import { showSuccess, showError, showWarning, showInfo } from './toastService.jsx';
import { config } from '../config/environment';

// Create axios instance with clean configuration
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 600000, // 10 minutes default (for large file uploads)
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

// Export these functions for use in other components
export { getTabId, getStorageKey };

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData - let axios handle it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📤 FormData detected - letting axios set Content-Type automatically');
      // Set extended timeout for file uploads (10 minutes for large files)
      // Calculate timeout based on file size: 1 minute per 100MB, minimum 2 minutes, maximum 10 minutes
      let uploadTimeout = 600000; // Default 10 minutes
      if (config.data instanceof FormData) {
        // Try to estimate file size from FormData (approximate)
        // For large files, use maximum timeout
        uploadTimeout = 600000; // 10 minutes for large uploads
      }
      if (!config.timeout || config.timeout < uploadTimeout) {
        config.timeout = uploadTimeout;
        console.log(`⏱️ Timeout set to ${uploadTimeout / 1000 / 60} minutes for file upload`);
      }
    }
    
    // Get token from tab-specific sessionStorage
    const token = sessionStorage.getItem(getStorageKey('token'));
    console.log('🔍 Token retrieval:', JSON.stringify({
      tabId: getTabId(),
      storageKey: getStorageKey('token'),
      tokenFound: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    }));
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.log('❌ No token found, trying fallback...');
      // Fallback to user data
      const userData = sessionStorage.getItem(getStorageKey('user'));
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
            console.log('✅ Fallback token added to headers');
          } else {
            console.log('❌ No token in user data');
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        console.log('❌ No user data found');
      }
    }
    
    console.log('🔍 Final headers:', JSON.stringify({
      hasAuth: !!config.headers.Authorization,
      authHeader: config.headers.Authorization ? 'Bearer ***' : 'none',
      contentType: config.headers['Content-Type'] || 'auto-detect',
      timeout: config.timeout
    }));
    
    console.log('🔍 API Request:', JSON.stringify({
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
      isFormData: config.data instanceof FormData,
      timeout: config.timeout
    }));
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response received:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success,
      message: response.data?.message
    });
    return response;
  },
  (error) => {
    const { response, request, message, code } = error;
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      message: message,
      code: code,
      hasResponse: !!response,
      hasRequest: !!request,
      isNetworkError: !response && !!request,
      isTimeout: code === 'ECONNABORTED' || message?.includes('timeout')
    });
    
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
      // Network error - no response received
      console.error('❌ Network error - no response from server:', {
        url: error.config?.url,
        code: code,
        message: message
      });
      
      if (code === 'ECONNABORTED' || message?.includes('timeout')) {
        showError('Request timed out. Please check your connection and try again.');
      } else if (code === 'ERR_NETWORK' || code === 'NETWORK_ERROR') {
        showError('Network error. Please check your internet connection.');
      } else {
        showError('Unable to connect to the server. Please try again later.');
      }
    } else {
      // Request setup error
      console.error('❌ Request setup error:', message);
      showError('Failed to send request. Please try again.');
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
  
  // Upload file - with extended timeout for large files
  upload: (url, formData, config = {}) => {
    // Don't set Content-Type manually - let axios handle it with boundary
    // The request interceptor will detect FormData and remove Content-Type
    return api.post(url, formData, {
      ...config,
      timeout: 600000, // 10 minutes for file uploads (allows for large files)
    });
  },
};

export default api;
