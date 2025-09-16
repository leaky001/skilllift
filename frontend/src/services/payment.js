import apiService from './api';

// ===== PAYMENT METHODS =====

export const getPaymentMethods = async () => {
  try {
    const response = await apiService.get('/payments/methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

export const addPaymentMethod = async (paymentData) => {
  try {
    const response = await apiService.post('/payments/methods', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

export const updatePaymentMethod = async (methodId, paymentData) => {
  try {
    const response = await apiService.put(`/payments/methods/${methodId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (methodId) => {
  try {
    const response = await apiService.delete(`/payments/methods/${methodId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

export const setDefaultPaymentMethod = async (methodId) => {
  try {
    const response = await apiService.put(`/payments/methods/${methodId}/default`);
    return response.data;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

// ===== PAYMENT PROCESSING =====

export const processPayment = async (paymentData) => {
  try {
    const response = await apiService.post('/payments/process', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const processCoursePayment = async (courseId, paymentData) => {
  try {
    const response = await apiService.post(`/payments/courses/${courseId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing course payment:', error);
    throw error;
  }
};

export const processSubscriptionPayment = async (subscriptionId, paymentData) => {
  try {
    const response = await apiService.post(`/payments/subscriptions/${subscriptionId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing subscription payment:', error);
    throw error;
  }
};

export const processRefund = async (paymentId, refundData) => {
  try {
    const response = await apiService.post(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

// ===== PAYMENT HISTORY =====

export const getPaymentHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/payments/history?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await apiService.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

export const getPaymentReceipt = async (paymentId) => {
  try {
    const response = await apiService.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment receipt:', error);
    throw error;
  }
};

// ===== PAYMENT STATISTICS =====

export const getPaymentStatistics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/payments/statistics?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
};

export const getRevenueAnalytics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/payments/revenue?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

export const getPaymentMethodStats = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/payments/method-stats?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment method statistics:', error);
    throw error;
  }
};

// ===== PAYOUTS =====

export const requestPayout = async (payoutData) => {
  try {
    const response = await apiService.post('/payments/payouts', payoutData);
    return response.data;
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw error;
  }
};

export const getPayoutHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/payments/payouts?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payout history:', error);
    throw error;
  }
};

export const getPayoutDetails = async (payoutId) => {
  try {
    const response = await apiService.get(`/payments/payouts/${payoutId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payout details:', error);
    throw error;
  }
};

export const cancelPayout = async (payoutId) => {
  try {
    const response = await apiService.delete(`/payments/payouts/${payoutId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling payout:', error);
    throw error;
  }
};

// ===== INVOICES =====

export const generateInvoice = async (paymentId) => {
  try {
    const response = await apiService.post(`/payments/${paymentId}/invoice`);
    return response.data;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export const getInvoice = async (invoiceId) => {
  try {
    const response = await apiService.get(`/payments/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

export const downloadInvoice = async (invoiceId) => {
  try {
    const response = await apiService.get(`/payments/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

// ===== PAYMENT VERIFICATION =====

export const verifyPayment = async (paymentId) => {
  try {
    const response = await apiService.post(`/payments/${paymentId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await apiService.get(`/payments/${paymentId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

// ===== PAYMENT WEBHOOKS =====

export const registerWebhook = async (webhookData) => {
  try {
    const response = await apiService.post('/payments/webhooks', webhookData);
    return response.data;
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
};

export const getWebhooks = async () => {
  try {
    const response = await apiService.get('/payments/webhooks');
    return response.data;
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    throw error;
  }
};

export const deleteWebhook = async (webhookId) => {
  try {
    const response = await apiService.delete(`/payments/webhooks/${webhookId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting webhook:', error);
    throw error;
  }
};

// ===== PAYMENT SETTINGS =====

export const getPaymentSettings = async () => {
  try {
    const response = await apiService.get('/payments/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    throw error;
  }
};

export const updatePaymentSettings = async (settings) => {
  try {
    const response = await apiService.put('/payments/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating payment settings:', error);
    throw error;
  }
};

// ===== PAYMENT DISPUTES =====

export const createDispute = async (paymentId, disputeData) => {
  try {
    const response = await apiService.post(`/payments/${paymentId}/disputes`, disputeData);
    return response.data;
  } catch (error) {
    console.error('Error creating dispute:', error);
    throw error;
  }
};

export const getDisputes = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/payments/disputes?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching disputes:', error);
    throw error;
  }
};

export const updateDispute = async (disputeId, updates) => {
  try {
    const response = await apiService.put(`/payments/disputes/${disputeId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating dispute:', error);
    throw error;
  }
};

export const resolveDispute = async (disputeId, resolution) => {
  try {
    const response = await apiService.put(`/payments/disputes/${disputeId}/resolve`, resolution);
    return response.data;
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
  }
};
