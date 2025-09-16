import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, 
  FaKey, 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaClock
} from 'react-icons/fa';
import { showSuccess as showToastSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { useAuth } from '../../context/AuthContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerificationEmail, user } = useAuth();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  
  // Get email from multiple sources (URL params, user data, or location state)
  const getEmail = () => {
    const urlEmail = searchParams.get('email');
    const userEmail = user?.email;
    const stateEmail = location?.state?.email;
    const storedEmail = localStorage.getItem('pendingVerificationEmail') || sessionStorage.getItem('pendingVerificationEmail');
    
    console.log('Email sources:', { urlEmail, userEmail, stateEmail, storedEmail });
    
    const finalEmail = urlEmail || userEmail || stateEmail || storedEmail || '';
    console.log('Final email:', finalEmail);
    
    return finalEmail;
  };
  
  const [email] = useState(getEmail());
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const codeArray = pastedData.slice(0, 6).split('');
    
    if (codeArray.length === 6 && codeArray.every(char => /^\d$/.test(char))) {
      setVerificationCode([...codeArray, ...Array(6 - codeArray.length).fill('')]);
    }
  };

    const handleVerify = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      showError('Please enter the complete 6-digit verification code');
      return;
    }

    if (!email) {
      showError('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail(email, code);
      
      if (result.success) {
        setShowSuccess(true);
        showToastSuccess('✅ Email verified successfully!');
        
        // Clean up stored email
        localStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('pendingVerificationEmail');
        
        // Navigate to dashboard after successful verification
        setTimeout(() => {
          console.log('🔍 Verification result:', result);
          console.log('👤 User role:', result.user?.role);
          console.log('📧 User email:', result.user?.email);
          
          // Navigate based on user role
          if (result.user && result.user.role === 'admin') {
            console.log('🔀 Redirecting to admin dashboard');
            navigate('/admin/dashboard');
          } else if (result.user && result.user.role === 'tutor') {
            console.log('🔀 Redirecting to tutor area');
            // Check if tutor needs to complete KYC
            const kycStatus = result.user.tutorProfile?.kycStatus;
            console.log('📋 KYC Status:', kycStatus);
            if (kycStatus === 'pending' || !kycStatus) {
              console.log('🔀 Redirecting to KYC submission');
              navigate('/tutor/kyc-submission');
            } else {
              console.log('🔀 Redirecting to tutor dashboard');
              navigate('/tutor/dashboard');
            }
          } else if (result.user && result.user.role === 'learner') {
            console.log('🔀 Redirecting to learner dashboard');
            navigate('/learner/dashboard');
          } else {
            console.log('🔀 No user data or unknown role, redirecting to login');
            navigate('/login');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      showError('Email is required');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setCountdown(60); // Start 60-second countdown
        showToastSuccess('📧 Verification code sent successfully!');
      }
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600">Your email has been successfully verified. Welcome to SkillLift!</p>
          </div>
          
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <span className="text-blue-600">Redirecting to dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaEnvelope className="text-2xl text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📧 Check Your Email:</strong> We've sent a verification code to your email address. 
              If you don't see it, please check your spam folder.
            </p>
          </div>
        </div>

        {/* Email Display (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
            {email || 'Your registered email'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This is the email address you registered with
          </p>
        </div>

        {/* Verification Code Input */}
        <form onSubmit={handleVerify} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter Verification Code
          </label>
          <div className="flex justify-between gap-2 mb-4">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || verificationCode.join('').length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-600 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
            className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {isResending ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <>
                <FaClock className="mr-2" />
                Resend in {countdown}s
              </>
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-gray-500 hover:text-gray-700 flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">📧 Email Verification:</p>
              <ul className="space-y-1">
                <li>• Check your email inbox for the verification code</li>
                <li>• If not in inbox, check your spam/junk folder</li>
                <li>• The code expires in 10 minutes for security</li>
                <li>• Enter the 6-digit code exactly as received</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
