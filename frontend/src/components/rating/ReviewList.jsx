import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaReply, FaFlag, FaUser, FaCalendarAlt } from 'react-icons/fa';
import RatingStars from './RatingStars';
import { getCourseReviews, getCourseReviewStats } from '../../services/reviewService';
import { showError } from '../../services/toastService.jsx';

const ReviewList = ({ courseId, onReviewAdded, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  // Reload reviews when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadReviews();
    }
  }, [refreshTrigger]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading reviews for course:', courseId);
      const [reviewsResponse, statsResponse] = await Promise.all([
        getCourseReviews(courseId, { limit: 10, sort: 'newest' }),
        getCourseReviewStats(courseId)
      ]);

      console.log('📊 Reviews response:', reviewsResponse);
      console.log('📊 Reviews data:', reviewsResponse.data);
      console.log('📈 Stats response:', statsResponse);
      console.log('📈 Stats data:', statsResponse.data);

      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data);
        console.log('✅ Reviews loaded:', reviewsResponse.data.length);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
        console.log('✅ Stats loaded:', statsResponse.data);
      }
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      showError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingPercentage = (rating) => {
    if (stats.totalRatings === 0) return 0;
    return Math.round((stats.ratingDistribution[rating] / stats.totalRatings) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Ratings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <RatingStars rating={Math.round(stats.averageRating)} readonly size="lg" />
            <div className="text-sm text-gray-500 mt-1">
              {stats.totalRatings} {stats.totalRatings === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm text-gray-600 w-8">{rating}★</span>
                <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12">
                  {stats.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Student Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaStar className="mx-auto text-4xl text-gray-300 mb-4" />
            <p>No reviews yet. Be the first to review this course!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.rater?.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <RatingStars rating={review.overallRating} readonly size="sm" />
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h4>
                )}

                <p className="text-gray-700 mb-4">
                  {review.review}
                </p>

                {/* Review Actions */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="flex items-center hover:text-gray-700 transition-colors">
                    <FaThumbsUp className="mr-1" />
                    <span>{review.helpfulCount || 0}</span>
                  </button>
                  <button className="flex items-center hover:text-gray-700 transition-colors">
                    <FaReply className="mr-1" />
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center hover:text-gray-700 transition-colors">
                    <FaFlag className="mr-1" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
