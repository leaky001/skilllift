import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaEdit, 
  FaTrash, 
  FaThumbsUp, 
  FaThumbsDown,
  FaReply,
  FaFlag,
  FaFilter,
  FaSearch,
  FaSort,
  FaBookOpen,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaSpinner
} from 'react-icons/fa';
import { getMyReviews, deleteReview } from '../../services/reviewService';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../../components/rating/RatingStars';
import ReviewForm from '../../components/rating/ReviewForm';

const LearnerRatings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Load user reviews
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getMyReviews();
      if (response.success) {
        setRatings(response.data);
      } else {
        showError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      showError('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await deleteReview(reviewId);
        if (response.success) {
          showSuccess('Review deleted successfully');
          loadReviews(); // Reload the list
        } else {
          showError('Failed to delete review');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        showError('Error deleting review');
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      flagged: { color: 'bg-orange-100 text-orange-800', text: 'Flagged' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredAndSortedRatings = ratings
    .filter(rating => {
      const matchesFilter = filter === 'all' || 
        (filter === 'pending' && rating.status === 'pending') ||
        (filter === 'approved' && rating.status === 'approved') ||
        (filter === 'rejected' && rating.status === 'rejected');
      
      const matchesSearch = rating.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rating.review?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rating.ratedEntity?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'rating':
          return b.overallRating - a.overallRating;
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

  const stats = {
    total: ratings.length,
    average: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length).toFixed(1) : '0.0',
    pending: ratings.filter(r => r.status === 'pending').length,
    approved: ratings.filter(r => r.status === 'approved').length,
    rejected: ratings.filter(r => r.status === 'rejected').length,
    fiveStar: ratings.filter(r => r.overallRating === 5).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600 mt-1">Manage your course reviews and ratings</p>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <FaPlus />
            <span>Write New Review</span>
          </button>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ReviewForm
                courseId={editingReview?.ratedEntity?._id}
                existingReview={editingReview}
                onReviewSubmitted={(review) => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  loadReviews();
                }}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.average}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredAndSortedRatings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FaStar className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t written any reviews yet'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Write Your First Review
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedRatings.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.title || 'Untitled Review'}
                      </h3>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span>{formatDate(review.createdAt)}</span>
                      <span>•</span>
                      <span>{getTimeAgo(review.createdAt)}</span>
                      {review.ratedEntity?.title && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{review.ratedEntity.title}</span>
                        </>
                      )}
                    </div>
                    <RatingStars rating={review.overallRating} readonly size="sm" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit review"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete review"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{review.review}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <FaThumbsUp className="mr-1" />
                      {review.helpfulCount || 0} helpful
                    </span>
                  </div>
                  {review.status === 'rejected' && review.rejectionReason && (
                    <div className="text-red-600">
                      Reason: {review.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerRatings;
