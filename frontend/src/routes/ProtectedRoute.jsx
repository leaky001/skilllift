import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🔒 ProtectedRoute check:', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    userAccountStatus: user?.accountStatus
  });

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
