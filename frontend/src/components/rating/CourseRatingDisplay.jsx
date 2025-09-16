import React, { useState, useEffect } from 'react';
import { StarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import ratingService from '../services/ratingService';

const CourseRatingDisplay = ({ courseId, showTitle = true }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourseRatings();
  }, [courseId]);

  const loadCourseRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingService.getCourseRatingsForEnrollment(courseId, 5);
      if (response.success) {
        setRatings(response.data.ratings);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading course ratings:', error);
      setError('Failed to load ratings');
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

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Reviews</h3>
        )}
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Reviews</h3>
        )}
        <div className="text-center text-gray-500 py-8">
          <p>Unable to load reviews at this time</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Reviews</h3>
        )}
        <div className="text-center text-gray-500 py-8">
          <StarOutlineIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">Be the first to review this course!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Reviews</h3>
      )}
      
      {/* Rating Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.averageRating}</div>
            <div className="flex items-center justify-center">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.totalRatings} review{stats.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="w-3 text-gray-600">{rating}</span>
                  <StarIcon className="w-3 h-3 text-yellow-400" />
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-gray-500 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Recent Reviews</h4>
          {ratings.map((rating) => (
            <div key={rating._id} className="border-t border-gray-100 pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {rating.rater.profilePicture ? (
                      <img
                        src={rating.rater.profilePicture}
                        alt={rating.rater.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{rating.rater.name}</div>
                    <div className="flex items-center space-x-1">
                      {renderStars(rating.overallRating)}
                      <span className="text-sm text-gray-500 ml-1">
                        {getRatingText(rating.overallRating)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatDate(rating.createdAt)}
                </div>
              </div>
              
              {rating.title && (
                <h5 className="font-medium text-gray-900 mb-1">{rating.title}</h5>
              )}
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {rating.review}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseRatingDisplay;
