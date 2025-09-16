import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getLearnerProgress } from '../services/progressTrackingService';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { 
  FaTrophy, 
  FaMedal, 
  FaCertificate, 
  FaUserTie, 
  FaChartLine, 
  FaFire, 
  FaStar, 
  FaClock, 
  FaBookOpen, 
  FaVideo, 
  FaFileAlt, 
  FaGraduationCap,
  FaAward,
  FaRocket,
  FaBullseye,
  FaCheckCircle,
  FaTimes,
  FaDownload,
  FaShare,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaCalendarAlt,
  FaUsers,
  FaLightbulb,
  FaHandshake,
  FaGift,
  FaBell
} from 'react-icons/fa';

const LearnerProgressTracker = () => {
  const { user } = useAuth();
  const { streakData } = useStreakTracking();
  const [learnerData, setLearnerData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [mentorshipEligibility, setMentorshipEligibility] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load real learner progress data
  useEffect(() => {
    const loadLearnerData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load progress data from API
        const response = await getLearnerProgress(user.id);
        if (response.success) {
          const data = response.data;
          setLearnerData(data);
          setAchievements(data.achievements || []);
          setMentorshipEligibility(data.mentorshipEligible || false);
          
          // Load certificates from context (already integrated)
          // Certificates are handled by CertificateContext
        } else {
          console.error('Failed to load learner progress:', response.message);
          // Fallback to empty data
          setLearnerData({
            id: user.id,
            name: user.name || 'Learner',
            email: user.email || '',
            totalCourses: 0,
            completedCourses: 0,
            totalHours: 0,
            streak: streakData?.currentStreak || 0,
            totalAssignments: 0,
            completedAssignments: 0,
            averageScore: 0,
            totalLiveClasses: 0,
            attendedLiveClasses: 0,
            totalReplays: 0,
            watchedReplays: 0,
            certificatesEarned: 0,
            mentorshipScore: 0,
            lastActive: 'Never',
            joinDate: new Date().toISOString().split('T')[0],
            currentLevel: 'Beginner',
            nextLevel: 'Intermediate',
            levelProgress: 0
          });
        }
      } catch (error) {
        console.error('Error loading learner progress:', error);
        // Fallback to empty data
        setLearnerData({
          id: user?.id,
          name: user?.name || 'Learner',
          email: user?.email || '',
          totalCourses: 0,
          completedCourses: 0,
          totalHours: 0,
          streak: streakData?.currentStreak || 0,
          totalAssignments: 0,
          completedAssignments: 0,
          averageScore: 0,
          totalLiveClasses: 0,
          attendedLiveClasses: 0,
          totalReplays: 0,
          watchedReplays: 0,
          certificatesEarned: 0,
          mentorshipScore: 0,
          lastActive: 'Never',
          joinDate: new Date().toISOString().split('T')[0],
          currentLevel: 'Beginner',
          nextLevel: 'Intermediate',
          levelProgress: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadLearnerData();
  }, [user?.id, streakData?.currentStreak]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-200';
      case 'rare': return 'border-blue-200';
      case 'epic': return 'border-purple-200';
      case 'legendary': return 'border-yellow-200';
      default: return 'border-gray-200';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Advanced': return 'text-purple-600 bg-purple-100';
      case 'Expert': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!learnerData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Progress Data</h3>
            <p className="text-gray-600">Start learning to see your progress here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Progress</h1>
          <p className="text-slate-600">Track your learning journey and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Courses Completed</p>
                <p className="text-2xl font-bold text-slate-900">{learnerData.completedCourses}</p>
                <p className="text-xs text-slate-500">of {learnerData.totalCourses} total</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Learning Streak</p>
                <p className="text-2xl font-bold text-slate-900">{learnerData.streak} days</p>
                <p className="text-xs text-slate-500">Keep it up!</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                <FaFire className="text-white text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Certificates</p>
                <p className="text-2xl font-bold text-slate-900">{learnerData.certificatesEarned}</p>
                <p className="text-xs text-slate-500">Earned</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                <FaCertificate className="text-white text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Level</p>
                <p className="text-2xl font-bold text-slate-900">{learnerData.currentLevel}</p>
                <p className="text-xs text-slate-500">{learnerData.levelProgress}% progress</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                <FaRocket className="text-white text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Learning Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-primary-600" />
              Learning Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Learning Hours</span>
                <span className="font-semibold text-slate-900">{learnerData.totalHours}h</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Average Score</span>
                <span className="font-semibold text-slate-900">{learnerData.averageScore}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Assignments Completed</span>
                <span className="font-semibold text-slate-900">
                  {learnerData.completedAssignments}/{learnerData.totalAssignments}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Live Classes Attended</span>
                <span className="font-semibold text-slate-900">
                  {learnerData.attendedLiveClasses}/{learnerData.totalLiveClasses}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Replays Watched</span>
                <span className="font-semibold text-slate-900">
                  {learnerData.watchedReplays}/{learnerData.totalReplays}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Mentorship Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FaUserTie className="mr-2 text-secondary-600" />
              Mentorship Status
            </h3>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {learnerData.mentorshipScore}/100
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(learnerData.currentLevel)}`}>
                {learnerData.currentLevel} Level
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Mentorship Progress</span>
                <span>{learnerData.mentorshipScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-secondary-500 to-secondary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${learnerData.mentorshipScore}%` }}
                ></div>
              </div>
            </div>
            
            {mentorshipEligibility ? (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <FaCheckCircle className="text-green-600 text-2xl mx-auto mb-2" />
                <p className="text-green-800 font-medium">Mentorship Eligible!</p>
                <p className="text-green-600 text-sm">You can now apply for mentorship programs</p>
              </div>
            ) : (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <FaBullseye className="text-blue-600 text-2xl mx-auto mb-2" />
                <p className="text-blue-800 font-medium">Keep Learning!</p>
                <p className="text-blue-600 text-sm">
                  Complete more courses to reach 75+ mentorship score
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FaTrophy className="mr-2 text-accent-600" />
              Achievements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${getRarityBorder(achievement.rarity)} ${
                    achievement.earned ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                      {achievement.icon && <achievement.icon className="text-lg" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                      <p className="text-sm text-slate-600">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {achievement.points} pts
                        </span>
                      </div>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-slate-500 mt-1">
                          Earned: {formatDate(achievement.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FaClock className="mr-2 text-primary-600" />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <FaBookOpen className="text-primary-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Joined SkillLift</p>
                <p className="text-xs text-slate-600">{formatDate(learnerData.joinDate)}</p>
              </div>
            </div>
            
            {learnerData.lastActive !== 'Never' && (
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <FaFire className="text-accent-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Last Active</p>
                  <p className="text-xs text-slate-600">{learnerData.lastActive}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearnerProgressTracker;