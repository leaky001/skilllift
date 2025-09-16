import api from './api';

// Get platform settings (admin only)
export const getPlatformSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update platform settings (admin only)
export const updatePlatformSettings = async (settingsData) => {
  try {
    const response = await api.put('/settings', settingsData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update specific setting category (admin only)
export const updateSettingCategory = async (category, updateData) => {
  try {
    const response = await api.put(`/settings/${category}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Reset settings to defaults (admin only)
export const resetSettingsToDefaults = async () => {
  try {
    const response = await api.post('/settings/reset');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get public settings (no authentication required)
export const getPublicSettings = async () => {
  try {
    const response = await api.get('/settings/public');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update payment settings (admin only)
export const updatePaymentSettings = async (paymentData) => {
  try {
    const response = await api.put('/settings/payments', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get settings audit log (admin only)
export const getSettingsAuditLog = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/settings/audit-log?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Export settings (admin only)
export const exportSettings = async (format = 'json') => {
  try {
    const response = await api.get(`/settings/export?format=${format}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
