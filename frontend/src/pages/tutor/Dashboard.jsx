import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getTutorDashboardStats,
  getTutorRecentLearners,
  getTutorUpcomingSessions,
  getTutorRecentNotifications,
  getTutorCoursePerformance,
  getTutorEarnings
} from '../../services/tutorService';
import { showError } from '../../services/toastService.jsx';
import TutorRatingDashboard from '../../components/rating/TutorRatingDashboard';

import { 
  FaUser, 
  FaUsers, 
  FaDollarSign, 
  FaChartLine, 
  FaPlay,
  FaCalendarAlt,
  FaStar,
  FaPlus,
  FaVideo,
  FaBookOpen,
  FaGraduationCap,
  FaClock,
  FaTrophy,
  FaArrowRight,
  FaSearch,
  FaHome,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaChevronDown,
  FaUserGraduate,
  FaCreditCard
} from 'react-icons/fa';

const TutorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentLearners, setRecentLearners] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [earnings, setEarnings] = useState({});

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
  }, [isAuthenticated]);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const testDashboardAPI = async () => {
    console.log('🧪 Testing dashboard API manually...');
    console.log('🔐 User:', user);
    console.log('🔐 Is Authenticated:', isAuthenticated);
    console.log('📊 Current stats state:', stats);
    console.log('📊 Stats length:', stats.length);
    
    try {
      const response = await getTutorDashboardStats();
      console.log('✅ Manual API test successful:', response);
      console.log('📊 API response data:', response.data);
      console.log('📊 API response success:', response.data.success);
      console.log('📊 API response data array:', response.data.data);
      console.log('📊 API response data length:', response.data.data?.length);
    } catch (error) {
      console.error('❌ Manual API test failed:', error);
      console.error('❌ Error response:', error.response?.data);
    }
  };

  const loadDashboardData = async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping dashboard data load');
      return;
    }

    try {
      setLoading(true);
      
      // Load dashboard data sequentially to avoid rate limiting
      console.log('🔄 Loading dashboard data sequentially...');
      
      // Load stats first
      try {
        console.log('🔄 Loading tutor dashboard stats...');
        const statsResponse = await getTutorDashboardStats();
        console.log('📊 Stats response:', statsResponse);
        console.log('📊 Stats response success:', statsResponse.success);
        console.log('📊 Stats response data:', statsResponse.data);
        console.log('📊 Stats response data length:', statsResponse.data?.length);
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data || []);
          console.log('✅ Stats loaded successfully:', statsResponse.data.data);
          console.log('✅ Stats state updated, length:', statsResponse.data.data?.length);
        } else {
          console.warn('⚠️ Stats response not successful:', statsResponse.data);
        }
      } catch (error) {
        console.error('❌ Error loading stats:', error);
        console.error('❌ Error details:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
      }
      
      // Load learners
      try {
        const learnersResponse = await getTutorRecentLearners(5);
        if (learnersResponse.data.success) {
          setRecentLearners(learnersResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading learners:', error);
      }
      
      // Load sessions
      try {
        const sessionsResponse = await getTutorUpcomingSessions();
        if (sessionsResponse.data.success) {
          setUpcomingSessions(sessionsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
      
      // Load notifications
      try {
        const notificationsResponse = await getTutorRecentNotifications(5);
        if (notificationsResponse.data.success) {
          setRecentNotifications(notificationsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
      
      // Load performance
      try {
        const performanceResponse = await getTutorCoursePerformance('month');
        if (performanceResponse.data.success) {
          setCoursePerformance(performanceResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading performance:', error);
      }
      
      // Load earnings
      try {
        const earningsResponse = await getTutorEarnings('month');
        if (earningsResponse.data.success) {
          setEarnings(earningsResponse.data.data || {});
        }
      } catch (error) {
        console.error('Error loading earnings:', error);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('Authentication error, redirecting to login');
        localStorage.removeItem('skilllift_user');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      showError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Default stats structure for loading state
  const defaultStats = [
    { 
      title: 'Total Courses', 
      value: '42', 
      icon: FaBookOpen, 
      color: 'text-blue-600', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      change: '+2 this month'
    },
    { 
      title: 'Upcoming', 
      value: '5', 
      icon: FaVideo, 
      color: 'text-blue-600', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      change: 'Next in 2 hours'
    },
    { 
      title: 'Total Learners', 
      value: '234', 
      icon: FaUsers, 
      color: 'text-blue-600', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      change: '+18 this week'
    },
    { 
      title: 'Monthly', 
      value: '₦245,000', 
      icon: FaDollarSign, 
      color: 'text-blue-600', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      change: '+12% vs last month'
    }
  ];

    // Use real data or default structure
  const displayStats = loading ? [] : stats;
  const displayLearners = loading ? [] : recentLearners;
  const displaySessions = loading ? [] : upcomingSessions;
  const displayNotifications = loading ? [] : recentNotifications;
  const displayPerformance = loading ? [] : coursePerformance;

  // Default learners data for loading state
  const defaultLearners = [
    {
      id: 1,
      name: 'Muiz Abass',
      course: 'JavaScript Fundamentals',
      signupDate: 'Jan 15, 2025',
      avatar: 'MA',
      progress: 75,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Mistura Rokibat',
      course: 'React Development',
      signupDate: 'Jan 14, 2025',
      avatar: 'MR',
      progress: 60,
      rating: 4.9
    },
    {
      id: 3,
      name: 'Ridwan Idris',
      course: 'Python for Beginners',
      signupDate: 'Jan 13, 2025',
      avatar: 'RI',
      progress: 45,
      rating: 4.7
    }
  ];

  // Default data structures for loading state
  const defaultNotifications = [
    {
      id: 1,
      title: 'New Learner Enrolled',
      message: 'Muiz Abass joined JavaScript Fundamentals course',
      time: '2 hours ago',
      type: 'enrollment',
      read: false
    },
    {
      id: 2,
      title: 'Live Session Reminder',
      message: 'Your React Development class starts in 2 hours',
      time: '4 hours ago',
      type: 'live',
      read: false
    },
    {
      id: 3,
      title: 'Payment Received',
      message: '₦15,000 received for Python course',
      time: '1 day ago',
      type: 'payment',
      read: true
    }
  ];

  const defaultSessions = [
    {
      id: 1,
      title: 'JavaScript Fundamentals - Variables & Functions',
      date: 'JAN 25',
      time: '2:00 PM - 3:30 PM',
      learners: 24,
      status: 'ready'
    },
    {
      id: 2,
      title: 'React Development - Advanced Hooks',
      date: 'JAN 26',
      time: '10:00 AM - 12:00 PM',
      learners: 18,
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Python for Beginners - Data Types',
      date: 'JAN 27',
      time: '4:00 PM - 5:30 PM',
      learners: 31,
      status: 'scheduled'
    }
  ];

  const defaultPerformance = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      learners: 89,
      completion: 78,
      rating: 4.8,
      earnings: '₦89,000'
    },
    {
      id: 2,
      title: 'React Development',
      learners: 67,
      completion: 82,
      rating: 4.9,
      earnings: '₦67,000'
    },
    {
      id: 3,
      title: 'Python for Beginners',
      learners: 45,
      completion: 71,
      rating: 4.7,
      earnings: '₦45,000'
    }
  ];

  // Icon mapping for backend icon names
  const iconMap = {
    'FaBookOpen': FaBookOpen,
    'FaVideo': FaVideo,
    'FaUsers': FaUsers,
    'FaDollarSign': FaDollarSign,
    'FaUser': FaUser,
    'FaChartLine': FaChartLine,
    'FaPlay': FaPlay,
    'FaCalendarAlt': FaCalendarAlt,
    'FaStar': FaStar,
    'FaPlus': FaPlus,
    'FaGraduationCap': FaGraduationCap,
    'FaClock': FaClock,
    'FaTrophy': FaTrophy,
    'FaArrowRight': FaArrowRight,
    'FaSearch': FaSearch,
    'FaHome': FaHome,
    'FaEnvelope': FaEnvelope,
    'FaCog': FaCog,
    'FaSignOutAlt': FaSignOutAlt,
    'FaBell': FaBell,
    'FaChevronDown': FaChevronDown,
    'FaUserGraduate': FaUserGraduate,
    'FaCreditCard': FaCreditCard
  };

  const StatCard = ({ title, value, icon, color, bgColor, borderColor, gradient, change }) => {
    // Get the actual icon component from the icon name
    const IconComponent = iconMap[icon] || FaBookOpen; // Default fallback
    
    return (
      <div className={`${bgColor} border ${borderColor} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <IconComponent className="text-xl text-white" />
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-secondary-100 text-secondary-800 rounded-full font-medium">
              {change}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    );
  };

  const LearnerCard = ({ learner }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {learner.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-lg">{learner.name}</h4>
          <p className="text-slate-600 mb-2">{learner.course}</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <FaStar className="text-accent-400" />
              <span className="text-slate-700">{learner.rating}</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-700">{learner.progress}% complete</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">{learner.signupDate}</span>
          <button className="mt-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );

  const NotificationCard = ({ notification }) => (
    <div className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-l-4 ${
      !notification.read ? 'border-l-primary-500' : 'border-l-slate-300'
    } border border-slate-100`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-xl ${
          notification.type === 'enrollment' ? 'bg-primary-100 text-primary-600' :
          notification.type === 'live' ? 'bg-secondary-100 text-secondary-600' :
          notification.type === 'payment' || notification.type === 'payment_received' ? 'bg-accent-100 text-accent-600' :
          'bg-primary-100 text-primary-600'
        }`}>
          {notification.type === 'enrollment' && <FaUserGraduate className="text-lg" />}
          {notification.type === 'live' && <FaVideo className="text-lg" />}
          {(notification.type === 'payment' || notification.type === 'payment_received') && <FaCreditCard className="text-lg" />}
          {notification.type === 'review' && <FaStar className="text-lg" />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{notification.title}</h4>
          <p className="text-slate-700 mb-2">{notification.message}</p>
          <span className="text-sm text-slate-500">{notification.time}</span>
        </div>
        {!notification.read && (
          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
        )}
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-slate-100">
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
            <span>{session.learners} learners enrolled</span>
          </div>
        </div>
        <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
          session.status === 'ready' 
            ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700' 
            : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white hover:from-slate-500 hover:to-slate-600'
        }`}>
          {session.status === 'ready' ? 'Start Now' : 'Edit Session'}
        </button>
      </div>
    </div>
  );

  const CoursePerformanceCard = ({ course }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900 text-lg">{course.title}</h4>
        <div className="flex items-center space-x-1">
          <FaStar className="text-accent-400" />
          <span className="font-medium">{course.rating}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{course.learners}</div>
          <div className="text-sm text-slate-600">Learners</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-600">{course.completion}%</div>
          <div className="text-sm text-slate-600">Completion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-600">{course.earnings}</div>
          <div className="text-sm text-slate-600">Earnings</div>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
        View Details
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name || 'Tutor'}! 👋</h1>
            <p className="text-xl text-secondary-100">Here's what's happening with your courses today.</p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-sm font-medium">Active Courses: {stats.find(s => s.title === 'Total Courses')?.value || '0'}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-sm font-medium">Total Learners: {stats.find(s => s.title === 'Total Learners')?.value || '0'}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-sm font-medium">This Month: ₦{stats.find(s => s.title === 'Monthly')?.value || '0'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={testDashboardAPI}
            className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            🧪 Test API
          </button>
        </div>
      </div>

      

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(() => {
          console.log('🎨 Rendering stats cards...');
          console.log('📊 Loading state:', loading);
          console.log('📊 Display stats:', displayStats);
          console.log('📊 Display stats length:', displayStats.length);
          
          if (loading) {
            console.log('🎨 Showing loading state');
            return Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div className="w-16 h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-6 bg-slate-200 rounded"></div>
                  <div className="w-12 h-8 bg-slate-200 rounded"></div>
                </div>
              </div>
            ));
          } else if (displayStats.length > 0) {
            console.log('🎨 Showing stats cards with data');
            return displayStats.map((stat, index) => (
              <StatCard key={`stat-${stat.id || stat.title || index}`} {...stat} />
            ));
          } else {
            console.log('🎨 Showing empty state');
            return (
              <div className="col-span-full bg-white rounded-2xl shadow-lg p-8 border border-slate-100 text-center">
                <div className="text-slate-400 mb-4">
                  <FaChartLine className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Dashboard Data</h3>
                <p className="text-slate-500">Start by creating your first course to see statistics here.</p>
              </div>
            );
          }
        })()}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2 border border-slate-200">
        <div className="flex space-x-1">
          {['overview', 'sessions', 'performance', 'ratings', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Overview Section */}
          <div className="space-y-8">
            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Course Performance</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Last 30 days</span>
                    <div className="w-3 h-3 bg-secondary-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{stats.find(s => s.title === 'Completion Rate')?.value || '0%'}</div>
                    <div className="text-sm text-blue-700">Completion Rate</div>
                    <div className="text-xs text-blue-600 mt-1">{stats.find(s => s.title === 'Completion Rate')?.change || 'No data'}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{stats.find(s => s.title === 'Average Rating')?.value || '0.0'}</div>
                    <div className="text-sm text-blue-700">Average Rating</div>
                    <div className="text-xs text-blue-600 mt-1">{stats.find(s => s.title === 'Average Rating')?.change || 'No data'}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{stats.find(s => s.title === 'Total Learners')?.value || '0'}</div>
                    <div className="text-sm text-blue-700">Active Learners</div>
                    <div className="text-xs text-blue-600 mt-1">{stats.find(s => s.title === 'Total Learners')?.change || 'No data'}</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FaDollarSign className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">Today's Earnings</div>
                        <div className="text-lg font-bold text-slate-900">₦{stats.find(s => s.title === 'Today\'s Earnings')?.value || '0'}</div>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">+15%</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FaVideo className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">Live Sessions</div>
                        <div className="text-lg font-bold text-slate-900">3 Today</div>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">Next: 2:00 PM</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FaUsers className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">New Enrollments</div>
                        <div className="text-lg font-bold text-slate-900">{stats.find(s => s.title === 'New Enrollments')?.value || '0'} Today</div>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">+25%</div>
                  </div>
                </div>
              </div>
            </div>


          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Learners Signups */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Recent Learner Signups</h2>
                  <Link to="/tutor/learners" className="text-secondary-600 hover:text-secondary-700 font-medium flex items-center space-x-2">
                    <span>View All</span>
                    <FaArrowRight className="text-sm" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {displayLearners.map((learner) => (
                    <LearnerCard key={`learner-${learner._id || learner.id}`} learner={learner} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Recent Notifications</h2>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {recentNotifications.slice(0, 4).map((notification, index) => (
                    <NotificationCard key={`recent-notification-${notification._id || notification.id || `fallback-${index}`}`} notification={notification} />
                  ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'sessions' && (
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Upcoming Live Sessions</h2>
          <div className="space-y-4">
            {displaySessions.map((session) => (
              <SessionCard key={`session-${session._id || session.id}`} session={session} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Course Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPerformance.map((course) => (
              <CoursePerformanceCard key={`course-${course._id || course.id}`} course={course} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Course Ratings & Reviews</h2>
          <TutorRatingDashboard />
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">All Notifications</h2>
          <div className="space-y-4">
            {recentNotifications.map((notification, index) => (
              <NotificationCard key={`all-notification-${notification._id || notification.id || `fallback-${index}`}`} notification={notification} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
