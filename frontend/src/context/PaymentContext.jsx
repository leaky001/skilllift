import React, { createContext, useContext, useState, useEffect } from 'react';
import { showSuccess, showError } from '../services/toastService.jsx';
import axios from 'axios';
import { useAuth } from './AuthContext';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [installmentPlans, setInstallmentPlans] = useState([]);

  // Initialize Paystack
  const initializePaystack = (paymentData) => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_paystack_key_here',
          email: paymentData.email,
          amount: paymentData.amount * 100, // Convert to kobo (smallest currency unit)
          currency: 'NGN',
          ref: `SL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          callback: (response) => {
            // Payment successful
            handlePaymentSuccess(response, paymentData);
            resolve(response);
          },
          onClose: () => {
            // Payment cancelled
                         showError('❌ Payment cancelled');
            reject(new Error('Payment cancelled'));
          },
        });
        handler.openIframe();
      } else {
        reject(new Error('Paystack not loaded'));
      }
    });
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response, paymentData) => {
    try {
      setIsLoading(true);
      
      // Create payment record
      const paymentRecord = {
        id: response.reference,
        amount: paymentData.amount,
        currency: 'NGN',
        status: 'successful',
        paymentType: paymentData.paymentType, // 'full' or 'installment'
        courseId: paymentData.courseId,
        courseTitle: paymentData.courseTitle,
        tutorId: paymentData.tutorId,
        learnerId: paymentData.learnerId,
        commission: calculateCommission(paymentData.amount),
        tutorAmount: paymentData.amount - calculateCommission(paymentData.amount),
        timestamp: new Date().toISOString(),
        paystackRef: response.reference,
        installmentPlan: paymentData.installmentPlan || null,
      };

      // Add to local state
      setPayments(prev => [...prev, paymentRecord]);
      setPaymentHistory(prev => [...prev, paymentRecord]);

      // Show success message
      showSuccess(`💳 Payment successful! You now have access to ${paymentData.courseTitle}`);

      // TODO: Send to backend API
      // await axios.post('/api/payments', paymentRecord);

    } catch (error) {
      console.error('Error processing payment success:', error);
      showError('Payment processed but there was an error updating your account');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate platform commission (10-15%)
  const calculateCommission = (amount) => {
    const commissionRate = 0.125; // 12.5% average
    return Math.round(amount * commissionRate);
  };

  // Process course payment
  const processCoursePayment = async (paymentData) => {
    try {
      setIsLoading(true);
      
      if (paymentData.paymentType === 'installment') {
        return await processInstallmentPayment(paymentData);
      } else {
        // Initialize payment with backend
        const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/payments/initialize`, paymentData);
        
        if (response.data.success) {
          // Open Paystack popup
          return await initializePaystack(paymentData);
        } else {
          throw new Error(response.data.message || 'Failed to initialize payment');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
             showError('Payment failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process installment payment
  const processInstallmentPayment = async (paymentData) => {
    const { amount, installmentCount } = paymentData;
    const installmentAmount = Math.ceil(amount / installmentCount);
    
    // Create installment plan
    const plan = {
      id: `INST_${Date.now()}`,
      totalAmount: amount,
      installmentAmount,
      installmentCount,
      remainingAmount: amount - installmentAmount,
      paidInstallments: 1,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
      courseId: paymentData.courseId,
      learnerId: paymentData.learnerId,
    };

    setInstallmentPlans(prev => [...prev, plan]);

    // Process first installment
    const firstPaymentData = {
      ...paymentData,
      amount: installmentAmount,
      installmentPlan: plan,
    };

    return await initializePaystack(firstPaymentData);
  };

  // Process certificate payment
  const processCertificatePayment = async (certificateData) => {
    try {
      setIsLoading(true);
      
      const paymentData = {
        email: certificateData.learnerEmail,
        amount: 1500, // ₦1500 for certificates
        paymentType: 'certificate',
        courseId: certificateData.courseId,
        courseTitle: certificateData.courseTitle,
        learnerId: certificateData.learnerId,
        tutorId: certificateData.tutorId,
      };

      return await initializePaystack(paymentData);
    } catch (error) {
      console.error('Certificate payment error:', error);
             showError('Certificate payment failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process mentorship payment
  const processMentorshipPayment = async (mentorshipData) => {
    try {
      setIsLoading(true);
      
      const paymentData = {
        email: mentorshipData.learnerEmail,
        amount: mentorshipData.price, // ₦1000-₦2000
        paymentType: 'mentorship',
        mentorshipId: mentorshipData.mentorshipId,
        mentorId: mentorshipData.mentorId,
        learnerId: mentorshipData.learnerId,
      };

      return await initializePaystack(paymentData);
    } catch (error) {
      console.error('Mentorship payment error:', error);
             showError('Mentorship payment failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment history
  const getPaymentHistory = () => {
    return paymentHistory;
  };

  // Get installment plans
  const getInstallmentPlans = () => {
    return installmentPlans;
  };

  // Get payment statistics
  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCommission = payments.reduce((sum, payment) => sum + payment.commission, 0);
    
    return {
      totalPayments,
      totalAmount,
      totalCommission,
      averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0,
    };
  };

  // Load Paystack script only when authenticated and initialized
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    
    let originalFetch, originalXHROpen, originalAppendChild, originalInsertBefore, originalCreateElement;
    
    const loadPaystackScript = () => {
      if (typeof window !== 'undefined' && !window.PaystackPop) {
        // Store original methods
        originalFetch = window.fetch;
        originalXHROpen = window.XMLHttpRequest.prototype.open;
        originalAppendChild = document.head.appendChild;
        originalInsertBefore = document.head.insertBefore;
        originalCreateElement = document.createElement;
        
        // Block Paystack CSS requests
        window.fetch = function(...args) {
          const url = args[0];
          if (typeof url === 'string' && url.includes('paystack.com') && url.includes('.css')) {
            console.log('Blocking Paystack CSS fetch request:', url);
            return Promise.resolve(new Response('', { status: 200 }));
          }
          return originalFetch.apply(this, args);
        };

        // Block Paystack CSS XHR requests
        window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
          if (typeof url === 'string' && url.includes('paystack.com') && url.includes('.css')) {
            console.log('Blocking Paystack CSS XHR request:', url);
            // Return a dummy URL to prevent the request
            return originalXHROpen.call(this, method, 'data:text/css,', ...rest);
          }
          return originalXHROpen.call(this, method, url, ...rest);
        };

        // Also block any link tag insertions for Paystack CSS
        document.head.appendChild = function(element) {
          if (element.tagName === 'LINK' && element.href && element.href.includes('paystack.com') && element.href.includes('.css')) {
            console.log('Blocking Paystack CSS link insertion:', element.href);
            return element; // Return the element without actually appending it
          }
          return originalAppendChild.call(this, element);
        };

        // Also block insertBefore and other insertion methods
        document.head.insertBefore = function(element, referenceNode) {
          if (element.tagName === 'LINK' && element.href && element.href.includes('paystack.com') && element.href.includes('.css')) {
            console.log('Blocking Paystack CSS insertBefore:', element.href);
            return element;
          }
          return originalInsertBefore.call(this, element, referenceNode);
        };

        // Block any dynamic script loading that might contain CSS
        document.createElement = function(tagName) {
          const element = originalCreateElement.call(document, tagName);
          
          if (tagName.toLowerCase() === 'link') {
            // Override the href setter for link elements
            Object.defineProperty(element, 'href', {
              set: function(value) {
                if (value && value.includes('paystack.com') && value.includes('.css')) {
                  console.log('Blocking Paystack CSS href setting:', value);
                  // Set to a dummy value
                  this.setAttribute('href', 'data:text/css,');
                } else {
                  this.setAttribute('href', value);
                }
              },
              get: function() {
                return this.getAttribute('href');
              }
            });
          }
          
          return element;
        };

        // Load Paystack script with CSS blocking
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        
        // Intercept the script content before it executes
        script.onload = () => {
          console.log('Paystack script loaded successfully');
          
          // Wait a bit for the script to fully initialize
          setTimeout(() => {
            // After script loads, override Paystack's internal CSS loading methods
            if (window.PaystackPop && window.PaystackPop.Inline) {
              // Override the loadButtonCSS method to prevent CSS loading
              if (window.PaystackPop.Inline.prototype && window.PaystackPop.Inline.prototype.loadButtonCSS) {
                const originalLoadButtonCSS = window.PaystackPop.Inline.prototype.loadButtonCSS;
                window.PaystackPop.Inline.prototype.loadButtonCSS = function() {
                  console.log('Blocking Paystack internal CSS loading');
                  return Promise.resolve(); // Return resolved promise to prevent errors
                };
              }
              
              // Also override the setup method to prevent any CSS-related operations
              if (window.PaystackPop.Inline.prototype && window.PaystackPop.Inline.prototype.setup) {
                const originalSetup = window.PaystackPop.Inline.prototype.setup;
                window.PaystackPop.Inline.prototype.setup = function(config) {
                  console.log('Paystack setup called with config:', config);
                  // Remove any CSS-related configurations
                  const cleanConfig = { ...config };
                  return originalSetup.call(this, cleanConfig);
                };
              }
            }
          }, 100);
        };
        
        script.onerror = () => {
          console.error('Failed to load Paystack script');
        };
        document.head.appendChild(script);
      }
    };

    loadPaystackScript();

    // Cleanup function to restore original methods
    return () => {
      if (typeof window !== 'undefined') {
        // Restore original methods
        if (originalFetch) {
          window.fetch = originalFetch;
        }
        if (originalXHROpen) {
          window.XMLHttpRequest.prototype.open = originalXHROpen;
        }
        if (originalAppendChild) {
          document.head.appendChild = originalAppendChild;
        }
        if (originalInsertBefore) {
          document.head.insertBefore = originalInsertBefore;
        }
        if (originalCreateElement) {
          document.createElement = originalCreateElement;
        }
      }
    };
  }, [isInitialized, isAuthenticated]);

  const value = {
    payments,
    isLoading,
    paymentHistory,
    installmentPlans,
    processCoursePayment,
    processCertificatePayment,
    processMentorshipPayment,
    getPaymentHistory,
    getInstallmentPlans,
    getPaymentStats,
    calculateCommission,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
