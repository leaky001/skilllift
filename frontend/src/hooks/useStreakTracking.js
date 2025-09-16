import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import streakService from '../services/streakService';

// Custom hook for streak tracking
export const useStreakTracking = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load streak data
  const loadStreakData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await streakService.getMyStreak();
      if (response.success) {
        setStreakData(response.data);
      }
    } catch (err) {
      console.error('Error loading streak data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Track activity
  const trackActivity = useCallback(async (activityType, activityData = {}) => {
    if (!user?.id) return;
    
    try {
      const response = await streakService.trackActivity(activityType, activityData);
      if (response.success) {
        // Update local streak data
        setStreakData(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Error tracking activity:', err);
      throw err;
    }
  }, [user?.id]);

  // Convenience methods for common activities
  const trackCourseProgress = useCallback(async (courseId, progressPercentage) => {
    return await trackActivity('course_progress', {
      courseId,
      progressPercentage,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  const trackAssignmentSubmission = useCallback(async (assignmentId, score) => {
    return await trackActivity('assignment_submit', {
      assignmentId,
      score,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  const trackLiveClassAttendance = useCallback(async (classId, duration) => {
    return await trackActivity('live_class_attend', {
      classId,
      duration,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  const trackReplayWatch = useCallback(async (replayId, watchDuration) => {
    return await trackActivity('replay_watch', {
      replayId,
      watchDuration,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  const trackQuizCompletion = useCallback(async (quizId, score) => {
    return await trackActivity('quiz_complete', {
      quizId,
      score,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  const trackForumPost = useCallback(async (postId, postType) => {
    return await trackActivity('forum_post', {
      postId,
      postType,
      timestamp: new Date().toISOString()
    });
  }, [trackActivity]);

  // Load streak data on mount
  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  return {
    streakData,
    loading,
    error,
    loadStreakData,
    trackActivity,
    trackCourseProgress,
    trackAssignmentSubmission,
    trackLiveClassAttendance,
    trackReplayWatch,
    trackQuizCompletion,
    trackForumPost
  };
};

// Hook for streak leaderboard
export const useStreakLeaderboard = (limit = 10) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await streakService.getStreakLeaderboard(limit);
      if (response.success) {
        setLeaderboard(response.data);
      }
    } catch (err) {
      console.error('Error loading streak leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    loadLeaderboard
  };
};

export default useStreakTracking;
