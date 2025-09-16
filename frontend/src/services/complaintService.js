import api from './api';

// Submit a new complaint
export const submitComplaint = async (complaintData) => {
  try {
    const response = await api.post('/complaints/submit', complaintData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's complaints
export const getMyComplaints = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/complaints/my-complaints?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get specific complaint
export const getComplaint = async (complaintId) => {
  try {
    const response = await api.get(`/complaints/${complaintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update complaint
export const updateComplaint = async (complaintId, updateData) => {
  try {
    const response = await api.put(`/complaints/${complaintId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all complaints (admin only)
export const getAllComplaints = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.type) params.append('type', filters.type);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/complaints/admin/all?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Assign complaint to admin
export const assignComplaint = async (complaintId, assignmentData) => {
  try {
    const response = await api.post(`/complaints/${complaintId}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update complaint status
export const updateComplaintStatus = async (complaintId, statusData) => {
  try {
    const response = await api.patch(`/complaints/${complaintId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add admin response
export const addAdminResponse = async (complaintId, responseData) => {
  try {
    const response = await api.post(`/complaints/${complaintId}/response`, responseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Close complaint
export const closeComplaint = async (complaintId, closeData) => {
  try {
    const response = await api.patch(`/complaints/${complaintId}/close`, closeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get complaint statistics
export const getComplaintStatistics = async (period = 'all') => {
  try {
    const response = await api.get(`/complaints/admin/statistics?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete complaint
export const deleteComplaint = async (complaintId) => {
  try {
    const response = await api.delete(`/complaints/${complaintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
