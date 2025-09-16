// Streak Tracking System
// Tracks daily learning activities to maintain learning streaks

const mongoose = require('mongoose');

// Activity Log Schema for tracking daily activities
const activityLogSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: ['course_progress', 'assignment_submit', 'live_class_attend', 'replay_watch', 'quiz_complete', 'forum_post'],
    required: true
  },
  activityData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  points: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Learner Streak Schema for maintaining streak data
const learnerStreakSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  streakStartDate: {
    type: Date,
    default: null
  },
  totalDaysActive: {
    type: Number,
    default: 0
  },
  streakHistory: [{
    startDate: Date,
    endDate: Date,
    duration: Number,
    reason: String // 'broken', 'maintained', 'new'
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
const LearnerStreak = mongoose.model('LearnerStreak', learnerStreakSchema);

// Streak calculation functions
const calculateStreak = async (learnerId) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get all activity logs for this learner
    const activities = await ActivityLog.find({ learnerId })
      .sort({ date: -1 })
      .limit(365); // Last year of activities
    
    if (activities.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        totalDaysActive: 0
      };
    }
    
    // Group activities by date
    const activitiesByDate = {};
    activities.forEach(activity => {
      const activityDate = new Date(activity.date);
      const dateKey = activityDate.toISOString().split('T')[0];
      
      if (!activitiesByDate[dateKey]) {
        activitiesByDate[dateKey] = [];
      }
      activitiesByDate[dateKey].push(activity);
    });
    
    // Calculate current streak
    let currentStreak = 0;
    let streakStartDate = null;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalDaysActive = Object.keys(activitiesByDate).length;
    
    const sortedDates = Object.keys(activitiesByDate).sort((a, b) => new Date(b) - new Date(a));
    
    // Calculate current streak (consecutive days from today backwards)
    let checkDate = new Date(startOfToday);
    let hasActivityToday = false;
    
    // Check if there's activity today
    const todayKey = checkDate.toISOString().split('T')[0];
    if (activitiesByDate[todayKey]) {
      hasActivityToday = true;
      currentStreak = 1;
      streakStartDate = checkDate;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If no activity today, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Count consecutive days backwards
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      
      if (activitiesByDate[dateKey]) {
        currentStreak++;
        if (!streakStartDate) {
          streakStartDate = new Date(checkDate);
        }
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    tempStreak = 0;
    let previousDate = null;
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      
      if (previousDate === null) {
        tempStreak = 1;
      } else {
        const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      previousDate = currentDate;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      currentStreak,
      longestStreak,
      lastActivityDate: activities[0]?.date || null,
      streakStartDate,
      totalDaysActive,
      hasActivityToday
    };
    
  } catch (error) {
    console.error('Error calculating streak:', error);
    throw error;
  }
};

// Update learner streak
const updateLearnerStreak = async (learnerId, activityType, activityData = {}) => {
  try {
    // Log the activity
    const activityLog = new ActivityLog({
      learnerId,
      activityType,
      activityData,
      points: getActivityPoints(activityType),
      date: new Date()
    });
    
    await activityLog.save();
    
    // Calculate new streak
    const streakData = await calculateStreak(learnerId);
    
    // Update or create learner streak record
    let learnerStreak = await LearnerStreak.findOne({ learnerId });
    
    if (!learnerStreak) {
      learnerStreak = new LearnerStreak({
        learnerId,
        ...streakData
      });
    } else {
      // Check if streak was broken
      const wasStreakBroken = learnerStreak.currentStreak > 0 && 
        streakData.currentStreak === 1 && 
        learnerStreak.lastActivityDate &&
        Math.floor((new Date() - new Date(learnerStreak.lastActivityDate)) / (1000 * 60 * 60 * 24)) > 1;
      
      if (wasStreakBroken) {
        // Add to streak history
        learnerStreak.streakHistory.push({
          startDate: learnerStreak.streakStartDate,
          endDate: learnerStreak.lastActivityDate,
          duration: learnerStreak.currentStreak,
          reason: 'broken'
        });
      }
      
      // Update streak data
      learnerStreak.currentStreak = streakData.currentStreak;
      learnerStreak.longestStreak = Math.max(learnerStreak.longestStreak, streakData.longestStreak);
      learnerStreak.lastActivityDate = streakData.lastActivityDate;
      learnerStreak.streakStartDate = streakData.streakStartDate;
      learnerStreak.totalDaysActive = streakData.totalDaysActive;
      learnerStreak.updatedAt = new Date();
    }
    
    await learnerStreak.save();
    
    return {
      success: true,
      streakData: {
        currentStreak: learnerStreak.currentStreak,
        longestStreak: learnerStreak.longestStreak,
        lastActivityDate: learnerStreak.lastActivityDate,
        streakStartDate: learnerStreak.streakStartDate,
        totalDaysActive: learnerStreak.totalDaysActive,
        hasActivityToday: streakData.hasActivityToday
      }
    };
    
  } catch (error) {
    console.error('Error updating learner streak:', error);
    throw error;
  }
};

// Get activity points based on type
const getActivityPoints = (activityType) => {
  const pointsMap = {
    'course_progress': 10,
    'assignment_submit': 15,
    'live_class_attend': 20,
    'replay_watch': 5,
    'quiz_complete': 8,
    'forum_post': 3
  };
  
  return pointsMap[activityType] || 5;
};

// Get learner streak data
const getLearnerStreak = async (learnerId) => {
  try {
    let learnerStreak = await LearnerStreak.findOne({ learnerId });
    
    if (!learnerStreak) {
      // Calculate streak from activity logs
      const streakData = await calculateStreak(learnerId);
      
      learnerStreak = new LearnerStreak({
        learnerId,
        ...streakData
      });
      
      await learnerStreak.save();
    }
    
    return {
      success: true,
      data: {
        currentStreak: learnerStreak.currentStreak,
        longestStreak: learnerStreak.longestStreak,
        lastActivityDate: learnerStreak.lastActivityDate,
        streakStartDate: learnerStreak.streakStartDate,
        totalDaysActive: learnerStreak.totalDaysActive,
        streakHistory: learnerStreak.streakHistory
      }
    };
    
  } catch (error) {
    console.error('Error getting learner streak:', error);
    throw error;
  }
};

// Get streak leaderboard
const getStreakLeaderboard = async (limit = 10) => {
  try {
    const leaderboard = await LearnerStreak.find()
      .populate('learnerId', 'name email avatar')
      .sort({ currentStreak: -1, longestStreak: -1 })
      .limit(limit);
    
    return {
      success: true,
      data: leaderboard.map(item => ({
        learnerId: item.learnerId._id,
        learnerName: item.learnerId.name,
        learnerEmail: item.learnerId.email,
        learnerAvatar: item.learnerId.avatar,
        currentStreak: item.currentStreak,
        longestStreak: item.longestStreak,
        totalDaysActive: item.totalDaysActive
      }))
    };
    
  } catch (error) {
    console.error('Error getting streak leaderboard:', error);
    throw error;
  }
};

// Daily streak maintenance (run this daily)
const maintainStreaks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Find learners who haven't been active in the last 2 days
    const inactiveLearners = await LearnerStreak.find({
      lastActivityDate: { $lt: yesterday },
      currentStreak: { $gt: 0 }
    });
    
    for (const learner of inactiveLearners) {
      // Break their streak
      learner.streakHistory.push({
        startDate: learner.streakStartDate,
        endDate: learner.lastActivityDate,
        duration: learner.currentStreak,
        reason: 'broken'
      });
      
      learner.currentStreak = 0;
      learner.streakStartDate = null;
      learner.updatedAt = new Date();
      
      await learner.save();
    }
    
    console.log(`Maintained streaks for ${inactiveLearners.length} learners`);
    
  } catch (error) {
    console.error('Error maintaining streaks:', error);
    throw error;
  }
};

module.exports = {
  ActivityLog,
  LearnerStreak,
  updateLearnerStreak,
  getLearnerStreak,
  getStreakLeaderboard,
  maintainStreaks,
  calculateStreak,
  getActivityPoints
};
