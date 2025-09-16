import React, { useState, useEffect } from 'react';
import { initializePayment } from '../services/paymentService';
import { showSuccess, showError } from '../services/toastService';

const PaymentModal = ({ isOpen, onClose, course, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentType, setPaymentType] = useState('full');

  // Set user's email when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 PaymentModal opened with course data:', course);
      console.log('🔍 Next installment number:', course?.nextInstallmentNumber);
      console.log('🔍 Installment amount:', course?.installmentAmount);
      
      const userData = localStorage.getItem('skilllift_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setEmail(user.email || '');
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      // Set payment type from course if available
      if (course && course.paymentType) {
        setPaymentType(course.paymentType);
      } else {
        setPaymentType('full');
      }
    }
  }, [isOpen, course]);

  const handlePayment = async () => {
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    if (!course || !course._id || !course.price) {
      showError('Invalid course information');
      return;
    }

    // Debug authentication before payment
    console.log('🔍 Payment Debug - Authentication Check:');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User data:', localStorage.getItem('skilllift_user'));
    
    // Note: Payment can be made without being logged in
    // Authentication will be handled after successful payment
    console.log('✅ Proceeding with payment (no login required)');

    setIsLoading(true);
    try {
      console.log('🔍 Starting payment for course:', course._id, 'Amount:', course.price, 'Email:', email, 'Payment Type:', paymentType);
      
      // Store course ID for redirect after payment
      localStorage.setItem('lastCourseId', course._id);
      
      // Calculate payment amount based on type
      const paymentAmount = course.price;
      
      const response = await initializePayment(course._id, paymentAmount, email, paymentType);
      
      console.log('✅ Payment initialization response:', response);
      
      if (response.success && response.data && (response.data.authorizationUrl || response.data.authorization_url)) {
        // Redirect to Paystack payment page
        const authUrl = response.data.authorizationUrl || response.data.authorization_url;
        console.log('🔄 Redirecting to Paystack:', authUrl);
        window.location.href = authUrl;
      } else {
        console.error('❌ Payment initialization failed:', response);
        showError(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        showError('Authentication failed. Please login again.');
        // Clear invalid data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('skilllift_user');
        window.location.href = '/login';
      } else if (error.response?.status === 500) {
        showError('Server error. Please check if Paystack keys are configured.');
      } else {
        showError('Payment initialization failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-2">{course.title}</h3>
          <p className="text-slate-600 text-sm mb-4">{course.description}</p>
          
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">Course Price:</span>
              <span className="font-bold text-secondary-600">
                ₦{course.price?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === 'full'}
                onChange={(e) => setPaymentType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-slate-700">
                Full Payment - ₦{course.price?.toLocaleString() || '0'}
              </span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-500 text-center">
          You will be redirected to Paystack to complete your payment securely.
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
