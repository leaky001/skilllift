import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePayment } from '../../context/PaymentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCreditCard, 
  FaChartLine, 
  FaDollarSign, 
  FaUsers, 
  FaCalendarAlt, 
  FaDownload,
  FaEye,
  FaFilter,
  FaSearch,
  FaSort,
  FaArrowUp,
  FaArrowDown,
  FaReceipt,
  FaWallet,
  FaPercent,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import { 
  getTutorPayments,
  getTutorEarningsReport,
  getTutorPaymentHistory,
  requestWithdrawal
} from '../../services/tutorService';
import { showSuccess, showError } from '../../services/toastService.jsx';

const TutorPayments = () => {
  const { paymentHistory, getPaymentStats, calculateCommission } = usePayment();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [payments, setPayments] = useState([]);
  const [earningsReport, setEarningsReport] = useState({});
  const [loading, setLoading] = useState(true);

  // Load payments data
  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      
      const [paymentsResponse, earningsResponse] = await Promise.all([
        getTutorPayments(),
        getTutorEarningsReport('all') // Changed from 'month' to 'all'
      ]);

      console.log('🔍 Payments response:', paymentsResponse);
      console.log('🔍 Earnings response:', earningsResponse);

      if (paymentsResponse.success) {
        console.log('📊 Payments data:', paymentsResponse.data);
        setPayments(paymentsResponse.data || []);
      }

      if (earningsResponse.success) {
        console.log('💰 Earnings data:', earningsResponse.data);
        setEarningsReport(earningsResponse.data || {});
      }
    } catch (error) {
      console.error('Error loading payments data:', error);
      showError('Error loading payments data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async (withdrawalData) => {
    try {
      const response = await requestWithdrawal(withdrawalData);
      if (response.success) {
        showSuccess('Withdrawal request submitted successfully');
        loadPaymentsData(); // Reload data
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      showError('Error requesting withdrawal. Please try again.');
    }
  };

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const stats = {
    totalEarnings: earningsReport.totalEarnings || 0,
    monthlyEarnings: earningsReport.monthlyEarnings || 0,
    totalStudents: payments.length,
    averageEarning: payments.length > 0 ? (earningsReport.totalEarnings || 0) / payments.length : 0,
    commissionRate: earningsReport.commissionRate || 0.1
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
        return <FaArrowUp className="w-4 h-4" />;
      case 'pending':
        return <FaCalendarAlt className="w-4 h-4" />;
      case 'failed':
        return <FaArrowDown className="w-4 h-4" />;
      default:
        return <FaCalendarAlt className="w-4 h-4" />;
    }
  };

  // Calculate tutor-specific statistics
  const getTutorStats = () => {
    console.log('🔍 Calculating tutor stats from payments:', payments);
    
    const totalEarnings = payments.reduce((sum, payment) => {
      console.log(`  - Payment ${payment._id}: tutorAmount=${payment.tutorAmount}`);
      return sum + (payment.tutorAmount || 0);
    }, 0);
    
    const totalCommission = payments.reduce((sum, payment) => sum + (payment.commissionAmount || 0), 0);
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const averageEarning = payments.length > 0 ? totalEarnings / payments.length : 0;
    
    const stats = {
      totalEarnings,
      totalCommission,
      totalRevenue,
      averageEarning,
      totalPayments: payments.length,
      commissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
    };
    
    console.log('📊 Calculated tutor stats:', stats);
    return stats;
  };

  const tutorStats = getTutorStats();

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment._id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    // Tab-based filtering
    let matchesTab = true;
    switch (activeTab) {
      case 'overview':
        matchesTab = true; // Show all payments
        break;
      case 'earnings':
        matchesTab = payment.status === 'successful'; // Only successful payments
        break;
      case 'pending':
        matchesTab = payment.status === 'pending'; // Only pending payments
        break;
      default:
        matchesTab = true;
    }
    
    const matches = matchesSearch && matchesStatus && matchesTab;
    
    // Debug logging for first few payments
    if (payments.indexOf(payment) < 3) {
      console.log(`🔍 Payment ${payment._id}:`, {
        status: payment.status,
        matchesSearch,
        matchesStatus,
        matchesTab,
        finalMatch: matches,
        activeTab,
        filterStatus
      });
    }
    
    return matches;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'amount':
        return b.amount - a.amount;
      case 'course':
        return a.course?.title?.localeCompare(b.course?.title);
      default:
        return 0;
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', count: payments.length },
    { id: 'earnings', label: 'Earnings', count: payments.filter(p => p.status === 'successful').length },
    { id: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
  ];

  console.log('🔍 Tab counts:', {
    total: payments.length,
    successful: payments.filter(p => p.status === 'successful').length,
    pending: payments.filter(p => p.status === 'pending').length,
    activeTab,
    filteredCount: filteredPayments.length
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
              <p className="text-gray-600 mt-1">Track your earnings and payment performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <FaDownload className="w-4 h-4 mr-2 inline" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-600">{formatPrice(tutorStats.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaWallet className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-emerald-600">
              <FaArrowUp className="w-4 h-4 mr-1" />
              <span>+12.5% this month</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(tutorStats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <FaUsers className="w-4 h-4 mr-1" />
              <span>{tutorStats.totalPayments} payments</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                <p className="text-2xl font-bold text-orange-600">{formatPrice(tutorStats.totalCommission)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaPercent className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-orange-600">
              <span>{tutorStats.commissionRate.toFixed(1)}% rate</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Payment</p>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(tutorStats.averageEarning)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaChartLine className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-purple-600">
              <FaArrowUp className="w-4 h-4 mr-1" />
              <span>Per transaction</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments by course or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="course">Sort by Course</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Records</h3>
          </div>
          
          {sortedPayments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <FaReceipt className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{payment.course?.title || 'Course Payment'}</h4>
                        <p className="text-sm text-gray-500">Payment ID: {payment._id}</p>
                        <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FaUsers className="w-4 h-4 mr-1" />
                            Learner: {payment.user?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center">
                            <FaCreditCard className="w-4 h-4 mr-1" />
                            {payment.paymentType} payment
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="capitalize">{payment.status}</span>
                          </div>
                          
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-medium text-gray-800">{formatPrice(payment.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Commission:</span>
                              <span className="font-medium text-orange-600">-{formatPrice(payment.commissionAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1">
                              <span className="text-gray-800 font-semibold">You Earn:</span>
                              <span className="font-bold text-emerald-600">{formatPrice(payment.tutorAmount)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <FaDownload className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">Start by creating courses to see your payment history</p>
            </div>
          )}
        </div>

        {/* Earnings Insights */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaChartLine className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">Earnings Insights</h3>
              <ul className="space-y-2 text-emerald-800 text-sm">
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Platform commission is 10-15% of total course price
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Payments are processed securely via Paystack
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Earnings are transferred to your account after commission deduction
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Track your performance and optimize course pricing for better earnings
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPayments;
