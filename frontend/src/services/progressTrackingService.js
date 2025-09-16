// Progress Tracking Service for Frontend
// Handles API calls for learner progress, achievements, and mentorship

import apiService from './api';

export const getLearnerProgress = async (learnerId) => {
  try {
    const response = await apiService.get(`/progress-tracking/progress/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learner progress:', error);
    throw error;
  }
};

export const trackActivity = async (activityData) => {
  try {
    const response = await apiService.post('/progress-tracking/activity', activityData);
    return response.data;
  } catch (error) {
    console.error('Error tracking activity:', error);
    throw error;
  }
};

export const checkCertificateEligibility = async (learnerId, courseId) => {
  try {
    const response = await apiService.get(`/progress-tracking/certificate-eligibility/${learnerId}/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    throw error;
  }
};

export const getLearnerAchievements = async (learnerId) => {
  try {
    const response = await apiService.get(`/progress-tracking/achievements/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

export const getLearnerCertificates = async (learnerId) => {
  try {
    const response = await apiService.get(`/progress-tracking/certificates/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

export const checkMentorshipEligibility = async (learnerId) => {
  try {
    const response = await apiService.get(`/progress-tracking/mentorship-eligibility/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking mentorship eligibility:', error);
    throw error;
  }
};

export const requestMentorship = async (mentorshipData) => {
  try {
    const response = await apiService.post('/progress-tracking/mentorship/request', mentorshipData);
    return response.data;
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    throw error;
  }
};

// Activity tracking helpers
export const trackCourseCompletion = async (learnerId, courseId, courseData) => {
  return await trackActivity({
    learnerId,
    activity: {
      type: 'course_complete',
      courseId,
      courseData,
      points: 50
    }
  });
};

export const trackAssignmentSubmission = async (learnerId, assignmentId, score) => {
  return await trackActivity({
    learnerId,
    activity: {
      type: 'assignment_submit',
      assignmentId,
      score,
      points: Math.round(score / 10) // 1 point per 10% score
    }
  });
};

export const trackLiveClassAttendance = async (learnerId, classId) => {
  return await trackActivity({
    learnerId,
    activity: {
      type: 'live_class_attend',
      classId,
      points: 10
    }
  });
};

export const trackReplayWatching = async (learnerId, replayId, watchDuration) => {
  return await trackActivity({
    learnerId,
    activity: {
      type: 'replay_watch',
      replayId,
      watchDuration,
      points: Math.min(5, Math.round(watchDuration / 60)) // 1 point per minute, max 5
    }
  });
};

export const trackDailyLogin = async (learnerId) => {
  return await trackActivity({
    learnerId,
    activity: {
      type: 'daily_login',
      points: 5
    }
  });
};

export default {
  getLearnerProgress,
  trackActivity,
  checkCertificateEligibility,
  getLearnerAchievements,
  getLearnerCertificates,
  checkMentorshipEligibility,
  requestMentorship,
  trackCourseCompletion,
  trackAssignmentSubmission,
  trackLiveClassAttendance,
  trackReplayWatching,
  trackDailyLogin
};
