import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  UserIcon, 
  ClockIcon, 
  ChartBarIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const TutorRatingDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('newest');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadRatingData();
  }, [sortBy, timeRange]);

  const loadRatingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading tutor rating data...');
      
      // Import ratingService dynamically to avoid build issues
      const { default: ratingService } = await import('../../services/ratingService');
      
      // Load course ratings
      console.log('🔄 Fetching tutor course ratings...');
      const ratingsResponse = await ratingService.getTutorCourseRatings(1, 10, sortBy);
      console.log('📊 Ratings response:', ratingsResponse);
      
      if (ratingsResponse.success) {
        setRatings(ratingsResponse.data.ratings || []);
        setCourseStats(ratingsResponse.data.courseStats || []);
        setOverallStats(ratingsResponse.data.overallStats || null);
        console.log('✅ Ratings loaded successfully');
      } else {
        console.warn('⚠️ Ratings response not successful:', ratingsResponse.message);
        setError(ratingsResponse.message || 'Failed to load ratings');
      }

      // Load analytics
      console.log('🔄 Fetching tutor rating analytics...');
      const analyticsResponse = await ratingService.getTutorRatingAnalytics(timeRange);
      console.log('📈 Analytics response:', analyticsResponse);
      
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
        console.log('✅ Analytics loaded successfully');
      } else {
        console.warn('⚠️ Analytics response not successful:', analyticsResponse.message);
        // Don't set error for analytics failure, just log it
      }
    } catch (error) {
      console.error('❌ Error loading rating data:', error);
      console.error('❌ Error details:', error.response?.data);
      setError('Failed to load rating data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      return starNumber <= rating ? (
        <StarIcon key={index} className="w-4 h-4 text-yellow-400" />
      ) : (
        <StarOutlineIcon key={index} className="w-4 h-4 text-gray-300" />
      );
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading rating data...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Ratings</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={loadRatingData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Course Ratings & Reviews</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* No ratings fallback */}
          {(!overallStats || overallStats.totalRatings === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No ratings yet</h3>
              <p className="text-gray-500 mb-6">
                Your courses haven't received any ratings yet. Encourage your learners to rate their experience!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">Tips to get more ratings:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Ask learners to rate after completing courses</li>
                  <li>• Provide high-quality content and support</li>
                  <li>• Engage with learners in discussions</li>
                  <li>• Send follow-up emails after course completion</li>
                </ul>
              </div>
            </div>
          )}

          {/* Overall Stats */}
          {overallStats && overallStats.totalRatings > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <StarIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {overallStats.averageRating}
                    </p>
                    <div className="flex items-center mt-1">
                      {renderStars(Math.round(overallStats.averageRating))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {overallStats.totalRatings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Courses Rated</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {courseStats.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Performance */}
          {courseStats && courseStats.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
              <div className="space-y-4">
                {courseStats.map((course) => (
                  <div key={course.courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.courseTitle}</h4>
                      <div className="flex items-center mt-1">
                        {renderStars(Math.round(course.averageRating))}
                        <span className="ml-2 text-sm text-gray-600">
                          {course.averageRating} ({course.totalRatings} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {ratings && ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {renderStars(rating.overallRating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {rating.overallRating}/5
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-gray-700 mb-2">{rating.review}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span>{rating.rater?.name || 'Anonymous'}</span>
                        <ClockIcon className="w-4 h-4 ml-4 mr-1" />
                        <span>{formatDate(rating.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
              <p className="text-gray-500">
                Your courses haven't received any reviews yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Analytics ({timeRange})</h3>
            
            {/* Rating Distribution Chart */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = analytics.overallStats.ratingDistribution[rating] || 0;
                  const percentage = analytics.overallStats.totalRatings > 0 
                    ? (count / analytics.overallStats.totalRatings) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="w-4 text-sm text-gray-600">{rating}</span>
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-400 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600 text-right">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorRatingDashboard;