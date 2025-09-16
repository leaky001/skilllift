import React from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ 
  rating = 0, 
  onRatingChange, 
  size = 'md', 
  readonly = false, 
  showValue = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      // You can add hover effects here if needed
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readonly}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            } ${sizes[size]} ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            }`}
          >
            <FaStar className="w-full h-full" />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'No rating'}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
