import api from './api';

// Submit KYC documents
export const submitKYC = async (formData) => {
  try {
    const response = await api.post('/kyc/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get KYC status
export const getKYCStatus = async () => {
  try {
    const response = await api.get('/kyc/status');
    return response.data;
  } catch (error) {
    throw error;
  }
};
