/**
 * Frontend-Backend Integration Test Utility
 * This file provides functions to test the integration between frontend and backend
 */

import { showSuccess, showError, showWarning, showInfo } from '../services/toastService.jsx';
// Services with named exports
import { getAllAssignments } from '../services/assignment';
import { submitAssignment, getMySubmissions } from '../services/assignmentSubmissionService';
// Services with default exports
import paymentService from '../services/payment';
import kycService from '../services/kyc';
import notificationService from '../services/notification';
import ratingService from '../services/rating';
import mentorshipService from '../services/mentorship';
import certificateService from '../services/certificate';

/**
 * Test all services to verify integration
 */
export const testAllServices = async () => {
  const results = {
    assignment: false,
    payment: false,
    kyc: false,
    notification: false,
    rating: false,
    mentorship: false,
    certificate: false
  };

  try {
    // Test Assignment Service
    console.log('🧪 Testing Assignment Service...');
    const assignments = await getAllAssignments();
    if (assignments && assignments.data) {
      results.assignment = true;
      console.log('✅ Assignment Service: Working');
    }
  } catch (error) {
    console.log('❌ Assignment Service: Failed', error);
  }

  try {
    // Test Payment Service
    console.log('🧪 Testing Payment Service...');
    const payments = await paymentService.getPaymentHistory();
    if (payments && payments.data) {
      results.payment = true;
      console.log('✅ Payment Service: Working');
    }
  } catch (error) {
    console.log('❌ Payment Service: Failed', error);
  }

  try {
    // Test KYC Service
    console.log('🧪 Testing KYC Service...');
    const kycStatus = await kycService.getKYCStatus('test-user');
    if (kycStatus) {
      results.kyc = true;
      console.log('✅ KYC Service: Working');
    }
  } catch (error) {
    console.log('❌ KYC Service: Failed', error);
  }

  try {
    // Test Notification Service
    console.log('🧪 Testing Notification Service...');
    const notifications = await notificationService.getUserNotifications();
    if (notifications && notifications.data) {
      results.notification = true;
      console.log('✅ Notification Service: Working');
    }
  } catch (error) {
    console.log('❌ Notification Service: Failed', error);
  }

  try {
    // Test Rating Service
    console.log('🧪 Testing Rating Service...');
    const ratings = await ratingService.getAllRatings();
    if (ratings && ratings.data) {
      results.rating = true;
      console.log('✅ Rating Service: Working');
    }
  } catch (error) {
    console.log('❌ Rating Service: Failed', error);
  }

  try {
    // Test Mentorship Service
    console.log('🧪 Testing Mentorship Service...');
    const mentorship = await mentorshipService.getAllMentorship();
    if (mentorship && mentorship.data) {
      results.mentorship = true;
      console.log('✅ Mentorship Service: Working');
    }
  } catch (error) {
    console.log('❌ Mentorship Service: Failed', error);
  }

  try {
    // Test Certificate Service
    console.log('🧪 Testing Certificate Service...');
    const certificates = await certificateService.getAllCertificates();
    if (certificates && certificates.data) {
      results.certificate = true;
      console.log('✅ Certificate Service: Working');
    }
  } catch (error) {
    console.log('❌ Certificate Service: Failed', error);
  }

  return results;
};

/**
 * Test specific service functionality
 */
export const testServiceFunctionality = async (serviceName) => {
  const serviceTests = {
    assignment: async () => {
      const result = await getAllAssignments();
      return result;
    },
    payment: async () => {
      const result = await paymentService.getPaymentHistory();
      return result;
    },
    kyc: async () => {
      const result = await kycService.getKYCStatus('test-user');
      return result;
    },
    notification: async () => {
      const result = await notificationService.getUserNotifications();
      return result;
    },
    rating: async () => {
      const result = await ratingService.getAllRatings();
      return result;
    },
    mentorship: async () => {
      const result = await mentorshipService.getAllMentorship();
      return result;
    },
    certificate: async () => {
      const result = await certificateService.getAllCertificates();
      return result;
    }
  };

  const testFunction = serviceTests[serviceName];
  if (!testFunction) {
    showError(`Service ${serviceName} not found`);
    return false;
  }

  try {
    console.log(`🧪 Testing ${serviceName} service...`);
    const result = await testFunction();
    console.log(`✅ ${serviceName} service test successful:`, result);
    showSuccess(`${serviceName} service is working!`);
    return true;
  } catch (error) {
    console.error(`❌ ${serviceName} service test failed:`, error);
    showError(`${serviceName} service test failed`);
    return false;
  }
};

