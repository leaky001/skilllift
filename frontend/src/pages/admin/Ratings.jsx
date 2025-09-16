import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEye, 
  FaEyeSlash,
  FaFlag,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaReply,
  FaDownload,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaGraduationCap,
  FaShieldAlt
} from 'react-icons/fa';
import { getAllRatings, getTutors } from '../../services/ratingService';

const AdminRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);

  // Fetch real ratings and tutors data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Fetching ratings and tutors for admin review...');
        
        // Fetch ratings
        const ratingsResponse = await getAllRatings();
        if (ratingsResponse.success) {
          console.log('✅ Ratings fetched:', ratingsResponse.data.length);
          console.log('📊 Sample rating data:', ratingsResponse.data[0]);
          setRatings(ratingsResponse.data);
        } else {
          console.error('❌ Failed to fetch ratings:', ratingsResponse.message);
        }

        // Fetch tutors
        const tutorsResponse = await getTutors();
        if (tutorsResponse.success) {
          console.log('✅ Tutors fetched:', tutorsResponse.data.length);
          console.log('👨‍🏫 Sample tutor data:', tutorsResponse.data[0]);
          setTutors(tutorsResponse.data);
        } else {
          console.error('❌ Failed to fetch tutors:', tutorsResponse.message);
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colorMap = {
      approved: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      rejected: 'text-red-600 bg-red-50 border-red-200',
      flagged: 'text-orange-600 bg-orange-50 border-orange-200'
    };
    return colorMap[status] || colorMap.pending;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4) return 'text-blue-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleApprove = async (id) => {
    try {
      console.log('✅ Approving rating:', id);
      const response = await approveRating(id);
      if (response.success) {
        setRatings(prev => 
          prev.map(rating => 
            rating._id === id ? { ...rating, status: 'approved' } : rating
          )
        );
        console.log('✅ Rating approved successfully');
      } else {
        console.error('❌ Failed to approve rating:', response.message);
        alert('Failed to approve rating: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error approving rating:', error);
      alert('Error approving rating: ' + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      console.log('❌ Rejecting rating:', id);
      const response = await rejectRating(id, { rejectionReason: 'Admin rejection' });
      if (response.success) {
        setRatings(prev => 
          prev.map(rating => 
            rating._id === id ? { ...rating, status: 'rejected' } : rating
          )
        );
        console.log('✅ Rating rejected successfully');
      } else {
        console.error('❌ Failed to reject rating:', response.message);
        alert('Failed to reject rating: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error rejecting rating:', error);
      alert('Error rejecting rating: ' + error.message);
    }
  };

  const handleFlag = (id) => {
    setRatings(prev => 
      prev.map(rating => 
        rating.id === id ? { ...rating, isFlagged: true, flagReason: 'Admin flagged' } : rating
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setRatings(prev => prev.filter(rating => rating.id !== id));
    }
  };

  const filteredRatings = ratings.filter(rating => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'tutor' && rating.ratedEntity?.tutor?._id === selectedTutor);
    
    const matchesSearch = (rating.rater?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rating.ratedEntity?.tutor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rating.ratedEntity?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rating.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'rating':
        return b.overallRating - a.overallRating;
      case 'tutor':
        return (a.ratedEntity?.tutor?.name || '').localeCompare(b.ratedEntity?.tutor?.name || '');
      case 'course':
        return (a.ratedEntity?.title || '').localeCompare(b.ratedEntity?.title || '');
      default:
        return 0;
    }
  });

  const stats = {
    total: ratings.length,
    averageRating: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length).toFixed(1) : '0.0',
    totalTutors: tutors.length,
    activeTutors: tutors.filter(t => t.accountStatus === 'approved').length,
    totalReviews: ratings.length,
    responseRate: tutors.length > 0 ? (tutors.filter(t => t.tutorProfile?.skills?.length > 0).length / tutors.length * 100).toFixed(1) : '0.0'
  };

  const RatingCard = ({ rating }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all duration-200 hover:shadow-xl ${
      rating.isFlagged 
        ? 'border-l-orange-500' 
        : rating.status === 'approved'
        ? 'border-l-green-500'
        : rating.status === 'pending'
        ? 'border-l-yellow-500'
        : 'border-l-red-500'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <FaUser className="text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900">{rating.rater?.name || 'Unknown User'}</h3>
            <span className="text-sm text-gray-500">→</span>
            <FaGraduationCap className="text-green-500" />
            <h4 className="text-lg font-bold text-gray-900">{rating.ratedEntity?.tutor?.name || 'Loading Tutor...'}</h4>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <FaBookOpen className="text-gray-400" />
              {rating.ratedEntity?.title || 'Loading Course...'}
            </span>
            <span className="flex items-center space-x-1">
              <FaCalendarAlt className="text-gray-400" />
              {new Date(rating.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center space-x-1">
              <FaClock className="text-gray-400" />
              {rating.overallExperience || 'positive'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 text-sm font-medium rounded-full border border-green-200 text-green-600 bg-green-50">
            Published
          </span>
        </div>
      </div>

      {/* Rating and Review */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(rating.overallRating)}
          </div>
          <span className={`font-semibold ${getRatingColor(rating.overallRating)}`}>
            {rating.overallRating}/5
          </span>
        </div>
        <div className="mb-2">
          <h4 className="font-semibold text-gray-900">{rating.title}</h4>
        </div>
        <p className="text-gray-700 leading-relaxed">{rating.review}</p>
      </div>

      {/* Review Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600">Overall Rating</div>
          <div className="font-medium text-gray-900">{rating.overallRating}/5</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Experience</div>
          <div className="font-medium text-gray-900 capitalize">{rating.overallExperience}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Created</div>
          <div className="font-medium text-gray-900">{new Date(rating.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 flex items-center space-x-2">
            <FaThumbsUp className="text-green-500" />
            {rating.helpfulCount || 0}
          </span>
          <span className="text-sm text-gray-500 flex items-center space-x-2">
            <FaThumbsDown className="text-red-500" />
            {rating.reportCount || 0}
          </span>
          <span className="text-sm text-gray-500 flex items-center space-x-2">
            <FaReply className="text-blue-500" />
            {rating.tutorReply ? 'Has Reply' : 'No Reply'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDelete(rating._id)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tutor Reply */}
      {rating.tutorReply && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center space-x-2 mb-2">
            <FaGraduationCap className="text-blue-600" />
            <span className="font-semibold text-blue-900">{rating.ratedEntity?.tutor?.name || 'Tutor'}</span>
            <span className="text-sm text-blue-600">(Tutor Reply)</span>
            <span className="text-sm text-blue-500">{rating.tutorReplyDate ? new Date(rating.tutorReplyDate).toLocaleDateString() : 'Recently'}</span>
          </div>
          <p className="text-blue-800">{rating.tutorReply}</p>
        </div>
      )}
    </div>
  );

  const TutorCard = ({ tutor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{tutor.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                tutor.accountStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tutor.accountStatus || 'pending'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tutor.email}</div>
              <div className="text-sm text-gray-600">Email</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tutor.role}</div>
              <div className="text-sm text-gray-600">Role</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tutor.tutorProfile?.skills?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Skills</div>
            </div>
          </div>

          {/* Skills/Expertise */}
          {tutor.tutorProfile?.skills && tutor.tutorProfile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tutor.tutorProfile.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </span>
              ))}
              {tutor.tutorProfile.skills.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  +{tutor.tutorProfile.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Joined: {new Date(tutor.createdAt).toLocaleDateString()}</span>
            <span>ID: {tutor._id}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Rating Management</h2>
          <p className="text-gray-600">Monitor and manage ratings, reviews, and tutor performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FaDownload className="inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.averageRating}</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalTutors}</div>
          <div className="text-sm text-gray-600">Total Tutors</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-1">
          {[
            { key: 'overview', label: 'Overview', icon: FaChartBar },
            { key: 'reviews', label: 'Reviews & Feedback', icon: FaStar },
            { key: 'tutors', label: 'Tutor Performance', icon: FaGraduationCap }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="text-sm" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-1">
                    {renderStars(rating.overallRating)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {rating.ratedEntity?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {rating.rater?.name} → {rating.ratedEntity?.tutor?.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rating.status)}`}>
                    {rating.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tutor Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Tutors</h3>
            <div className="space-y-3">
              {tutors
                .filter(tutor => tutor.tutorProfile?.skills?.length > 0)
                .slice(0, 5)
                .map((tutor) => (
                  <div key={tutor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tutor.name}</p>
                      <p className="text-xs text-gray-500">{tutor.tutorProfile?.skills?.length || 0} skills</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">{tutor.accountStatus}</span>
                      </div>
                      <p className="text-xs text-gray-500">{tutor.email}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <>
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Reviews' },
                  { key: 'tutor', label: 'By Tutor' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                
                {/* Tutor Dropdown */}
                {filter === 'tutor' && (
                  <select
                    value={selectedTutor || ''}
                    onChange={(e) => setSelectedTutor(e.target.value || null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor._id} value={tutor._id}>
                        {tutor.name} ({tutor.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="tutor">Sort by Tutor</option>
                  <option value="course">Sort by Course</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredRatings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredRatings.map((rating) => (
                <RatingCard key={rating._id} rating={rating} />
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'tutors' && (
        <div className="space-y-4">
          {tutors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tutors found</h3>
              <p className="text-gray-500">Tutor data will appear here</p>
            </div>
          ) : (
            tutors.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRatings;
