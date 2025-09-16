import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../services/paymentService';
import { showSuccess, showError } from '../services/toastService';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        
        console.log('🔍 Payment verification started');
        console.log('Reference from URL:', reference);
        console.log('Trxref from URL:', trxref);
        console.log('All search params:', Object.fromEntries(searchParams.entries()));

        if (!reference && !trxref) {
          console.log('❌ No reference found');
          setStatus('error');
          setVerifying(false);
          showError('Invalid payment reference');
          return;
        }

        console.log('🔄 Calling verifyPayment with reference:', reference || trxref);
        
        // For testing purposes, try manual verification first
        let response;
        try {
          response = await verifyPayment(reference || trxref);
        } catch (error) {
          console.log('🔄 Regular verification failed, trying manual verification...');
          // Try manual verification
          const { verifyPaymentManual } = await import('../services/paymentService');
          response = await verifyPaymentManual(reference || trxref);
        }
        console.log('✅ Payment verification response:', response);
        
        if (response.success) {
          setStatus('success');
          showSuccess('Payment successful! You are now enrolled in the course.');
          
          // Get course ID for immediate updates
          const courseId = localStorage.getItem('lastCourseId');
          
          // Trigger immediate state update across all tabs
          localStorage.setItem('payment_completed', JSON.stringify({
            timestamp: Date.now(),
            courseId: courseId,
            reference: reference || trxref
          }));
          
          // Dispatch payment completion event for real-time updates
          if (courseId) {
            window.dispatchEvent(new CustomEvent('paymentCompleted', {
              detail: {
                courseId: courseId,
                reference: reference || trxref,
                timestamp: Date.now()
              }
            }));
            console.log('🔔 Payment completion event dispatched for course:', courseId);
          }
          
          // Redirect to courses page after 1 second (reduced from 2 seconds)
          setTimeout(() => {
            if (courseId) {
              navigate(`/learner/courses/${courseId}?paymentSuccess=true&t=${Date.now()}`);
              localStorage.removeItem('lastCourseId');
            } else {
              navigate(`/learner/courses?paymentSuccess=true&t=${Date.now()}`);
            }
          }, 1000);
        } else {
          setStatus('error');
          showError(response.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('❌ Payment verification error:', error);
        setStatus('error');
        showError('Payment verification failed. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPaymentStatus();
  }, [searchParams]);

  const handleContinue = () => {
    const courseId = localStorage.getItem('lastCourseId');
    if (courseId) {
      navigate(`/learner/courses/${courseId}?paymentSuccess=true&t=${Date.now()}`);
      localStorage.removeItem('lastCourseId');
    } else {
      navigate(`/learner/courses?paymentSuccess=true&t=${Date.now()}`);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">You are now enrolled in the course. Redirecting to your courses...</p>
            <button
              onClick={handleContinue}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue to Courses
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">We couldn't verify your payment. Please try again or contact support.</p>
            <button
              onClick={handleContinue}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Courses
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentVerification;