/**
 * Test API connectivity
 */
export const testAPIConnectivity = async () => {
  try {
      // Test basic API call with proper URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connectivity: Working', data);
      showSuccess('Backend API is accessible!');
      return true;
    } else {
      console.log('❌ API Connectivity: Failed', response.status);
      showWarning('Backend API returned an error');
      return false;
    }
  } catch (error) {
    console.log('❌ API Connectivity: Network error', error);
    showInfo('Backend API is not accessible - using mock data');
    return false;
  }
};

/**
 * Run comprehensive integration test
 */
export const runIntegrationTest = async () => {
  console.log('🚀 Starting Frontend-Backend Integration Test...');
  
  // Test API connectivity first
  const apiConnected = await testAPIConnectivity();
  
  // Test all services
  const serviceResults = await testAllServices();
  
  // Calculate success rate
  const totalServices = Object.keys(serviceResults).length;
  const workingServices = Object.values(serviceResults).filter(Boolean).length;
  const successRate = (workingServices / totalServices) * 100;
  
  console.log('📊 Integration Test Results:');
  console.log(`API Connected: ${apiConnected ? '✅ Yes' : '❌ No'}`);
  console.log(`Services Working: ${workingServices}/${totalServices} (${successRate.toFixed(1)}%)`);
  console.log('Detailed Results:', serviceResults);
  
  // Show results to user
  if (successRate === 100) {
    showSuccess(`🎉 All services working perfectly! (${successRate.toFixed(1)}% success)`);
  } else if (successRate >= 80) {
    showSuccess(`✅ Most services working well (${successRate.toFixed(1)}% success)`);
  } else if (successRate >= 60) {
    showWarning(`⚠️ Some services need attention (${successRate.toFixed(1)}% success)`);
  } else {
    showError(`❌ Many services failing (${successRate.toFixed(1)}% success)`);
  }

  // Log detailed results for debugging
  console.log('🔍 Detailed Service Results:');
  Object.entries(serviceResults).forEach(([service, working]) => {
    console.log(`${working ? '✅' : '❌'} ${service}: ${working ? 'Working' : 'Failed'}`);
  });
  
  return {
    apiConnected,
    serviceResults,
    successRate,
    totalServices,
    workingServices
  };
};

/**
 * Quick health check
 */
export const quickHealthCheck = async () => {
  try {
    const apiConnected = await testAPIConnectivity();
    const assignmentTest = await testServiceFunctionality('assignment');
    
    return {
      api: apiConnected,
      assignment: assignmentTest,
      overall: apiConnected && assignmentTest
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      api: false,
      assignment: false,
      overall: false,
      error: error.message
    };
  }
};

/**
 * Test email verification system
 */
export const testEmailVerification = async () => {
  try {
    console.log('🧪 Testing Email Verification System...');
    
    // Test registration endpoint
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      phone: '08012345678',
      role: 'learner'
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    if (response.ok) {
      console.log('✅ Email verification registration endpoint working');
      showSuccess('Email verification system is working!');
      return true;
    } else {
      console.log('❌ Email verification registration failed:', response.status);
      showWarning('Email verification registration endpoint returned an error');
      return false;
    }
  } catch (error) {
    console.log('❌ Email verification test failed:', error);
    showError('Email verification system test failed');
    return false;
  }
};

export default {
  testAllServices,
  testServiceFunctionality,
  testAPIConnectivity,
  runIntegrationTest,
  quickHealthCheck,
  testEmailVerification
};
