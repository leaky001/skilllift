import { createContext, useContext, useState } from 'react';
import { showSuccess, showError, showWarning, showInfo } from '../services/toastService.jsx';

const EmailVerificationContext = createContext();

export const useEmailVerification = () => {
  const context = useContext(EmailVerificationContext);
  if (!context) {
    throw new Error('useEmailVerification must be used within an EmailVerificationProvider');
  }
  return context;
};

export const EmailVerificationProvider = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState({
    isVerifying: false,
    isVerified: false,
    verificationCode: null,
    email: null,
    attempts: 0,
    maxAttempts: 3
  });

  // Generate a random 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send verification email (mock implementation)
  const sendVerificationEmail = async (email, userData) => {
    try {
      setVerificationStatus(prev => ({
        ...prev,
        isVerifying: true,
        email: email
      }));

      // Generate verification code
      const verificationCode = generateVerificationCode();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store verification data (in real app, this would be in backend)
      const verificationData = {
        email,
        code: verificationCode,
        userData,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0
      };

      localStorage.setItem('email_verification', JSON.stringify(verificationData));

      setVerificationStatus(prev => ({
        ...prev,
        isVerifying: false,
        verificationCode: verificationCode,
        attempts: 0
      }));

      // In a real app, this would be sent via email service
      console.log('Verification code sent to:', email);
      console.log('Verification code:', verificationCode); // For testing purposes
      
              showSuccess(`📧 Verification code sent to ${email}`);
      return { success: true, code: verificationCode };
    } catch (error) {
      setVerificationStatus(prev => ({
        ...prev,
        isVerifying: false
      }));
              showError('Failed to send verification email');
      return { success: false, error: error.message };
    }
  };

  // Verify the code entered by user
  const verifyCode = async (enteredCode) => {
    try {
      const storedVerification = localStorage.getItem('email_verification');
      if (!storedVerification) {
        showError('No verification code found. Please request a new one.');
        return { success: false, error: 'No verification code found' };
      }

      const verificationData = JSON.parse(storedVerification);
      
      // Check if verification has expired
      if (new Date() > new Date(verificationData.expiresAt)) {
        localStorage.removeItem('email_verification');
        showError('Verification code has expired. Please request a new one.');
        return { success: false, error: 'Verification code expired' };
      }

      // Check attempts limit
      if (verificationData.attempts >= verificationStatus.maxAttempts) {
        localStorage.removeItem('email_verification');
        showError('Too many failed attempts. Please request a new verification code.');
        return { success: false, error: 'Too many failed attempts' };
      }

      // Update attempts
      verificationData.attempts += 1;
      localStorage.setItem('email_verification', JSON.stringify(verificationData));

      setVerificationStatus(prev => ({
        ...prev,
        attempts: verificationData.attempts
      }));

      // Check if code matches
      if (enteredCode === verificationData.code) {
        setVerificationStatus(prev => ({
          ...prev,
          isVerified: true
        }));
        
        // Clear verification data
        localStorage.removeItem('email_verification');
        
        showSuccess('✅ Email verified successfully!');
        return { success: true, userData: verificationData.userData };
      } else {
        const remainingAttempts = verificationStatus.maxAttempts - verificationData.attempts;
        showError(`Invalid code. ${remainingAttempts} attempts remaining.`);
        return { success: false, error: 'Invalid code' };
      }
    } catch (error) {
              showError('Verification failed');
      return { success: false, error: error.message };
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    const storedVerification = localStorage.getItem('email_verification');
    if (!storedVerification) {
              showError('No verification data found. Please register again.');
      return { success: false, error: 'No verification data found' };
    }

    const verificationData = JSON.parse(storedVerification);
    return await sendVerificationEmail(verificationData.email, verificationData.userData);
  };

  // Clear verification status
  const clearVerificationStatus = () => {
    setVerificationStatus({
      isVerifying: false,
      isVerified: false,
      verificationCode: null,
      email: null,
      attempts: 0,
      maxAttempts: 3
    });
    localStorage.removeItem('email_verification');
  };

  // Check if user is currently in verification process
  const isInVerificationProcess = () => {
    const storedVerification = localStorage.getItem('email_verification');
    return !!storedVerification;
  };

  const value = {
    verificationStatus,
    sendVerificationEmail,
    verifyCode,
    resendVerificationCode,
    clearVerificationStatus,
    isInVerificationProcess
  };

  return (
    <EmailVerificationContext.Provider value={value}>
      {children}
    </EmailVerificationContext.Provider>
  );
};
