import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Authentication Status',
        test: () => {
          return {
            success: isAuthenticated,
            message: isAuthenticated ? 'User is authenticated' : 'User is not authenticated',
            data: { user, isAuthenticated }
          };
        }
      },
      {
        name: 'Token Check',
        test: () => {
          const token = localStorage.getItem('token');
          const userData = localStorage.getItem('skilllift_user');
          return {
            success: !!(token || userData),
            message: token ? 'Token found' : userData ? 'User data found' : 'No token or user data',
            data: { hasToken: !!token, hasUserData: !!userData }
          };
        }
      },
      {
        name: 'API Health Check',
        test: async () => {
          try {
            const response = await api.get('/health');
            return {
              success: true,
              message: 'API is reachable',
              data: response.data
            };
          } catch (error) {
            return {
              success: false,
              message: 'API not reachable',
              data: error.message
            };
          }
        }
      },
      {
        name: 'Tutor Dashboard Stats',
        test: async () => {
          try {
            const response = await api.get('/tutor/dashboard/stats');
            return {
              success: true,
              message: 'Dashboard stats loaded successfully',
              data: response.data
            };
          } catch (error) {
            return {
              success: false,
              message: `Dashboard stats failed: ${error.response?.status} ${error.response?.data?.message || error.message}`,
              data: error.response?.data || error.message
            };
          }
        }
      },
      {
        name: 'Admin Dashboard Stats',
        test: async () => {
          try {
            const response = await api.get('/admin/dashboard');
            return {
              success: true,
              message: 'Admin dashboard loaded successfully',
              data: response.data
            };
          } catch (error) {
            return {
              success: false,
              message: `Admin dashboard failed: ${error.response?.status} ${error.response?.data?.message || error.message}`,
              data: error.response?.data || error.message
            };
          }
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          ...result
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          message: `Test failed: ${error.message}`,
          data: error
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Debug Tool</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User Role:</strong> {user?.role || 'None'}
            </div>
            <div>
              <strong>User Name:</strong> {user?.name || 'None'}
            </div>
            <div>
              <strong>User ID:</strong> {user?._id || 'None'}
            </div>
          </div>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
        </button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500">View Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Quick Fixes</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• If not authenticated: Go to <a href="/login" className="underline">/login</a> and log in</li>
            <li>• If API not reachable: Check if backend server is running on port 3001</li>
            <li>• If dashboard fails: Check if you have the correct role (tutor/admin)</li>
            <li>• Clear localStorage and try again if token issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardDebug;







