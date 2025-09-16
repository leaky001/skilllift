import api from './api';

// Get user's transactions
export const getMyTransactions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/transactions/my-transactions?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get specific transaction
export const getTransaction = async (transactionId) => {
  try {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get tutor payouts
export const getTutorPayouts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/transactions/tutor/payouts?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Request payout
export const requestPayout = async (payoutData) => {
  try {
    const response = await api.post('/transactions/request-payout', payoutData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get tutor earnings
export const getTutorEarnings = async (period = 'all') => {
  try {
    const response = await api.get(`/transactions/tutor/earnings?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all transactions (admin only)
export const getAllTransactions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/transactions/admin/all?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get pending payouts (admin only)
export const getPendingPayouts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.tutorId) params.append('tutorId', filters.tutorId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/transactions/admin/pending-payouts?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Process payout (admin only)
export const processPayout = async (payoutId, processData) => {
  try {
    const response = await api.post(`/transactions/admin/process-payout/${payoutId}`, processData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get transaction statistics (admin only)
export const getTransactionStatistics = async (period = 'all') => {
  try {
    const response = await api.get(`/transactions/admin/statistics?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Process refund (admin only)
export const processRefund = async (transactionId, refundData) => {
  try {
    const response = await api.post(`/transactions/admin/refund/${transactionId}`, refundData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
