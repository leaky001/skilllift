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
  FaClock,
  FaPaperPlane,
  FaInbox,
  FaClipboardCheck,
  FaLifeRing
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

  const renderSuccessState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        <div className="bg-white shadow-2xl rounded-3xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-white px-10 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-3xl text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Email Verified Successfully</h2>
            <p className="text-lg text-slate-600">
              Thanks for confirming your email. We’re finishing up a few checks and will take you to your dashboard in a moment.
            </p>
          </div>
          <div className="px-10 py-8 bg-white flex items-center justify-center text-primary-600 font-medium">
            <FaSpinner className="animate-spin mr-2" />
            Redirecting you to your personalised experience…
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderDefaultState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Verification Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-8 sm:p-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="inline-flex items-center space-x-3 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
                    <FaPaperPlane />
                    <span>Action required</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-3">
                    Verify your SkillLift email
                  </h1>
                  <p className="text-slate-600 text-base sm:text-lg max-w-xl">
                    We’ve sent a 6-digit code to <span className="font-semibold text-primary-600">{email || 'your registered email address'}</span>. Enter it below to secure your account and unlock the dashboard.
                  </p>
                </div>
                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-600 items-center justify-center">
                  <FaKey className="text-2xl" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">Heads up:</span> The verification code expires in 10 minutes. If the email hasn’t arrived, check your spam folder or request a new code below.
                </p>
              </div>

              <form onSubmit={handleVerify} className="mt-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  Enter verification code
                </label>
                <div className="grid grid-cols-6 gap-3 mb-6">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="h-14 text-center text-2xl font-semibold rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all shadow-sm"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.join('').length !== 6}
                  className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-base tracking-wide py-3.5 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-600/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      Verifying your email…
                    </>
                  ) : (
                    'Confirm and continue'
                  )}
                </button>
              </form>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-slate-500 flex items-center">
                  <FaClipboardCheck className="text-primary-500 mr-2" />
                  Enter the exact digits we sent to you.
                </div>
                <button
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  className="inline-flex items-center justify-center text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending new code…
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <FaClock className="mr-2" />
                      Resend available in {countdown}s
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Resend verification code
                    </>
                  )}
                </button>
              </div>

              <div className="pt-8 mt-auto">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to sign in options
                </Link>
              </div>
            </div>
          </div>

          {/* Guidance Panel */}
          <div className="lg:col-span-2">
            <div className="relative h-full bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-3xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative p-8 sm:p-10 flex flex-col h-full">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                    <FaInbox className="text-xl" />
                  </div>
                  <h2 className="text-2xl font-semibold leading-tight mb-3">
                    The email is on its way
                  </h2>
                  <p className="text-white/90 leading-relaxed mb-8">
                    Subject: <span className="font-semibold">SkillLift Email Verification Code</span>
                    <br />
                    Sender: <span className="font-semibold">SkillLift Support</span>
                  </p>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-6 backdrop-blur-sm">
                  <p className="text-sm uppercase tracking-widest text-white/70 font-semibold mb-2">
                    Sample message
                  </p>
                  <div className="bg-white/90 text-primary-800 rounded-xl p-4 shadow-inner space-y-2">
                    <p className="font-semibold">Hi there 👋</p>
                    <p>Your SkillLift verification code is:</p>
                    <p className="text-3xl font-bold tracking-[0.35em] text-primary-600 text-center">123456</p>
                    <p className="text-sm text-primary-700/80">
                      It expires in 10 minutes. Didn’t request this? You can safely ignore this message.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-white/90">
                  <div className="flex items-start gap-3">
                    <FaClipboardCheck className="mt-1" />
                    <p>
                      Check your spam or promotions folder. Mark the email as “Not Spam” to receive future updates seamlessly.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaLifeRing className="mt-1" />
                    <p>
                      Need help? <span className="font-semibold">support@skilllift.io</span> is ready to assist you around the clock.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaEnvelope className="mt-1" />
                    <p>
                      Still can’t find it after a minute? Tap <span className="font-semibold">Resend verification code</span> to generate a fresh one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (showSuccess) {
    return renderSuccessState();
  }

  return renderDefaultState();
};

export default EmailVerification;
