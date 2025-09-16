import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, 
  FaLock, 
  FaShieldAlt, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import apiService from '../../services/api';

const PaymentForm = ({ 
  course, 
  amount, 
  onSuccess, 
  onFailure, 
  paymentType = 'full',
  installmentPlan = null 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // form, processing, success, error

  // Payment validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    cardNumber: Yup.string()
      .matches(/^\d{16}$/, 'Card number must be 16 digits')
      .required('Card number is required'),
    expiryMonth: Yup.string()
      .matches(/^(0[1-9]|1[0-2])$/, 'Invalid month')
      .required('Expiry month is required'),
    expiryYear: Yup.string()
      .matches(/^\d{4}$/, 'Invalid year')
      .required('Expiry year is required'),
    cvv: Yup.string()
      .matches(/^\d{3,4}$/, 'CVV must be 3-4 digits')
      .required('CVV is required'),
    cardholderName: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Cardholder name is required')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsProcessing(true);
      setPaymentStep('processing');
      
      try {
        // Initialize payment with Paystack
        const response = await apiService.post('/payments/initialize', {
          email: values.email,
          amount: amount,
          courseId: course._id,
          courseTitle: course.title,
          tutorId: course.tutor,
          paymentType: paymentType,
          installmentPlan: installmentPlan,
          metadata: {
            cardholderName: values.cardholderName,
            paymentMethod: 'card'
          }
        });

        if (response.data.success) {
          // Redirect to Paystack payment page
          window.location.href = response.data.data.authorization_url;
        } else {
          throw new Error(response.data.message || 'Payment initialization failed');
        }
      } catch (error) {
        console.error('Payment error:', error);
        setPaymentStep('error');
        showError(error.response?.data?.message || 'Payment failed. Please try again.');
        onFailure?.(error);
      } finally {
        setIsProcessing(false);
      }
    }
  });

  // Generate expiry year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const expiryYears = Array.from({ length: 11 }, (_, i) => currentYear + i);

  // Generate expiry month options
  const expiryMonths = Array.from({ length: 12 }, (_, i) => 
    String(i + 1).padStart(2, '0')
  );

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    formik.setFieldValue('cardNumber', formatted);
  };

  if (paymentStep === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h3>
        <p className="text-gray-600">Please wait while we process your payment...</p>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="text-center py-12">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">You can now access your course.</p>
        <button
          onClick={() => onSuccess?.()}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Continue to Course
        </button>
      </div>
    );
  }

  if (paymentStep === 'error') {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h3>
        <p className="text-gray-600 mb-4">Something went wrong with your payment.</p>
        <button
          onClick={() => setPaymentStep('form')}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Course:</span>
            <span className="font-medium">{course?.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium text-primary-600">₦{amount?.toLocaleString()}</span>
          </div>
          {installmentPlan && (
            <div className="flex justify-between">
              <span>Installment Plan:</span>
              <span className="font-medium">{installmentPlan.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formik.touched.email && formik.errors.email
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              onChange={handleCardNumberChange}
              onBlur={formik.handleBlur}
              value={formik.values.cardNumber}
              maxLength="19"
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                formik.touched.cardNumber && formik.errors.cardNumber
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
            />
            <FaCreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {formik.touched.cardNumber && formik.errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            id="cardholderName"
            name="cardholderName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.cardholderName}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              formik.touched.cardholderName && formik.errors.cardholderName
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {formik.touched.cardholderName && formik.errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.cardholderName}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              id="expiryMonth"
              name="expiryMonth"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.expiryMonth}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                formik.touched.expiryMonth && formik.errors.expiryMonth
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
            >
              <option value="">MM</option>
              {expiryMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            {formik.touched.expiryMonth && formik.errors.expiryMonth && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.expiryMonth}</p>
            )}
          </div>

          <div>
            <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="expiryYear"
              name="expiryYear"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.expiryYear}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                formik.touched.expiryYear && formik.errors.expiryYear
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
            >
              <option value="">YYYY</option>
              {expiryYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {formik.touched.expiryYear && formik.errors.expiryYear && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.expiryYear}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              id="cvv"
              name="cvv"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.cvv}
              maxLength="4"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                formik.touched.cvv && formik.errors.cvv
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="123"
            />
            {formik.touched.cvv && formik.errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Secure Payment</p>
              <p>Your payment information is encrypted and secure. We never store your card details.</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !formik.isValid}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isProcessing || !formik.isValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </div>
          ) : (
            `Pay ₦${amount?.toLocaleString()}`
          )}
        </button>
      </form>

      {/* Payment Methods */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">We accept:</p>
        <div className="flex justify-center space-x-4">
          <div className="text-xs text-gray-500">Visa</div>
          <div className="text-xs text-gray-500">Mastercard</div>
          <div className="text-xs text-gray-500">Verve</div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentForm;
