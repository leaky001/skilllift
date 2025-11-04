import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RouteGuard = ({ children }) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run this effect when authentication is fully initialized
    if (!isLoading && isInitialized) {
      const currentPath = location.pathname;
      
      // Check if the current path is a protected route
      const isProtectedRoute = currentPath.startsWith('/learner/') || 
                              currentPath.startsWith('/tutor/') || 
                              currentPath.startsWith('/admin/');
      
      // Check if the current path is a public route
      const isPublicRoute = currentPath === '/' || 
                           currentPath === '/login' || 
                           currentPath === '/register' || 
                           currentPath === '/role-selection' ||
                           currentPath === '/email-verification' ||
                           currentPath === '/forgot-password' ||
                           currentPath === '/reset-password' ||
                           currentPath === '/payment/verify' ||
                           currentPath === '/test';

      if (isProtectedRoute && !isAuthenticated) {
        // Store the intended destination for redirect after login
        console.log('📍 Storing intended destination:', currentPath);
        sessionStorage.setItem('intendedDestination', currentPath);
        
        // Redirect to appropriate login page based on the route
        if (currentPath.startsWith('/admin/')) {
          navigate('/admin/login');
        } else if (currentPath.startsWith('/tutor/')) {
          navigate('/login?role=tutor');
        } else {
          navigate('/login?role=learner');
        }
      } else if (isAuthenticated && user) {
        // Check if user is trying to access a route they don't have permission for
        const isAdminPath = currentPath.startsWith('/admin/');
        const isTutorPath = currentPath.startsWith('/tutor/');
        const isLearnerPath = currentPath.startsWith('/learner/');
        
        if ((user.role === 'admin' && !isAdminPath && isProtectedRoute) ||
            (user.role === 'tutor' && !isTutorPath && isProtectedRoute) ||
            (user.role === 'learner' && !isLearnerPath && isProtectedRoute)) {
          console.log('❌ User trying to access unauthorized route, redirecting to dashboard');
          // Redirect to appropriate dashboard
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user.role === 'tutor') {
            navigate('/tutor/dashboard');
          } else {
            navigate('/learner/dashboard');
          }
        }
      }
    }
  }, [isAuthenticated, user, isLoading, isInitialized, location.pathname, navigate]);

  return children;
};

export default RouteGuard;

