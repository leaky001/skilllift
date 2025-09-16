import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaDollarSign, 
  FaExclamationTriangle, 
  FaShieldAlt,
  FaEye,
  FaEdit,
  FaBan,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaCog,
  FaBell,
  FaGraduationCap,
  FaUserGraduate,
  FaUserTie,
  FaClipboardList,
  FaHandshake,
  FaCreditCard,
  FaFileAlt,
  FaFlag,
  FaLock,
  FaUnlock,
  FaRocket,
  FaFlask,
  FaSpinner,
  FaBookOpen,
  FaUserClock,
  FaEnvelope
} from 'react-icons/fa';
import { 
  getDashboardStats, 
  getPendingUsers,
  getRecentUsers, 
  getRecentTransactions, 
  getComplaints 
} from '../../services/adminService';
import { showError } from '../../services/toastService.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Real data state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel with error handling
      const [
        statsResponse,
        usersResponse,
        transactionsResponse,
        complaintsResponse
      ] = await Promise.allSettled([
        getDashboardStats(),
        getPendingUsers(),
        getRecentTransactions(10),
        getComplaints({ limit: 10, status: 'open' })
      ]);

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        const overview = statsResponse.value.data.overview || {};
        const statsArray = [
          {
            id: 'totalUsers',
            title: 'Total Users',
            value: overview.totalUsers || 0,
            icon: FaUsers,
            color: 'blue'
          },
          {
            id: 'totalRevenue',
            title: 'Total Revenue',
            value: `$${overview.totalRevenue || 0}`,
            icon: FaDollarSign,
            color: 'green'
          },
          {
            id: 'totalCourses',
            title: 'Total Courses',
            value: overview.totalCourses || 0,
            icon: FaGraduationCap,
            color: 'purple'
          }
        ];
        setStats(statsArray);
      } else {
        // Fallback stats if API fails
        setStats([
          { id: 'totalUsers', title: 'Total Users', value: 156, icon: FaUsers, color: 'blue' },
          { id: 'totalRevenue', title: 'Total Revenue', value: '$12,450', icon: FaDollarSign, color: 'green' },
          { id: 'totalCourses', title: 'Total Courses', value: 28, icon: FaGraduationCap, color: 'purple' }
        ]);
      }
      
      // Handle courses response - Always show sample data for now
      const sampleCourses = [
        {
          _id: '1',
          title: 'Advanced React Development',
          tutor: { name: 'John Smith', email: 'john@example.com' },
          category: 'Web Development',
          price: 299,
          createdAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          _id: '2',
          title: 'Python Data Science',
          tutor: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          category: 'Data Science',
          price: 399,
          createdAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          _id: '3',
          title: 'UI/UX Design Fundamentals',
          tutor: { name: 'Mike Chen', email: 'mike@example.com' },
          category: 'Design',
          price: 199,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ];
      
      // Course approval removed - courses are published directly
      setPendingCourses([]);
      
      // Handle users response
      if (usersResponse.status === 'fulfilled' && usersResponse.value.success) {
        setRecentUsers(usersResponse.value.data || []);
      } else {
        // Sample recent users for demonstration
        setRecentUsers([
          {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'tutor',
            accountStatus: 'active',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Bob Wilson',
            email: 'bob@example.com',
            role: 'learner',
            accountStatus: 'active',
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            name: 'Carol Davis',
            email: 'carol@example.com',
            role: 'tutor',
            accountStatus: 'pending',
            createdAt: new Date().toISOString()
          }
        ]);
      }
      
      // Handle transactions response
      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        setRecentTransactions(transactionsResponse.value.data || []);
      } else {
        setRecentTransactions([]);
      }
      
      // Handle complaints response
      if (complaintsResponse.status === 'fulfilled' && complaintsResponse.value.success) {
        setComplaints(complaintsResponse.value.data || []);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback data
      setStats([
        { id: 'totalUsers', title: 'Total Users', value: 0, icon: FaUsers, color: 'blue' },
        { id: 'totalRevenue', title: 'Total Revenue', value: '$0', icon: FaDollarSign, color: 'green' },
        { id: 'totalCourses', title: 'Total Courses', value: 0, icon: FaGraduationCap, color: 'purple' }
      ]);
      setRecentUsers([]);
      setRecentTransactions([]);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };


  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
          <p className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'primary' ? 'bg-blue-100 text-blue-600' :
          color === 'success' ? 'bg-green-100 text-green-600' :
          color === 'accent' ? 'bg-yellow-100 text-yellow-600' :
          'bg-red-100 text-red-600'
        }`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </motion.div>
  );

  const UserCard = ({ user }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-4 shadow-md border border-neutral-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-neutral-900 mb-1">{user.name}</h4>
          <p className="text-sm text-neutral-600 mb-2">{user.email}</p>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.role === 'tutor' ? 'bg-blue-100 text-blue-800' : 'bg-cyan-100 text-cyan-800'
            }`}>
              {user.role}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.accountStatus}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            className="p-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <FaEye />
          </button>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
            <FaCheck />
          </button>
          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
            <FaBan />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const TransactionCard = ({ transaction }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-4 shadow-md border border-neutral-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-neutral-900 mb-1">
            {transaction.user?.name || transaction.user?.email || 'Unknown User'}
          </h4>
          <p className="text-sm text-neutral-600 mb-2">
            {transaction.course?.title || 'Unknown Course'}
          </p>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {transaction.status}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {transaction.paymentMethod}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-neutral-900">${transaction.amount}</p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            <FaEye />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ComplaintCard = ({ complaint }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-4 shadow-md border border-neutral-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-neutral-900 mb-1">{complaint.subject || 'No Subject'}</h4>
          <p className="text-sm text-neutral-600 mb-2">
            by {complaint.user?.name || complaint.user?.email || 'Unknown User'}
          </p>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              complaint.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {complaint.priority || 'normal'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              complaint.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {complaint.status || 'open'}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {new Date(complaint.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              setSelectedUser(complaint);
              setShowComplaintModal(true);
            }}
            className="p-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <FaEye />
          </button>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
            <FaCheck />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard 🛡️</h1>
              <p className="text-slate-600 mt-1">Monitor and manage the platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => console.log('Quick Test clicked')}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <FaFlask className="h-4 w-4" />
                <span>Quick Test</span>
              </button>
              <button 
                onClick={() => console.log('Full Test clicked')}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <FaRocket className="h-4 w-4" />
                <span>Full Test</span>
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, courses..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64 transition-colors"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <FaFilter className="text-xl" />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <FaCog className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.id || stat.title || index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          {['overview', 'user-management', 'messages', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Recent User Registrations */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Recent User Registrations</h2>
                <Link 
                  to="/admin/users"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Users
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentUsers.map((user) => (
                  <UserCard key={user._id || user.id} user={user} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/admin/users" className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors text-center">
                  <FaUserCheck className="mx-auto mb-2 text-2xl" />
                  <span className="block font-medium">User Management</span>
                </Link>
                <Link to="/admin/messages" className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors text-center">
                  <FaEnvelope className="mx-auto mb-2 text-2xl" />
                  <span className="block font-medium">Messages</span>
                </Link>
                <Link to="/admin/analytics" className="bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 transition-colors text-center">
                  <FaChartLine className="mx-auto mb-2 text-2xl" />
                  <span className="block font-medium">Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'user-management' && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">User Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentUsers.map((user) => (
                <UserCard key={user._id || user.id} user={user} />
              ))}
            </div>
          </div>
        )}


        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Messages to Tutors</h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Admin Messaging System</h3>
                <p className="text-gray-500 mb-6">Send messages to tutors and manage communications.</p>
                <Link 
                  to="/admin/tutor-messages" 
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Tutor Messages
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Platform Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Analytics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUsers className="mr-2 text-blue-600" />
                  User Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold">{stats.find(s => s.id === 'totalUsers')?.value || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Tutors</span>
                    <span className="font-semibold">{recentUsers.filter(u => u.role === 'tutor').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Learners</span>
                    <span className="font-semibold">{recentUsers.filter(u => u.role === 'learner').length}</span>
                  </div>
                </div>
              </div>

              {/* Course Analytics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBookOpen className="mr-2 text-green-600" />
                  Course Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Courses</span>
                    <span className="font-semibold">{stats.find(s => s.id === 'totalCourses')?.value || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published Courses</span>
                    <span className="font-semibold">{stats.find(s => s.id === 'totalCourses')?.value || 0}</span>
                  </div>
                </div>
              </div>

              {/* Revenue Analytics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaDollarSign className="mr-2 text-yellow-600" />
                  Revenue Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold">{stats.find(s => s.id === 'totalRevenue')?.value || '$0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className="font-semibold text-green-600">+0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals will be added here */}
    </div>
  );
};

export default AdminDashboard;
