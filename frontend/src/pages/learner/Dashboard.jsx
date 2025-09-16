import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyEnrollments } from '../../services/courseService';
import { getMyReviews } from '../../services/reviewService';
import learnerDashboardService from '../../services/learnerDashboardService';
import { useStreakTracking } from '../../hooks/useStreakTracking';
import { showError } from '../../services/toastService.jsx';
import { 
  FaBookOpen, 
  FaPlay, 
  FaClock, 
  FaTrophy,
  FaSearch,
  FaVideo,
  FaStar,
  FaEye,
  FaGraduationCap,
  FaArrowRight,
  FaClipboard,
  FaUserFriends,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaUser,
  FaDollarSign,
  FaHome,
  FaHistory,
  FaCalendarAlt
} from 'react-icons/fa';

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  const { streakData } = useStreakTracking();
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollments, setEnrollments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load enrollments
      await loadEnrollments();
      
      // Load reviews
      await loadReviews();
      
      // Load dashboard summary (upcoming sessions and announcements)
      await loadDashboardSummary();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardSummary = async () => {
    try {
      console.log('🔄 Loading learner dashboard summary...');
      const response = await learnerDashboardService.getDashboardSummary();
      console.log('📊 Dashboard summary response:', response);
      if (response.success) {
        setUpcomingSessions(response.data.upcomingSessions || []);
        setRecentAnnouncements(response.data.recentAnnouncements || []);
        console.log('✅ Dashboard summary loaded successfully:', response.data);
      } else {
        console.error('⚠️ Dashboard summary response not successful:', response.message);
        // Set empty arrays as fallback
        setUpcomingSessions([]);
        setRecentAnnouncements([]);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard summary:', error);
      console.error('❌ Error details:', error.response?.data);
      // Set empty arrays as fallback
      setUpcomingSessions([]);
      setRecentAnnouncements([]);
    }
  };

  const loadEnrollments = async () => {
    try {
      console.log('🔄 Loading learner enrollments...');
      const response = await getMyEnrollments();
      console.log('📚 Enrollments response:', response);
      if (response.success) {
        setEnrollments(response.data || []);
        console.log('✅ Enrollments loaded successfully:', response.data);
        console.log('📊 Enrollment count:', response.data?.length || 0);
        console.log('📊 Enrollment details:', response.data);
      } else {
        console.error('⚠️ Enrollments response not successful:', response.message);
        showError('Failed to load enrollments');
      }
    } catch (error) {
      console.error('❌ Error loading enrollments:', error);
      console.error('❌ Error details:', error.response?.data);
      showError('Error loading enrollments');
    }
  };

  const loadReviews = async () => {
    try {
      const response = await getMyReviews();
      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  // Debug enrollments data
  console.log('🔍 Dashboard Debug - Enrollments:', enrollments);
  console.log('🔍 Dashboard Debug - Enrollments length:', enrollments.length);
  console.log('🔍 Dashboard Debug - Enrollments statuses:', enrollments.map(e => ({ id: e._id, status: e.status, course: e.course?.title })));

  // Stats cards with real data
  const stats = [
    {
      title: 'Total Courses',
      value: enrollments.length.toString(),
      icon: FaBookOpen,
      color: 'text-primary-600',
      bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
      borderColor: 'border-primary-200',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Certificates',
      value: enrollments.filter(e => e.status === 'completed').length.toString(),
      icon: FaTrophy,
      color: 'text-accent-600',
      bgColor: 'bg-gradient-to-br from-accent-50 to-accent-100',
      borderColor: 'border-accent-200',
      gradient: 'from-accent-500 to-accent-600'
    },
    {
      title: 'Active Courses',
      value: enrollments.filter(e => e.status === 'active').length.toString(),
      icon: FaVideo,
      color: 'text-success-600',
      bgColor: 'bg-gradient-to-br from-success-50 to-success-100',
      borderColor: 'border-success-200',
      gradient: 'from-success-500 to-success-600'
    },
    {
      title: 'In Progress',
      value: enrollments.filter(e => e.progress > 0 && e.progress < 100).length.toString(),
      icon: FaClipboard,
      color: 'text-secondary-600',
      bgColor: 'bg-gradient-to-br from-secondary-50 to-secondary-100',
      borderColor: 'border-secondary-200',
      gradient: 'from-secondary-500 to-secondary-600'
    },
  ];

  // Continue Learning courses (from real enrollments)
  const continueLearningCourses = enrollments
    .filter(enrollment => enrollment.status === 'active' && enrollment.progress < 100)
    .slice(0, 2)
    .map(enrollment => ({
      id: enrollment._id,
      title: enrollment.course?.title || 'Unknown Course',
      instructor: enrollment.tutor?.name || 'Unknown Instructor',
      progress: enrollment.progress || 0,
      category: enrollment.course?.category || 'General',
      rating: enrollment.course?.rating || 4.5,
      students: enrollment.course?.totalEnrollments || 0
    }));

  const StatCard = ({ title, value, icon: Icon, color, bgColor, borderColor, gradient }) => (
    <div className={`${bgColor} border ${borderColor} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200">
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {course.category}
            </span>
            <div className="flex items-center space-x-1">
              <FaStar className="text-accent-400 text-sm" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-slate-600 mb-3">by {course.instructor}</p>
        
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <span>{course.students} students enrolled</span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-900">{course.progress}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
        
        <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
          Continue Learning
        </button>
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-2 text-lg">{session.title}</h4>
          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-primary-500" />
              <span>{session.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="text-secondary-500" />
              <span>{session.time}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span>by {session.instructor}</span>
            <span>•</span>
            <span>{session.participants} participants</span>
          </div>
        </div>
        <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
          session.status === 'join' 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700' 
            : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white hover:from-slate-500 hover:to-slate-600'
        }`}>
          {session.status === 'join' ? 'Join Now' : 'Set Reminder'}
        </button>
      </div>
    </div>
  );

  const AnnouncementCard = ({ announcement }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${
          announcement.type === 'course' ? 'bg-primary-100 text-primary-600' :
          announcement.type === 'assignment' ? 'bg-accent-100 text-accent-600' :
          announcement.type === 'live-class' ? 'bg-secondary-100 text-secondary-600' :
          announcement.type === 'replay' ? 'bg-primary-100 text-primary-600' :
          'bg-slate-100 text-slate-600'
        }`}>
          {announcement.type === 'course' && <FaBookOpen className="text-xl" />}
          {announcement.type === 'assignment' && <FaClipboard className="text-xl" />}
          {announcement.type === 'live-class' && <FaVideo className="text-xl" />}
          {announcement.type === 'replay' && <FaPlay className="text-xl" />}
          {announcement.type === 'system' && <FaCog className="text-xl" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">{announcement.title}</h4>
            {!announcement.isRead && (
              <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
            )}
          </div>
          <p className="text-slate-700 mb-2">{announcement.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {announcement.time || announcement.createdAt ? 
                (announcement.time || new Date(announcement.createdAt).toLocaleDateString()) : 
                'Recently'
              }
            </span>
            {announcement.sender && (
              <span className="text-xs text-slate-400">by {announcement.sender}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1">

      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Learner'}! 👋</h1>
          <p className="text-xl text-primary-100">Ready to continue your learning journey?</p>
          <div className="mt-6 flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm font-medium">Current Streak: {streakData?.currentStreak || 0} days</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-sm font-medium">Total Learning Time: {enrollments.reduce((total, enrollment) => total + (enrollment.course?.duration || 0), 0)}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 border border-slate-200">
        <div className="flex space-x-1">
          {['overview', 'replays', 'ratings', 'tutor-feedback', 'payments', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab === 'tutor-feedback' ? 'Tutor Feedback' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Continue Learning Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Continue Learning</h2>
              <Link to="/learner/courses" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2">
                <span>View All Courses</span>
                <FaArrowRight className="text-sm" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {continueLearningCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Upcoming Sessions</h2>
                <div className="flex items-center space-x-4">
                  <Link to="/learner/live-session" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center text-sm">
                    <FaVideo className="mr-2" />
                    Join Live Session
                  </Link>
                  <Link to="/learner/live-classes" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2">
                    <span>View All</span>
                    <FaArrowRight className="text-sm" />
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 text-center">
                    <FaCalendarAlt className="text-4xl text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No upcoming sessions</h3>
                    <p className="text-slate-500">Your upcoming live classes will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Recent Announcements</h2>
                <Link to="/learner/notifications" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2">
                  <span>View All</span>
                  <FaArrowRight className="text-sm" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentAnnouncements.length > 0 ? (
                  recentAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
                    <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No announcements yet</h3>
                    <p className="text-gray-500">You'll see important updates and notifications here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'replays' && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Replay Classes</h2>
          <p className="text-gray-600 mb-8">Watch recorded live sessions at your own pace.</p>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No replays available yet</h3>
              <p className="text-gray-500 mb-6">Your recorded live sessions will appear here after they're processed.</p>
              <Link to="/learner/live-classes" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Go to Live Classes
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">My Ratings & Reviews</h2>
          <p className="text-gray-600 mb-8">View and manage your course ratings and reviews.</p>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center">
                <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No ratings yet</h3>
                <p className="text-gray-500 mb-6">Your course ratings and reviews will appear here after you complete courses.</p>
                <Link to="/learner/courses" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Browse Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Review Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {reviews.filter(r => r.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reviews.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">
                    {(reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {review.title || 'Untitled Review'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {review.review.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              review.status === 'approved' ? 'bg-green-100 text-green-800' :
                              review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`text-sm ${
                                star <= review.overallRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link to="/learner/ratings" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                    View All Reviews
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tutor-feedback' && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Tutor Feedback</h2>
          <p className="text-gray-600 mb-8">Share your thoughts on teaching quality and help improve the learning experience.</p>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to give feedback?</h3>
              <p className="text-gray-500 mb-6">Your feedback helps tutors improve and other learners make informed decisions.</p>
              <Link to="/learner/tutor-feedback" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Go to Tutor Feedback
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment History</h2>
          <p className="text-gray-600 mb-8">Track all your course payments and transactions.</p>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <FaDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No payment history yet</h3>
              <p className="text-gray-500 mb-6">Your payment records will appear here after you enroll in courses.</p>
              <Link to="/learner/courses" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h2>
          <p className="text-gray-600 mb-8">Stay updated with important announcements and updates.</p>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">All caught up!</h3>
              <p className="text-gray-500 mb-6">You have no new notifications at the moment.</p>
              <Link to="/learner/notifications" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                View All Notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerDashboard;
