import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { showSuccess, showError, showNetworkError } from '../services/toastService.jsx';
import apiService from '../services/api';

const AuthContext = createContext();

// Export AuthContext for direct use in other contexts
export { AuthContext };

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent redirects during initialization
  error: null,
  isInitialized: false,
  isAuthenticating: false,
  tabId: null,
};

// Generate unique tab ID
const generateTabId = () => {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem('skilllift_tab_id');
  if (!tabId) {
    tabId = generateTabId();
    sessionStorage.setItem('skilllift_tab_id', tabId);
  }
  return tabId;
};

// Tab-specific storage keys
const getStorageKey = (key) => {
  const tabId = getTabId();
  return `skilllift_${tabId}_${key}`;
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        isAuthenticating: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isAuthenticating: false,
        error: null,
        tabId: action.tabId,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthenticating: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tabId: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_TAB_ID':
      return {
        ...state,
        tabId: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state for this tab
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tabId = getTabId();
        dispatch({ type: 'SET_TAB_ID', payload: tabId });
        
        // Clear old localStorage data to prevent conflicts
        localStorage.removeItem('token');
        localStorage.removeItem('skilllift_user');
        localStorage.removeItem('user');
        
        const storedUser = sessionStorage.getItem(getStorageKey('user'));
        const storedToken = sessionStorage.getItem(getStorageKey('token'));
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          console.log('🔐 Found stored user:', user.name, 'Role:', user.role);
          
          // Verify token is still valid
          try {
            console.log('🔍 Verifying token...');
            const response = await apiService.get('/auth/verify');
            console.log('✅ Token verification response:', response.data);
            
            if (response.data.success) {
              console.log('✅ Token is valid, user authenticated');
              dispatch({ 
                type: 'LOGIN_SUCCESS', 
                payload: user,
                tabId: tabId
              });
            } else {
              console.log('❌ Token verification failed:', response.data.message);
              // Token invalid, clear storage
              sessionStorage.removeItem(getStorageKey('user'));
              sessionStorage.removeItem(getStorageKey('token'));
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } catch (error) {
            console.log('❌ Token verification error:', error);
            console.log('❌ Error response:', error.response?.data);
            console.log('❌ Error status:', error.response?.status);
            // Token invalid, clear storage
            sessionStorage.removeItem(getStorageKey('user'));
            sessionStorage.removeItem(getStorageKey('token'));
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          console.log('❌ No stored user or token found');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      } finally {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password, role = 'learner') => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiService.post('/auth/login', { email, password, role });
      
      if (response.data.success) {
        const user = response.data.data;
        const tabId = getTabId();
        
        // Store in tab-specific sessionStorage
        sessionStorage.setItem(getStorageKey('user'), JSON.stringify(user));
        sessionStorage.setItem(getStorageKey('token'), user.token);
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: user,
          tabId: tabId
        });
        
        showSuccess(`Welcome back, ${user.name}!`);
        return { success: true, user };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.data.message });
        showError(response.data.message || 'Login failed');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      
      if (error.code === 'NETWORK_ERROR') {
        showNetworkError();
      } else {
        showError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    const tabId = getTabId();
    
    // Clear tab-specific storage
    sessionStorage.removeItem(getStorageKey('user'));
    sessionStorage.removeItem(getStorageKey('token'));
    
    dispatch({ type: 'LOGOUT' });
    showSuccess('Logged out successfully');
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      
      const response = await apiService.post('/auth/register', userData);
      
      
      if (response.data.success) {
        const user = response.data.data;
        const tabId = getTabId();
        
        
        // Store in tab-specific sessionStorage
        sessionStorage.setItem(getStorageKey('user'), JSON.stringify(user));
        sessionStorage.setItem(getStorageKey('token'), user.token);
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: user,
          tabId: tabId
        });
        
        showSuccess(`Welcome to SkillLift, ${user.name}!`);
        return { success: true, user };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.data.message });
        showError(response.data.message || 'Registration failed');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      
      if (error.code === 'NETWORK_ERROR') {
        showNetworkError();
      } else {
        showError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify token function
  const verifyToken = useCallback(async () => {
    try {
      const token = sessionStorage.getItem(getStorageKey('token'));
      const userData = sessionStorage.getItem(getStorageKey('user'));
      
      if (!token || !userData) {
        return false;
      }
      
      const response = await apiService.get('/auth/verify');
      
      if (response.data.success) {
        const user = JSON.parse(userData);
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: user,
          tabId: getTabId()
        });
        return true;
      } else {
        // Token invalid, clear storage
        sessionStorage.removeItem(getStorageKey('user'));
        sessionStorage.removeItem(getStorageKey('token'));
        dispatch({ type: 'LOGOUT' });
        return false;
      }
    } catch (error) {
      // Token invalid, clear storage
      sessionStorage.removeItem(getStorageKey('user'));
      sessionStorage.removeItem(getStorageKey('token'));
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  }, []);

  // Update user profile function
  const updateProfile = useCallback(async (updateData) => {
    try {
      const response = await apiService.put('/auth/profile', updateData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        
        // Update tab-specific storage
        sessionStorage.setItem(getStorageKey('user'), JSON.stringify(updatedUser));
        
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        showSuccess('Profile updated successfully');
        return { success: true, user: updatedUser };
      } else {
        showError(response.data.message || 'Failed to update profile');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh user data function
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiService.get('/auth/profile');
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Update tab-specific storage
        sessionStorage.setItem(getStorageKey('user'), JSON.stringify(userData));
        
        dispatch({ type: 'UPDATE_USER', payload: userData });
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Get current tab info
  const getTabInfo = useCallback(() => {
    return {
      tabId: getTabId(),
      isCurrentTab: state.tabId === getTabId(),
      user: state.user,
      role: state.user?.role
    };
  }, [state.tabId, state.user]);

  // Get token from storage
  const getToken = useCallback(() => {
    return sessionStorage.getItem(getStorageKey('token'));
  }, []);

  // Verify email with code
  const verifyEmail = useCallback(async (email, code) => {
    try {
      const response = await apiService.post('/auth/verify-email', {
        email,
        verificationCode: code
      });

      if (response.data.success) {
        // Update user data after successful verification
        const updatedUser = response.data.data; // Backend returns user in 'data' field
        dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
        
        // Store token if provided
        if (response.data.data.token) {
          sessionStorage.setItem(getStorageKey('token'), response.data.data.token);
        }

        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }, []);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (email) => {
    try {
      const response = await apiService.post('/auth/resend-verification', {
        email
      });

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }, []);

  // Refresh user profile (alias for refreshUser)
  const refreshUserProfile = useCallback(async () => {
    return await refreshUser();
  }, [refreshUser]);

  // Get tutor status from user data
  const getTutorStatus = useCallback(() => {
    return state.user?.tutorStatus || state.user?.status || 'pending';
  }, [state.user]);

  const value = {
    ...state,
    token: getToken(),
    login,
    logout,
    register,
    verifyToken,
    updateProfile,
    refreshUser,
    refreshUserProfile,
    getTutorStatus,
    clearError,
    getTabInfo,
    getToken,
    verifyEmail,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};