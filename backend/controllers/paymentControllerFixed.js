// Fixed Paystack Payment Controller
const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const axios = require('axios');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../utils/sendEmail');

// Initialize Payment (Fixed Version)
exports.initializePayment = asyncHandler(async (req, res) => {
  const { courseId, amount, email } = req.body;
  const userId = req.user._id;

  try {
    // Verify course exists and is available
    const course = await Course.findById(courseId).populate('tutor');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
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

    // Check if user has already paid for this course
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

    // Calculate commission and tutor amount
    const commissionPercentage = 15; // 15% platform commission
    const commissionAmount = Math.round(amount * (commissionPercentage / 100));
    const tutorAmount = amount - commissionAmount;

    // Check if Paystack is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      // TEST MODE - Simulate payment
      console.log('🧪 TEST MODE: Simulating payment initialization');
      
      const testReference = `TEST_${Date.now()}_${userId}_${courseId}`;
      
      // Create test payment record
      const payment = new Payment({
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        paystackReference: testReference,
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
          authorizationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify?reference=${testReference}`,
          accessCode: `TEST_ACCESS_${Date.now()}`,
          reference: testReference,
          testMode: true
        }
      });

      await payment.save();

      res.json({
        success: true,
        message: 'Test payment initialized successfully',
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
      return;
    }

    // REAL PAYSTACK MODE
    const paystackData = {
      email: email || user.email,
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      reference: `PAY_${Date.now()}_${userId}_${courseId}`,
      metadata: {
        userId: userId,
        courseId: courseId,
        courseTitle: course.title,
        tutorId: course.tutor._id,
        tutorName: course.tutor.name
      }
    };

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (paystackResponse.data.status) {
      // Create payment record
      const payment = new Payment({
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        paystackReference: paystackData.reference,
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
          authorizationUrl: paystackResponse.data.data.authorization_url,
          accessCode: paystackResponse.data.data.access_code,
          reference: paystackData.reference,
          testMode: false
        }
      });

      await payment.save();

      res.json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          authorizationUrl: paystackResponse.data.data.authorization_url,
          reference: paystackData.reference,
          paymentId: payment._id,
          testMode: false,
          amount: amount,
          commission: commissionAmount,
          tutorAmount: tutorAmount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.message
    });
  }
});

// Verify Payment (Fixed Version)
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  try {
    // Check if Paystack is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      // TEST MODE - Simulate successful payment
      console.log('🧪 TEST MODE: Simulating payment verification');
      
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
        message: 'Payment verified successfully (TEST MODE)',
        data: {
          payment: payment,
          enrollment: enrollment,
          testMode: true
        }
      });
      return;
    }

    // REAL PAYSTACK MODE
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (paystackResponse.data.status && paystackResponse.data.data.status === 'success') {
      const payment = await Payment.findOneAndUpdate(
        { paystackReference: reference },
        {
          status: 'successful',
          paystackData: paystackResponse.data.data,
          processedAt: new Date()
        },
        { new: true }
      );

      if (payment) {
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
          message: 'Payment verified and enrollment completed',
          data: {
            payment: payment,
            enrollment: enrollment,
            testMode: false
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Notify admin and tutor of payment
const notifyAdminOfPayment = async (payment, enrollment) => {
  try {
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

    // Create transaction record for admin tracking
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

    // Send email notification to admin
    try {
      await sendEmail({
        to: admin.email,
        subject: '💰 New Payment Received - SkillLift',
        template: 'adminPaymentNotification',
        data: {
          adminName: admin.name,
          learnerName: learner.name,
          learnerEmail: learner.email,
          courseTitle: course.title,
          tutorName: tutor.name,
          amount: payment.amount,
          commission: payment.commissionAmount,
          tutorAmount: payment.tutorAmount,
          paymentId: payment._id
        }
      });
      console.log('✅ Admin payment notification email sent');
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error);
    }

    // Notify tutor of payment
    try {
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

      // Send email to tutor
      await sendEmail({
        to: tutor.email,
        subject: '💰 Payment Received for Your Course!',
        template: 'tutorPaymentNotification',
        data: {
          tutorName: tutor.name,
          learnerName: learner.name,
          courseTitle: course.title,
          amount: payment.amount,
          tutorAmount: payment.tutorAmount,
          commission: payment.commissionAmount
        }
      });
      console.log('✅ Tutor payment notification sent');
    } catch (error) {
      console.error('❌ Failed to notify tutor:', error);
    }

    console.log('✅ Admin and tutor notified of payment');
  } catch (error) {
    console.error('Error notifying admin of payment:', error);
  }
};

// Get Payment History
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const payments = await Payment.find({ user: userId })
    .populate('course', 'title category')
    .populate('tutor', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: payments
  });
});

// Get Payment Details
exports.getPaymentDetails = asyncHandler(async (req, res) => {
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
});
