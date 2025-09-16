import apiService from './api';

// ===== CERTIFICATE CRUD =====

export const getCertificates = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/certificates?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

export const getUserCertificates = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/certificates/user?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    throw error;
  }
};

export const getCertificate = async (certificateId) => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
};

export const createCertificate = async (certificateData) => {
  try {
    const response = await apiService.post('/certificates', certificateData);
    return response.data;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

export const updateCertificate = async (certificateId, updates) => {
  try {
    const response = await apiService.put(`/certificates/${certificateId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
};

export const deleteCertificate = async (certificateId) => {
  try {
    const response = await apiService.delete(`/certificates/${certificateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};

// ===== COURSE CERTIFICATES =====

export const getCourseCertificates = async (courseId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/courses/${courseId}/certificates?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course certificates:', error);
    throw error;
  }
};

export const generateCourseCertificate = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/certificates`);
    return response.data;
  } catch (error) {
    console.error('Error generating course certificate:', error);
    throw error;
  }
};

export const getCourseCertificate = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/certificate`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course certificate:', error);
    throw error;
  }
};

// ===== CERTIFICATE VERIFICATION =====

export const verifyCertificate = async (verificationCode) => {
  try {
    const response = await apiService.post('/certificates/verify', { verificationCode });
    return response.data;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

export const getCertificateByVerificationCode = async (verificationCode) => {
  try {
    const response = await apiService.get(`/certificates/verify/${verificationCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate by verification code:', error);
    throw error;
  }
};

// ===== CERTIFICATE DOWNLOADS =====

export const downloadCertificate = async (certificateId, format = 'pdf') => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/download?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

export const downloadCertificateAsPDF = async (certificateId) => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading certificate as PDF:', error);
    throw error;
  }
};

export const downloadCertificateAsImage = async (certificateId, format = 'png') => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/image?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading certificate as image:', error);
    throw error;
  }
};

// ===== CERTIFICATE TEMPLATES =====

export const getCertificateTemplates = async () => {
  try {
    const response = await apiService.get('/certificates/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate templates:', error);
    throw error;
  }
};

export const createCertificateTemplate = async (templateData) => {
  try {
    const response = await apiService.post('/certificates/templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating certificate template:', error);
    throw error;
  }
};

export const updateCertificateTemplate = async (templateId, updates) => {
  try {
    const response = await apiService.put(`/certificates/templates/${templateId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating certificate template:', error);
    throw error;
  }
};

export const deleteCertificateTemplate = async (templateId) => {
  try {
    const response = await apiService.delete(`/certificates/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting certificate template:', error);
    throw error;
  }
};

// ===== CERTIFICATE STATISTICS =====

export const getCertificateStatistics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/certificates/statistics?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate statistics:', error);
    throw error;
  }
};

export const getCertificateAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/certificates/analytics?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate analytics:', error);
    throw error;
  }
};

export const getCertificateTrends = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/certificates/trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate trends:', error);
    throw error;
  }
};

// ===== CERTIFICATE SHARING =====

export const shareCertificate = async (certificateId, shareData) => {
  try {
    const response = await apiService.post(`/certificates/${certificateId}/share`, shareData);
    return response.data;
  } catch (error) {
    console.error('Error sharing certificate:', error);
    throw error;
  }
};

export const getCertificateShareStats = async (certificateId) => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/share-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate share stats:', error);
    throw error;
  }
};

export const getCertificateShareLinks = async (certificateId) => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/share-links`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate share links:', error);
    throw error;
  }
};

// ===== CERTIFICATE EXPORT & IMPORT =====

export const exportCertificates = async (filters = {}, format = 'csv') => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/certificates/export?${queryParams}&format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting certificates:', error);
    throw error;
  }
};

export const importCertificates = async (importData) => {
  try {
    const response = await apiService.post('/certificates/import', importData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error importing certificates:', error);
    throw error;
  }
};

// ===== CERTIFICATE REPORTS =====

export const generateCertificateReport = async (reportData) => {
  try {
    const response = await apiService.post('/certificates/reports/generate', reportData);
    return response.data;
  } catch (error) {
    console.error('Error generating certificate report:', error);
    throw error;
  }
};

export const getCertificateReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/certificates/reports?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate reports:', error);
    throw error;
  }
};

export const downloadCertificateReport = async (reportId) => {
  try {
    const response = await apiService.get(`/certificates/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading certificate report:', error);
    throw error;
  }
};

// ===== CERTIFICATE VALIDATION =====

export const validateCertificate = async (certificateData) => {
  try {
    const response = await apiService.post('/certificates/validate', certificateData);
    return response.data;
  } catch (error) {
    console.error('Error validating certificate:', error);
    throw error;
  }
};

export const getCertificateValidationHistory = async (certificateId) => {
  try {
    const response = await apiService.get(`/certificates/${certificateId}/validation-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate validation history:', error);
    throw error;
  }
};

// ===== CERTIFICATE SETTINGS =====

export const getCertificateSettings = async () => {
  try {
    const response = await apiService.get('/certificates/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate settings:', error);
    throw error;
  }
};

export const updateCertificateSettings = async (settings) => {
  try {
    const response = await apiService.put('/certificates/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating certificate settings:', error);
    throw error;
  }
};
