import apiService from './api';

// ===== COURSE CRUD OPERATIONS =====
// Note: createCourse is handled in tutorService.js to avoid duplicates

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await apiService.put(`/courses/${courseId}`, courseData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await apiService.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getCourses = async (params = {}) => {
  try {
    const response = await apiService.get('/courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const getTutorCourse = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/tutor/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor course:', error);
    throw error;
  }
};

export const getMyCourses = async (params = {}) => {
  try {
    const response = await apiService.get('/courses/tutor/my-courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my courses:', error);
    throw error;
  }
};

export const getTutorCourses = async (params = {}) => {
  try {
    const response = await apiService.get('/courses/tutor/my-courses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor courses:', error);
    throw error;
  }
};

// ===== COURSE MANAGEMENT =====

export const publishCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
};

export const unpublishCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/unpublish`);
    return response.data;
  } catch (error) {
    console.error('Error unpublishing course:', error);
    throw error;
  }
};

export const archiveCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving course:', error);
    throw error;
  }
};

export const restoreCourse = async (courseId) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring course:', error);
    throw error;
  }
};

// ===== ADMIN COURSE APPROVAL =====

export const approveCourse = async (courseId) => {
  try {
    const response = await apiService.put(`/courses/${courseId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving course:', error);
    throw error;
  }
};

export const rejectCourse = async (courseId, reason = '') => {
  try {
    const response = await apiService.put(`/courses/${courseId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting course:', error);
    throw error;
  }
};

export const getAllCourses = async (params = {}) => {
  try {
    const response = await apiService.get('/courses/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

// ===== COURSE CONTENT MANAGEMENT =====

export const addCourseContent = async (courseId, contentData) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/content`, contentData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding course content:', error);
    throw error;
  }
};

export const updateCourseContent = async (courseId, contentId, contentData) => {
  try {
    const response = await apiService.put(`/courses/${courseId}/content/${contentId}`, contentData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating course content:', error);
    throw error;
  }
};

export const deleteCourseContent = async (courseId, contentId) => {
  try {
    const response = await apiService.delete(`/courses/${courseId}/content/${contentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course content:', error);
    throw error;
  }
};

// ===== COURSE ENROLLMENT =====

export const enrollInCourse = async (courseId, enrollmentData = {}) => {
  try {
    const response = await apiService.post('/enrollments/enroll', {
      courseId,
      ...enrollmentData
    });
    return response.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

export const getMyEnrollments = async (params = {}) => {
  try {
    // The API service handles authentication automatically
    // No need to manually check for tokens here
    console.log('🔄 Fetching enrollments via API service...');
    
    const response = await apiService.get('/enrollments/my-enrollments', { params });
    console.log('✅ Enrollments API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    
    // If it's a 401 error, the API service will handle token clearing
    if (error.response?.status === 401) {
      console.log('🔐 Authentication expired, API service will handle token clearing');
      return { success: true, data: [] };
    }
    
    throw error;
  }
};

export const checkEnrollmentStatus = async (courseId, forceRefresh = false) => {
  try {
    const response = await apiService.get(`/enrollments/check-status/${courseId}`, {
      timeout: 5000, // 5 second timeout
      params: forceRefresh ? { refresh: true } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        success: false,
        message: 'Enrollment status check timed out. Please try again.',
        data: {
          isEnrolled: false,
          enrollmentStatus: 'timeout',
          paymentStatus: 'unknown'
        }
      };
    }
    
    // Handle other errors
    if (error.response?.status === 408) {
      return error.response.data; // Return the timeout response from backend
    }
    
    throw error;
  }
};

// ===== COURSE ANALYTICS =====

export const getCourseAnalytics = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

export const getCourseStats = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course stats:', error);
    throw error;
  }
};

// ===== COURSE SEARCH AND FILTERS =====

export const searchCourses = async (searchParams) => {
  try {
    const response = await apiService.get('/courses/search', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
};

export const getCourseCategories = async () => {
  try {
    const response = await apiService.get('/courses/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw error;
  }
};

// ===== COURSE RATINGS AND REVIEWS =====

export const addCourseReview = async (courseId, reviewData) => {
  try {
    const response = await apiService.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding course review:', error);
    throw error;
  }
};

export const getCourseReviews = async (courseId, params = {}) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/reviews`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    throw error;
  }
};

export const updateCourseReview = async (courseId, reviewId, reviewData) => {
  try {
    const response = await apiService.put(`/courses/${courseId}/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating course review:', error);
    throw error;
  }
};

export const deleteCourseReview = async (courseId, reviewId) => {
  try {
    const response = await apiService.delete(`/courses/${courseId}/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course review:', error);
    throw error;
  }
};
