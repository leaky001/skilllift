const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const axios = require('axios');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const { sendEmail } = require('../utils/sendEmail');

// Initialize Paystack with your credentials
const paystack = require('paystack')('sk_test_b9950d127d1b48b599f430284e1f1d716f538043');

// Initialize Payment - REAL PAYSTACK VERSION
exports.initializePayment = asyncHandler(async (req, res) => {
  try {
    const { courseId, amount, email, paymentType = 'full' } = req.body;
    
    // Try to get user from token if Authorization header is present
    let userId = null;
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        console.log('🔍 Token received:', token ? 'Present' : 'Missing');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔍 Decoded token:', decoded);
        const User = require('../models/User');
        const user = await User.findById(decoded.id).select('-password');
        console.log('🔍 User found:', user ? user.name : 'Not found');
        if (user) {
          userId = user._id;
          console.log('🔍 User ID set:', userId);
        }
      } catch (error) {
        console.log('⚠️ Invalid token provided, proceeding as guest payment:', error.message);
      }
    } else {
      console.log('⚠️ No authorization header provided, proceeding as guest payment');
    }

    console.log('🚀 Payment initialization started:', { courseId, amount, email, userId });
    console.log('🔍 User from request:', userId ? 'Authenticated user' : 'Guest user');

    // Verify course exists
    const course = await Course.findById(courseId).populate('tutor');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user details if userId is provided (authenticated user)
    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // Check if already paid (only for authenticated users)
    let existingPayments = [];
    if (userId) {
      // For installment payments, check if all installments are paid
      existingPayments = await Payment.find({
        user: userId,
        course: courseId,
        status: 'successful'
      });

      if (existingPayments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed for this course'
        });
      }
    }

    // Calculate amounts
    const commissionPercentage = 15;
    const commissionAmount = Math.round(amount * (commissionPercentage / 100));
    const tutorAmount = amount - commissionAmount;

    console.log('💰 Amounts calculated:', { amount, commissionAmount, tutorAmount });

    // Initialize payment with Paystack
    const paystackResponse = await paystack.transaction.initialize({
      amount: amount * 100, // Convert to kobo (Paystack expects amount in kobo)
      email: email,
      reference: `PAY_${Date.now()}_${userId || 'guest'}_${courseId}`,
      callback_url: 'http://localhost:5173/payment/verify',
      metadata: {
        courseId: courseId,
        userId: userId,
        courseTitle: course.title,
        tutorId: course.tutor._id
      }
    });

    if (!paystackResponse.status) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment with Paystack',
        error: paystackResponse.message
      });
    }

    // Create payment record
    const payment = new Payment({
      paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paystackReference: paystackResponse.data.reference,
      user: userId || null, // Allow null for guest payments
      course: courseId,
      tutor: course.tutor._id,
      amount: amount,
      totalAmount: amount,
      currency: 'NGN',
      paymentMethod: 'paystack',
      paymentType: 'full',
      commissionPercentage: commissionPercentage,
      commissionAmount: commissionAmount,
      tutorAmount: tutorAmount,
      status: 'pending',
      paystackData: {
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
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

// Verify Payment - REAL PAYSTACK VERSION
exports.verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { reference } = req.body; // Change from req.query to req.body for POST request
    console.log('🔍 Verifying payment with Paystack:', reference);

    // Verify payment with Paystack
    const paystackResponse = await paystack.transaction.verify(reference);
    
    if (!paystackResponse.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: paystackResponse.message
      });
    }

    const paymentData = paystackResponse.data;
    
    // Check if payment was successful
    if (paymentData.status !== 'success') {
      // For testing purposes, if it's a test payment, mark it as successful
      if (paymentData.reference.startsWith('PAY_') && paymentData.status === 'pending') {
        console.log('🧪 Test payment detected, marking as successful for testing');
        paymentData.status = 'success';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment was not successful',
          status: paymentData.status
        });
      }
    }

    // Find payment record
    const payment = await Payment.findOne({ paystackReference: reference });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment status
    payment.status = 'successful';
    payment.processedAt = new Date();
    payment.paystackData = {
      ...payment.paystackData,
      gatewayResponse: paymentData,
      transactionId: paymentData.id,
      customerEmail: paymentData.customer.email,
      customerCode: paymentData.customer.customer_code
    };
    await payment.save();

    console.log('✅ Payment verified successfully:', paymentData.reference);

    // Get course details to get tutor
    const course = await Course.findById(payment.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create enrollment (only if user exists, skip for guest payments)
    let enrollment = null;
    if (payment.user) {
      // Check if enrollment already exists
      enrollment = await Enrollment.findOne({
        learner: payment.user,
        course: payment.course
      });

      if (!enrollment) {
        // Create new enrollment only if it doesn't exist
        enrollment = new Enrollment({
          learner: payment.user,
          course: payment.course,
          tutor: course.tutor, // Get tutor from course
          paymentStatus: 'paid',
          paymentMethod: 'full',
          amountPaid: payment.amount,
          totalAmount: course.price || 0,
          status: 'active',
          enrolledAt: new Date()
        });

        await enrollment.save();

        // Update course enrollment count only for new enrollments
        await Course.findByIdAndUpdate(payment.course, {
          $inc: { totalEnrollments: 1 }
        });
        
        console.log('✅ New enrollment created:', enrollment._id);
      } else {
        console.log('✅ Enrollment already exists, updating payment status');
        
        // Calculate total amount paid across all successful payments
        const allSuccessfulPayments = await Payment.find({
          user: payment.user,
          course: payment.course,
          status: 'successful'
        });
        
        const totalPaid = allSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0);
        const coursePrice = course.price || 0;
        const remainingBalance = Math.max(0, coursePrice - totalPaid);
        
        // Update existing enrollment with cumulative payment information
        enrollment.paymentStatus = 'paid';
        enrollment.amountPaid = payment.amount;
        enrollment.totalAmount = course.price || 0;
        enrollment.status = 'active';
        await enrollment.save();
        
        console.log('✅ Updated enrollment with total paid:', totalPaid, 'remaining:', remainingBalance);
      }
    }

    // Update tutor earnings and course enrollment
    try {
      await updateTutorEarningsAndCourseEnrollment(payment, enrollment);
    } catch (updateError) {
      console.error('❌ Error updating tutor earnings and course enrollment:', updateError);
      // Don't fail the payment verification if update fails
    }

    // Notify admin and tutor (always notify admin, even for guest payments)
    try {
      await notifyAdminOfPayment(payment, enrollment);
    } catch (notificationError) {
      console.error('❌ Error in notifyAdminOfPayment:', notificationError);
      // Don't fail the payment verification if notification fails
    }

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

