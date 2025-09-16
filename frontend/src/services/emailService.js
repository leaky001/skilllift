import apiService from './api';

// ===== EMAIL NOTIFICATION SERVICE =====

export const sendEmailNotification = async (notificationData) => {
  try {
    const response = await apiService.post('/notifications/email', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

export const getEmailTemplates = async () => {
  try {
    const response = await apiService.get('/notifications/email/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching email templates:', error);
    throw error;
  }
};

export const createEmailTemplate = async (templateData) => {
  try {
    const response = await apiService.post('/notifications/email/templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
};

export const updateEmailTemplate = async (templateId, templateData) => {
  try {
    const response = await apiService.put(`/notifications/email/templates/${templateId}`, templateData);
    return response.data;
  } catch (error) {
    console.error('Error updating email template:', error);
    throw error;
  }
};

export const deleteEmailTemplate = async (templateId) => {
  try {
    const response = await apiService.delete(`/notifications/email/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting email template:', error);
    throw error;
  }
};

// ===== EMAIL PREFERENCES =====

export const getEmailPreferences = async () => {
  try {
    const response = await apiService.get('/notifications/email/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    throw error;
  }
};

export const updateEmailPreferences = async (preferences) => {
  try {
    const response = await apiService.put('/notifications/email/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating email preferences:', error);
    throw error;
  }
};

// ===== SPECIFIC EMAIL NOTIFICATIONS =====

export const sendMentorshipRequestEmail = async (mentorshipData) => {
  try {
    const response = await apiService.post('/notifications/email/mentorship-request', mentorshipData);
    return response.data;
  } catch (error) {
    console.error('Error sending mentorship request email:', error);
    throw error;
  }
};

export const sendCourseEnrollmentEmail = async (enrollmentData) => {
  try {
    const response = await apiService.post('/notifications/email/course-enrollment', enrollmentData);
    return response.data;
  } catch (error) {
    console.error('Error sending course enrollment email:', error);
    throw error;
  }
};

export const sendLiveSessionReminderEmail = async (sessionData) => {
  try {
    const response = await apiService.post('/notifications/email/live-session-reminder', sessionData);
    return response.data;
  } catch (error) {
    console.error('Error sending live session reminder email:', error);
    throw error;
  }
};

export const sendPaymentConfirmationEmail = async (paymentData) => {
  try {
    const response = await apiService.post('/notifications/email/payment-confirmation', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

export const sendCertificateEmail = async (certificateData) => {
  try {
    const response = await apiService.post('/notifications/email/certificate', certificateData);
    return response.data;
  } catch (error) {
    console.error('Error sending certificate email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (userData) => {
  try {
    const response = await apiService.post('/notifications/email/welcome', userData);
    return response.data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await apiService.post('/notifications/email/password-reset', { email });
    return response.data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendEmailVerificationEmail = async (email) => {
  try {
    const response = await apiService.post('/notifications/email/verification', { email });
    return response.data;
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};

// ===== EMAIL CAMPAIGNS =====

export const createEmailCampaign = async (campaignData) => {
  try {
    const response = await apiService.post('/notifications/email/campaigns', campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating email campaign:', error);
    throw error;
  }
};

export const getEmailCampaigns = async (params = {}) => {
  try {
    const response = await apiService.get('/notifications/email/campaigns', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    throw error;
  }
};

export const updateEmailCampaign = async (campaignId, campaignData) => {
  try {
    const response = await apiService.put(`/notifications/email/campaigns/${campaignId}`, campaignData);
    return response.data;
  } catch (error) {
    console.error('Error updating email campaign:', error);
    throw error;
  }
};

export const deleteEmailCampaign = async (campaignId) => {
  try {
    const response = await apiService.delete(`/notifications/email/campaigns/${campaignId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting email campaign:', error);
    throw error;
  }
};

export const sendEmailCampaign = async (campaignId) => {
  try {
    const response = await apiService.post(`/notifications/email/campaigns/${campaignId}/send`);
    return response.data;
  } catch (error) {
    console.error('Error sending email campaign:', error);
    throw error;
  }
};

// ===== EMAIL ANALYTICS =====

export const getEmailAnalytics = async (params = {}) => {
  try {
    const response = await apiService.get('/notifications/email/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    throw error;
  }
};

export const getEmailDeliveryStatus = async (emailId) => {
  try {
    const response = await apiService.get(`/notifications/email/status/${emailId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching email delivery status:', error);
    throw error;
  }
};

// ===== EMAIL SUBSCRIBERS =====

export const getEmailSubscribers = async (params = {}) => {
  try {
    const response = await apiService.get('/notifications/email/subscribers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching email subscribers:', error);
    throw error;
  }
};

export const addEmailSubscriber = async (subscriberData) => {
  try {
    const response = await apiService.post('/notifications/email/subscribers', subscriberData);
    return response.data;
  } catch (error) {
    console.error('Error adding email subscriber:', error);
    throw error;
  }
};

export const removeEmailSubscriber = async (subscriberId) => {
  try {
    const response = await apiService.delete(`/notifications/email/subscribers/${subscriberId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing email subscriber:', error);
    throw error;
  }
};

export const unsubscribeFromEmails = async (token) => {
  try {
    const response = await apiService.post('/notifications/email/unsubscribe', { token });
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing from emails:', error);
    throw error;
  }
};
