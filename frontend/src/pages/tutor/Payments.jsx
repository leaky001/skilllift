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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading payments...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Payment Analytics</h1>
              <p className="text-slate-600 text-lg">Track your earnings and payment performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center bg-secondary-600 hover:bg-secondary-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                <FaDownload className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Earnings</p>
                <p className="text-3xl font-bold text-secondary-600 break-words">{formatPrice(tutorStats.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ml-3">
                <FaWallet className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-secondary-600 font-semibold">
              <FaArrowUp className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">+12.5% this month</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-primary-600 break-words">{formatPrice(tutorStats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ml-3">
                <FaDollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-primary-600 font-semibold">
              <FaUsers className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{tutorStats.totalPayments} payments</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600 mb-2">Platform Commission</p>
                <p className="text-3xl font-bold text-accent-600 break-words">{formatPrice(tutorStats.totalCommission)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ml-3">
                <FaPercent className="w-6 h-6 text-accent-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-accent-600 font-semibold">
              <span className="truncate">{tutorStats.commissionRate.toFixed(1)}% rate</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600 mb-2">Average Payment</p>
                <p className="text-3xl font-bold text-primary-600 break-words">{formatPrice(tutorStats.averageEarning)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ml-3">
                <FaChartLine className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-primary-600 font-semibold">
              <FaArrowUp className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">Per transaction</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-slate-100 text-slate-900 py-0.5 px-2.5 rounded-full text-xs font-semibold">
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
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payments by course or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
              >
                <option value="all">All Status</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="course">Sort by Course</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Payment Records</h3>
          </div>
          
          {sortedPayments.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {sortedPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <FaReceipt className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-slate-900 mb-2 break-words">{payment.course?.title || 'Course Payment'}</h4>
                        <p className="text-sm text-slate-500 mb-1">Payment ID: {payment._id}</p>
                        <p className="text-sm text-slate-500 mb-3">{formatDate(payment.createdAt)}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            <FaUsers className="w-4 h-4 mr-1.5 text-primary-600 flex-shrink-0" />
                            <span className="font-medium text-slate-700">Learner: {payment.user?.name || 'Unknown'}</span>
                          </span>
                          <span className="inline-flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            <FaCreditCard className="w-4 h-4 mr-1.5 text-primary-600 flex-shrink-0" />
                            <span className="font-medium text-slate-700">{payment.paymentType} payment</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 lg:gap-3 flex-shrink-0">
                      <div className="flex flex-col items-end">
                        <div className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-1 mb-3 ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                        
                        <div className="space-y-1.5 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[200px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Total:</span>
                            <span className="font-semibold text-slate-800">{formatPrice(payment.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Commission:</span>
                            <span className="font-semibold text-accent-600">-{formatPrice(payment.commissionAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 mt-1.5">
                            <span className="text-slate-800 font-bold">You Earn:</span>
                            <span className="font-bold text-secondary-600">{formatPrice(payment.tutorAmount)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Download">
                          <FaDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaReceipt className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No payments found</h3>
              <p className="text-slate-600">Start by creating courses to see your payment history</p>
            </div>
          )}
        </div>

        {/* Earnings Insights */}
        <div className="mt-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <FaChartLine className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-900 mb-3">Earnings Insights</h3>
              <ul className="space-y-2.5 text-primary-800 text-sm">
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span>Platform commission is 10-15% of total course price</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span>Payments are processed securely via Paystack</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span>Earnings are transferred to your account after commission deduction</span>
                </li>
                <li className="flex items-center">
                  <FaCheckCircle className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span>Track your performance and optimize course pricing for better earnings</span>
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
