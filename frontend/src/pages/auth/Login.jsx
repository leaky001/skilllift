import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { 
  FaGraduationCap, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaArrowLeft,
  FaGoogle,
  FaFacebook,
  FaShieldAlt
} from 'react-icons/fa';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  
  // Get role from URL params or detect from path
  const pathRole = window.location.pathname.includes('/admin/login')
    ? 'admin'
    : window.location.pathname.includes('/tutor/login')
      ? 'tutor'
      : window.location.pathname.includes('/learner/login')
        ? 'learner'
        : null;
  const urlRole = searchParams.get('role');
  const role = pathRole || urlRole || 'learner';
  
  // Validate role
  const validRoles = ['learner', 'tutor', 'admin'];
  const finalRole = validRoles.includes(role) ? role : 'learner';
  const isTutor = finalRole === 'tutor';

  // Handle navigation after successful authentication
  useEffect(() => {
    console.log('Login useEffect triggered:', { isAuthenticated, user, role });
    
    if (isAuthenticated && user) {
      console.log('User authenticated, navigating to:', user.role);
      
      // Only redirect if we're actually on the login page
      if (window.location.pathname === '/login' || window.location.pathname === '/admin/login') {
        console.log('On login page, redirecting to dashboard');
        // Navigate based on user role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'tutor') {
          navigate('/tutor/dashboard');
        } else {
          navigate('/learner/dashboard');
        }
      } else {
        console.log('Not on login page, not redirecting');
      }
    }
  }, [isAuthenticated, user, navigate, role]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      console.log('Form submitted with role:', role);
      
      try {
        const result = await login(values.email, values.password, finalRole);
        console.log('Login result:', result);
        
        // Handle email verification requirement
        if (result && result.requiresEmailVerification) {
          // Store email in localStorage as backup
          localStorage.setItem('pendingVerificationEmail', values.email);
          
          // Redirect to email verification page
          navigate('/email-verification', { 
            state: { 
              email: values.email,
              message: 'Please verify your email before accessing the dashboard'
            }
          });
          return;
        }
      } catch (error) {
        console.error('Login error:', error);
        // Error handling is managed by AuthContext
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login
  };

  const getRoleInfo = () => {
    if (finalRole === 'admin') {
      return {
        title: 'Admin Access',
        subtitle: 'Sign in to access admin dashboard',
        icon: FaShieldAlt,
        iconBg: 'bg-error-100',
        iconColor: 'text-error-600',
        buttonColor: 'bg-error-600 hover:bg-error-700',
        accentColor: 'text-error-600'
      };
    } else if (isTutor) {
      return {
        title: 'Welcome Back, Tutor!',
        subtitle: 'Sign in to manage your courses and students',
        icon: FaUser,
        iconBg: 'bg-secondary-100',
        iconColor: 'text-secondary-600',
        buttonColor: 'bg-secondary-600 hover:bg-secondary-700',
        accentColor: 'text-secondary-600'
      };
    } else {
      return {
        title: 'Welcome Back, Learner!',
        subtitle: 'Sign in to continue your learning journey',
        icon: FaGraduationCap,
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        buttonColor: 'bg-primary-600 hover:bg-primary-700',
        accentColor: 'text-primary-600'
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`${roleInfo.iconBg} rounded-full p-3 shadow-lg`}>
              <roleInfo.icon className={`text-3xl ${roleInfo.iconColor}`} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {roleInfo.title}
          </h2>
          <p className="text-slate-600">
            {roleInfo.subtitle}
          </p>
          
          {/* Role Display */}
          <div className="mt-4 inline-block bg-primary-100 rounded-full px-4 py-2">
            <span className="text-primary-700 font-medium capitalize">
              {finalRole} Account
            </span>
          </div>
        </div>

        {/* Back to Role Selection */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Choose Different Role
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    formik.touched.email && formik.errors.email
                      ? 'border-error-300 focus:ring-error-500'
                      : 'border-slate-300'
                  }`}
                  placeholder="Enter your email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-error-600">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    formik.touched.password && formik.errors.password
                      ? 'border-error-300 focus:ring-error-500'
                      : 'border-slate-300'
                  }`}
                  placeholder="Enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-slate-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-error-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                Login As
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaShieldAlt className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    // Navigate to role-specific login page
                    if (newRole === 'admin') {
                      navigate('/admin/login');
                    } else if (newRole === 'tutor') {
                      navigate('/tutor/login');
                    } else if (newRole === 'learner') {
                      navigate('/learner/login');
                    }
                  }}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                >
                  <option value="learner">Learner</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${roleInfo.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                )}
              </button>
            </div>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <FaGoogle className="text-red-500 text-lg" />
                  <span className="ml-2 font-medium">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <FaFacebook className="text-blue-600 text-lg" />
                  <span className="ml-2 font-medium">Facebook</span>
                </button>
              </div>
            </div>
          </form>

          {/* Sign Up Link - Hidden for Admin users */}
          {role !== 'admin' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a 
                  href={`/register?role=${role}`}
                  className={`font-medium ${roleInfo.accentColor} hover:underline`}
                >
                  Sign up as a {role}
                </a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
