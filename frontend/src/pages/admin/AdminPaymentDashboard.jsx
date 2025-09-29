import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { 
  CreditCardIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const AdminPaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    paymentType: '',
    startDate: '',
    endDate: ''
  });

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      const response = await adminService.getAllPayments({
        status: filters.status,
        paymentType: filters.paymentType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: 1,
        limit: 50
      });

      console.log('Payment response:', response);

      if (response?.success) {
        setPayments(response.data || []);
        // Calculate statistics from the payments data
        const stats = {
          totalAmount: response.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
          successfulPayments: response.data?.filter(p => p.status === 'successful').length || 0,
          pendingPayments: response.data?.filter(p => p.status === 'pending').length || 0,
          failedPayments: response.data?.filter(p => p.status === 'failed').length || 0
        };
        setStatistics(stats);
      } else {
        setPayments(response?.data || []);
        setStatistics({});
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      setStatistics({});
    }
  };

  // Installments removed – no due installments feature

  // Installments removed – no reminders feature

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPayments();
      setLoading(false);
    };
    loadData();
  }, [filters]);
  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Payment Management Dashboard</h1>
        <p className="text-gray-600">Monitor all payments, track installments, and manage payment reminders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful Payments</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.successfulPayments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.pendingPayments || 0}</p>
            </div>
          </div>
        </div>

        {/* Installments card removed */}
      </div>

      {/* Installments removed */}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Filter Payments</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="full">Full Payment</option>
              <option value="installment">Installment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {/* Bulk actions removed */}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">💳 All Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Selection removed */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Due
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  {/* Selection removed */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.user?.name || 'Guest User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.user?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.course?.title || 'Unknown Course'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.course?.category || 'No category'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.tutor?.name || 'Unknown Tutor'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.tutor?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Commission: {formatCurrency(payment.commissionAmount || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {payment.paymentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.nextInstallmentDate ? formatDate(payment.nextInstallmentDate) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentDashboard;