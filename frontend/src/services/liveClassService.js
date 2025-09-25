import apiService from './api';

// Live Class Service
export const liveClassService = {
  // Create a new live class
  createLiveClass: async (liveClassData) => {
    try {
      const response = await apiService.post('/live-classes', liveClassData);
      return response.data;
    } catch (error) {
      console.error('Error creating live class:', error);
      throw error;
    }
  },

  // Start a live class
  startLiveClass: async (liveClassId) => {
    try {
      const response = await apiService.post(`/live-classes/${liveClassId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting live class:', error);
      throw error;
    }
  },

  // Join a live class (for tutors)
  joinLiveClassAsTutor: async (liveClassId) => {
    try {
      const response = await apiService.post(`/live-classes/${liveClassId}/join-tutor`);
      return response.data;
    } catch (error) {
      console.error('Error joining live class as tutor:', error);
      throw error;
    }
  },

  // Join a live class
  joinLiveClass: async (liveClassId) => {
    try {
      const response = await apiService.post(`/live-classes/${liveClassId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining live class:', error);
      throw error;
    }
  },

  // End a live class
  endLiveClass: async (liveClassId) => {
    try {
      const response = await apiService.post(`/live-classes/${liveClassId}/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending live class:', error);
      throw error;
    }
  },

  // Get live class details
  getLiveClass: async (liveClassId) => {
    try {
      const response = await apiService.get(`/live-classes/${liveClassId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live class:', error);
      throw error;
    }
  },

  // Get live classes for a course
  getCourseLiveClasses: async (courseId) => {
    try {
      const response = await apiService.get(`/courses/${courseId}/live-classes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course live classes:', error);
      throw error;
    }
  },

  // Get all live classes for enrolled courses (learner)
  getLiveClasses: async () => {
    try {
      const response = await apiService.get('/live-classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching live classes:', error);
      throw error;
    }
  },

  // Send chat message
  sendChatMessage: async (liveClassId, message) => {
    try {
      const response = await apiService.post(`/live-classes/${liveClassId}/chat`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (liveClassId) => {
    try {
      const response = await apiService.get(`/live-classes/${liveClassId}/chat`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }
};

export default liveClassService;
