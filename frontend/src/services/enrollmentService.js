import api from './api';

// Enroll in a course
export const enrollInCourse = async (courseId, enrollmentData = {}) => {
  try {
    const response = await api.post(`/enrollments/enroll/${courseId}`, enrollmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's enrollments
export const getMyEnrollments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/enrollments/my-enrollments?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get specific enrollment
export const getEnrollment = async (enrollmentId) => {
  try {
    const response = await api.get(`/enrollments/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update enrollment progress
export const updateProgress = async (enrollmentId, progressData) => {
  try {
    const response = await api.patch(`/enrollments/${enrollmentId}/progress`, progressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Complete course
export const completeCourse = async (enrollmentId, completionData = {}) => {
  try {
    const response = await api.post(`/enrollments/${enrollmentId}/complete`, completionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Submit assignment
export const submitAssignment = async (enrollmentId, assignmentId, submissionData) => {
  try {
    const response = await api.post(`/enrollments/${enrollmentId}/assignments/${assignmentId}/submit`, submissionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get enrollment assignments
export const getEnrollmentAssignments = async (enrollmentId) => {
  try {
    const response = await api.get(`/enrollments/${enrollmentId}/assignments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get tutor's students
export const getTutorStudents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/enrollments/tutor/students?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get course enrollments
export const getCourseEnrollments = async (courseId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/enrollments/course/${courseId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Grade enrollment (tutor only)
export const gradeEnrollment = async (enrollmentId, gradeData) => {
  try {
    const response = await api.post(`/enrollments/${enrollmentId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Issue certificate for enrollment
export const issueCertificate = async (enrollmentId, certificateData = {}) => {
  try {
    const response = await api.post(`/enrollments/${enrollmentId}/certificate`, certificateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all enrollments (admin only)
export const getAllEnrollments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.tutorId) params.append('tutorId', filters.tutorId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/enrollments/admin/all?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get enrollment statistics (admin only)
export const getEnrollmentStatistics = async (period = 'all') => {
  try {
    const response = await api.get(`/enrollments/admin/statistics?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Check enrollment status for a course
export const checkEnrollmentStatus = async (courseId, forceRefresh = false) => {
  try {
    const url = forceRefresh 
      ? `/enrollments/check-status/${courseId}?t=${Date.now()}`
      : `/enrollments/check-status/${courseId}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};