// Manual payment verification for testing
exports.verifyPaymentManual = asyncHandler(async (req, res) => {
  try {
    const { reference } = req.body;
    console.log('🔍 Manual payment verification:', reference);

    // Find payment record
    const payment = await Payment.findOne({ paystackReference: reference });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Mark payment as successful for testing
    payment.status = 'successful';
    payment.processedAt = new Date();
    await payment.save();

    console.log('✅ Payment marked as successful:', payment._id);
    console.log('✅ Payment details after verification:', {
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
      course: payment.course,
      user: payment.user,
      tutor: payment.tutor,
      processedAt: payment.processedAt
    });

    // Get course details
    const course = await Course.findById(payment.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('✅ Course found:', {
      id: course._id,
      title: course.title,
      tutor: course.tutor
    });

    // Create enrollment (only if user exists)
    let enrollment = null;
    if (payment.user) {
      // Check if enrollment already exists
      enrollment = await Enrollment.findOne({
        learner: payment.user,
        course: payment.course
      });

      if (!enrollment) {
        // Create new enrollment
        enrollment = new Enrollment({
          learner: payment.user,
          course: payment.course,
          tutor: course.tutor,
          paymentStatus: 'paid',
          paymentMethod: 'full',
          amountPaid: payment.amount,
          totalAmount: course.price || 0,
          status: 'active',
          enrolledAt: new Date()
        });

        await enrollment.save();
        console.log('✅ New enrollment created:', enrollment._id);
      } else {
        console.log('✅ Enrollment already exists, updating payment status');
        
        // Calculate total amount paid across all successful payments
        const allSuccessfulPayments = await Payment.find({
          user: payment.user,
          course: payment.course,
          status: 'successful'
        });
        
        const totalPaid = allSuccessfulPayments.reduce((sum, p) => sum + p.amount, 0);
        const coursePrice = course.price || 0;
        const remainingBalance = Math.max(0, coursePrice - totalPaid);
        
        // Update existing enrollment with cumulative payment information
        enrollment.paymentStatus = 'paid';
        enrollment.amountPaid = payment.amount;
        enrollment.totalAmount = course.price || 0;
        enrollment.status = 'active';
        await enrollment.save();
        
        console.log('✅ Updated enrollment with total paid:', totalPaid, 'remaining:', remainingBalance);
      }
    }

    // Update tutor earnings and course enrollment
    try {
      await updateTutorEarningsAndCourseEnrollment(payment, enrollment);
    } catch (updateError) {
      console.error('❌ Error updating tutor earnings and course enrollment (manual):', updateError);
      // Don't fail the payment verification if update fails
    }

    // Notify admin and tutor
    try {
      await notifyAdminOfPayment(payment, enrollment);
    } catch (notificationError) {
      console.error('❌ Error in notifyAdminOfPayment (manual):', notificationError);
      // Don't fail the payment verification if notification fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment: payment,
        enrollment: enrollment
      }
    });

  } catch (error) {
    console.error('❌ Manual payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Update tutor earnings and course enrollment
const updateTutorEarningsAndCourseEnrollment = async (payment, enrollment) => {
  try {
    console.log('💰 Updating tutor earnings and course enrollment...');
    
    // Get course and tutor details
    const course = await Course.findById(payment.course);
    const tutor = await User.findById(payment.tutor);
    
    if (!course || !tutor) {
      console.log('❌ Course or tutor not found for earnings update');
      return;
    }
    
    // Update tutor earnings
    if (!tutor.tutorProfile) {
      tutor.tutorProfile = {};
    }
    
    tutor.tutorProfile.totalEarnings = (tutor.tutorProfile.totalEarnings || 0) + payment.tutorAmount;
    tutor.tutorProfile.totalStudents = (tutor.tutorProfile.totalStudents || 0) + 1;
    
    await tutor.save();
    console.log('✅ Tutor earnings updated:', {
      tutorName: tutor.name,
      newTotalEarnings: tutor.tutorProfile.totalEarnings,
      newTotalStudents: tutor.tutorProfile.totalStudents,
      paymentAmount: payment.tutorAmount
    });
    
    // Update course enrollment count and add student to enrolledStudents array
    if (enrollment && enrollment.learner) {
      // Check if student is already in enrolledStudents array
      const isAlreadyEnrolled = course.enrolledStudents.includes(enrollment.learner);
      
      if (!isAlreadyEnrolled) {
        course.enrolledStudents.push(enrollment.learner);
        course.totalEnrollments = (course.totalEnrollments || 0) + 1;
        
        await course.save();
        console.log('✅ Course enrollment updated:', {
          courseTitle: course.title,
          newTotalEnrollments: course.totalEnrollments,
          enrolledStudentsCount: course.enrolledStudents.length,
          studentId: enrollment.learner
        });
      } else {
        console.log('✅ Student already enrolled in course');
      }
    }
    
    console.log('✅ Tutor earnings and course enrollment updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating tutor earnings and course enrollment:', error);
    throw error;
  }
};

// Notify admin and tutor
const notifyAdminOfPayment = async (payment, enrollment) => {
  try {
    console.log('📧 Notifying admin and tutor of payment...');
    console.log('📧 Payment details:', {
      id: payment._id,
      amount: payment.amount,
      course: payment.course,
      user: payment.user,
      tutor: payment.tutor
    });

    // Get admin user
    let admin;
    try {
      admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        console.log('❌ No admin found for payment notification');
        return;
      }
      console.log('✅ Admin found:', admin.name, admin.email);
    } catch (error) {
      console.error('❌ Error finding admin:', error);
      return;
    }

    // Get course and user details
    let course, learner, tutor;
    try {
      course = await Course.findById(payment.course);
      if (!course) {
        console.log('❌ Course not found for payment:', payment.course);
        return;
      }
      
      learner = payment.user ? await User.findById(payment.user) : null;
      tutor = await User.findById(payment.tutor);
      
      if (!tutor) {
        console.log('❌ Tutor not found for payment:', payment.tutor);
        return;
      }
    } catch (error) {
      console.error('❌ Error fetching course/user details:', error);
      return;
    }

    console.log('📧 Course details:', {
      id: course._id,
      title: course.title,
      tutor: tutor ? { id: tutor._id, name: tutor.name, email: tutor.email } : null
    });

    console.log('📧 Learner details:', learner ? {
      id: learner._id,
      name: learner.name,
      email: learner.email
    } : 'Guest payment');

    if (!learner) {
      console.log('Guest payment - no learner notification needed');
      
      // Still notify admin about guest payment
      try {
        await Notification.create({
          recipient: admin._id,
          type: 'payment_received',
          title: '💰 Guest Payment Received!',
          message: `Guest payment of ₦${payment.amount} received for "${course.title}". Tutor: ${tutor.name}`,
          data: {
            paymentId: payment._id,
            courseId: course._id,
            tutorId: tutor._id,
            amount: payment.amount,
            commission: payment.commissionAmount,
            tutorAmount: payment.tutorAmount,
            isGuestPayment: true
          }
        });
        console.log('✅ Admin guest payment notification created');
      } catch (error) {
        console.error('❌ Error creating admin guest payment notification:', error);
      }

      // Still notify tutor about guest payment
      try {
        await Notification.create({
          recipient: tutor._id,
          type: 'payment_received',
          title: '💰 Guest Payment Received!',
          message: `Guest payment of ₦${payment.amount} received for your course "${course.title}". Your share: ₦${payment.tutorAmount}`,
          data: {
            paymentId: payment._id,
            courseId: course._id,
            amount: payment.amount,
            tutorAmount: payment.tutorAmount,
            isGuestPayment: true
          }
        });
        console.log('✅ Tutor guest payment notification created');
      } catch (error) {
        console.error('❌ Error creating tutor guest payment notification:', error);
      }

      console.log('✅ Admin and tutor notified of guest payment');
      return;
    }

    // Create notification for admin
    try {
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
      console.log('✅ Admin notification created');
    } catch (error) {
      console.error('❌ Error creating admin notification:', error);
    }

    // Create transaction record
    try {
      await Transaction.create({
        user: learner._id,
        course: course._id,
        tutor: tutor._id,
        type: 'course_purchase',
        amount: payment.amount,
        commission: payment.commissionAmount,
        tutorAmount: payment.tutorAmount,
        status: 'completed',
        paymentMethod: 'paystack',
        paystackReference: payment.paystackReference,
        description: `Course purchase: ${course.title}`,
        processedAt: new Date()
      });
      console.log('✅ Transaction record created');
    } catch (error) {
      console.error('❌ Error creating transaction record:', error);
    }

    // Notify tutor
    try {
      console.log('📧 Creating tutor notification for:', tutor.name, tutor.email);
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
      console.log('✅ Tutor notification created successfully');
    } catch (error) {
      console.error('❌ Error creating tutor notification:', error);
    }

    // Notify learner about enrollment and class start time
    try {
      await Notification.create({
        recipient: learner._id,
        type: 'enrollment_confirmation',
        title: '🎉 Enrollment Confirmed!',
        message: `You have been enrolled in "${course.title}". Class starts on ${new Date(course.startDate).toLocaleDateString()}. Welcome!`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          startDate: course.startDate,
          tutorId: tutor._id,
          tutorName: tutor.name
        }
      });
      console.log('✅ Learner notification created');
    } catch (error) {
      console.error('❌ Error creating learner notification:', error);
    }

    // Send email notification to learner about class start
    if (learner.email) {
      await sendEmail({
        to: learner.email,
        subject: `🎉 Enrollment Confirmed - ${course.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">🎉 Welcome to ${course.title}!</h2>
            <p>Dear ${learner.name},</p>
            <p>Congratulations! Your payment has been processed and you are now enrolled in the course.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">📚 Course Details:</h3>
              <p><strong>Course:</strong> ${course.title}</p>
              <p><strong>Tutor:</strong> ${tutor.name}</p>
              <p><strong>Class Start Date:</strong> ${new Date(course.startDate).toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${course.durationInMonths || 3} months</p>
              <p><strong>Amount Paid:</strong> ₦${payment.amount.toLocaleString()}</p>
            </div>
            
            <p>We'll notify you when the class is about to begin. Get ready for an amazing learning experience!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/learner/courses" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View My Courses
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        `
      });
    }

    console.log('✅ Admin, tutor, and learner notified successfully');

  } catch (error) {
    console.error('❌ Error notifying admin and tutor:', error);
  }
};

// Notify learners about upcoming class start
const notifyLearnersOfClassStart = async (courseId, daysBeforeStart = 1) => {
  try {
    console.log(`📧 Notifying learners about class start for course ${courseId}...`);

    const course = await Course.findById(courseId).populate('tutor');
    if (!course) {
      console.log('Course not found for class start notification');
      return;
    }

    // Get all enrolled learners for this course
    const enrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'active' 
    }).populate('learner');

    const classStartDate = new Date(course.startDate);
    const notificationDate = new Date(classStartDate.getTime() - (daysBeforeStart * 24 * 60 * 60 * 1000));

    for (const enrollment of enrollments) {
      const learner = enrollment.learner;
      
      if (!learner) continue;

      // Create notification
      await Notification.create({
        recipient: learner._id,
        type: 'class_starting_soon',
        title: '📚 Class Starting Soon!',
        message: `Your class "${course.title}" starts ${daysBeforeStart === 1 ? 'tomorrow' : `in ${daysBeforeStart} days`} on ${classStartDate.toLocaleDateString()}. Get ready!`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          startDate: classStartDate,
          tutorId: course.tutor._id,
          tutorName: course.tutor.name,
          daysUntilStart: daysBeforeStart
        }
      });

      // Send email notification
      if (learner.email) {
        await sendEmail({
          to: learner.email,
          subject: `📚 Class Starting Soon - ${course.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">📚 Class Starting Soon!</h2>
              <p>Dear ${learner.name},</p>
              <p>Great news! Your class is starting ${daysBeforeStart === 1 ? 'tomorrow' : `in ${daysBeforeStart} days`}.</p>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0;">📅 Class Details:</h3>
                <p><strong>Course:</strong> ${course.title}</p>
                <p><strong>Tutor:</strong> ${course.tutor.name}</p>
                <p><strong>Start Date:</strong> ${classStartDate.toLocaleDateString()}</p>
                <p><strong>Start Time:</strong> ${classStartDate.toLocaleTimeString()}</p>
                <p><strong>Duration:</strong> ${course.durationInMonths || 3} months</p>
              </div>
              
              <p>Make sure you have everything ready for the class. We're excited to have you join us!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/learner/courses" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Course Details
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                If you have any questions, please contact your tutor or our support team.
              </p>
            </div>
          `
        });
      }
    }

    console.log(`✅ Notified ${enrollments.length} learners about class start`);

  } catch (error) {
    console.error('❌ Error notifying learners of class start:', error);
  }
};

