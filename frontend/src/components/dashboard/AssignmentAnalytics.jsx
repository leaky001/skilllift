import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaStar,
  FaDownload
} from 'react-icons/fa';

const AssignmentAnalytics = ({ assignments }) => {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('submissions');

  // Calculate analytics data
  const analytics = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter(a => a.status === 'active').length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    totalSubmissions: assignments.reduce((sum, a) => sum + a.submittedCount, 0),
    totalStudents: assignments.reduce((sum, a) => sum + a.totalStudents, 0),
    avgSubmissionRate: assignments.length > 0 
      ? Math.round(assignments.reduce((sum, a) => sum + (a.submittedCount / a.totalStudents), 0) / assignments.length * 100)
      : 0,
    pendingGrades: assignments.reduce((sum, a) => sum + (a.submittedCount - a.gradedCount), 0),
    overdueAssignments: assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      const today = new Date();
      return dueDate < today && a.status === 'active';
    }).length
  };

  // Course-wise analytics
  const courseAnalytics = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.course]) {
      acc[assignment.course] = {
        total: 0,
        submissions: 0,
        students: 0,
        avgScore: 0
      };
    }
    acc[assignment.course].total++;
    acc[assignment.course].submissions += assignment.submittedCount;
    acc[assignment.course].students += assignment.totalStudents;
    return acc;
  }, {});

  // Recent activity
  const recentActivity = assignments
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 5);

  const exportAnalytics = () => {
    const data = {
      summary: analytics,
      courseBreakdown: courseAnalytics,
      recentActivity: recentActivity
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment-analytics.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assignment Analytics</h3>
          <p className="text-sm text-gray-600">Comprehensive insights into assignment performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Assignments</p>
              <p className="text-3xl font-bold">{analytics.totalAssignments}</p>
            </div>
            <FaChartLine className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Assignments</p>
              <p className="text-3xl font-bold">{analytics.activeAssignments}</p>
            </div>
            <FaCheckCircle className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Submission Rate</p>
              <p className="text-3xl font-bold">{analytics.avgSubmissionRate}%</p>
            </div>
            <FaUsers className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Grades</p>
              <p className="text-3xl font-bold">{analytics.pendingGrades}</p>
            </div>
            <FaClock className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h4>
        <div className="space-y-4">
          {Object.entries(courseAnalytics).map(([course, data]) => (
            <div key={course} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{course}</h5>
                <p className="text-sm text-gray-600">
                  {data.total} assignments • {data.submissions} submissions
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {Math.round((data.submissions / data.students) * 100)}%
                </p>
                <p className="text-sm text-gray-600">submission rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {recentActivity.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-600">{assignment.course}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {assignment.submittedCount}/{assignment.totalStudents}
                </p>
                <p className="text-xs text-gray-600">submissions</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {analytics.overdueAssignments > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <div>
              <h5 className="font-medium text-red-900">Overdue Assignments</h5>
              <p className="text-sm text-red-700">
                {analytics.overdueAssignments} assignments are past their due date
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentAnalytics;
