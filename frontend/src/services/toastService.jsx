import { toast } from 'react-toastify';

// Configure toast defaults for professional appearance
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  style: {
    borderRadius: '12px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }
};

// Success toast with checkmark icon
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    icon: "✅",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      color: 'white',
      border: '1px solid #10B981',
    },
    ...options
  });
};

// Error toast with X icon
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    icon: "❌",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: 'white',
      border: '1px solid #EF4444',
    },
    ...options
  });
};

// Warning toast with warning icon
export const showWarning = (message, options = {}) => {
  return toast.warning(message, {
    ...toastConfig,
    icon: "⚠️",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
      color: 'white',
      border: '1px solid #F59E0B',
    },
    ...options
  });
};

// Info toast with info icon
export const showInfo = (message, options = {}) => {
  return toast.info(message, {
    ...toastConfig,
    icon: "ℹ️",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
      color: 'white',
      border: '1px solid #3B82F6',
    },
    ...options
  });
};

// Custom toast for course actions
export const showCourseAction = (message, type = 'success', options = {}) => {
  const icons = {
    success: "🎓",
    error: "📚",
    warning: "⚠️",
    info: "ℹ️"
  };
  
  const colors = {
    success: 'linear-gradient(135deg, #10B981, #059669)',
    error: 'linear-gradient(135deg, #EF4444, #DC2626)',
    warning: 'linear-gradient(135deg, #F59E0B, #D97706)',
    info: 'linear-gradient(135deg, #3B82F6, #2563EB)'
  };
  
  return toast[type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'success'](message, {
    ...toastConfig,
    icon: icons[type] || icons.success,
    style: {
      ...toastConfig.style,
      background: colors[type] || colors.success,
      color: 'white',
      border: `1px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'}`,
    },
    ...options
  });
};

// Payment success toast
export const showPaymentSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    icon: "💳",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      color: 'white',
      border: '1px solid #10B981',
    },
    ...options
  });
};

// Course approval toast
export const showCourseApproval = (message, approved = true, options = {}) => {
  return toast[approved ? 'success' : 'warning'](message, {
    ...toastConfig,
    icon: approved ? "✅" : "⚠️",
    style: {
      ...toastConfig.style,
      background: approved ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
      color: 'white',
      border: `1px solid ${approved ? '#10B981' : '#F59E0B'}`,
    },
    ...options
  });
};

// Course enrollment toast
export const showCourseEnrolled = (message = 'Successfully enrolled in course!', options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    icon: "🎓",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      color: 'white',
      border: '1px solid #10B981',
    },
    ...options
  });
};

// Network error toast
export const showNetworkError = (message = 'Network error. Please check your connection.', options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    icon: "🌐",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: 'white',
      border: '1px solid #EF4444',
    },
    ...options
  });
};

// Server error toast
export const showServerError = (message = 'Server error. Please try again later.', options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    icon: "🖥️",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: 'white',
      border: '1px solid #EF4444',
    },
    ...options
  });
};

// Validation error toast
export const showValidationError = (message = 'Please check your input and try again.', options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    icon: "⚠️",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
      color: 'white',
      border: '1px solid #F59E0B',
    },
    ...options
  });
};

// Course created toast
export const showCourseCreated = (message = 'Course created successfully!', options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    icon: "📚",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      color: 'white',
      border: '1px solid #10B981',
    },
    ...options
  });
};

// Course updated toast
export const showCourseUpdated = (message = 'Course updated successfully!', options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    icon: "✏️",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      color: 'white',
      border: '1px solid #10B981',
    },
    ...options
  });
};

// Course deleted toast
export const showCourseDeleted = (message = 'Course deleted successfully!', options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    icon: "🗑️",
    style: {
      ...toastConfig.style,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      color: 'white',
      border: '1px solid #10B981',
    },
    ...options
  });
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showCourseAction,
  showPaymentSuccess,
  showCourseApproval,
  showCourseEnrolled,
  showNetworkError,
  showServerError,
  showValidationError,
  showCourseCreated,
  showCourseUpdated,
  showCourseDeleted
};
