import apiService from './api';

// ===== TUTOR REVIEW ANALYTICS =====

export const getTutorReviewAnalytics = async (params = {}) => {
  try {
    const response = await apiService.get('/reviews/admin/tutor-analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor review analytics:', error);
    throw error;
  }
};

export const getTutorDetailedAnalytics = async (tutorId, params = {}) => {
  try {
    const response = await apiService.get(`/reviews/admin/tutor/${tutorId}/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed tutor analytics:', error);
    throw error;
  }
};

// ===== TUTOR PERFORMANCE MONITORING =====

export const getTutorPerformanceSummary = async (timeRange = '30d') => {
  try {
    const response = await apiService.get('/reviews/admin/tutor-analytics', { 
      params: { timeRange } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor performance summary:', error);
    throw error;
  }
};

export const getTutorsWithNegativeReviews = async (timeRange = '30d') => {
  try {
    const response = await apiService.get('/reviews/admin/tutor-analytics', { 
      params: { timeRange } 
    });
    
    if (response.data.success) {
      const tutorsWithNegativeReviews = response.data.data.tutors.filter(
        tutor => tutor.negativeReviews > 0
      );
      
      return {
        success: true,
        data: {
          tutors: tutorsWithNegativeReviews,
          count: tutorsWithNegativeReviews.length,
          timeRange
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tutors with negative reviews:', error);
    throw error;
  }
};

export const getTopPerformingTutors = async (timeRange = '30d', limit = 10) => {
  try {
    const response = await apiService.get('/reviews/admin/tutor-analytics', { 
      params: { timeRange } 
    });
    
    if (response.data.success) {
      const topTutors = response.data.data.tutors
        .filter(tutor => tutor.totalReviews >= 3) // Minimum 3 reviews
        .slice(0, limit);
      
      return {
        success: true,
        data: {
          tutors: topTutors,
          count: topTutors.length,
          timeRange
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching top performing tutors:', error);
    throw error;
  }
};

export const getTutorsNeedingAttention = async (timeRange = '30d') => {
  try {
    const response = await apiService.get('/reviews/admin/tutor-analytics', { 
      params: { timeRange } 
    });
    
    if (response.data.success) {
      const tutorsNeedingAttention = response.data.data.tutors.filter(
        tutor => 
          tutor.negativeReviewPercentage > 30 || // More than 30% negative reviews
          (tutor.averageRating < 3.0 && tutor.totalReviews >= 2) // Low average with multiple reviews
      );
      
      return {
        success: true,
        data: {
          tutors: tutorsNeedingAttention,
          count: tutorsNeedingAttention.length,
          timeRange
        }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tutors needing attention:', error);
    throw error;
  }
};

// ===== REVIEW MODERATION =====

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

export const getReviewStatistics = async (params = {}) => {
  try {
    const response = await apiService.get('/reviews/admin/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    throw error;
  }
};

export default {
  getTutorReviewAnalytics,
  getTutorDetailedAnalytics,
  getTutorPerformanceSummary,
  getTutorsWithNegativeReviews,
  getTopPerformingTutors,
  getTutorsNeedingAttention,
  getPendingReviews,
  approveReview,
  rejectReview,
  getReviewStatistics
};
