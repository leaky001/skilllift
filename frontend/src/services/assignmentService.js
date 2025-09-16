import apiService from './api';

// ===== ASSIGNMENT CRUD OPERATIONS =====

export const createAssignment = async (assignmentData) => {
  try {
    const response = await apiService.post('/assignments', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await apiService.delete(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

export const getAssignment = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
};

// ===== COURSE ASSIGNMENTS =====

export const getCourseAssignments = async (courseId, status = 'published') => {
  try {
    const response = await apiService.get(`/assignments/course/${courseId}`, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    throw error;
  }
};

// ===== TUTOR ASSIGNMENTS =====

export const getTutorAssignments = async (params = {}) => {
  try {
    const response = await apiService.get('/assignments/tutor/my-assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor assignments:', error);
    throw error;
  }
};

// ===== ASSIGNMENT MANAGEMENT =====

export const publishAssignment = async (assignmentId) => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing assignment:', error);
    throw error;
  }
};

export const archiveAssignment = async (assignmentId) => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving assignment:', error);
    throw error;
  }
};

export const duplicateAssignment = async (assignmentId, duplicateData) => {
  try {
    const response = await apiService.post(`/assignments/${assignmentId}/duplicate`, duplicateData);
    return response.data;
  } catch (error) {
    console.error('Error duplicating assignment:', error);
    throw error;
  }
};

export const getAssignmentStats = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    throw error;
  }
};

// ===== ASSIGNMENT UTILITIES =====

export const getAssignmentTypeLabel = (type) => {
  const labels = {
    'homework': 'Homework',
    'project': 'Project',
    'quiz': 'Quiz',
    'assessment': 'Assessment',
    'reading': 'Reading',
    'discussion': 'Discussion'
  };
  return labels[type] || type;
};

export const getSubmissionTypeLabel = (type) => {
  const labels = {
    'file': 'File Upload',
    'text': 'Text Input',
    'multiple-choice': 'Multiple Choice',
    'link': 'Link/URL',
    'none': 'No Submission Required'
  };
  return labels[type] || type;
};

export const formatDueDate = (dueDate) => {
  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export const getAssignmentStatusColor = (status) => {
  const colors = {
    'draft': 'text-gray-600 bg-gray-100',
    'published': 'text-green-600 bg-green-100',
    'archived': 'text-red-600 bg-red-100'
  };
  return colors[status] || colors.draft;
};

export const getAssignmentStatusIcon = (status) => {
  const icons = {
    'draft': '📝',
    'published': '✅',
    'archived': '🗄️'
  };
  return icons[status] || icons.draft;
};

export default {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignment,
  getCourseAssignments,
  getTutorAssignments,
  publishAssignment,
  archiveAssignment,
  duplicateAssignment,
  getAssignmentStats,
  getAssignmentTypeLabel,
  getSubmissionTypeLabel,
  formatDueDate,
  getAssignmentStatusColor,
  getAssignmentStatusIcon
};
