import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with shorter timeout for testing
const apiService = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds instead of 30
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test the basic API connection
export const testConnection = async () => {
  try {
    const response = await apiService.get('/test');
    return response.data;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    throw error;
  }
};

// Test live class endpoint without database dependency - BYPASS VERSION
export const testLiveClassJoin = async (userId, userRole = 'participant') => {
  try {
    console.log('🧪 Testing live class join bypass with userId:', userId);
    
    const response = await apiService.post('/test-live-bypass', {
      userId: userId,
      userRole: userRole
    });
    
    console.log('✅ Test live class join bypass successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Test live class join bypass failed:', error);
    throw error;
  }
};

export default {
  testConnection,
  testLiveClassJoin
};
