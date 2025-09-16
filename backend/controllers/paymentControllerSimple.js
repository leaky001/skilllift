const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const axios = require('axios');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../utils/sendEmail');

// Initialize Payment - SIMPLE WORKING VERSION
exports.initializePayment = asyncHandler(async (req, res) => {
  try {
    const { courseId, amount, email } = req.body;
    const userId = req.user._id;

    console.log('🚀 Payment initialization started:', { courseId, amount, email, userId });

    // Verify course exists
    const course = await Course.findById(courseId).populate('tutor');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      user: userId,
      course: courseId,
      status: 'successful'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this course'
      });
    }

    // Calculate amounts
    const commissionPercentage = 15;
    const commissionAmount = Math.round(amount * (commissionPercentage / 100));
    const tutorAmount = amount - commissionAmount;

    console.log('💰 Amounts calculated:', { amount, commissionAmount, tutorAmount });

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paystackReference: `TEST_${Date.now()}_${userId}_${courseId}`,
      user: userId,
      course: courseId,
      tutor: course.tutor._id,
      amount: amount,
      totalAmount: amount,
      currency: 'NGN',
      paymentMethod: 'paystack',
      commissionPercentage: commissionPercentage,
      commissionAmount: commissionAmount,
      tutorAmount: tutorAmount,
      status: 'pending',
      paystackData: {
        authorizationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify?reference=TEST_${Date.now()}_${userId}_${courseId}`,
        accessCode: `TEST_ACCESS_${Date.now()}`,
        reference: `TEST_${Date.now()}_${userId}_${courseId}`,
        testMode: true
      }
    });

    await payment.save();
    console.log('✅ Payment record created:', payment._id);

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorizationUrl: payment.paystackData.authorizationUrl,
        reference: payment.paystackReference,
        paymentId: payment._id,
        testMode: true,
        amount: amount,
        commission: commissionAmount,
        tutorAmount: tutorAmount
      }
    });

  } catch (error) {
    console.error('❌ Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.message
    });
  }
});

// Verify Payment - SIMPLE WORKING VERSION
exports.verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { reference } = req.query;
    console.log('🔍 Verifying payment:', reference);

    const payment = await Payment.findOne({ paystackReference: reference });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'successful';
    payment.processedAt = new Date();
    await payment.save();

    // Create enrollment
    const enrollment = new Enrollment({
      learner: payment.user,
      course: payment.course,
      paymentStatus: 'paid',
      paymentMethod: 'paystack',
      amountPaid: payment.amount,
      totalAmount: payment.amount,
      remainingBalance: 0,
      status: 'active',
      enrolledAt: new Date()
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { totalEnrollments: 1 }
    });

    // Notify admin and tutor
    await notifyAdminOfPayment(payment, enrollment);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment: payment,
        enrollment: enrollment,
        testMode: true
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Notify admin and tutor
const notifyAdminOfPayment = async (payment, enrollment) => {
  try {
    console.log('📧 Notifying admin and tutor of payment...');

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found for payment notification');
      return;
    }

    // Get course and user details
    const course = await Course.findById(payment.course).populate('tutor');
    const learner = await User.findById(payment.user);
    const tutor = course.tutor;

    // Create notification for admin
    await Notification.create({
      recipient: admin._id,
      type: 'payment_received',
      title: '💰 New Payment Received!',
      message: `${learner.name} paid ₦${payment.amount} for "${course.title}". Tutor: ${tutor.name}`,
      data: {
        paymentId: payment._id,
        courseId: course._id,
        learnerId: learner._id,
        tutorId: tutor._id,
        amount: payment.amount,
        commission: payment.commissionAmount,
        tutorAmount: payment.tutorAmount
      }
    });

    // Create transaction record
    await Transaction.create({
      user: learner._id,
      course: course._id,
      tutor: tutor._id,
      type: 'course_purchase',
      amount: payment.amount,
      commissionAmount: payment.commissionAmount,
      tutorAmount: payment.tutorAmount,
      status: 'completed',
      paymentMethod: 'paystack',
      paystackReference: payment.paystackReference,
      description: `Course purchase: ${course.title}`,
      processedAt: new Date()
    });

    // Notify tutor
    await Notification.create({
      recipient: tutor._id,
      type: 'payment_received',
      title: '💰 Payment Received!',
      message: `${learner.name} paid ₦${payment.amount} for your course "${course.title}". Your share: ₦${payment.tutorAmount}`,
      data: {
        paymentId: payment._id,
        courseId: course._id,
        learnerId: learner._id,
        amount: payment.amount,
        tutorAmount: payment.tutorAmount
      }
    });

    console.log('✅ Admin and tutor notified successfully');

  } catch (error) {
    console.error('❌ Error notifying admin and tutor:', error);
  }
};

// Get Payment History
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .populate('course', 'title category')
      .populate('tutor', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// Get Payment Details
exports.getPaymentDetails = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId })
      .populate('course', 'title category description')
      .populate('tutor', 'name email')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('❌ Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message
    });
  }
});
