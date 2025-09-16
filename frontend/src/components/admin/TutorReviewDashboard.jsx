import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaUsers, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaEye,
  FaFilter,
  FaDownload
} from 'react-icons/fa';
import adminTutorService from '../services/adminTutorService';

const TutorReviewDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorDetails, setTutorDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminTutorService.getTutorReviewAnalytics({ timeRange });
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorDetails = async (tutorId) => {
    try {
      const response = await adminTutorService.getTutorDetailedAnalytics(tutorId, { timeRange });
      if (response.success) {
        setTutorDetails(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching tutor details:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (tutor) => {
    if (tutor.negativeReviewPercentage > 30) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">⚠️ Needs Attention</span>;
    }
    if (tutor.averageRating >= 4.5) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">⭐ Top Performer</span>;
    }
    if (tutor.averageRating >= 3.5) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">✅ Good</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">📈 Improving</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tutor Review Analytics</h2>
          <p className="text-gray-600">Monitor tutor performance through learner reviews</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tutors</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTutors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaStar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaChartLine className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Need Attention</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.tutorsWithNegativeReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tutor Performance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negative %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.tutors.map((tutor) => (
                <tr key={tutor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tutor.tutorName}</div>
                      <div className="text-sm text-gray-500">{tutor.tutorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tutor.courses.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tutor.totalReviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className={`text-sm font-medium ${getRatingColor(tutor.averageRating)}`}>
                        {tutor.averageRating}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tutor.negativeReviewPercentage > 30 
                        ? 'bg-red-100 text-red-800' 
                        : tutor.negativeReviewPercentage > 15 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {tutor.negativeReviewPercentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tutor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => fetchTutorDetails(tutor._id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <FaEye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tutor Details Modal */}
      {showDetails && tutorDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Detailed Analytics - {tutorDetails.tutor.name}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Tutor Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Tutor Information</h4>
                <p><strong>Name:</strong> {tutorDetails.tutor.name}</p>
                <p><strong>Email:</strong> {tutorDetails.tutor.email}</p>
              </div>

              {/* Analytics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{tutorDetails.analytics.totalReviews}</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{tutorDetails.analytics.averageRating}</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{tutorDetails.analytics.negativeReviews}</p>
                  <p className="text-sm text-gray-600">Negative</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{tutorDetails.analytics.positiveReviews}</p>
                  <p className="text-sm text-gray-600">Positive</p>
                </div>
              </div>

              {/* Course Performance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Course Performance</h4>
                <div className="space-y-2">
                  {tutorDetails.courses.map((course) => (
                    <div key={course.courseId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{course.courseTitle}</p>
                        <p className="text-sm text-gray-600">{course.totalReviews} reviews</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{course.averageRating}</span>
                        </div>
                        {course.negativeReviews > 0 && (
                          <p className="text-sm text-red-600">{course.negativeReviews} negative</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Reviews</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tutorDetails.recentReviews.map((review) => (
                    <div key={review.ratingId} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.title}</p>
                          <p className="text-sm text-gray-600">{review.courseTitle}</p>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.review}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        By {review.rater.name} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorReviewDashboard;
