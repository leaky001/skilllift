import apiService from './api';

// Submit assignment
export const submitAssignment = async (assignmentData) => {
  try {
    const formData = new FormData();
    
    // Add basic assignment data - ensure we use the correct field name
    formData.append('assignment', assignmentData.assignmentId || assignmentData.assignment);
    formData.append('content', assignmentData.content || '');
    formData.append('submissionNotes', assignmentData.submissionNotes || '');
    
    // Add links as JSON string
    if (assignmentData.links && assignmentData.links.length > 0) {
      formData.append('links', JSON.stringify(assignmentData.links));
    }
    
    // Add files
    if (assignmentData.files && assignmentData.files.length > 0) {
      assignmentData.files.forEach((file, index) => {
        formData.append('attachments', file);
      });
    }
    
    console.log('📤 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    const response = await apiService.post('/assignment-submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Submit assignment error:', error);
    throw error;
  }
};

// Get my submissions
export const getMySubmissions = async () => {
  try {
    const response = await apiService.get('/assignment-submissions/my-submissions');
    return response.data;
  } catch (error) {
    console.error('Get my submissions error:', error);
    throw error;
  }
};

// Get specific submission
export const getSubmission = async (submissionId) => {
  try {
    const response = await apiService.get(`/assignment-submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('Get submission error:', error);
    throw error;
  }
};

// Update submission
export const updateSubmission = async (submissionId, submissionData) => {
  try {
    const formData = new FormData();
    
    // Add basic submission data
    formData.append('content', submissionData.content);
    formData.append('submissionNotes', submissionData.submissionNotes || '');
    
    // Add links as JSON string
    if (submissionData.links && submissionData.links.length > 0) {
      formData.append('links', JSON.stringify(submissionData.links));
    }
    
    // Add files
    if (submissionData.files && submissionData.files.length > 0) {
      submissionData.files.forEach((file, index) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiService.put(`/assignment-submissions/${submissionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Update submission error:', error);
    throw error;
  }
};

// Delete submission
export const deleteSubmission = async (submissionId) => {
  try {
    const response = await apiService.delete(`/assignment-submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('Delete submission error:', error);
    throw error;
  }
};

// Get assignment submissions (for tutors)
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignment-submissions/tutor/assignments/${assignmentId}/submissions`);
    return response.data;
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    throw error;
  }
};

// Grade submission (for tutors)
export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await apiService.put(`/assignment-submissions/${submissionId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error('Grade submission error:', error);
    throw error;
  }
};

// Add feedback to submission (for tutors)
export const addFeedback = async (submissionId, feedback) => {
  try {
    const response = await apiService.put(`/assignment-submissions/${submissionId}/feedback`, { feedback });
    return response.data;
  } catch (error) {
    console.error('Add feedback error:', error);
    throw error;
  }
};

// Get ungraded submissions (for tutors)
export const getUngradedSubmissions = async () => {
  try {
    const response = await apiService.get('/assignment-submissions/tutor/ungraded');
    return response.data;
  } catch (error) {
    console.error('Get ungraded submissions error:', error);
    throw error;
  }
};

// Get all submissions (for admins)
export const getAllSubmissions = async (filters = {}) => {
  try {
    const response = await apiService.get('/assignment-submissions/admin/all', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Get all submissions error:', error);
    throw error;
  }
};

// Get submission statistics (for admins)
export const getSubmissionStatistics = async () => {
  try {
    const response = await apiService.get('/assignment-submissions/admin/statistics');
    return response.data;
  } catch (error) {
    console.error('Get submission statistics error:', error);
    throw error;
  }
};

// Moderate submission (for admins)
export const moderateSubmission = async (submissionId, action, reason) => {
  try {
    const response = await apiService.put(`/assignment-submissions/admin/${submissionId}/moderate`, {
      action,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Moderate submission error:', error);
    throw error;
  }
};
