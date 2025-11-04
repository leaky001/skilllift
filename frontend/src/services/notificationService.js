import apiService from './api';

// ===== NOTIFICATION API SERVICE =====

// Get user's notifications
export const getMyNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);

    const response = await apiService.get(`/notifications/my-notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get role-specific notifications
export const getRoleNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiService.get(`/notifications/role-notifications?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role notifications:', error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (period = 'week') => {
  try {
    const response = await apiService.get(`/notifications/stats?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
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

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiService.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// ===== NOTIFICATION CREATION HELPERS =====

// Create enrollment notification
export const createEnrollmentNotification = async (courseId, studentId, enrollmentId) => {
  try {
    const response = await apiService.post('/notifications/enrollment', {
      courseId,
      studentId,
      enrollmentId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating enrollment notification:', error);
    throw error;
  }
};

// Create payment notification
export const createPaymentNotification = async (courseId, studentId, amount, paymentId, paymentType) => {
  try {
    const response = await apiService.post('/notifications/payment', {
      courseId,
      studentId,
      amount,
      paymentId,
      paymentType
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment notification:', error);
    throw error;
  }
};

// Create assignment submission notification
export const createAssignmentSubmissionNotification = async (assignmentId, studentId, submissionId) => {
  try {
    const response = await apiService.post('/notifications/assignment-submitted', {
      assignmentId,
      studentId,
      submissionId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating assignment submission notification:', error);
    throw error;
  }
};

// Create assignment graded notification
export const createAssignmentGradedNotification = async (assignmentId, studentId, grade, feedback) => {
  try {
    const response = await apiService.post('/notifications/assignment-graded', {
      assignmentId,
      studentId,
      grade,
      feedback
    });
    return response.data;
  } catch (error) {
    console.error('Error creating assignment graded notification:', error);
    throw error;
  }
};

// Create course completion notification
export const createCourseCompletionNotification = async (courseId, studentId) => {
  try {
    const response = await apiService.post('/notifications/course-completed', {
      courseId,
      studentId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course completion notification:', error);
    throw error;
  }
};

// Create live session notification
export const createLiveSessionNotification = async (sessionId, type, message) => {
  try {
    const response = await apiService.post('/notifications/live-session', {
      sessionId,
      type,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error creating live session notification:', error);
    throw error;
  }
};

// Create system notification (Admin only)
export const createSystemNotification = async (title, message, recipients, type, priority) => {
  try {
    const response = await apiService.post('/notifications/system', {
      title,
      message,
      recipients,
      type,
      priority
    });
    return response.data;
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

// Get notification icon based on type
export const getNotificationIcon = (type) => {
  const iconMap = {
    // Course related
    course_submission: '📚',
    course_update: '🔄',
    course_completed: '🎓',
    course_available: '🎓',
    
    // Enrollment related
    enrollment: '👨‍🎓',
    new_enrollment: '👨‍🎓',
    enrollment_confirmation: '✅',
    
    // Payment related
    payment_received: '💰',
    payment_confirmation: '✅',
    payment_reminder: '⏰',
    
    // Assignment related
    assignment_created: '📝',
    assignment_published: '📝',
    assignment_submitted: '📝',
    assignment_graded: '📊',
    assignment_due: '⏰',
    
    // Live session related
    live_session_reminder: '📅',
    live_session_started: '🎥',
    live_session_updated: '🔄',
    // live_class_* removed - Live class functionality deleted
    
    // Replay related
    replay_uploaded: '🎬',
    
    // User management
    user_approval: '👤',
    user_rejection: '❌',
    account_approved: '✅',
    account_rejected: '❌',
    
    // KYC related
    kyc_submission: '🆔',
    kyc_approval: '✅',
    kyc_rejection: '❌',
    
    // Mentorship related
    mentorship_request: '🎓',
    mentorship_accepted: '✅',
    mentorship_rejected: '❌',
    mentorship_response: '💬',
    
    // Certificate related
    certificate_ready: '🏆',
    
    // System related
    system_alert: '⚠️',
    system_maintenance: '🔧',
    system_update: '🔄',
    
    // Support related
    support_ticket: '🎫',
    support_response: '💬',
    
    // Dispute related
    dispute_reported: '🚨',
    dispute_resolved: '✅',
    
    // Message related
    message_received: '💬',
    message_sent: '📤',
    tutor_message: '👨‍🏫',
    learner_message: '👨‍🎓',
    chat_message: '💬',
    
    // General
    general: '📢'
  };
  
  return iconMap[type] || '📢';
};

// Get notification color based on type
export const getNotificationColor = (type) => {
  const colorMap = {
    // Success/Positive
    course_available: 'emerald',
    enrollment_confirmation: 'emerald',
    new_enrollment: 'emerald',
    payment_confirmation: 'emerald',
    assignment_graded: 'emerald',
    assignment_published: 'emerald',
    course_completed: 'emerald',
    account_approved: 'emerald',
    kyc_approval: 'emerald',
    mentorship_accepted: 'emerald',
    certificate_ready: 'emerald',
    dispute_resolved: 'emerald',
    
    // Warning/Reminder
    payment_reminder: 'amber',
    assignment_created: 'indigo',
    assignment_due: 'amber',
    live_session_reminder: 'amber',
    // live_class_* removed - Live class functionality deleted
    system_maintenance: 'amber',
    
    // Error/Rejection
    course_rejection: 'red',
    user_rejection: 'red',
    account_rejected: 'red',
    kyc_rejection: 'red',
    mentorship_rejected: 'red',
    dispute_reported: 'red',
    
    // Info/Neutral
    course_submission: 'indigo',
    enrollment: 'indigo',
    payment_received: 'indigo',
    assignment_submitted: 'indigo',
    live_session_started: 'indigo',
    live_session_updated: 'indigo',
    // live_class_* removed - Live class functionality deleted
    replay_uploaded: 'indigo',
    course_update: 'indigo',
    user_approval: 'indigo',
    kyc_submission: 'indigo',
    mentorship_request: 'indigo',
    mentorship_response: 'indigo',
    system_alert: 'indigo',
    system_update: 'indigo',
    support_ticket: 'indigo',
    support_response: 'indigo',
    
    // Message related
    message_received: 'blue',
    message_sent: 'blue',
    tutor_message: 'blue',
    learner_message: 'blue',
    chat_message: 'blue',
    
    general: 'indigo'
  };
  
  return colorMap[type] || 'indigo';
};

// Format time ago
export const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

// Get notification priority label
export const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  return labels[priority] || 'Medium';
};

// Get notification type label
export const getTypeLabel = (type) => {
  const labels = {
    // Course related
    course_submission: 'Course Submission',
    course_update: 'Course Update',
    course_completed: 'Course Completed',
    
    // Enrollment related
    enrollment: 'New Enrollment',
    enrollment_confirmation: 'Enrollment Confirmed',
    
    // Payment related
    payment_received: 'Payment Received',
    payment_confirmation: 'Payment Confirmed',
    payment_reminder: 'Payment Reminder',
    
    // Assignment related
    assignment_submitted: 'Assignment Submitted',
    assignment_graded: 'Assignment Graded',
    assignment_due: 'Assignment Due',
    
    // Live session related
    live_session_reminder: 'Live Session Reminder',
    live_session_started: 'Live Session Started',
    live_session_updated: 'Live Session Updated',
    
    // User management
    user_approval: 'User Approval',
    user_rejection: 'User Rejection',
    account_approved: 'Account Approved',
    account_rejected: 'Account Rejected',
    
    // KYC related
    kyc_submission: 'KYC Submission',
    kyc_approval: 'KYC Approved',
    kyc_rejection: 'KYC Rejected',
    
    // Mentorship related
    mentorship_request: 'Mentorship Request',
    mentorship_accepted: 'Mentorship Accepted',
    mentorship_rejected: 'Mentorship Rejected',
    mentorship_response: 'Mentorship Response',
    
    // Certificate related
    certificate_ready: 'Certificate Ready',
    
    // System related
    system_alert: 'System Alert',
    system_maintenance: 'System Maintenance',
    system_update: 'System Update',
    
    // Support related
    support_ticket: 'Support Ticket',
    support_response: 'Support Response',
    
    // Dispute related
    dispute_reported: 'Dispute Reported',
    dispute_resolved: 'Dispute Resolved',
    
    // Message related
    message_received: 'Message Received',
    message_sent: 'Message Sent',
    tutor_message: 'Message from Tutor',
    learner_message: 'Message from Student',
    chat_message: 'Chat Message',
    
    // General
    general: 'General'
  };
  
  return labels[type] || 'Notification';
};

// Check if notification is actionable
export const isActionable = (type) => {
  const actionableTypes = [
    'course_rejection',
    'enrollment',
    'payment_received',
    'assignment_submitted',
    'assignment_graded',
    'live_session_reminder',
    'live_session_started',
    'user_approval',
    'user_rejection',
    'kyc_submission',
    'kyc_approval',
    'kyc_rejection',
    'mentorship_request',
    'mentorship_accepted',
    'mentorship_rejected',
    'certificate_ready',
    'support_ticket',
    'support_response',
    'dispute_reported',
    'dispute_resolved',
    'message_received',
    'tutor_message',
    'learner_message',
    'chat_message'
  ];
  
  return actionableTypes.includes(type);
};

// Get notification action text
export const getActionText = (type) => {
  const actionMap = {
    course_rejection: 'Update Course',
    enrollment: 'View Student',
    payment_received: 'View Payment',
    assignment_submitted: 'Grade Assignment',
    assignment_graded: 'View Feedback',
    live_session_reminder: 'Join Session',
    live_session_started: 'Join Now',
    user_approval: 'Review User',
    user_rejection: 'View Details',
    kyc_submission: 'Review KYC',
    kyc_approval: 'View Details',
    kyc_rejection: 'View Details',
    mentorship_request: 'Respond',
    mentorship_accepted: 'View Details',
    mentorship_rejected: 'View Details',
    certificate_ready: 'Download',
    support_ticket: 'Respond',
    support_response: 'View Response',
    dispute_reported: 'Investigate',
    dispute_resolved: 'View Details',
    message_received: 'View Message',
    tutor_message: 'Reply to Tutor',
    learner_message: 'Reply to Student',
    chat_message: 'Open Chat'
  };
  
  return actionMap[type] || 'View Details';
};
