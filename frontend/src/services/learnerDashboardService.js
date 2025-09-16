import api from './api';

// Learner dashboard service for API calls
export const learnerDashboardService = {
  // Get upcoming live sessions
  async getUpcomingSessions(limit = 5) {
    try {
      const response = await api.get(`/learner/dashboard/upcoming-sessions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  },

  // Get recent announcements
  async getRecentAnnouncements(limit = 5, unreadOnly = false) {
    try {
      const response = await api.get(`/learner/dashboard/announcements?limit=${limit}&unreadOnly=${unreadOnly}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  // Mark announcement as read
  async markAnnouncementAsRead(announcementId) {
    try {
      const response = await api.put(`/learner/dashboard/announcements/${announcementId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  },

  // Get dashboard summary (all data in one call)
  async getDashboardSummary() {
    try {
      const response = await api.get('/learner/dashboard/dashboard-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }
};

export default learnerDashboardService;
