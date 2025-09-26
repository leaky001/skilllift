import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { showSuccess, showError, showCourseEnrolled, showNetworkError, showServerError } from '../../services/toastService.jsx';
import { 
  FaStar, 
  FaUsers, 
  FaClock, 
  FaBookOpen, 
  FaPlay, 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaGraduationCap,
  FaCertificate,
  FaMobile,
  FaLaptop,
  FaGlobe,
  FaVideo,
  FaFileAlt
} from 'react-icons/fa';
import { getCourses, enrollInCourse } from '../../services/courseService';
import { checkEnrollmentStatus } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { getThumbnailUrl, getPlaceholderImage, getCSSPlaceholder } from '../../utils/fileUtils';
import PaymentModal from '../../components/PaymentModal';

const LearnerCourses = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});

  // Course categories
  const categories = [
    'Beauty & Fashion',
    'Business',
    'Technology',
    'Health & Wellness',
    'Arts & Design',
    'Education',
    'Marketing',
    'Finance',
    'Sports',
    'Music',
    'Cooking',
    'Photography',
    'Writing',
    'Language Learning',
    'Personal Development'
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];
  const formats = ['online-prerecorded', 'online-live', 'physical'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-25000', label: '₦0 - ₦25,000' },
    { value: '25000-50000', label: '₦25,000 - ₦50,000' },
    { value: '50000-100000', label: '₦50,000 - ₦100,000' },
    { value: '100000+', label: '₦100,000+' }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && user) {
      loadEnrollmentStatuses();
    }
  }, [courses, user]);

  // Check for payment success parameter and refresh enrollment status
  useEffect(() => {
    const paymentSuccess = searchParams.get('paymentSuccess');
    if (paymentSuccess === 'true' && user && courses.length > 0) {
      // Force immediate refresh with cache busting
      loadEnrollmentStatuses(true);
      // Remove the parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('paymentSuccess');
        return newParams;
      });
    }
  }, [searchParams, user, courses, setSearchParams]);

  // Periodic refresh to ensure state stays updated
  useEffect(() => {
    if (!user || courses.length === 0) return;
    
    const interval = setInterval(() => {
      loadEnrollmentStatuses(true); // Force refresh every 30 seconds
      loadCourses(); // Also refresh course data to get updated ratings
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses({
        status: 'published',
        isApproved: true
      });
      
      if (response.success) {
        setCourses(response.data || []);
      } else {
        showError('Failed to load courses: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      showServerError();
    } finally {
      setLoading(false);
    }
  };

  // Load enrollment status for all courses
  const loadEnrollmentStatuses = async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      const statuses = {};
      for (const course of courses) {
        try {
          // Add cache busting parameter for force refresh
          const url = forceRefresh 
            ? `/api/enrollments/check-status/${course._id}?t=${Date.now()}`
            : `/api/enrollments/check-status/${course._id}`;
          
          const response = await checkEnrollmentStatus(course._id, forceRefresh);
          if (response.success) {
            statuses[course._id] = response.data;
          }
        } catch (error) {
          console.error(`Error checking enrollment for course ${course._id}:`, error);
        }
      }
      setEnrollmentStatuses(statuses);
    } catch (error) {
      console.error('Error loading enrollment statuses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) {
        showError('Course not found');
        return;
      }

      // Check if course is free
      if (course.price === 0 || course.price === null || course.price === undefined) {
        // Free course - enroll directly
        const response = await enrollInCourse(courseId);
        if (response.success) {
          showCourseEnrolled();
          loadCourses(); // Reload to update enrollment status
          loadEnrollmentStatuses(); // Refresh enrollment statuses
        } else {
          showError(response.message || 'Failed to enroll in course');
        }
      } else {
        // Paid course - show payment modal directly
        setSelectedCourse(course);
        setShowPaymentModal(true);
      }
    } catch (error) {
      showError('Error enrolling in course. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedCourse(null);
    showSuccess('Payment successful! Admin will enroll you when the course starts.');
    loadCourses(); // Reload to update enrollment status
    loadEnrollmentStatuses(); // Refresh enrollment statuses
  };



  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.tutor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      const matchesFormat = selectedFormat === 'all' || course.courseType === selectedFormat;
      
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const price = course.price || 0;
        switch (priceRange) {
          case '0-25000':
            matchesPrice = price >= 0 && price <= 25000;
            break;
          case '25000-50000':
            matchesPrice = price > 25000 && price <= 50000;
            break;
          case '50000-100000':
            matchesPrice = price > 50000 && price <= 100000;
            break;
          case '100000+':
            matchesPrice = price > 100000;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesLevel && matchesFormat && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'students':
          return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
        default:
          return 0;
      }
    });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'online-prerecorded':
        return <FaPlay />;
      case 'online-live':
        return <FaGlobe />;
      case 'physical':
        return <FaUsers />;
      default:
        return <FaBookOpen />;
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case 'online-prerecorded':
        return 'Pre-recorded';
      case 'online-live':
        return 'Live Online';
      case 'physical':
        return 'Physical Class';
      default:
        return format;
    }
  };

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 overflow-hidden h-full flex flex-col transform hover:scale-105">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        <img 
          src={getThumbnailUrl(course.thumbnail) || getPlaceholderImage(course.category)} 
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide the image and use CSS background instead
            e.target.style.display = 'none';
            e.target.parentElement.style.background = getCSSPlaceholder(course.category);
            e.target.parentElement.style.display = 'flex';
            e.target.parentElement.style.alignItems = 'center';
            e.target.parentElement.style.justifyContent = 'center';
            e.target.parentElement.innerHTML = `
              <div style="color: white; font-size: 18px; font-weight: bold; text-align: center;">
                ${course.category || 'Course'}
              </div>
            `;
          }}
        />
        {/* Course Type Badge */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
            {getFormatIcon(course.courseType)}
            <span>{getFormatLabel(course.courseType)}</span>
          </div>
        </div>
        {/* Rating Badge - Clickable for enrolled users */}
        <div className="absolute top-3 left-3">
          {(() => {
            const enrollmentStatus = enrollmentStatuses[course._id];
            const isEnrolled = enrollmentStatus?.isEnrolled;
            const isPaymentComplete = enrollmentStatus?.isPaymentComplete;
            
            if (isEnrolled && isPaymentComplete) {
              return (
                <Link
                  to={`/learner/courses/${course._id}`}
                  className="flex items-center space-x-1 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs hover:bg-opacity-90 hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                  title="Click to rate this course"
                >
                  <FaStar className="text-yellow-400 animate-pulse" />
                  <span>{course.rating || 0}</span>
                </Link>
              );
            }
            
            return (
              <div className="flex items-center space-x-1 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                <FaStar className="text-yellow-400" />
                <span>{course.rating || 0}</span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
              {course.category}
            </span>
            <span className="text-xs text-neutral-500 capitalize">
              {course.level || 'beginner'}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2 text-left">
            {course.title}
          </h3>
          
          <p className="text-sm text-neutral-600 mb-3 line-clamp-3 overflow-hidden text-left leading-relaxed max-h-16">
            {course.description && typeof course.description === 'string' && course.description.length > 120 
              ? `${course.description.substring(0, 120)}...` 
              : course.description || 'Learn valuable skills in this comprehensive course.'}
          </p>
          
          <div className="flex items-center text-sm text-neutral-500 mb-3 text-left">
            <FaClock className="mr-1" />
            <span>{course.duration || '8 weeks'}</span>
            <span className="mx-2">•</span>
            <FaBookOpen className="mr-1" />
            <span>{course.content?.length || 0} lessons</span>
            <span className="mx-2">•</span>
            <FaUsers className="mr-1" />
            <span>{course.enrollmentCount || 0} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-left">
            <div className="text-2xl font-bold text-primary-600">
              {formatCurrency(course.price)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-sm text-neutral-600 mb-1 justify-end">
              <FaGraduationCap className="mr-1" />
              <span>{course.tutor?.name || 'Unknown Tutor'}</span>
            </div>
            {course.certificate && (
              <div className="flex items-center text-xs text-success-600 justify-end">
                <FaCertificate className="mr-1" />
                <span>Certificate included</span>
              </div>
            )}
          </div>
        </div>

        {/* Course Features */}
        <div className="mb-4">
          <div className="flex items-center space-x-4 text-sm text-neutral-600 text-left">
            <div className="flex items-center space-x-1">
              <FaBookOpen className="text-primary-600" />
              <span>{course.content?.length || 0} lessons</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mt-auto">
          {/* Primary Actions */}
          <div className="flex space-x-3">
            <Link
              to={`/learner/courses/${course._id}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaEye className="mr-2" />
              View Course
            </Link>
            {(() => {
              const enrollmentStatus = enrollmentStatuses[course._id];
              const isEnrolled = enrollmentStatus?.isEnrolled;
              const isPaymentComplete = enrollmentStatus?.isPaymentComplete;
              const hasPayment = enrollmentStatus?.hasPayment;
              
              // First check if user is enrolled and payment is complete
              if (isEnrolled && isPaymentComplete) {
                return (
                  <div className="flex-1 text-primary-600 bg-primary-50 border border-primary-200 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>✅ Enrolled</span>
                  </div>
                );
              }
              
              // Check if user is enrolled but payment is not complete
              if (isEnrolled && !isPaymentComplete) {
                return (
                  <div className="flex-1 bg-error-100 text-error-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>❌ Payment Required - Contact Support</span>
                  </div>
                );
              }
              
              // Check if payment was received but user is not enrolled yet (pending enrollment)
              if (hasPayment && !isEnrolled) {
                return (
                  <div className="flex-1 bg-accent-100 text-accent-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>💰 Payment Received</span>
                  </div>
                );
              }
              
              return (
                <button
                  onClick={() => handleEnroll(course._id)}
                  className="flex-1 text-primary-600 bg-primary-50 border border-primary-200 hover:bg-primary-100 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Enroll Now</span>
                </button>
              );
            })()}
          </div>
          
        </div>
      </div>
    </div>
  );

  // Show loading while authentication is being initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">

      {/* Debug Authentication Button */}
      {!isAuthenticated && (
        <div className="bg-accent-100 border border-accent-400 text-accent-700 px-4 py-3 rounded mb-4">
          <strong>⚠️ Not Logged In!</strong> 
          <a href="/login" className="ml-2 text-primary-600 hover:underline">Click here to login</a>
        </div>
      )}
      
      <div className="max-w-none mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Discover Courses</h1>
          <p className="text-neutral-600">Learn from expert tutors and advance your skills</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search courses, tutors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>

            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Formats</option>
              {formats.map(format => (
                <option key={format} value={format}>{getFormatLabel(format)}</option>
              ))}
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="students">Most Students</option>
              </select>
            </div>

            <div className="text-sm text-neutral-600">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-neutral-300 mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No courses found</h3>
            <p className="text-neutral-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No courses available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-none">
            {filteredCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={selectedCourse}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default LearnerCourses;
