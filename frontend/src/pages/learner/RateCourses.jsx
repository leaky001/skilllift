import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaBookOpen, FaUser, FaCheckCircle } from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { getMyEnrollments } from '../../services/courseService';
import ratingService from '../../services/ratingService';
import { useAuth } from '../../context/AuthContext';

const RateCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []); // Empty dependency array to run only once

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading enrollments and reviews...');
      
      // Get user's enrollments
      const enrollmentsResponse = await getMyEnrollments();
      console.log('📚 Enrollments response:', enrollmentsResponse);
      
      if (enrollmentsResponse.success) {
        setEnrollments(enrollmentsResponse.data);
        console.log('✅ Enrollments loaded:', enrollmentsResponse.data.length);
        console.log('📊 Enrollment details:', enrollmentsResponse.data);
      } else {
        console.log('❌ Failed to load enrollments:', enrollmentsResponse.message);
      }

      // Get user's ratings
      const ratingsResponse = await ratingService.getMyRatings();
      console.log('⭐ Ratings response:', ratingsResponse);
      
      if (ratingsResponse.success) {
        setUserRatings(ratingsResponse.data);
        console.log('✅ Ratings loaded:', ratingsResponse.data.length);
      } else {
        console.log('❌ Failed to load ratings:', ratingsResponse.message);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      showError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const hasUserRated = (courseId) => {
    return userRatings.some(rating => rating.ratedEntity === courseId);
  };

  const getUserRating = (courseId) => {
    return userRatings.find(rating => rating.ratedEntity === courseId);
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const coursesToRate = useMemo(() => 
    enrollments.filter(enrollment => {
      // Check if enrollment exists and has course data
      if (!enrollment || !enrollment.course || !enrollment.course._id) {
        console.log('⚠️ Filtering out enrollment with missing course data:', enrollment);
        return false;
      }
      
      // Check if enrollment is active (be more lenient)
      const isActive = enrollment.status === 'active' || 
                      enrollment.status === 'enrolled' ||
                      enrollment.status === 'approved' ||
                      enrollment.status === 'completed';
      
      // Check if payment is completed (various ways this might be stored)
      const hasPayment = enrollment.paymentStatus === 'completed' || 
                        enrollment.hasPayment === true ||
                        enrollment.payment?.status === 'completed' ||
                        (typeof enrollment.paymentStatus === 'object' && enrollment.paymentStatus?.status === 'completed') ||
                        (typeof enrollment.paymentStatus === 'object' && enrollment.paymentStatus?.status === 'success') ||
                        enrollment.paymentStatus === 'success';
      
      console.log(`Course: ${enrollment.course.title}, Status: ${enrollment.status}, Payment: ${JSON.stringify(enrollment.paymentStatus)}, HasPayment: ${enrollment.hasPayment}, Active: ${isActive}, HasPayment: ${hasPayment}`);
      
      // Show courses if they're active OR if they have payment completed
      // This ensures enrolled courses show up for rating
      return isActive || hasPayment;
    }), [enrollments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('🔍 Debug Info:');
  console.log('- Total enrollments:', enrollments.length);
  console.log('- Enrollments:', enrollments);
  console.log('- Courses to rate:', coursesToRate.length);
  console.log('- Courses to rate:', coursesToRate);
  console.log('- Enrollment statuses:', enrollments.map(e => ({ 
    title: e.course?.title, 
    status: e.status, 
    paymentStatus: e.paymentStatus,
    hasPayment: e.hasPayment 
  })));

  // If no courses match the filter, show all enrollments for debugging
  const displayCourses = coursesToRate.length > 0 ? coursesToRate : enrollments;
  
  console.log('🔍 Final display courses:', displayCourses.length);
  console.log('🔍 Display courses:', displayCourses);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Your Courses</h1>
        <p className="text-gray-600">
          Share your experience and help other learners choose the right courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Courses</p>
              <p className="text-2xl font-bold text-gray-900">{displayCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaStar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviews Written</p>
              <p className="text-2xl font-bold text-gray-900">{userRatings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaCheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayCourses.length - userRatings.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {displayCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses to rate yet</h3>
          <p className="text-gray-500 mb-6">
            Complete some courses first, then come back to rate them
          </p>
          <Link
            to="/learner/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaBookOpen className="mr-2" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayCourses.map((enrollment) => {
            // Skip enrollments with null or missing course data
            if (!enrollment || !enrollment.course || !enrollment.course._id) {
              console.log('⚠️ Skipping enrollment with missing course data:', enrollment);
              return null;
            }

            const course = enrollment.course;
            const hasRated = hasUserRated(course._id);
            const userRating = getUserRating(course._id);

            return (
              <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      {hasRated && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          ✓ Rated
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Status: {enrollment.status}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Payment: {typeof enrollment.paymentStatus === 'object' ? JSON.stringify(enrollment.paymentStatus) : enrollment.paymentStatus || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <FaUser className="w-4 h-4" />
                        <span>{course.tutor?.name || course.tutorName || 'Loading Tutor...'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaClock className="w-4 h-4" />
                        <span>{course.duration || 'Unknown Duration'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaBookOpen className="w-4 h-4" />
                        <span>{course.category || 'Unknown Category'}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    {hasRated && userRating && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {getRatingStars(userRating.overallRating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {userRating.overallRating}/5
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{userRating.title}</p>
                        <p className="text-sm text-gray-700 mt-1">{userRating.review}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6">
                    {hasRated ? (
                      <Link
                        to={`/learner/courses/${course._id}`}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FaStar className="mr-2" />
                        Edit Rating
                      </Link>
                    ) : (
                      <Link
                        to={`/learner/courses/${course._id}`}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <FaStar className="mr-2" />
                        Rate Course
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)} {/* Remove null entries */}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Why Rate Courses?</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Help other learners make informed decisions</li>
          <li>• Provide valuable feedback to tutors</li>
          <li>• Improve the quality of courses on the platform</li>
          <li>• Build a community of honest reviews</li>
        </ul>
      </div>
    </div>
  );
};

export default RateCourses;
