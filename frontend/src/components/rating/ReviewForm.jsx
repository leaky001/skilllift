import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaSmile, FaMeh, FaFrown } from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { createReview, updateReview } from '../../services/reviewService';

const ReviewForm = ({ courseId, existingReview = null, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [overallExperience, setOverallExperience] = useState(existingReview?.overallExperience || 'positive');
  const [submitting, setSubmitting] = useState(false);

  const experienceOptions = [
    { value: 'positive', label: 'Positive', icon: <FaSmile className="text-green-500" /> },
    { value: 'neutral', label: 'Neutral', icon: <FaMeh className="text-yellow-500" /> },
    { value: 'negative', label: 'Negative', icon: <FaFrown className="text-red-500" /> }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }
    
    if (!title.trim()) {
      showError('Please provide a review title');
      return;
    }
    
    if (!comment.trim()) {
      showError('Please provide a review comment');
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData = {
        courseId,
        rating,
        title: title.trim(),
        review: comment.trim(),
        overallExperience
      };

      console.log('📝 Submitting review data:', reviewData);

      let response;
      if (existingReview) {
        response = await updateReview(existingReview._id, {
          ...reviewData,
          review: comment.trim() // Ensure we send 'review' for updates too
        });
      } else {
        response = await createReview(reviewData);
      }

      if (response.success) {
        // Show success message with more details
        showSuccess(
          existingReview 
            ? 'Review updated successfully! Your updated review is now visible to other learners.' 
            : 'Review submitted successfully! Your review is now visible to other learners and tutors.'
        );
        
        console.log('✅ Review submitted successfully:', response.data);
        console.log('📋 Full response:', response);
        
        // Call the callback to update parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data);
        }
        
        // Reset form for new reviews
        if (!existingReview) {
          setRating(0);
          setTitle('');
          setComment('');
          setOverallExperience('positive');
        }
      } else {
        showError(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`text-2xl transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                <FaStar />
              </button>
            ))}
            <span className="ml-3 text-sm font-medium text-gray-700">
              {getRatingLabel(hoveredRating || rating)}
            </span>
          </div>
        </div>

        {/* Overall Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Experience
          </label>
          <div className="flex space-x-4">
            {experienceOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                  overallExperience === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="overallExperience"
                  value={option.value}
                  checked={overallExperience === option.value}
                  onChange={(e) => setOverallExperience(e.target.value)}
                  className="sr-only"
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience in a few words..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed experience with this course..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={500}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{existingReview ? 'Updating Review...' : 'Submitting Review...'}</span>
              </>
            ) : (
              <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
