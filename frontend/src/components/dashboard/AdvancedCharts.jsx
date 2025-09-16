import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaUsers,
  FaStar,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';

const AdvancedCharts = ({ assignments, submissions, students }) => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('submissions');

  // Generate mock chart data
  const chartData = useMemo(() => {
    const generateData = (days, metric) => {
      const data = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        let value = 0;
        switch (metric) {
          case 'submissions':
            value = Math.floor(Math.random() * 20) + 5;
            break;
          case 'grades':
            value = Math.floor(Math.random() * 15) + 3;
            break;
          case 'students':
            value = Math.floor(Math.random() * 10) + 2;
            break;
          case 'assignments':
            value = Math.floor(Math.random() * 5) + 1;
            break;
          default:
            value = Math.floor(Math.random() * 20) + 5;
        }
        
        data.push({
          date: date.toISOString().split('T')[0],
          value,
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
      return data;
    };

    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    return generateData(days, selectedMetric);
  }, [timeRange, selectedMetric]);

  // Course performance data
  const coursePerformance = useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      if (!acc[assignment.course]) {
        acc[assignment.course] = {
          totalAssignments: 0,
          totalSubmissions: 0,
          totalStudents: 0,
          avgScore: 0,
          completionRate: 0
        };
      }
      
      acc[assignment.course].totalAssignments++;
      acc[assignment.course].totalSubmissions += assignment.submittedCount;
      acc[assignment.course].totalStudents += assignment.totalStudents;
      
      return acc;
    }, {});
  }, [assignments]);

  // Calculate completion rates
  Object.keys(coursePerformance).forEach(course => {
    const data = coursePerformance[course];
    data.completionRate = data.totalStudents > 0 
      ? Math.round((data.totalSubmissions / data.totalStudents) * 100)
      : 0;
  });

  // Student engagement data
  const studentEngagement = useMemo(() => {
    const engagement = {
      active: 0,
      moderate: 0,
      low: 0,
      inactive: 0
    };

    // Mock student engagement calculation
    const totalStudents = assignments.reduce((sum, a) => sum + a.totalStudents, 0);
    engagement.active = Math.round(totalStudents * 0.4);
    engagement.moderate = Math.round(totalStudents * 0.3);
    engagement.low = Math.round(totalStudents * 0.2);
    engagement.inactive = Math.round(totalStudents * 0.1);

    return engagement;
  }, [assignments]);

  const exportChartData = () => {
    const data = {
      chartData,
      coursePerformance,
      studentEngagement,
      metadata: {
        timeRange,
        selectedMetric,
        exportDate: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-data-${timeRange}-${selectedMetric}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderLineChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
        <div className="flex items-center space-x-2">
          <FaChartLine className="text-blue-500" />
          <span className="text-sm text-gray-600">Line Chart</span>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {chartData.map((point, index) => {
          const maxValue = Math.max(...chartData.map(d => d.value));
          const height = (point.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                style={{ height: `${height}%` }}
                title={`${point.label}: ${point.value}`}
              />
              <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} over {timeRange}
        </p>
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Course Performance</h3>
        <div className="flex items-center space-x-2">
          <FaChartBar className="text-green-500" />
          <span className="text-sm text-gray-600">Bar Chart</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(coursePerformance).map(([course, data]) => (
          <div key={course} className="flex items-center space-x-4">
            <div className="w-1/3">
              <p className="text-sm font-medium text-gray-900 truncate">{course}</p>
              <p className="text-xs text-gray-500">{data.totalAssignments} assignments</p>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${data.completionRate}%` }}
              />
            </div>
            <div className="w-16 text-right">
              <p className="text-sm font-semibold text-gray-900">{data.completionRate}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Student Engagement</h3>
        <div className="flex items-center space-x-2">
          <FaChartPie className="text-purple-500" />
          <span className="text-sm text-gray-600">Pie Chart</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(studentEngagement).map(([level, count]) => {
          const colors = {
            active: 'bg-green-500',
            moderate: 'bg-yellow-500',
            low: 'bg-orange-500',
            inactive: 'bg-red-500'
          };
          
          return (
            <div key={level} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${colors[level]}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 capitalize">{level}</p>
                <p className="text-xs text-gray-500">{count} students</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
            <div className="flex space-x-2">
              {[
                { type: 'line', icon: FaChartLine, label: 'Trend' },
                { type: 'bar', icon: FaChartBar, label: 'Performance' },
                { type: 'pie', icon: FaChartPie, label: 'Engagement' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    chartType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="submissions">Submissions</option>
              <option value="grades">Grades</option>
              <option value="students">Students</option>
              <option value="assignments">Assignments</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={exportChartData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center"
            >
              <FaDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Chart Display */}
      {chartType === 'line' && renderLineChart()}
      {chartType === 'bar' && renderBarChart()}
      {chartType === 'pie' && renderPieChart()}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Submissions</p>
              <p className="text-3xl font-bold">
                {assignments.reduce((sum, a) => sum + a.submittedCount, 0)}
              </p>
            </div>
            <FaUsers className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg. Completion</p>
              <p className="text-3xl font-bold">
                {Math.round(
                  assignments.reduce((sum, a) => sum + (a.submittedCount / a.totalStudents), 0) / 
                  assignments.length * 100
                )}%
              </p>
            </div>
            <FaCheckCircle className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Grades</p>
              <p className="text-3xl font-bold">
                {assignments.reduce((sum, a) => sum + (a.submittedCount - a.gradedCount), 0)}
              </p>
            </div>
            <FaClock className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg. Score</p>
              <p className="text-3xl font-bold">87%</p>
            </div>
            <FaStar className="text-3xl opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
