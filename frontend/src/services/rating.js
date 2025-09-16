import apiService from './api';

// ===== COURSE RATINGS =====

export const getCourseRatings = async (courseId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/courses/${courseId}/ratings?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course ratings:', error);
    throw error;
  }
};

export const getUserRatings = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/ratings/user?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
};

export const createRating = async (ratingData) => {
  try {
    const response = await apiService.post('/ratings', ratingData);
    return response.data;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
};

export const updateRating = async (ratingId, ratingData) => {
  try {
    const response = await apiService.put(`/ratings/${ratingId}`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Error updating rating:', error);
    throw error;
  }
};

export const deleteRating = async (ratingId) => {
  try {
    const response = await apiService.delete(`/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
};

export const getRatingStatistics = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/rating-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating statistics:', error);
    throw error;
  }
};

export const getRatingDistribution = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/rating-distribution`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating distribution:', error);
    throw error;
  }
};

export const getAverageRating = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/average-rating`);
    return response.data;
  } catch (error) {
    console.error('Error fetching average rating:', error);
    throw error;
  }
};

export const getRatingTrends = async (courseId, timeframe = 'month') => {
  try {
    const response = await apiService.get(`/courses/${courseId}/rating-trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating trends:', error);
    throw error;
  }
};

export const getTopRatedCourses = async (limit = 10) => {
  try {
    const response = await apiService.get(`/courses/top-rated?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated courses:', error);
    throw error;
  }
};

export const getRatingAnalytics = async (timeframe = 'month') => {
  try {
    const response = await apiService.get(`/ratings/analytics?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating analytics:', error);
    throw error;
  }
};

export const getRatingInsights = async (courseId) => {
  try {
    const response = await apiService.get(`/courses/${courseId}/rating-insights`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating insights:', error);
    throw error;
  }
};

export const reportRating = async (ratingId, reason) => {
  try {
    const response = await apiService.post(`/ratings/${ratingId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error reporting rating:', error);
    throw error;
  }
};

export const getRatingReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiService.get(`/ratings/reports?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating reports:', error);
    throw error;
  }
};

export const resolveRatingReport = async (reportId, resolution) => {
  try {
    const response = await apiService.put(`/ratings/reports/${reportId}/resolve`, { resolution });
    return response.data;
  } catch (error) {
    console.error('Error resolving rating report:', error);
    throw error;
  }
};