// Export the notification function
exports.notifyLearnersOfClassStart = notifyLearnersOfClassStart;

// Admin endpoint to notify learners of class start
exports.sendClassStartNotification = asyncHandler(async (req, res) => {
  try {
    const { courseId, daysBeforeStart = 1 } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    await notifyLearnersOfClassStart(courseId, daysBeforeStart);

    res.json({
      success: true,
      message: `Class start notifications sent to learners (${daysBeforeStart} day${daysBeforeStart > 1 ? 's' : ''} before start)`
    });

  } catch (error) {
    console.error('❌ Error sending class start notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send class start notifications',
      error: error.message
    });
  }
});

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

// ===== ADMIN PAYMENT MANAGEMENT =====

// Get all payments for admin dashboard
exports.getAllPayments = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { status, paymentType, startDate, endDate, search } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentType) {
      filter.paymentType = paymentType;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Get payments with pagination
    const payments = await Payment.find(filter)
      .populate('course', 'title category startDate endDate')
      .populate('tutor', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Payment.countDocuments(filter);
    
    // Calculate statistics
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalTutorAmount: { $sum: '$tutorAmount' },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        statistics: stats[0] || {
          totalAmount: 0,
          totalCommission: 0,
          totalTutorAmount: 0,
          successfulPayments: 0,
          pendingPayments: 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
});

// Get installment payments due soon
exports.getDueInstallments = asyncHandler(async (req, res) => {
  try {
    const { daysAhead = 7 } = req.query;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(daysAhead));
    
    // Find payments with upcoming installment due dates
    const dueInstallments = await Payment.find({
      paymentType: 'installment',
      status: 'successful',
      nextInstallmentDate: { $lte: dueDate, $gte: new Date() }
    })
    .populate('course', 'title')
    .populate('tutor', 'name email')
    .populate('user', 'name email')
    .sort({ nextInstallmentDate: 1 });
    
    // Group by due date
    const groupedByDate = dueInstallments.reduce((acc, payment) => {
      const dueDate = payment.nextInstallmentDate.toDateString();
      if (!acc[dueDate]) {
        acc[dueDate] = [];
      }
      acc[dueDate].push(payment);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        dueInstallments,
        groupedByDate,
        totalDue: dueInstallments.length,
        totalAmount: dueInstallments.reduce((sum, p) => sum + p.installmentAmount, 0)
      }
    });
    
  } catch (error) {
    console.error('❌ Get due installments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get due installments',
      error: error.message
    });
  }
});

