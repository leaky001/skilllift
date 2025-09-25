import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaUsers, 
  FaClock, 
  FaBookOpen, 
  FaPlay, 
  FaEye,
  FaGraduationCap,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
  FaDownload,
  FaShare,
  FaHeart,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaVideo,
  FaFileAlt,
  FaMobile,
  FaLaptop,
  FaComments,
  FaBook
} from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { getCourse, checkEnrollmentStatus } from '../../services/courseService';
import { enrollInCourse } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../../components/PaymentModal';
import { getThumbnailUrl, getPlaceholderImage, getCSSPlaceholder } from '../../utils/fileUtils';
import ReviewList from '../../components/rating/ReviewList';
import ReviewForm from '../../components/rating/ReviewForm';
import { getMyReviews } from '../../services/reviewService';
import LessonPlayer from '../../components/LessonPlayer';

const LearnerCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingEnrollmentStatus, setLoadingEnrollmentStatus] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  useEffect(() => {
    console.log('🔍 CourseDetail useEffect triggered');
    console.log('🔍 User:', user);
    console.log('🔍 CourseId:', courseId);
    console.log('🔍 Initial enrollmentStatus:', enrollmentStatus);
    
    loadCourse();
    loadLiveClasses();
    if (user) {
      checkUserReview();
      loadEnrollmentStatus();
    }
    
    // Refresh enrollment status when user returns to the page (e.g., after payment)
    const handleFocus = () => {
      if (user) {
        console.log('🔍 Page focus - refreshing enrollment status');
        loadEnrollmentStatus(true); // Force refresh on focus
      }
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔍 Page visible - refreshing enrollment status');
        loadEnrollmentStatus(true); // Force refresh when page becomes visible
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, user]);

  // Check for payment success parameter and refresh enrollment status
  useEffect(() => {
    const paymentSuccess = searchParams.get('paymentSuccess');
    if (paymentSuccess === 'true' && user && courseId) {
      console.log('🔄 Payment success detected, refreshing enrollment status...');
      loadEnrollmentStatus(true); // Force refresh
      // Remove the parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('paymentSuccess');
        return newParams;
      });
    }
  }, [searchParams, user, courseId, setSearchParams]);

  // Periodic refresh to ensure state stays updated (reduced to 5 seconds for faster updates)
  useEffect(() => {
    if (!user || !courseId) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Periodic enrollment status refresh for course:', courseId);
      loadEnrollmentStatus(true); // Force refresh every 5 seconds
    }, 5000); // 5 seconds for faster updates
    
    return () => clearInterval(interval);
  }, [user, courseId]);

  // Listen for payment completion events
  useEffect(() => {
    const handlePaymentComplete = (event) => {
      console.log('🔔 Payment completion event received:', event.detail);
      if (event.detail.courseId === courseId) {
        console.log('🔄 Payment completed for this course, refreshing enrollment status...');
        loadEnrollmentStatus(true);
      }
    };

    window.addEventListener('paymentCompleted', handlePaymentComplete);
    
    return () => {
      window.removeEventListener('paymentCompleted', handlePaymentComplete);
    };
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading course data for:', courseId);
      const response = await getCourse(courseId);
      console.log('📚 Course response:', response);
      if (response.success) {
        console.log('✅ Course loaded:', response.data.title);
        console.log('⭐ Course rating:', response.data.rating);
        console.log('📊 Total ratings:', response.data.totalRatings);
        setCourse(response.data);
      } else {
        showError('Failed to load course details');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showError('Error loading course details');
    } finally {
      setLoading(false);
    }
  };

  const loadLiveClasses = async () => {
    try {
      setLoadingLiveClasses(true);
      console.log('Loading live classes for course:', courseId);
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/live-classes`);
      const data = await response.json();
      console.log('Live classes API response:', data);
      if (data.success) {
        setLiveClasses(data.data);
        console.log('Live classes loaded:', data.data);
      } else {
        console.log('Failed to load live classes:', data.message);
      }
    } catch (error) {
      console.error('Error loading live classes:', error);
    } finally {
      setLoadingLiveClasses(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const response = await getMyReviews();
      if (response.success) {
        const userReviewForThisCourse = response.data.find(
          review => review.ratedEntity === courseId
        );
        if (userReviewForThisCourse) {
          setUserReview(userReviewForThisCourse);
        }
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const loadEnrollmentStatus = async (forceRefresh = false) => {
    if (!user) return;
    
    // Check if user has valid token
    const token = localStorage.getItem('token') || localStorage.getItem('skilllift_user');
    if (!token) {
      console.log('⚠️ No authentication token found, skipping enrollment status check');
      return;
    }
    
    console.log('🔍 LOADING ENROLLMENT STATUS for course:', courseId, forceRefresh ? '(FORCE REFRESH)' : '');
    console.log('🔍 User:', user);
    console.log('🔍 Token:', token ? 'Present' : 'Missing');
    
    try {
      setLoadingEnrollmentStatus(true);
      console.log('🔍 Calling checkEnrollmentStatus...');
      const response = await checkEnrollmentStatus(courseId, forceRefresh);
      console.log('🔍 checkEnrollmentStatus response:', response);
      
      if (response.success) {
        console.log('🔍 Setting enrollment status:', response.data);
        console.log('🔍 Installment info:', response.data.installmentInfo);
        console.log('🔍 Next installment number:', response.data.installmentInfo?.nextInstallmentNumber);
        setEnrollmentStatus(response.data);
      } else {
        console.log('❌ Enrollment status check failed:', response.message);
        
        // Handle timeout gracefully
        if (response.data?.enrollmentStatus === 'timeout') {
          console.log('⏰ Enrollment status timeout, showing fallback state');
          setEnrollmentStatus({
            isEnrolled: false,
            enrollmentStatus: 'timeout',
            paymentStatus: 'unknown'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error checking enrollment status:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Set fallback state on error
      setEnrollmentStatus({
        isEnrolled: false,
        enrollmentStatus: 'error',
        paymentStatus: 'unknown'
      });
    } finally {
      setLoadingEnrollmentStatus(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      showError('Please login to enroll in courses');
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      
      // Check if course is free
      if (course.price === 0 || course.price === null || course.price === undefined) {
        // Free course - enroll directly
        const response = await enrollInCourse(courseId);
        if (response.success) {
          showSuccess('Successfully enrolled in course!');
          await loadEnrollmentStatus(); // Refresh enrollment status
          navigate('/learner/dashboard');
        } else {
          showError(response.message || 'Failed to enroll in course');
        }
      } else {
        // Paid course - show payment modal
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      showError('Error enrolling in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewReplay = async (liveClass) => {
    // Check if user is enrolled
    if (!user) {
      showError('Please log in to watch recorded sessions');
      return;
    }

    if (!enrollmentStatus?.isEnrolled) {
      showError('You need to enroll in this course first to watch recorded live sessions');
      return;
    }

    try {
      // Check if there are replays for this specific live class/course
      const response = await fetch(`http://localhost:3001/api/learner/replays?courseId=${courseId}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Navigate to replays page filtered by this course
        navigate(`/learner/replays?courseId=${courseId}`);
      } else {
        // Show message that no replays are available yet
        showError('No recorded sessions available yet. Your tutor hasn\'t uploaded any replays for this course.');
      }
    } catch (error) {
      console.error('Error checking replays:', error);
      showError('Unable to check for recorded sessions. Please try again.');
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    showSuccess('Payment successful! You will be enrolled when the course starts.');
    await loadEnrollmentStatus(); // Refresh enrollment status
  };


  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getFormatIcon = (type) => {
    switch (type) {
      case 'online-prerecorded': return <FaVideo />;
      case 'online-live': return <FaGlobe />;
      case 'physical': return <FaMapMarkerAlt />;
      default: return <FaBookOpen />;
    }
  };

  const getFormatLabel = (type) => {
    switch (type) {
      case 'online-prerecorded': return 'Online';
      case 'online-live': return 'Live Online';
      case 'physical': return 'Physical';
      default: return 'Online';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Course Not Found</h2>
          <p className="text-neutral-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/learner/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Courses
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <FaShare />
              </button>
              <button className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <FaHeart />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-sm text-neutral-500 capitalize">
                      {course.level || 'beginner'}
                    </span>
                    <div className="flex items-center text-sm text-neutral-500">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span>{course.rating || 0}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                    {course.title}
                  </h1>
                  
                  <p className="text-lg text-neutral-600 mb-6">
                    {course.description}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-neutral-500 mb-6">
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>{course.duration || '8 weeks'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBookOpen className="mr-2" />
                      <span>{course.content?.length || 0} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-2" />
                      <span>{course.enrollmentCount || 0} students enrolled</span>
                    </div>
                    <div className="flex items-center">
                      {getFormatIcon(course.courseType)}
                      <span className="ml-2">{getFormatLabel(course.courseType)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <img 
                        src={course.tutor?.avatar || getPlaceholderImage()} 
                        alt={course.tutor?.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium text-neutral-900">
                          {course.tutor?.name || 'Unknown Tutor'}
                        </div>
                        <div className="text-sm text-neutral-500">
                          Course Instructor
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Course Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-soft p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Course Content</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('lessons')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'lessons' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Lessons
                  </button>
                  <button
                    onClick={() => setActiveTab('live-classes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'live-classes' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Live Classes
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'reviews' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Reviews
                  </button>
                </div>
              </div>

              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {course.learningObjectives?.map((objective, index) => (
                      <div key={index} className="flex items-start">
                        <FaCheckCircle className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-neutral-700">{objective}</span>
                      </div>
                    )) || (
                      <div className="text-neutral-500">No learning objectives specified</div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Requirements</h3>
                  <div className="space-y-2 mb-6">
                    {course.requirements?.map((requirement, index) => (
                      <div key={index} className="flex items-start">
                        <FaCheckCircle className="text-success-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-neutral-700">{requirement}</span>
                      </div>
                    )) || (
                      <div className="text-neutral-500">No specific requirements</div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Target Audience</h3>
                  <p className="text-neutral-700 mb-6">
                    {course.targetAudience || 'This course is suitable for anyone interested in learning this subject.'}
                  </p>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div>
                  {enrollmentStatus?.isEnrolled ? (
                    selectedLessonId ? (
                      <LessonPlayer 
                        courseId={courseId} 
                        lessonId={selectedLessonId}
                        onLessonComplete={() => {
                          // Refresh course data or show success message
                          showSuccess('Lesson completed!');
                        }}
                        onNextLesson={() => {
                          // Navigate to next lesson logic
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <FaBook className="mx-auto text-4xl text-neutral-400 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">Select a Lesson</h3>
                        <p className="text-neutral-600 mb-4">Choose a lesson to start learning</p>
                        <div className="space-y-2">
                          {course.content?.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="border border-neutral-200 rounded-lg p-4">
                              <h4 className="font-semibold text-neutral-900 mb-2">
                                Module {moduleIndex + 1}: {module.title}
                              </h4>
                              <div className="space-y-2">
                                {module.lessons?.map((lesson, lessonIndex) => (
                                  <button
                                    key={lessonIndex}
                                    onClick={() => setSelectedLessonId(lesson._id || `${moduleIndex}-${lessonIndex}`)}
                                    className="w-full flex items-center justify-between text-sm p-2 hover:bg-neutral-50 rounded"
                                  >
                                    <div className="flex items-center">
                                      <FaPlay className="text-neutral-400 mr-2" />
                                      <span className="text-neutral-700">{lesson.title}</span>
                                    </div>
                                    <span className="text-neutral-500">{lesson.duration || '10 min'}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )) || (
                            <div className="text-neutral-500">No lessons available yet</div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <FaBook className="mx-auto text-4xl text-neutral-400 mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">Enroll to Access Lessons</h3>
                      <p className="text-neutral-600 mb-4">You need to enroll in this course to access the lessons</p>
                      <button
                        onClick={handleEnroll}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Enroll Now
                      </button>
                    </div>
                  )}
                </div>
              )}


              {activeTab === 'live-classes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Live Classes</h3>
                    <span className="text-sm text-neutral-500">{liveClasses.length} classes scheduled</span>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    {loadingLiveClasses ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : liveClasses.length > 0 ? (
                      <div className="grid gap-4">
                        {liveClasses.map((liveClass) => {
                          console.log('Rendering live class:', liveClass);
                          console.log('Live class ID:', liveClass._id);
                          console.log('Live class has _id:', !!liveClass._id);
                          return (
                        <div key={liveClass._id} className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-neutral-900 mb-2">{liveClass.title}</h4>
                              <p className="text-neutral-600 mb-4">{liveClass.description}</p>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center text-neutral-600">
                                  <FaCalendarAlt className="mr-2 text-primary-600" />
                                  <span>{new Date(liveClass.scheduledDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-neutral-600">
                                  <FaClock className="mr-2 text-primary-600" />
                                  <span>{new Date(liveClass.scheduledDate).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center text-neutral-600">
                                  <FaUsers className="mr-2 text-primary-600" />
                                  <span>{liveClass.attendees}/{liveClass.maxAttendees} attendees</span>
                                </div>
                                <div className="flex items-center text-neutral-600">
                                  <FaClock className="mr-2 text-primary-600" />
                                  <span>{liveClass.duration} minutes</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-4 flex flex-col space-y-2">
                              <button
                                onClick={() => {
                                  console.log('Join Class button clicked!', liveClass._id);
                                  console.log('Navigating to tutor page:', `/tutor/live-classes/${liveClass._id}/room`);
                                  
                                  // Navigate to tutor's live class page so learners and tutors connect
                                  navigate(`/tutor/live-classes/${liveClass._id}/room`);
                                  console.log('Navigation called successfully');
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                style={{ zIndex: 10, position: 'relative' }}
                              >
                                <FaVideo />
                                <span>Join Class</span>
                              </button>
                              <button
                                onClick={() => handleViewReplay(liveClass)}
                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                <FaPlay />
                                <span>Watch Recorded Live Session</span>
                              </button>
                              <div className="text-xs text-neutral-500 text-center">
                                Password: {liveClass.meetingPassword}
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <FaVideo className="mx-auto text-4xl text-neutral-300 mb-4" />
                      <p>No live classes scheduled yet</p>
                      <p className="text-sm">Check back later for upcoming sessions</p>
                    </div>
                  )}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Student Reviews</h3>
                    {user && !userReview && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                      >
                        <FaComments />
                        <span>Write a Review</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Helpful tip */}
                  {user && !userReview && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> You can also click the ⭐ rating badge on course cards to quickly access the review form!
                      </p>
                    </div>
                  )}

                  {/* Review Form */}
                  {showReviewForm && (
                    <ReviewForm
                      courseId={courseId}
                      existingReview={userReview}
                      onReviewSubmitted={(review) => {
                        console.log('🎉 Review submitted callback triggered:', review);
                        setUserReview(review);
                        setShowReviewForm(false);
                        setRefreshReviews(prev => prev + 1); // Trigger review list refresh
                        console.log('✅ Review submitted successfully:', review);
                        // Refresh course data to get updated rating
                        console.log('🔄 Refreshing course data after review submission...');
                        loadCourse();
                      }}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  )}

                  {/* Success Message */}
                  {userReview && !showReviewForm && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Review Submitted Successfully!
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Your review is now visible to other learners and tutors.</p>
                            <p className="mt-1">You can edit your review by clicking the "Edit Review" button above.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <ReviewList 
                    courseId={courseId} 
                    refreshTrigger={refreshReviews}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-soft p-6 sticky top-8"
            >
              {/* Course Thumbnail */}
              <div className="relative mb-6">
                <img 
                  src={getThumbnailUrl(course.thumbnail) || getPlaceholderImage(course.category)} 
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    console.log('❌ Course thumbnail failed to load:', e.target.src);
                    // Hide the image and use CSS background instead
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = getCSSPlaceholder(course.category);
                    e.target.parentElement.style.display = 'flex';
                    e.target.parentElement.style.alignItems = 'center';
                    e.target.parentElement.style.justifyContent = 'center';
                    e.target.parentElement.innerHTML = `
                      <div style="color: white; font-size: 24px; font-weight: bold; text-align: center;">
                        ${course.category || 'Course'}
                      </div>
                    `;
                  }}
                />
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {getFormatIcon(course.courseType)}
                    <span>{getFormatLabel(course.courseType)}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {formatCurrency(course.price)}
                </div>
              </div>


              {/* SIMPLE ENROLLMENT BUTTON - GUARANTEED TO WORK */}
              <div className="mb-4">
                
                {(() => {
                  // Direct variable extraction
                  const isEnrolled = enrollmentStatus?.isEnrolled;
                  const isPaymentComplete = enrollmentStatus?.isPaymentComplete;
                  const hasPayment = enrollmentStatus?.hasPayment;
                  
                  console.log('🔍 SIMPLE CHECK:', { 
                    isEnrolled, 
                    isPaymentComplete, 
                    hasPayment, 
                    enrollmentStatus: enrollmentStatus 
                  });
                  
                  console.log('🔍 CONDITION CHECKS:');
                  console.log('  isEnrolled && isPaymentComplete:', isEnrolled && isPaymentComplete);
                  console.log('  isEnrolled && !isPaymentComplete:', isEnrolled && !isPaymentComplete);
                  console.log('  hasPayment:', hasPayment);
                  
                  if (loadingEnrollmentStatus) {
                    return (
                      <div className="w-full bg-gray-100 text-gray-600 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                        <span>Checking Status...</span>
                      </div>
                    );
                  }
                  
                  // Handle timeout state
                  if (enrollmentStatus?.enrollmentStatus === 'timeout') {
                    return (
                      <button
                        onClick={() => loadEnrollmentStatus(true)}
                        className="w-full bg-amber-100 text-amber-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-amber-200 transition-colors"
                      >
                        <FaExclamationTriangle className="w-5 h-5" />
                        <span>⏰ Status Check Timeout - Click to Retry</span>
                      </button>
                    );
                  }
                  
                  // Handle error state
                  if (enrollmentStatus?.enrollmentStatus === 'error') {
                    return (
                      <button
                        onClick={() => loadEnrollmentStatus(true)}
                        className="w-full bg-red-100 text-red-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-200 transition-colors"
                      >
                        <FaExclamationTriangle className="w-5 h-5" />
                        <span>❌ Error Loading Status - Click to Retry</span>
                      </button>
                    );
                  }
                  
                  if (isEnrolled && isPaymentComplete) {
                    return (
                      <div className="w-full bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                        <FaCheckCircle className="w-5 h-5" />
                        <span>✅ Payment Completed - Enrolled</span>
                      </div>
                    );
                  }
                  
                  if (isEnrolled && !isPaymentComplete) {
                    return (
                      <div className="w-full bg-red-100 text-red-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                        <FaCheckCircle className="w-5 h-5" />
                        <span>❌ Payment Required - Contact Support</span>
                      </div>
                    );
                  }
                  
                  if (hasPayment) {
                    return (
                      <div className="w-full bg-yellow-100 text-yellow-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                        <FaCheckCircle className="w-5 h-5" />
                        <span>💰 Payment Received - Awaiting Enrollment</span>
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {enrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Enroll Now - {formatCurrency(course.price)}</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>

              {/* Course Features */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-neutral-900">This course includes:</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <FaVideo className="text-success-500 mr-3" />
                    <span>Video lectures</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaFileAlt className="text-success-500 mr-3" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaGlobe className="text-success-500 mr-3" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaMobile className="text-success-500 mr-3" />
                    <span>Access on mobile and TV</span>
                  </div>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="font-semibold text-neutral-900 mb-3">About the instructor</h3>
                <div className="flex items-center">
                  <img 
                    src={course.tutor?.avatar || getPlaceholderImage()} 
                    alt={course.tutor?.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium text-neutral-900">
                      {course.tutor?.name || 'Unknown Tutor'}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {course.tutor?.bio || 'Professional instructor'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={{
          ...course,
        paymentType: 'full',
        amount: course.price
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default LearnerCourseDetail;
