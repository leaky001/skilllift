import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import ratingService from '../services/ratingService';

const RatingSubmissionForm = ({ courseId, courseTitle, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !title.trim() || !review.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a valid rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const ratingData = {
        courseId,
        rating,
        title: title.trim(),
        review: review.trim()
      };

      const response = await ratingService.createRating(ratingData);
      
      if (response.success) {
        onSuccess && onSuccess(response.data);
      } else {
        setError(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating, isInteractive = true) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= currentRating;
      
      return (
        <button
          key={index}
          type="button"
          className={`focus:outline-none ${
            isInteractive ? 'hover:scale-110 transition-transform' : ''
          }`}
          onClick={isInteractive ? () => setRating(starNumber) : undefined}
          onMouseEnter={isInteractive ? () => setHoveredRating(starNumber) : undefined}
          onMouseLeave={isInteractive ? () => setHoveredRating(0) : undefined}
        >
          {isFilled ? (
            <StarIcon className="w-8 h-8 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="w-8 h-8 text-gray-300" />
          )}
        </button>
      );
    });
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Very Good';
      case 3: return 'Good';
      case 2: return 'Fair';
      case 1: return 'Poor';
      default: return 'Select a rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rate This Course</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Course Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{courseTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">Share your experience with other learners</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {renderStars(hoveredRating || rating)}
                </div>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {getRatingText(hoveredRating || rating)}
                </span>
              </div>
              {rating > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  You selected {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Review Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience in a few words"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={100}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {title.length}/100 characters
              </p>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Review *
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell other learners about your experience with this course. What did you like? What could be improved?"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                maxLength={1000}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {review.length}/1000 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Guidelines */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be honest and constructive in your feedback</li>
                <li>• Focus on the course content and teaching quality</li>
                <li>• Avoid personal attacks or inappropriate language</li>
                <li>• Your review will be visible to other learners</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !rating || !title.trim() || !review.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingSubmissionForm;
