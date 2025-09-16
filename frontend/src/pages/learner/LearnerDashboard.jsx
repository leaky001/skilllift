import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBookOpen, 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaTrophy,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaUpload,
  FaFileAlt,
  FaVideo,
  FaLink,
  FaStar,
  FaAward,
  FaCertificate,
  FaPlay,
  FaPause,
  FaStop,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaShare,
  FaBookmark,
  FaHeart,
  FaComment,
  FaThumbsUp,
  FaThumbsDown,
  FaFlag,
  FaReport,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaInfoCircle,
  FaQuestionCircle,
  FaExclamationCircle,
  FaCheckDouble,
  FaArrowRight,
  FaArrowLeft,
  FaHome,
  FaList,
  FaGrid,
  FaBars,
  FaTimes as FaClose
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { getMyEnrollments, getMyLiveClasses } from '../../services/enrollmentService';
import { getMyAssignments, getMySubmissions } from '../../services/assignmentService';
import { getMyNotifications } from '../../services/notificationService';

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadDashboardData();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load enrollments
      const enrollmentsResponse = await getMyEnrollments();
      if (enrollmentsResponse.success) {
        setEnrollments(enrollmentsResponse.data || []);
      }

      // Load assignments
      const assignmentsResponse = await getMyAssignments();
      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data || []);
      }

      // Load submissions
      const submissionsResponse = await getMySubmissions();
      if (submissionsResponse.success) {
        setSubmissions(submissionsResponse.data || []);
      }

      // Load live classes
      const liveClassesResponse = await getMyLiveClasses();
      if (liveClassesResponse.success) {
        setLiveClasses(liveClassesResponse.data || []);
      }

      // Load notifications
      const notificationsResponse = await getMyNotifications();
      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getProgressStats = () => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const activeCourses = enrollments.filter(e => e.status === 'active').length;
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter(s => s.status === 'graded').length;
    const pendingAssignments = assignments.filter(a => 
      !submissions.find(s => s.assignment === a._id)
    ).length;

    return {
      totalCourses,
      completedCourses,
      activeCourses,
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
      assignmentCompletionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
    };
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const upcomingAssignments = assignments
      .filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const timeDiff = dueDate - now;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff > 0 && daysDiff <= 7; // Within next 7 days
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    return upcomingAssignments;
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent submissions
    submissions.slice(0, 3).forEach(submission => {
      activities.push({
        type: 'submission',
        title: `Submitted assignment: ${submission.assignment?.title}`,
        date: submission.submittedAt,
        status: submission.status,
        icon: FaUpload
      });
    });

    // Add recent grades
    submissions.filter(s => s.status === 'graded').slice(0, 3).forEach(submission => {
      activities.push({
        type: 'grade',
        title: `Assignment graded: ${submission.assignment?.title}`,
        date: submission.gradedAt,
        grade: submission.grade,
        icon: FaCheckCircle
      });
    });

    // Add recent enrollments
    enrollments.slice(0, 3).forEach(enrollment => {
      activities.push({
        type: 'enrollment',
        title: `Enrolled in: ${enrollment.course?.title}`,
        date: enrollment.enrolledAt,
        status: enrollment.status,
        icon: FaBookOpen
      });
    });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    showSuccess('Logged out successfully');
  };

  const stats = getProgressStats();
  const upcomingDeadlines = getUpcomingDeadlines();
  const recentActivity = getRecentActivity();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Learner Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <FaBell className="text-xl" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: FaHome },
              { id: 'courses', label: 'My Courses', icon: FaBookOpen },
              { id: 'assignments', label: 'Assignments', icon: FaFileAlt },
              { id: 'live-classes', label: 'Live Classes', icon: FaVideo },
              { id: 'progress', label: 'Progress', icon: FaChartLine }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FaBookOpen className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FaCheckCircle className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <FaFileAlt className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <FaTrophy className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h3>
                </div>
                <div className="p-6">
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingDeadlines.map((assignment, index) => (
                        <motion.div
                          key={assignment._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-sm text-gray-500">{assignment.course?.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <activity.icon className="text-sm" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                          {activity.grade && (
                            <span className="text-sm font-medium text-green-600">{activity.grade}</span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="all">All Courses</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {enrollments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments
                      .filter(enrollment => filterStatus === 'all' || enrollment.status === filterStatus)
                      .map((enrollment, index) => (
                        <motion.div
                          key={enrollment._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900">{enrollment.course?.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              enrollment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {enrollment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{enrollment.course?.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Progress: {enrollment.progress}%
                            </div>
                            <Link
                              to={`/course/${enrollment.course?._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Continue Learning →
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No courses enrolled yet</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">My Assignments</h3>
                  <Link
                    to="/assignments"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View All Assignments
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.slice(0, 5).map((assignment, index) => {
                      const submission = submissions.find(s => s.assignment === assignment._id);
                      return (
                        <motion.div
                          key={assignment._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                              <p className="text-sm text-gray-500">{assignment.course?.title}</p>
                              <p className="text-sm text-gray-500">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {submission ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Submitted
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                              {submission?.grade && (
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  Grade: {submission.grade}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No assignments available</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Classes Tab */}
        {activeTab === 'live-classes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Live Classes</h3>
              </div>
              <div className="p-6">
                {liveClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveClasses.map((session, index) => (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{session.title}</h4>
                        <p className="text-sm text-gray-500 mb-4">{session.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <FaCalendarAlt className="inline mr-2" />
                            {new Date(session.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <FaClock className="inline mr-2" />
                            {new Date(session.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <Link
                          to={`/live-session/${session._id}`}
                          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Join Session
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No live classes scheduled</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Learning Progress</h3>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Course Progress</h4>
                  <div className="space-y-4">
                    {enrollments.map((enrollment, index) => (
                      <div key={enrollment._id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{enrollment.course?.title}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{enrollment.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Assignment Performance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="text-sm font-medium text-green-600">{stats.completedAssignments}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending</span>
                          <span className="text-sm font-medium text-yellow-600">{stats.pendingAssignments}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="text-sm font-medium text-blue-600">{stats.assignmentCompletionRate}%</span>
                        </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Achievements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.completedCourses > 0 && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <FaTrophy className="text-2xl text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">Course Completion</p>
                      <p className="text-xs text-green-600">{stats.completedCourses} courses completed</p>
                    </div>
                  )}
                  {stats.completedAssignments > 0 && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <FaCheckCircle className="text-2xl text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-800">Assignment Master</p>
                      <p className="text-xs text-blue-600">{stats.completedAssignments} assignments completed</p>
                    </div>
                  )}
                  {stats.completionRate >= 80 && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <FaAward className="text-2xl text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-purple-800">High Achiever</p>
                      <p className="text-xs text-purple-600">{stats.completionRate}% completion rate</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
