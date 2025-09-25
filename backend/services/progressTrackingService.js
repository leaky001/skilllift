// Progress Tracking and Achievement System
// This service handles automatic certificate generation and mentorship eligibility

const calculateMentorshipScore = (learnerData) => {
  let score = 0;
  
  // Course completion (40% of score)
  const courseCompletionRate = (learnerData.completedCourses / learnerData.totalCourses) * 100;
  score += (courseCompletionRate * 0.4);
  
  // Assignment performance (25% of score)
  const avgAssignmentScore = learnerData.averageScore;
  score += (avgAssignmentScore * 0.25);
  
  // Consistency (20% of score)
  const streakBonus = Math.min(learnerData.streak * 2, 40); // Max 40 points for streak
  score += streakBonus;
  
  // Engagement (15% of score) - Live class attendance removed
  const replayWatching = (learnerData.watchedReplays / learnerData.totalReplays) * 100;
  const engagementScore = replayWatching; // Only replay watching now
  score += (engagementScore * 0.15);
  
  return Math.round(score);
};

const checkCertificateEligibility = (courseData) => {
  const requirements = {
    minCompletionRate: 80, // Must complete 80% of course content
    minAssignmentScore: 70, // Must average 70% on assignments
    // minLiveClassAttendance removed - Live class functionality deleted
    minReplayWatching: 50 // Must watch 50% of replays
  };
  
  return {
    eligible: courseData.completionRate >= requirements.minCompletionRate &&
              courseData.avgAssignmentScore >= requirements.minAssignmentScore &&
              // liveClassAttendance removed - Live class functionality deleted
              courseData.replayWatching >= requirements.minReplayWatching,
    requirements,
    currentProgress: {
      completionRate: courseData.completionRate,
      avgAssignmentScore: courseData.avgAssignmentScore,
      // liveClassAttendance removed - Live class functionality deleted
      replayWatching: courseData.replayWatching
    }
  };
};

const generateAchievements = (learnerData) => {
  const achievements = [];
  
  // Course completion achievements
  if (learnerData.completedCourses >= 1) {
    achievements.push({
      id: 'first_course',
      title: 'First Steps',
      description: 'Completed your first course',
      icon: 'FaGraduationCap',
      type: 'milestone',
      points: 50,
      rarity: 'common'
    });
  }
  
  if (learnerData.completedCourses >= 3) {
    achievements.push({
      id: 'course_master',
      title: 'Course Master',
      description: 'Completed 3 courses',
      icon: 'FaTrophy',
      type: 'milestone',
      points: 150,
      rarity: 'rare'
    });
  }
  
  // Performance achievements
  if (learnerData.averageScore >= 90) {
    achievements.push({
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Achieved 90%+ average score',
      icon: 'FaStar',
      type: 'performance',
      points: 200,
      rarity: 'epic'
    });
  }
  
  // Consistency achievements
  if (learnerData.streak >= 7) {
    achievements.push({
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Maintained 7-day learning streak',
      icon: 'FaFire',
      type: 'consistency',
      points: 100,
      rarity: 'rare'
    });
  }
  
  if (learnerData.streak >= 30) {
    achievements.push({
      id: 'month_master',
      title: 'Month Master',
      description: 'Maintained 30-day learning streak',
      icon: 'FaFire',
      type: 'consistency',
      points: 500,
      rarity: 'legendary'
    });
  }
  
  // Engagement achievements
  if (learnerData.attendedLiveClasses >= 5) {
    achievements.push({
      id: 'live_enthusiast',
      title: 'Live Class Enthusiast',
      description: 'Attended 5+ live classes',
      icon: 'FaVideo',
      type: 'engagement',
      points: 75,
      rarity: 'common'
    });
  }
  
  // Mentorship eligibility
  const mentorshipScore = calculateMentorshipScore(learnerData);
  if (mentorshipScore >= 75) {
    achievements.push({
      id: 'mentorship_ready',
      title: 'Mentorship Ready',
      description: 'Qualified for mentorship program',
      icon: 'FaUserTie',
      type: 'mentorship',
      points: 300,
      rarity: 'legendary'
    });
  }
  
  return achievements;
};

