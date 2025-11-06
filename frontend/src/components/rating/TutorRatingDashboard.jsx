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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading rating data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-md border border-red-200 p-8">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Ratings</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={loadRatingData}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Course Ratings & Reviews</h2>
              <p className="text-slate-600 text-lg">Track and analyze your course ratings</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white font-medium text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white font-medium text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                All Reviews
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* No ratings fallback */}
          {(!overallStats || overallStats.totalRatings === 0) && (
            <div className="bg-white rounded-xl shadow-md border border-slate-100 text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No ratings yet</h3>
              <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
                Your courses haven't received any ratings yet. Encourage your learners to rate their experience!
              </p>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 max-w-md mx-auto">
                <h4 className="font-bold text-primary-900 mb-3">Tips to get more ratings:</h4>
                <ul className="text-primary-800 text-sm space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ask learners to rate after completing courses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Provide high-quality content and support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Engage with learners in discussions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Send follow-up emails after course completion</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Overall Stats */}
          {overallStats && overallStats.totalRatings > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <StarIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {overallStats.averageRating}
                    </p>
                    <div className="flex items-center mt-2">
                      {renderStars(Math.round(overallStats.averageRating))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <EyeIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Reviews</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {overallStats.totalRatings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ChartBarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">Courses Rated</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {courseStats.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Performance */}
          {courseStats && courseStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Course Performance</h3>
              <div className="space-y-4">
                {courseStats.map((course) => (
                  <div key={course.courseId} className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-2">{course.courseTitle}</h4>
                      <div className="flex items-center">
                        {renderStars(Math.round(course.averageRating))}
                        <span className="ml-3 text-sm text-slate-600 font-semibold">
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
                <div key={rating._id} className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {renderStars(rating.overallRating)}
                        </div>
                        <span className="ml-3 text-sm font-semibold text-slate-600">
                          {rating.overallRating}/5
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-slate-700 mb-4 leading-relaxed">{rating.review}</p>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <UserIcon className="w-4 h-4 mr-1.5 text-primary-600" />
                        <span className="font-medium">{rating.rater?.name || 'Anonymous'}</span>
                        <ClockIcon className="w-4 h-4 ml-4 mr-1.5 text-primary-600" />
                        <span>{formatDate(rating.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-slate-100 text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No reviews yet</h3>
              <p className="text-slate-600 text-lg">
                Your courses haven't received any reviews yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Rating Analytics ({timeRange})</h3>
            
            {/* Rating Distribution Chart */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-4">Rating Distribution</h4>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = analytics.overallStats.ratingDistribution[rating] || 0;
                  const percentage = analytics.overallStats.totalRatings > 0 
                    ? (count / analytics.overallStats.totalRatings) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-4">
                      <span className="w-6 text-sm font-semibold text-slate-700">{rating}</span>
                      <StarIcon className="w-5 h-5 text-amber-500" />
                      <div className="flex-1 bg-slate-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-20 text-sm font-semibold text-slate-600 text-right">
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
    </div>
  );
};

export default TutorRatingDashboard;