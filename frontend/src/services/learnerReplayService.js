import apiService from './api';

// Get replays for enrolled learner
export const getLearnerReplays = async (params = {}) => {
  try {
    const response = await apiService.get('/learner/replays', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching learner replays:', error);
    throw error;
  }
};

// Get replay details
export const getReplayDetails = async (replayId) => {
  try {
    const response = await apiService.get(`/learner/replays/${replayId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching replay details:', error);
    throw error;
  }
};

// Get learner's enrolled courses for filter
export const getLearnerCourses = async () => {
  try {
    const response = await apiService.get('/learner/replays/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching learner courses:', error);
    throw error;
  }
};

// Stream/download replay
export const streamReplay = async (replayId) => {
  try {
    const response = await apiService.get(`/learner/replays/${replayId}/stream`);
    return response.data;
  } catch (error) {
    console.error('Error streaming replay:', error);
    throw error;
  }
};
