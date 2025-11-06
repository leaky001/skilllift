import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showValidationError } from '../../services/toastService.jsx';
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
  FaUserTie,
  FaPhone
} from 'react-icons/fa';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isAuthenticated, user } = useAuth();
  
  // Get role from URL params
  const urlRole = searchParams.get('role');
  const role = urlRole || 'learner';
  
  // Validate role (no admin registration through this page)
  const validRoles = ['learner', 'tutor'];
  const finalRole = validRoles.includes(role) ? role : 'learner';
  const isTutor = finalRole === 'tutor';

  // Handle navigation after successful authentication
  useEffect(() => {
    console.log('Register useEffect triggered:', { isAuthenticated, user, role });
    
    if (isAuthenticated && user) {
      console.log('User authenticated after registration, navigating to:', user.role);
      
      // Check for intended destination first
      const intendedDestination = sessionStorage.getItem('intendedDestination');
      if (intendedDestination) {
        console.log('📍 Found intended destination:', intendedDestination);
        // Verify the intended destination is valid for the user's role
        const isAdminPath = intendedDestination.startsWith('/admin/');
        const isTutorPath = intendedDestination.startsWith('/tutor/');
        const isLearnerPath = intendedDestination.startsWith('/learner/');
        
        if ((user.role === 'admin' && isAdminPath) ||
            (user.role === 'tutor' && isTutorPath) ||
            (user.role === 'learner' && isLearnerPath)) {
          console.log('✅ Intended destination is valid for user role, redirecting');
          sessionStorage.removeItem('intendedDestination');
          navigate(intendedDestination);
          return;
        } else {
          console.log('❌ Intended destination is not valid for user role, clearing it');
          sessionStorage.removeItem('intendedDestination');
        }
      }
      
      // Default navigation based on user role
      console.log('No valid intended destination, redirecting to dashboard');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/learner/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, role]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Full name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number')
      .required('Phone number is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      
      
      try {
        const userData = {
          ...values,
          role: finalRole, // Set the validated role
        };
        
        // Register user (this will trigger email verification)
        const result = await register(userData);
        
        if (result.success) {
          // Store email in localStorage as backup
          localStorage.setItem('pendingVerificationEmail', values.email);
          
          // Redirect to email verification page
          navigate('/email-verification', { 
            state: { 
              email: values.email,
              message: 'Please verify your email to complete registration'
            }
          });
        }
      } catch (error) {
        
        // Handle specific error types
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Show validation errors
            errorData.errors.forEach(err => {
              showError(err.msg || err.message || err);
            });
          } else {
            showError(errorData.message || 'Registration failed. Please check your input.');
          }
        } else if (error.response?.status === 422) {
          showError('Validation failed. Please check your input.');
        } else {
          showError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSocialLogin = (provider) => {
    // TODO: Implement social registration
  };

  const getRoleInfo = () => {
    if (isTutor) {
      return {
        title: 'Join as a Tutor',
        subtitle: 'Share your expertise and start earning',
        icon: FaUserTie,
        iconBg: 'bg-secondary-100',
        iconColor: 'text-secondary-600',
        buttonColor: 'bg-secondary-600 hover:bg-secondary-700',
        accentColor: 'text-secondary-600',
        features: [
          'Create and sell courses',
          'Host live classes',
          'Earn money from students',
          'Build your teaching brand'
        ]
      };
    } else {
      return {
        title: 'Join as a Learner',
        subtitle: 'Start your learning journey today',
        icon: FaGraduationCap,
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        buttonColor: 'bg-primary-600 hover:bg-primary-700',
        accentColor: 'text-primary-600',
        features: [
          'Access to expert courses',
          'Live interactive sessions',
          'Earn certificates',
          'Join mentorship programs'
        ]
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`${roleInfo.iconBg} rounded-full p-4 shadow-lg`}>
              <roleInfo.icon className={`text-3xl ${roleInfo.iconColor}`} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            {roleInfo.title}
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            {roleInfo.subtitle}
          </p>
          
          {/* Role Display */}
          <div className="mt-4 inline-block bg-gradient-to-r from-primary-100 to-primary-200 rounded-full px-4 py-2 border border-primary-200">
            <span className="text-primary-700 font-semibold capitalize">
              {role} Account
            </span>
          </div>
        </div>

        {/* Back to Role Selection */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-primary-600 transition-colors flex items-center justify-center mx-auto font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Choose Different Role
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features Section */}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">Why Choose SkillLift?</h3>
            <div className="space-y-4">
              {roleInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-slate-600 font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <h4 className="font-bold mb-2 text-slate-900">Platform Benefits</h4>
              <ul className="text-sm text-slate-600 space-y-1 font-medium">
                <li>• Secure payment processing</li>
                <li>• 24/7 customer support</li>
                <li>• Mobile-friendly platform</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                      formik.touched.name && formik.errors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Enter your full name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-error-600">{formik.errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
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
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Enter your email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                      formik.touched.phone && formik.errors.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Enter your phone number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Create a password"
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
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Confirm your password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirmPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 font-medium">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 hover:underline font-semibold">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 hover:underline font-semibold">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Register Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r ${roleInfo.buttonColor.includes('primary') ? 'from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800' : 'from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-md hover:shadow-lg ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending verification code...
                    </div>
                  ) : (
                    `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`
                  )}
                </button>
              </div>

              {/* Social Registration */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
                  >
                    <FaGoogle className="text-red-500" />
                    <span className="ml-2">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 hover:shadow-md"
                  >
                    <FaFacebook className="text-blue-600" />
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a 
                  href={`/login?role=${role}`}
                  className={`font-medium ${roleInfo.accentColor} hover:underline`}
                >
                  Sign in as a {role}
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