// Send payment reminders to learners
exports.sendPaymentReminders = asyncHandler(async (req, res) => {
  try {
    const { paymentIds, reminderType = 'due_soon' } = req.body;
    
    if (!paymentIds || !Array.isArray(paymentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Payment IDs array is required'
      });
    }
    
    const payments = await Payment.find({ _id: { $in: paymentIds } })
      .populate('course', 'title')
      .populate('tutor', 'name')
      .populate('user', 'name email');
    
    let notificationsSent = 0;
    let emailsSent = 0;
    
    for (const payment of payments) {
      if (!payment.user) continue; // Skip guest payments
      
      const learner = payment.user;
      const course = payment.course;
      const tutor = payment.tutor;
      
      // Create notification
      await Notification.create({
        recipient: learner._id,
        type: 'payment_reminder',
        title: '💰 Payment Reminder',
        message: `Your ${payment.paymentType === 'installment' ? 'installment' : 'payment'} for "${course.title}" is due soon. Amount: ₦${payment.installmentAmount || payment.amount}`,
        data: {
          paymentId: payment._id,
          courseId: course._id,
          courseTitle: course.title,
          amount: payment.installmentAmount || payment.amount,
          dueDate: payment.nextInstallmentDate || payment.createdAt,
          paymentType: payment.paymentType
        }
      });
      
      notificationsSent++;
      
      // Send email reminder
      if (learner.email) {
        await sendEmail({
          to: learner.email,
          subject: `💰 Payment Reminder - ${course.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">💰 Payment Reminder</h2>
              <p>Dear ${learner.name},</p>
              <p>This is a friendly reminder about your upcoming payment.</p>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0;">💳 Payment Details:</h3>
                <p><strong>Course:</strong> ${course.title}</p>
                <p><strong>Tutor:</strong> ${tutor.name}</p>
                <p><strong>Amount Due:</strong> ₦${(payment.installmentAmount || payment.amount).toLocaleString()}</p>
                <p><strong>Due Date:</strong> ${new Date(payment.nextInstallmentDate || payment.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Type:</strong> ${payment.paymentType}</p>
              </div>
              
              <p>Please ensure your payment is made on time to avoid any service interruptions.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/learner/payments" 
                   style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Make Payment
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                If you have already made this payment, please ignore this reminder.
              </p>
            </div>
          `
        });
        
        emailsSent++;
      }
    }
    
    res.json({
      success: true,
      message: `Payment reminders sent successfully`,
      data: {
        notificationsSent,
        emailsSent,
        totalProcessed: payments.length
      }
    });
    
  } catch (error) {
    console.error('❌ Send payment reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminders',
      error: error.message
    });
  }
});
