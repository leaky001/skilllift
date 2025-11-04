import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Store the intended destination for redirect after login
  useEffect(() => {
    if (!isAuthenticated && !isLoading && isInitialized) {
      // Only store the path if it's not already a login/register page
      const currentPath = location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/role-selection')) {
        sessionStorage.setItem('intendedDestination', currentPath);
        console.log('📍 Stored intended destination:', currentPath);
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, location.pathname]);

  console.log('🔒 ProtectedRoute check:', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    userAccountStatus: user?.accountStatus,
    isLoading,
    isInitialized,
    currentPath: location.pathname
  });

  // Show loading spinner while authentication is being verified
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to landing page');
    return <Navigate to="/" replace />;
  }

  // Check email verification for non-admin users (disabled for now)
  // if (user?.role !== 'admin' && !user?.isEmailVerified) {
  //   return <Navigate to="/email-verification" replace />;
  // }

  // Check account approval for non-admin users
  if (user?.role !== 'admin' && user?.accountStatus === 'pending') {
    // Allow access but with limited features
    // The individual components will handle the limitations
  }

  if (user?.role !== 'admin' && user?.accountStatus === 'blocked') {
    console.log('❌ User account is blocked, redirecting to account-blocked');
    return <Navigate to="/account-blocked" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('❌ User role not allowed, redirecting to dashboard');
    console.log('User role:', user?.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  console.log('✅ User authorized, rendering children');
  return children;
};

export default ProtectedRoute;
