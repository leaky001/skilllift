import apiService from './api';

// Initialize payment for a course
export const initializePayment = async (courseId, amount, email, paymentType = 'full') => {
  try {
    console.log('🔍 Initializing payment for:', { courseId, amount, email, paymentType });
    const response = await apiService.post('/payments/initialize', {
      courseId,
      amount,
      email,
      paymentType
    });
    console.log('✅ Payment initialization response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment initialization error:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (reference) => {
  try {
    console.log('🔍 Verifying payment with reference:', reference);
    const response = await apiService.post('/payments/verify', {
      reference: reference
    });
    console.log('✅ Payment verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    throw error;
  }
};

// Manual payment verification for testing
export const verifyPaymentManual = async (reference) => {
  try {
    console.log('🔍 Manual payment verification with reference:', reference);
    const response = await apiService.post('/payments/verify-manual', {
      reference: reference
    });
    console.log('✅ Manual payment verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Manual payment verification error:', error);
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async () => {
  try {
    const response = await apiService.get('/payments/history');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await apiService.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
