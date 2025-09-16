import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHandshake, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheck, 
  FaTimes,
  FaUser,
  FaUserTie,
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaChartLine
} from 'react-icons/fa';

const AdminMentorship = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock mentorship data
  const mentorships = [
    {
      id: 1,
              learner: 'Ridwan Idris',
      learnerEmail: 'john.doe@email.com',
              tutor: 'Mistura Rokibat',
      tutorEmail: 'sarah.j@email.com',
      type: 'career_coaching',
      status: 'active',
      startDate: '2024-01-15',
      lastSession: '2024-01-20',
      totalSessions: 8,
      rating: 4.8,
      progress: 75,
      amount: '₦25,000',
      description: 'Career transition from marketing to tech',
      goals: ['Learn programming basics', 'Build portfolio', 'Land first tech job'],
      nextSession: '2024-01-25',
      issues: []
    },
    {
      id: 2,
      learner: 'Jane Smith',
      learnerEmail: 'jane.smith@email.com',
              tutor: 'Muiz Abass',
      tutorEmail: 'm.chen@email.com',
      type: 'skill_development',
      status: 'pending',
      startDate: '2024-01-18',
      lastSession: null,
      totalSessions: 0,
      rating: null,
      progress: 0,
      amount: '₦30,000',
      description: 'Advanced digital marketing skills',
      goals: ['Master SEO', 'Learn PPC', 'Social media strategy'],
      nextSession: null,
      issues: ['Learner requested schedule change']
    },
    {
      id: 3,
      learner: 'Bob Johnson',
      learnerEmail: 'bob.j@email.com',
      tutor: 'Emma Wilson',
      tutorEmail: 'emma.w@email.com',
      type: 'business_coaching',
      status: 'completed',
      startDate: '2023-12-01',
      lastSession: '2024-01-10',
      totalSessions: 12,
      rating: 4.9,
      progress: 100,
      amount: '₦45,000',
      description: 'Startup business strategy and growth',
      goals: ['Business plan development', 'Funding strategy', 'Market analysis'],
      nextSession: null,
      issues: []
    },
    {
      id: 4,
      learner: 'Alice Brown',
      learnerEmail: 'alice.b@email.com',
      tutor: 'David Lee',
      tutorEmail: 'david.lee@email.com',
      type: 'academic_tutoring',
      status: 'suspended',
      startDate: '2024-01-10',
      lastSession: '2024-01-15',
      totalSessions: 3,
      rating: 3.2,
      progress: 25,
      amount: '₦20,000',
      description: 'Mathematics and statistics tutoring',
      goals: ['Improve grades', 'Understand concepts', 'Exam preparation'],
      nextSession: null,
      issues: ['Payment issues', 'Communication problems']
    }
  ];

  // Calculate statistics
  const totalMentorships = mentorships.length;
  const activeMentorships = mentorships.filter(m => m.status === 'active').length;
  const pendingMentorships = mentorships.filter(m => m.status === 'pending').length;
  const completedMentorships = mentorships.filter(m => m.status === 'completed').length;
  const suspendedMentorships = mentorships.filter(m => m.status === 'suspended').length;

  const totalRevenue = mentorships.reduce((sum, m) => {
    if (m.status === 'active' || m.status === 'completed') {
      return sum + parseInt(m.amount.replace(/[^\d]/g, ''));
    }
    return sum;
  }, 0);

  const filteredMentorships = mentorships.filter(mentorship => {
    const matchesSearch = mentorship.learner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentorship.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentorship.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || mentorship.status === filterStatus;
    const matchesType = filterType === 'all' || mentorship.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewMentorship = (mentorshipId) => {
    console.log('Viewing mentorship:', mentorshipId);
    // Open mentorship details modal
  };

  const handleApproveMentorship = (mentorshipId) => {
    console.log('Approving mentorship:', mentorshipId);
    // Update status to active
  };

  const handleSuspendMentorship = (mentorshipId, reason) => {
    console.log('Suspending mentorship:', mentorshipId, 'Reason:', reason);
    // Update status to suspended
  };

  const handleResolveIssue = (mentorshipId, issue) => {
    console.log('Resolving issue for mentorship:', mentorshipId, 'Issue:', issue);
    // Mark issue as resolved
  };

  const MentorshipCard = ({ mentorship }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-neutral-900">{mentorship.learner} → {mentorship.tutor}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              mentorship.status === 'active' ? 'bg-success-100 text-success-800' :
              mentorship.status === 'pending' ? 'bg-accent-100 text-accent-800' :
              mentorship.status === 'completed' ? 'bg-primary-100 text-primary-800' :
              'bg-error-100 text-error-800'
            }`}>
              {mentorship.status}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
              {mentorship.type.replace('_', ' ')}
            </span>
          </div>
          
          <p className="text-neutral-600 mb-2">{mentorship.description}</p>
          <p className="text-sm text-neutral-500 mb-3">Started: {mentorship.startDate}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-neutral-600">Amount</p>
              <p className="text-lg font-bold text-neutral-900">{mentorship.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Sessions</p>
              <p className="text-sm text-neutral-700">{mentorship.totalSessions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Progress</p>
              <p className="text-sm text-neutral-700">{mentorship.progress}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Rating</p>
              <p className="text-sm text-neutral-700">
                {mentorship.rating ? `${mentorship.rating}/5` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Goals */}
          <div className="mb-4">
            <p className="text-sm font-medium text-neutral-600 mb-2">Goals:</p>
            <div className="flex flex-wrap gap-2">
              {mentorship.goals.map((goal, index) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* Issues */}
          {mentorship.issues.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-error-600 mb-2">Issues:</p>
              <div className="flex flex-wrap gap-2">
                {mentorship.issues.map((issue, index) => (
                  <span key={index} className="px-2 py-1 bg-error-100 text-error-700 rounded-lg text-xs">
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleViewMentorship(mentorship.id)}
            className="p-2 text-accent-600 hover:text-accent-700 bg-accent-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye />
          </button>
          
          {mentorship.status === 'pending' && (
            <button
              onClick={() => handleApproveMentorship(mentorship.id)}
              className="p-2 text-success-600 hover:text-success-700 bg-success-50 rounded-lg transition-colors"
              title="Approve"
            >
              <FaCheck />
            </button>
          )}
          
          {mentorship.status === 'active' && (
            <button
              onClick={() => handleSuspendMentorship(mentorship.id, 'Admin decision')}
              className="p-2 text-error-600 hover:text-error-700 bg-error-50 rounded-lg transition-colors"
              title="Suspend"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-neutral-600">
          <span className="flex items-center space-x-1">
            <FaUser />
            <span>{mentorship.learnerEmail}</span>
          </span>
          <span className="flex items-center space-x-1">
            <FaUserTie />
            <span>{mentorship.tutorEmail}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {mentorship.nextSession && (
            <span className="text-sm text-neutral-600">
              Next: {mentorship.nextSession}
            </span>
          )}
          {mentorship.issues.length > 0 && (
            <button
              onClick={() => handleResolveIssue(mentorship.id, mentorship.issues[0])}
              className="px-3 py-1 text-sm bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200 transition-colors"
            >
              Resolve Issue
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-neutral-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-success-600' :
              changeType === 'negative' ? 'text-error-600' : 'text-accent-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'primary' ? 'bg-primary-100 text-primary-600' :
          color === 'success' ? 'bg-success-100 text-success-600' :
          color === 'accent' ? 'bg-accent-100 text-accent-600' :
          'bg-error-100 text-error-600'
        }`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Mentorship Management</h1>
              <p className="text-neutral-600 mt-1">Monitor and manage mentorship relationships</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-accent-600 text-neutral-900 px-4 py-2 rounded-lg font-medium hover:bg-accent-700 transition-colors flex items-center space-x-2">
                <FaChartLine />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total"
            value={totalMentorships}
            icon={FaHandshake}
            color="primary"
          />
          <StatCard
            title="Active"
            value={activeMentorships}
            change="+3"
            changeType="positive"
            icon={FaCheckCircle}
            color="success"
          />
          <StatCard
            title="Pending"
            value={pendingMentorships}
            change="+1"
            changeType="warning"
            icon={FaSpinner}
            color="accent"
          />
          <StatCard
            title="Completed"
            value={completedMentorships}
            change="+2"
            changeType="positive"
            icon={FaCheckCircle}
            color="primary"
          />
          <StatCard
            title="Suspended"
            value={suspendedMentorships}
            change="-1"
            changeType="negative"
            icon={FaTimesCircle}
            color="error"
          />
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Total Revenue</h3>
              <p className="text-3xl font-bold text-success-600">₦{(totalRevenue / 1000).toFixed(1)}K</p>
              <p className="text-sm text-neutral-600">From active and completed mentorships</p>
            </div>
            <div className="w-16 h-16 bg-success-100 rounded-xl flex items-center justify-center">
              <FaHandshake className="text-success-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by learner, tutor, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="career_coaching">Career Coaching</option>
                <option value="skill_development">Skill Development</option>
                <option value="business_coaching">Business Coaching</option>
                <option value="academic_tutoring">Academic Tutoring</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          {['all', 'active', 'pending', 'completed', 'suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-accent-500 text-neutral-900 shadow-lg'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Mentorships
            </button>
          ))}
        </div>

        {/* Mentorship List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMentorships
            .filter(mentorship => activeTab === 'all' || mentorship.status === activeTab)
            .map((mentorship) => (
              <MentorshipCard key={mentorship.id} mentorship={mentorship} />
            ))}
        </div>

        {filteredMentorships.length === 0 && (
          <div className="text-center py-12">
            <FaHandshake className="mx-auto text-4xl text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No mentorships found</h3>
            <p className="text-neutral-600">No mentorships match your current filters.</p>
          </div>
        )}

        {/* Analytics Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Mentorship Analytics</h3>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FaChartLine className="mx-auto text-4xl text-neutral-400 mb-2" />
              <p className="text-neutral-600">Mentorship analytics charts coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMentorship;
