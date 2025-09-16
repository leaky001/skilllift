const express = require('express');
const router = express.Router();
const {
  calculateMentorshipScore,
  checkCertificateEligibility,
  generateAchievements,
  // REMOVED: autoAwardCertificate - certificates should not be auto-awarded
  checkMentorshipEligibility,
  trackLearningActivity,
  checkForNewAchievements
} = require('../services/progressTrackingService');
const { getLearnerStreak } = require('../services/streakTrackingService');

// Get learner progress overview
router.get('/progress/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;
    
    // Get real streak data
    const streakResult = await getLearnerStreak(learnerId);
    const streakData = streakResult.success ? streakResult.data : {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakStartDate: null,
      totalDaysActive: 0
    };
    
    // Mock learner data - in real app, fetch from database
    const learnerData = {
      id: learnerId,
      completedCourses: 3,
      totalCourses: 5,
      totalHours: 45,
      streak: streakData.currentStreak, // Use real streak data
      longestStreak: streakData.longestStreak,
      totalDaysActive: streakData.totalDaysActive,
      totalAssignments: 15,
      completedAssignments: 12,
      averageScore: 87,
      totalLiveClasses: 8,
      attendedLiveClasses: 6,
      totalReplays: 12,
      watchedReplays: 10,
      certificatesEarned: 2,
      lastActive: streakData.lastActivityDate ? new Date(streakData.lastActivityDate).toLocaleString() : 'Never',
      joinDate: '2023-12-10'
    };
    
    const mentorshipScore = calculateMentorshipScore(learnerData);
    const achievements = generateAchievements(learnerData);
    
    res.json({
      success: true,
      data: {
        ...learnerData,
        mentorshipScore,
        mentorshipEligible: mentorshipScore >= 75,
        achievements: achievements.filter(a => a.earned),
        level: mentorshipScore >= 75 ? 'Advanced' : mentorshipScore >= 50 ? 'Intermediate' : 'Beginner',
        levelProgress: Math.min(100, (mentorshipScore / 75) * 100)
      }
    });
  } catch (error) {
    console.error('Error fetching learner progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learner progress',
      error: error.message
    });
  }
});

// Track learning activity
router.post('/activity', async (req, res) => {
  try {
    const { learnerId, activity } = req.body;
    
    const result = await trackLearningActivity(learnerId, activity);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track activity',
      error: error.message
    });
  }
});

// Check certificate eligibility for a course
router.get('/certificate-eligibility/:learnerId/:courseId', async (req, res) => {
  try {
    const { learnerId, courseId } = req.params;
    
    // Mock course data - in real app, fetch from database
    const courseData = {
      completionRate: 85,
      avgAssignmentScore: 88,
      liveClassAttendance: 75,
      replayWatching: 80,
      title: 'Web Development Fundamentals',
      tutorName: 'Dr. Mistura Rokibat'
    };
    
    const eligibility = checkCertificateEligibility(courseData);
    
    res.json({
      success: true,
      data: {
        eligible: eligibility.eligible,
        requirements: eligibility.requirements,
        currentProgress: eligibility.currentProgress,
        courseId,
        learnerId
      }
    });
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check certificate eligibility',
      error: error.message
    });
  }
});

// REMOVED: Auto-award certificate route
// Certificates should NOT be automatically awarded
// They must go through proper tutor generation → admin approval → learner payment workflow

// Check mentorship eligibility
router.get('/mentorship-eligibility/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;
    
    const eligibility = await checkMentorshipEligibility(learnerId);
    
    res.json({
      success: true,
      data: eligibility
    });
  } catch (error) {
    console.error('Error checking mentorship eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check mentorship eligibility',
      error: error.message
    });
  }
});

// Get learner achievements
router.get('/achievements/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;
    
    // Mock achievements data
    const achievements = [
      {
        id: 1,
        title: 'Course Completion Master',
        description: 'Completed 3 courses with 85%+ average score',
        icon: 'FaGraduationCap',
        type: 'course',
        points: 100,
        earned: true,
        date: '2024-02-01',
        rarity: 'common'
      },
      {
        id: 2,
        title: 'Live Class Enthusiast',
        description: 'Attended 5+ live classes',
        icon: 'FaVideo',
        type: 'engagement',
        points: 75,
        earned: true,
        date: '2024-01-25',
        rarity: 'common'
      },
      {
        id: 3,
        title: 'Assignment Ace',
        description: 'Scored 90%+ on 5 assignments',
        icon: 'FaFileAlt',
        type: 'performance',
        points: 150,
        earned: true,
        date: '2024-01-20',
        rarity: 'rare'
      },
      {
        id: 4,
        title: 'Streak Legend',
        description: 'Maintained 10+ day learning streak',
        icon: 'FaFire',
        type: 'consistency',
        points: 200,
        earned: true,
        date: '2024-02-05',
        rarity: 'epic'
      },
      {
        id: 5,
        title: 'Mentorship Qualifier',
        description: 'Achieved 75+ mentorship score',
        icon: 'FaUserTie',
        type: 'mentorship',
        points: 300,
        earned: false,
        date: null,
        rarity: 'legendary',
        progress: 78,
        requirement: 75
      }
    ];
    
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
});

// Get learner certificates
router.get('/certificates/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;
    
    // Mock certificates data
    const certificates = [
      {
        id: 1,
        courseTitle: 'Web Development Fundamentals',
        tutorName: 'Dr. Mistura Rokibat',
        completionDate: '2024-01-15',
        score: 92,
        status: 'earned',
        downloadUrl: '/certificates/web-dev-fundamentals.pdf',
        shareUrl: 'https://skilllift.com/certificates/ridwan-idris/web-dev-fundamentals'
      },
      {
        id: 2,
        courseTitle: 'React.js Complete Guide',
        tutorName: 'Muiz Abass',
        completionDate: '2024-01-28',
        score: 88,
        status: 'earned',
        downloadUrl: '/certificates/react-complete-guide.pdf',
        shareUrl: 'https://skilllift.com/certificates/ridwan-idris/react-complete-guide'
      },
      {
        id: 3,
        courseTitle: 'Node.js Backend Development',
        tutorName: 'Rodiyat Kabir',
        completionDate: null,
        score: null,
        status: 'in_progress',
        progress: 65,
        downloadUrl: null,
        shareUrl: null
      }
    ];
    
    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
});

// Request mentorship
router.post('/mentorship/request', async (req, res) => {
  try {
    const { learnerId, mentorId, message, preferredTime } = req.body;
    
    // Check if learner is eligible
    const eligibility = await checkMentorshipEligibility(learnerId);
    
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for mentorship yet. Keep learning to improve your score!',
        data: eligibility
      });
    }
    
    // Create mentorship request
    const mentorshipRequest = {
      learnerId,
      mentorId,
      message,
      preferredTime,
      status: 'pending',
      requestedAt: new Date(),
      eligibilityScore: eligibility.score
    };
    
    // Save to database
    // await MentorshipRequest.create(mentorshipRequest);
    
    // Notify mentor
    // await sendNotification(mentorId, 'mentorship_request', mentorshipRequest);
    
    res.json({
      success: true,
      data: mentorshipRequest,
      message: 'Mentorship request sent successfully'
    });
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request mentorship',
      error: error.message
    });
  }
});

module.exports = router;
