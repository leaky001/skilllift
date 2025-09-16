import apiService from './api';

// ===== REVIEW CRUD OPERATIONS =====

export const createReview = async (reviewData) => {
  try {
    const response = await apiService.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiService.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await apiService.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getReview = async (reviewId) => {
  try {
    const response = await apiService.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// ===== COURSE REVIEWS =====

export const getCourseReviews = async (courseId, params = {}) => {
  try {
    const response = await apiService.get(`/reviews/course/${courseId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    throw error;
  }
};

export const getMyReviews = async (params = {}) => {
  try {
    const response = await apiService.get('/reviews/my-reviews', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    throw error;
  }
};

export const getUserReviews = async (userId, params = {}) => {
  try {
    const response = await apiService.get(`/reviews/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// ===== REVIEW STATISTICS =====

export const getCourseReviewStats = async (courseId) => {
  try {
    const response = await apiService.get(`/reviews/course/${courseId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course review stats:', error);
    throw error;
  }
};

export const getReviewStatistics = async (params = {}) => {
  try {
    const response = await apiService.get('/reviews/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    throw error;
  }
};

// ===== REVIEW MODERATION (ADMIN) =====

export const getPendingReviews = async (params = {}) => {
  try {
    const response = await apiService.get('/reviews/admin/pending', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    throw error;
  }
};

export const approveReview = async (reviewId) => {
  try {
    const response = await apiService.put(`/reviews/${reviewId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving review:', error);
    throw error;
  }
};

export const rejectReview = async (reviewId, reason) => {
  try {
    const response = await apiService.put(`/reviews/${reviewId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};

// ===== REVIEW INTERACTIONS =====

export const likeReview = async (reviewId) => {
  try {
    const response = await apiService.post(`/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
};

export const unlikeReview = async (reviewId) => {
  try {
    const response = await apiService.delete(`/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error unliking review:', error);
    throw error;
  }
};

export const reportReview = async (reviewId, reason) => {
  try {
    const response = await apiService.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
};

export default {
  createReview,
  updateReview,
  deleteReview,
  getReview,
  getCourseReviews,
  getMyReviews,
  getUserReviews,
  getCourseReviewStats,
  getReviewStatistics,
  getPendingReviews,
  approveReview,
  rejectReview,
  likeReview,
  unlikeReview,
  reportReview
};
