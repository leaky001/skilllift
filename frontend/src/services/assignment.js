import apiService from './api';

// Get all assignments
export const getAssignments = async (params = {}) => {
  try {
    const response = await apiService.get('/assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

// Get single assignment
export const getAssignment = async (id) => {
  try {
    const response = await apiService.get(`/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
};

// Create assignment (Tutor only)
export const createAssignment = async (assignmentData) => {
  try {
    const response = await apiService.post('/assignments', assignmentData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Update assignment (Tutor only)
export const updateAssignment = async (id, updates) => {
  try {
    const response = await apiService.put(`/assignments/${id}`, updates, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

// Delete assignment (Tutor only)
export const deleteAssignment = async (id) => {
  try {
    const response = await apiService.delete(`/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// Get assignments for a specific course
export const getCourseAssignments = async (courseId) => {
  try {
    const response = await apiService.get(`/assignments/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    throw error;
  }
};

// Create assignment for a specific course
export const createCourseAssignment = async (courseId, assignmentData) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/assignments`, assignmentData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course assignment:', error);
    throw error;
  }
};

// Get assignment by course and assignment ID
export const getAssignmentByCourse = async (courseId, assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course assignment:', error);
    throw error;
  }
};

// Get my assignments (for learners)
export const getMyAssignments = async (params = {}) => {
  try {
    const response = await apiService.get('/assignments/my-assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my assignments:', error);
    throw error;
  }
};

// Get tutor assignments (for tutors)
export const getTutorAssignments = async (params = {}) => {
  try {
    const response = await apiService.get('/assignments/tutor/my-assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor assignments:', error);
    throw error;
  }
};

// Get assignment submissions (for tutors)
export const getAssignmentSubmissions = async (assignmentId, params = {}) => {
  try {
    const response = await apiService.get(`/assignment-submissions/tutor/assignments/${assignmentId}/submissions`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    throw error;
  }
};

// Submit assignment (for learners)
export const submitAssignment = async (assignmentId, submissionData) => {
  try {
    const response = await apiService.post(`/assignment-submissions`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// Grade assignment submission (for tutors)
export const gradeAssignmentSubmission = async (submissionId, gradeData) => {
  try {
    const response = await apiService.put(`/assignment-submissions/${submissionId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error('Error grading assignment submission:', error);
    throw error;
  }
};

// Get my submissions (for learners)
export const getMySubmissions = async (params = {}) => {
  try {
    const response = await apiService.get('/assignment-submissions/my-submissions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my submissions:', error);
    throw error;
  }
};

// Get submission by ID
export const getSubmission = async (submissionId) => {
  try {
    const response = await apiService.get(`/assignment-submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw error;
  }
};

// Update submission (for learners)
export const updateSubmission = async (submissionId, updates) => {
  try {
    const response = await apiService.put(`/assignment-submissions/${submissionId}`, updates, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
};

// Delete submission (for learners)
export const deleteSubmission = async (submissionId) => {
  try {
    const response = await apiService.delete(`/assignment-submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw error;
  }
};

// Publish assignment (for tutors)
export const publishAssignment = async (assignmentId) => {
  try {
    const response = await apiService.post(`/assignments/${assignmentId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing assignment:', error);
    throw error;
  }
};

// Unpublish assignment (for tutors)
export const unpublishAssignment = async (assignmentId) => {
  try {
    const response = await apiService.post(`/assignments/${assignmentId}/unpublish`);
    return response.data;
  } catch (error) {
    console.error('Error unpublishing assignment:', error);
    throw error;
  }
};

// Get assignment statistics (for tutors)
export const getAssignmentStats = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    throw error;
  }
};

// Get assignment analytics (for tutors)
export const getAssignmentAnalytics = async (assignmentId) => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment analytics:', error);
    throw error;
  }
};
