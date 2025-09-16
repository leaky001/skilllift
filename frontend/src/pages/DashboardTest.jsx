import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTutorDashboardStats } from '../services/tutorService';
import learnerDashboardService from '../services/learnerDashboardService';
import { getMyEnrollments } from '../services/courseService';

const DashboardTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test tutor dashboard stats
      if (user?.role === 'tutor') {
        console.log('🧪 Testing tutor dashboard stats...');
        try {
          const statsResponse = await getTutorDashboardStats();
          results.tutorStats = {
            success: true,
            data: statsResponse,
            message: 'Tutor stats loaded successfully'
          };
        } catch (error) {
          results.tutorStats = {
            success: false,
            error: error.message,
            response: error.response?.data
          };
        }
      }

      // Test learner dashboard
      if (user?.role === 'learner') {
        console.log('🧪 Testing learner dashboard...');
        
        // Test enrollments
        try {
          const enrollmentsResponse = await getMyEnrollments();
          results.learnerEnrollments = {
            success: true,
            data: enrollmentsResponse,
            message: 'Learner enrollments loaded successfully'
          };
        } catch (error) {
          results.learnerEnrollments = {
            success: false,
            error: error.message,
            response: error.response?.data
          };
        }

        // Test dashboard summary
        try {
          const summaryResponse = await learnerDashboardService.getDashboardSummary();
          results.learnerSummary = {
            success: true,
            data: summaryResponse,
            message: 'Learner dashboard summary loaded successfully'
          };
        } catch (error) {
          results.learnerSummary = {
            success: false,
            error: error.message,
            response: error.response?.data
          };
        }
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      runTests();
    }
  }, [isAuthenticated]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard API Test</h1>
      
      <div className="mb-4">
        <p><strong>User:</strong> {user?.name} ({user?.role})</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      </div>

      <button 
        onClick={runTests}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div className="space-y-4">
        {Object.entries(testResults).map(([key, result]) => (
          <div key={key} className="border rounded p-4">
            <h3 className="font-bold text-lg mb-2">{key}</h3>
            <div className={`p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
              {result.message && <p><strong>Message:</strong> {result.message}</p>}
              {result.error && <p><strong>Error:</strong> {result.error}</p>}
              {result.response && (
                <div>
                  <p><strong>Response:</strong></p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              )}
              {result.data && (
                <div>
                  <p><strong>Data:</strong></p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardTest;
