import React from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaTrophy, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useStreakTracking } from '../hooks/useStreakTracking';

const StreakTracker = ({ showDetails = false, className = '' }) => {
  const { streakData, loading, error } = useStreakTracking();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 rounded-lg p-4 border border-red-200 ${className}`}>
        <p className="text-red-600 text-sm">Failed to load streak data</p>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
        <p className="text-gray-600 text-sm">No streak data available</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, lastActivityDate, totalDaysActive } = streakData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            currentStreak > 0 
              ? 'bg-gradient-to-br from-orange-400 to-red-500' 
              : 'bg-gray-200'
          }`}>
            <FaFire className={`text-lg ${
              currentStreak > 0 ? 'text-white' : 'text-gray-500'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {currentStreak} day{currentStreak !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-600">Learning Streak</p>
          </div>
        </div>
        
        {currentStreak > 0 && (
          <div className="text-right">
            <div className="flex items-center text-green-600 text-sm">
              <FaTrophy className="w-4 h-4 mr-1" />
              <span className="font-medium">Active!</span>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{longestStreak}</div>
              <div className="text-xs text-gray-600">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalDaysActive}</div>
              <div className="text-xs text-gray-600">Total Days</div>
            </div>
          </div>
          
          {lastActivityDate && (
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center text-gray-600 text-sm">
                <FaClock className="w-3 h-3 mr-1" />
                <span>Last active: {new Date(lastActivityDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Streak motivation message */}
      {currentStreak === 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm text-center">
            Start your learning streak today! 🚀
          </p>
        </div>
      )}
      
      {currentStreak > 0 && currentStreak < 7 && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <p className="text-green-800 text-sm text-center">
            Great start! Keep it up for a week! 💪
          </p>
        </div>
      )}
      
      {currentStreak >= 7 && currentStreak < 30 && (
        <div className="mt-3 p-2 bg-purple-50 rounded-lg">
          <p className="text-purple-800 text-sm text-center">
            Amazing! You're building a strong habit! 🔥
          </p>
        </div>
      )}
      
      {currentStreak >= 30 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 text-sm text-center">
            Incredible! You're a learning champion! 🏆
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Streak leaderboard component
export const StreakLeaderboard = ({ limit = 10, className = '' }) => {
  const { leaderboard, loading, error } = useStreakTracking();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 rounded-lg p-4 border border-red-200 ${className}`}>
        <p className="text-red-600 text-sm">Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <FaTrophy className="w-5 h-5 mr-2 text-yellow-500" />
        Streak Leaderboard
      </h3>
      
      <div className="space-y-3">
        {leaderboard.map((learner, index) => (
          <motion.div
            key={learner.learnerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
              index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200' :
              'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-500 text-white' :
                'bg-gray-300 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{learner.learnerName}</p>
                <p className="text-xs text-gray-600">{learner.totalDaysActive} total days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-orange-600">
                <FaFire className="w-4 h-4 mr-1" />
                <span className="font-bold">{learner.currentStreak}</span>
              </div>
              <p className="text-xs text-gray-600">days</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreakTracker;