// REMOVED: Auto-award certificate function
// Certificates should NOT be automatically awarded
// They must go through proper tutor generation → admin approval → learner payment workflow

const checkMentorshipEligibility = async (learnerId) => {
  try {
    // Get learner data
    // const learner = await Learner.findById(learnerId);
    // const learnerData = await getLearnerProgressData(learnerId);
    
    const mentorshipScore = calculateMentorshipScore(learnerData);
    const isEligible = mentorshipScore >= 75;
    
    if (isEligible) {
      // Award mentorship achievement
      const achievement = {
        learnerId,
        title: 'Mentorship Qualifier',
        description: `Achieved mentorship score of ${mentorshipScore}`,
        type: 'mentorship',
        points: 300,
        rarity: 'legendary',
        earnedAt: new Date()
      };
      
      // await Achievement.create(achievement);
      // await sendNotification(learnerId, 'mentorship_unlocked', achievement);
      
      console.log('Mentorship eligibility unlocked:', achievement);
    }
    
    return {
      eligible: isEligible,
      score: mentorshipScore,
      requirements: {
        minScore: 75,
        currentScore: mentorshipScore,
        remaining: Math.max(0, 75 - mentorshipScore)
      }
    };
  } catch (error) {
    console.error('Error checking mentorship eligibility:', error);
    throw error;
  }
};

const trackLearningActivity = async (learnerId, activity) => {
  try {
    const activityLog = {
      learnerId,
      type: activity.type, // 'course_complete', 'assignment_submit', 'live_class_attend', 'replay_watch'
      data: activity.data,
      timestamp: new Date(),
      points: activity.points || 0
    };
    
    // Log activity
    // await ActivityLog.create(activityLog);
    
    // Update learner progress
    // await updateLearnerProgress(learnerId, activity);
    
    // Check for new achievements
    const achievements = await checkForNewAchievements(learnerId);
    
    // REMOVED: Auto-certificate awarding
    // Certificates must be manually generated by tutors and approved by admin
    // if (activity.type === 'course_complete') {
    //   await autoAwardCertificate(learnerId, activity.courseId, activity.courseData);
    // }
    
    // Check mentorship eligibility
    await checkMentorshipEligibility(learnerId);
    
    return {
      activityLogged: true,
      newAchievements: achievements,
      pointsEarned: activity.points || 0
    };
  } catch (error) {
    console.error('Error tracking learning activity:', error);
    throw error;
  }
};

const checkForNewAchievements = async (learnerId) => {
  try {
    // Get current learner data
    // const learnerData = await getLearnerProgressData(learnerId);
    
    // Generate all possible achievements
    const allAchievements = generateAchievements(learnerData);
    
    // Get already earned achievements
    // const earnedAchievements = await Achievement.find({ learnerId, earned: true });
    // const earnedIds = earnedAchievements.map(a => a.achievementId);
    
    // Find new achievements
    const newAchievements = allAchievements.filter(a => !earnedIds.includes(a.id));
    
    // Award new achievements
    for (const achievement of newAchievements) {
      // await Achievement.create({
      //   learnerId,
      //   achievementId: achievement.id,
      //   title: achievement.title,
      //   description: achievement.description,
      //   type: achievement.type,
      //   points: achievement.points,
      //   rarity: achievement.rarity,
      //   earnedAt: new Date(),
      //   earned: true
      // });
      
      // Send notification
      // await sendNotification(learnerId, 'achievement_earned', achievement);
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking for new achievements:', error);
    throw error;
  }
};

module.exports = {
  calculateMentorshipScore,
  checkCertificateEligibility,
  generateAchievements,
  // REMOVED: autoAwardCertificate - certificates should not be auto-awarded
  checkMentorshipEligibility,
  trackLearningActivity,
  checkForNewAchievements
};
