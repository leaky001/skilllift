import api from './api';

// Streak tracking service for API calls
export const streakService = {
  // Track learning activity
  async trackActivity(activityType, activityData = {}) {
    try {
      const response = await api.post('/streaks/track-activity', {
        activityType,
        activityData
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  },

  // Get learner streak data
  async getLearnerStreak(learnerId) {
    try {
      const response = await api.get(`/streaks/${learnerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching learner streak:', error);
      throw error;
    }
  },

  // Get current user's streak
  async getMyStreak() {
    try {
      const response = await api.get('/streaks/my-streak');
      return response.data;
    } catch (error) {
      console.error('Error fetching my streak:', error);
      throw error;
    }
  },

  // Get streak leaderboard
  async getStreakLeaderboard(limit = 10) {
    try {
      const response = await api.get(`/streaks/leaderboard?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streak leaderboard:', error);
      throw error;
    }
  },

  // Get activity points
  async getActivityPoints() {
    try {
      const response = await api.get('/streaks/activity-points');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity points:', error);
      throw error;
    }
  }
};

// Activity tracking helpers
export const trackCourseProgress = async (courseId, progressPercentage) => {
  return await streakService.trackActivity('course_progress', {
    courseId,
    progressPercentage,
    timestamp: new Date().toISOString()
  });
};

export const trackAssignmentSubmission = async (assignmentId, score) => {
  return await streakService.trackActivity('assignment_submit', {
    assignmentId,
    score,
    timestamp: new Date().toISOString()
  });
};

export const trackLiveClassAttendance = async (classId, duration) => {
  return await streakService.trackActivity('live_class_attend', {
    classId,
    duration,
    timestamp: new Date().toISOString()
  });
};

export const trackReplayWatch = async (replayId, watchDuration) => {
  return await streakService.trackActivity('replay_watch', {
    replayId,
    watchDuration,
    timestamp: new Date().toISOString()
  });
};

export const trackQuizCompletion = async (quizId, score) => {
  return await streakService.trackActivity('quiz_complete', {
    quizId,
    score,
    timestamp: new Date().toISOString()
  });
};

export const trackForumPost = async (postId, postType) => {
  return await streakService.trackActivity('forum_post', {
    postId,
    postType,
    timestamp: new Date().toISOString()
  });
};

export default streakService;
