import api from './api';

const ratingService = {
  // Get course ratings for enrollment page
  getCourseRatingsForEnrollment: async (courseId, limit = 5) => {
    try {
      const response = await api.get(`/ratings/course/${courseId}/enrollment?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course ratings for enrollment:', error);
      throw error;
    }
  },

  // Get course ratings with pagination
  getCourseRatings: async (courseId, page = 1, limit = 10, sort = 'newest') => {
    try {
      const response = await api.get(`/ratings/course/${courseId}?page=${page}&limit=${limit}&sort=${sort}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course ratings:', error);
      throw error;
    }
  },

  // Get course rating statistics
  getCourseRatingStats: async (courseId) => {
    try {
      const response = await api.get(`/ratings/course/${courseId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course rating stats:', error);
      throw error;
    }
  },

  // Create a new rating
  createRating: async (ratingData) => {
    try {
      const response = await api.post('/ratings', ratingData);
      return response.data;
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  },

  // Update a rating
  updateRating: async (ratingId, ratingData) => {
    try {
      const response = await api.put(`/ratings/${ratingId}`, ratingData);
      return response.data;
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  },

  // Delete a rating
  deleteRating: async (ratingId) => {
    try {
      const response = await api.delete(`/ratings/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  },

  // Get user's own ratings
  getMyRatings: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/ratings/user?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my ratings:', error);
      throw error;
    }
  },

  // Get tutor's course ratings
  getTutorCourseRatings: async (page = 1, limit = 10, sort = 'newest') => {
    try {
      const response = await api.get(`/ratings/tutor/my-courses?page=${page}&limit=${limit}&sort=${sort}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor course ratings:', error);
      throw error;
    }
  },

  // Get tutor's rating analytics
  getTutorRatingAnalytics: async (timeRange = '30d') => {
    try {
      const response = await api.get(`/ratings/tutor/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor rating analytics:', error);
      throw error;
    }
  },

  // Like a rating
  likeRating: async (ratingId) => {
    try {
      const response = await api.post(`/ratings/${ratingId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking rating:', error);
      throw error;
    }
  },

  // Unlike a rating
  unlikeRating: async (ratingId) => {
    try {
      const response = await api.delete(`/ratings/${ratingId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error unliking rating:', error);
      throw error;
    }
  },

  // Report a rating
  reportRating: async (ratingId, reason) => {
    try {
      const response = await api.post(`/ratings/${ratingId}/report`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error reporting rating:', error);
      throw error;
    }
  },

  // Admin functions
  getAllRatings: async (page = 1, limit = 20, status = 'all') => {
    try {
      const params = { page, limit };
      if (status !== 'all') {
        params.status = status;
      }
      const response = await api.get('/ratings/admin/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all ratings:', error);
      throw error;
    }
  },

  getPendingRatings: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/ratings/admin/pending?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending ratings:', error);
      throw error;
    }
  },

  approveRating: async (ratingId) => {
    try {
      const response = await api.put(`/ratings/admin/${ratingId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving rating:', error);
      throw error;
    }
  },

  rejectRating: async (ratingId, reason) => {
    try {
      const response = await api.put(`/ratings/admin/${ratingId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting rating:', error);
      throw error;
    }
  },

  getRatingStatistics: async () => {
    try {
      const response = await api.get('/ratings/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching rating statistics:', error);
      throw error;
    }
  },

  getTutors: async () => {
    try {
      const response = await api.get('/messages/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw error;
    }
  }
};

// Named exports for admin functions
export const getAllRatings = ratingService.getAllRatings;
export const getPendingRatings = ratingService.getPendingRatings;
export const approveRating = ratingService.approveRating;
export const rejectRating = ratingService.rejectRating;
export const getRatingStatistics = ratingService.getRatingStatistics;
export const getTutors = ratingService.getTutors;

export default ratingService;