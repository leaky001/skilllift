import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaBookOpen, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import * as adminService from '../../services/adminService';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeframe]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data, but provide fallbacks
      const [platform, users, courses, revenue, engagement] = await Promise.allSettled([
        adminService.getPlatformStatistics(timeframe),
        adminService.getUserAnalytics(timeframe),
        adminService.getCourseAnalytics(timeframe),
        adminService.getRevenueAnalytics(timeframe),
        adminService.getEngagementAnalytics(timeframe)
      ]);

      // Set platform stats with fallback - Always show sample data for now
      const samplePlatformStats = {
        totalUsers: 156,
        totalCourses: 28,
        totalRevenue: 12450,
        activeUsers: 89,
        growthRate: 12.5
      };
      
      if (platform.status === 'fulfilled' && platform.value.success && platform.value.data) {
        setPlatformStats(platform.value.data);
      } else {
        setPlatformStats(samplePlatformStats);
      }

      // Set user analytics with fallback - Always show sample data for now
      const sampleUserAnalytics = {
        totalUsers: 156,
        newUsers: 23,
        activeUsers: 89,
        userGrowth: 15.2,
        userDistribution: { tutors: 45, learners: 111 }
      };
      
      if (users.status === 'fulfilled' && users.value.success && users.value.data) {
        setUserAnalytics(users.value.data);
      } else {
        setUserAnalytics(sampleUserAnalytics);
      }

      // Set course analytics with fallback - Always show sample data for now
      const sampleCourseAnalytics = {
        totalCourses: 28,
        publishedCourses: 25,
        pendingCourses: 3,
        courseGrowth: 8.7,
        averageRating: 4.6
      };
      
      if (courses.status === 'fulfilled' && courses.value.success && courses.value.data) {
        setCourseAnalytics(courses.value.data);
      } else {
        setCourseAnalytics(sampleCourseAnalytics);
      }

      // Set revenue analytics with fallback - Always show sample data for now
      const sampleRevenueAnalytics = {
        totalRevenue: 12450,
        monthlyRevenue: 3200,
        revenueGrowth: 18.3,
        averageTransaction: 89
      };
      
      if (revenue.status === 'fulfilled' && revenue.value.success && revenue.value.data) {
        setRevenueAnalytics(revenue.value.data);
      } else {
        setRevenueAnalytics(sampleRevenueAnalytics);
      }

      // Set engagement analytics with fallback - Always show sample data for now
      const sampleEngagementAnalytics = {
        totalEnrollments: 234,
        completionRate: 78.5,
        averageSessionTime: 45,
        userRetention: 82.3
      };
      
      if (engagement.status === 'fulfilled' && engagement.value.success && engagement.value.data) {
        setEngagementAnalytics(engagement.value.data);
      } else {
        setEngagementAnalytics(sampleEngagementAnalytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set all fallback data
      setPlatformStats({
        totalUsers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        activeUsers: 0,
        growthRate: 0
      });
      setUserAnalytics({
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        userGrowth: 0,
        userDistribution: { tutors: 0, learners: 0 }
      });
      setCourseAnalytics({
        totalCourses: 0,
        publishedCourses: 0,
        pendingCourses: 0,
        courseGrowth: 0,
        averageRating: 0
      });
      setRevenueAnalytics({
        totalRevenue: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        averageTransaction: 0
      });
      setEngagementAnalytics({
        totalEnrollments: 0,
        completionRate: 0,
        averageSessionTime: 0,
        userRetention: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FaChartBar className="text-2xl text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Platform Overview */}
      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(platformStats.userStats?.reduce((sum, stat) => sum + stat.count, 0) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(platformStats.courseStats?.reduce((sum, stat) => sum + stat.count, 0) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaBookOpen className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(platformStats.revenueStats?.reduce((sum, stat) => sum + stat.totalAmount, 0) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(platformStats.revenueStats?.reduce((sum, stat) => sum + stat.count, 0) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        {userAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Role Distribution</h4>
                <div className="space-y-2">
                  {userAnalytics.roleDistribution?.map((role) => (
                    <div key={role._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 capitalize">{role._id}</span>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(role.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Analytics */}
        {courseAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Analytics</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Category Performance</h4>
                <div className="space-y-2">
                  {courseAnalytics.categoryPerformance?.slice(0, 5).map((category) => (
                    <div key={category._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{category._id}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{formatNumber(category.totalEnrollments)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(category.totalRevenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Analytics */}
        {revenueAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Revenue by Type</h4>
                <div className="space-y-2">
                  {revenueAnalytics.revenueByType?.map((type) => (
                    <div key={type._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{type._id.replace('_', ' ')}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(type.totalRevenue)}</div>
                        <div className="text-xs text-gray-500">{formatNumber(type.transactionCount)} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Analytics */}
        {engagementAnalytics && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Analytics</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Completion Rates</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total Enrollments</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(engagementAnalytics.completionRates?.totalEnrollments || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Completed</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(engagementAnalytics.completionRates?.completedEnrollments || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Average Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(engagementAnalytics.completionRates?.averageProgress || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">New user registration</span>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Course payment completed</span>
            </div>
            <span className="text-sm text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Account approval pending review</span>
            </div>
            <span className="text-sm text-gray-500">10 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
