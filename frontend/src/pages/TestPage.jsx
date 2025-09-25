import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestPage = () => {
  const { user, isAuthenticated, isLoading, isInitialized, error, login, logout } = useAuth();
  const navigate = useNavigate();

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      // Test health endpoint first
      const healthResponse = await fetch('http://localhost:3001/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Backend health check:', healthData);
        alert('Backend is running! ✅\nHealth: ' + healthData.status);
      } else {
        alert(`Backend health check failed: ${healthResponse.status} ❌`);
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      alert('Backend connection failed! ❌\nMake sure your backend server is running on http://localhost:3001');
    }
  };

  const testAdminLogin = async () => {
    try {
      console.log('Testing admin login...');
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@skilllift.com',
          password: 'admin123456'
        })
      });
      
      const data = await response.json();
      console.log('Admin login test response:', data);
      
      if (response.ok) {
        alert('Admin login test successful! ✅');
      } else {
        alert(`Admin login test failed: ${data.message} ❌`);
      }
    } catch (error) {
      console.error('Admin login test failed:', error);
      alert('Admin login test failed! ❌');
    }
  };

  const testDemoLogin = async (role) => {
    try {
      console.log(`Testing ${role} demo login...`);
      console.log('Role parameter:', role);
      console.log('Role type:', typeof role);
      
      let email, password;
      if (role === 'admin') {
        email = 'admin@skilllift.com';
        password = 'admin123456';
      } else if (role === 'tutor') {
        email = 'tutor@skilllift.com';
        password = 'tutor123';
      } else if (role === 'learner') {
        email = 'learner@skilllift.com';
        password = 'learner123';
      }

      console.log(`Attempting ${role} login with:`, { email, password, role });
      const result = await login(email, password, role);
      console.log(`${role} login result:`, result);
      
      if (result.success) {
        alert(`${role} demo login successful! ✅`);
        console.log('Login successful, user should be redirected');
      } else {
        alert(`${role} demo login failed: ${result.error} ❌`);
        console.log('Login failed with error:', result.error);
      }
    } catch (error) {
      console.error(`${role} demo login error:`, error);
      alert(`${role} demo login error: ${error.message} ❌`);
    }
  };

  const testDashboardAccess = () => {
    if (!isAuthenticated || !user) {
      alert('Please login first! ❌');
      return;
    }

    console.log('Testing dashboard access for:', user.role);
    
    try {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'tutor') {
        navigate('/tutor/dashboard');
      } else if (user.role === 'learner') {
        navigate('/learner/dashboard');
      }
      alert(`Navigating to ${user.role} dashboard... ✅`);
    } catch (error) {
      console.error('Dashboard navigation error:', error);
      alert(`Dashboard navigation error: ${error.message} ❌`);
    }
  };

  const testRoleProtection = () => {
    if (!isAuthenticated || !user) {
      alert('Please login first! ❌');
      return;
    }

    console.log('Testing role protection...');
    
    // Test accessing different role dashboards
    const testRoutes = [
      { role: 'admin', route: '/admin/dashboard' },
      { role: 'tutor', route: '/tutor/dashboard' },
      { role: 'learner', route: '/learner/dashboard' }
    ];

    testRoutes.forEach(({ role: testRole, route }) => {
      if (user.role === testRole) {
        console.log(`User can access ${route} ✅`);
      } else {
        console.log(`User cannot access ${route} ❌`);
      }
    });

    alert('Role protection test completed. Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Complete Authentication & Dashboard Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>isLoading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}</p>
              <p><strong>isInitialized:</strong> {isInitialized ? '✅ Yes' : '⏳ No'}</p>
            </div>
            <div>
              <p><strong>User:</strong> {user ? '✅ Present' : '❌ None'}</p>
              <p><strong>User Role:</strong> {user?.role || 'None'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
          <div className="mb-4">
            <p><strong>skilllift_user:</strong></p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {localStorage.getItem('skilllift_user') || 'No user data found'}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Demo Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Admin</h3>
              <p className="text-sm text-red-700">Email: admin@skilllift.com</p>
              <p className="text-sm text-red-700">Password: admin123456</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Tutor</h3>
              <p className="text-sm text-green-700">Email: tutor@skilllift.com</p>
              <p className="text-sm text-green-700">Password: tutor123</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Learner</h3>
              <p className="text-sm text-blue-700">Email: learner@skilllift.com</p>
              <p className="text-sm text-blue-700">Password: learner123</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Tests</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                onClick={() => testDemoLogin('admin')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Test Admin Login
              </button>
              <button 
                onClick={() => testDemoLogin('tutor')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Tutor Login
              </button>
              <button 
                onClick={() => testDemoLogin('learner')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Learner Login
              </button>
              <button 
                onClick={logout}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
            
            {/* Direct Login Test */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Direct Login Test</h3>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => {
                    console.log('Testing direct tutor login...');
                    login('tutor@skilllift.com', 'tutor123', 'tutor');
                  }}
                  className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
                >
                  Direct Tutor Login
                </button>
                <button 
                  onClick={() => {
                    console.log('Testing direct learner login...');
                    login('learner@skilllift.com', 'learner123', 'learner');
                  }}
                  className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
                >
                  Direct Learner Login
                </button>
                <button 
                  onClick={() => {
                    console.log('Testing direct admin login...');
                    login('admin@skilllift.com', 'admin123456', 'admin');
                  }}
                  className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
                >
                  Direct Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Access Tests</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button 
                onClick={testDashboardAccess}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Test Dashboard Access
              </button>
              <button 
                onClick={testRoleProtection}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Test Role Protection
              </button>
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Force Admin Dashboard
              </button>
              <button 
                onClick={() => navigate('/tutor/dashboard')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Force Tutor Dashboard
              </button>
              <button 
                onClick={() => navigate('/learner/dashboard')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Force Learner Dashboard
              </button>
            </div>
            <p className="text-sm text-gray-600">
              These tests will help diagnose authentication and dashboard access issues.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Backend Tests</h2>
          <div className="space-y-4">
            <div className="space-x-4">
              <button 
                onClick={testBackendConnection}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Backend Connection
              </button>
              <button 
                onClick={testAdminLogin}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Admin Login API
              </button>
            </div>
            <p className="text-sm text-gray-600">
              These tests will help diagnose if the backend is running and accessible.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State Debug</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>Pathname:</strong> {window.location.pathname}</p>
              <p><strong>Search Params:</strong> {window.location.search}</p>
            </div>
            <div>
              <p><strong>Local Storage User:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {localStorage.getItem('skilllift_user') || 'None'}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => {
                console.log('Current auth state:', { user, isAuthenticated, isLoading, isInitialized });
                console.log('Local storage:', localStorage.getItem('skilllift_user'));
                console.log('Current URL:', window.location.href);
                console.log('User agent:', navigator.userAgent);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Log to Console
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('skilllift_user');
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>

        {/* WebSocket Test Component */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">WebSocket Test</h2>
            <p className="text-gray-600">WebSocket test component removed - using live class system instead.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
