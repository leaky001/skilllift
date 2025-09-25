import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showValidationError } from '../../services/toastService.jsx';
import MobileDebugger from '../../components/MobileDebugger';
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
  const { register } = useAuth();
  
  // Get role from URL params
  const urlRole = searchParams.get('role');
  const role = urlRole || 'learner';
  
  // Validate role (no admin registration through this page)
  const validRoles = ['learner', 'tutor'];
  const finalRole = validRoles.includes(role) ? role : 'learner';
  const isTutor = finalRole === 'tutor';

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
      
      // Mobile debugging
      console.log('📱 Mobile registration attempt:', {
        userAgent: navigator.userAgent,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        values: { ...values, password: '[HIDDEN]' }
      });
      
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
        console.error('Registration error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
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
    console.log(`Registering with ${provider} as ${role}`);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <MobileDebugger />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`${roleInfo.iconBg} rounded-full p-3 shadow-lg`}>
              <roleInfo.icon className={`text-3xl ${roleInfo.iconColor}`} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {roleInfo.title}
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            {roleInfo.subtitle}
          </p>
          
          {/* Role Display */}
          <div className="mt-4 inline-block bg-primary-100 rounded-full px-4 py-2">
            <span className="text-primary-700 font-medium capitalize">
              {role} Account
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">Why Choose SkillLift?</h3>
            <div className="space-y-4">
              {roleInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                  <span className="text-slate-600">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <h4 className="font-bold mb-2 text-slate-900">Platform Benefits</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Secure payment processing</li>
                <li>• 24/7 customer support</li>
                <li>• Mobile-friendly platform</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
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
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      formik.touched.name && formik.errors.name
                        ? 'border-error-300 focus:ring-error-500'
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
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent transition-colors ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
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
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent transition-colors ${
                      formik.touched.phone && formik.errors.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
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
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent transition-colors ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
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
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender focus:border-transparent transition-colors ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300'
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
                  className="h-4 w-4 text-lavender focus:ring-lavender border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-lavender hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-lavender hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Register Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${roleInfo.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender transition-all duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
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
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <FaGoogle className="text-red-500" />
                    <span className="ml-2">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
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
