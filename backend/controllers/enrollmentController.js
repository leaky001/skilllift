const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');
const { checkAndSuspendOverdueAccounts } = require('../utils/accountSuspension');

// @desc    Enroll in course with payment validation
// @route   POST /api/enrollments
// @access  Private (Learner)
const createEnrollment = asyncHandler(async (req, res) => {
  const { courseId, paymentType = 'full' } = req.body;
  const userId = req.user._id;

  console.log('📚 Creating enrollment:', { courseId, userId, paymentType });

  // Check if course exists and is approved
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Course is not available for enrollment'
    });
  }

  // Check if course is still accepting enrollments
  if (course.enrollmentStatus === 'closed') {
    return res.status(400).json({
      success: false,
      message: 'Course enrollment is closed'
    });
  }

  // Check if course has reached maximum enrollments
  if (course.currentEnrollments >= course.maxEnrollments) {
    return res.status(400).json({
      success: false,
      message: 'Course is full'
    });
  }

  // Check if enrollment deadline has passed
  if (course.enrollmentDeadline && new Date() > course.enrollmentDeadline) {
    return res.status(400).json({
      success: false,
      message: 'Enrollment deadline has passed'
    });
  }

  // Check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    learner: userId,
    course: courseId
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: 'You are already enrolled in this course'
    });
  }

  // Check payment status for installment courses
  if (paymentType === 'installment' && course.paymentType === 'installment') {
    // Check if user has any pending payments for this course
    const pendingPayment = await Payment.findOne({
      user: userId,
      course: courseId,
      status: 'pending'
    });

    if (pendingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You have a pending payment for this course. Please complete payment first.',
        pendingPayment: {
          id: pendingPayment._id,
          amount: pendingPayment.amount,
          dueDate: pendingPayment.dueDate
        }
      });
    }
  }

  // Create enrollment
  const enrollment = new Enrollment({
    learner: userId,
    course: courseId,
    enrolledAt: new Date(),
    status: 'active',
    paymentType: paymentType,
    progress: 0,
    lastAccessed: new Date()
  });

  await enrollment.save();

  // Update course enrollment count
  course.currentEnrollments += 1;
  course.enrolledStudents.push(userId);
  await course.save();

  // Create notification for tutor
  try {
    await Notification.create({
      recipient: course.tutor,
      type: 'new_enrollment',
      title: 'New Student Enrolled!',
      message: `A new student has enrolled in your course "${course.title}"`,
      data: {
        enrollmentId: enrollment._id,
        courseId: courseId,
        learnerId: userId
      },
      isRead: false
    });
  } catch (error) {
    console.error('Error creating tutor notification:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Enrolled successfully',
    data: enrollment
  });
});

// @desc    Get user's enrollments with payment status
// @route   GET /api/enrollments/my-enrollments
// @access  Private
const getMyEnrollments = asyncHandler(async (req, res) => {
  try {
    console.log('📚 getMyEnrollments called');
    console.log('📚 Request user:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log('❌ No authenticated user found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user._id;
    const { status, paymentStatus } = req.query;

    console.log('📚 Fetching enrollments for user:', userId);
    console.log('📚 Query parameters:', { status, paymentStatus });

    let query = { learner: userId };
    
    if (status) {
      query.status = status;
    }

    console.log('📚 Database query:', query);

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title category thumbnail price durationInMonths startDate endDate')
      .populate('learner', 'name email')
      .sort({ enrolledAt: -1 })
      .maxTimeMS(10000); // 10 second timeout

    console.log('📚 Found enrollments:', enrollments.length);

    // Check for overdue payments and suspend accounts if needed
    try {
      await checkAndSuspendOverdueAccounts();
    } catch (suspensionError) {
      console.error('❌ Error checking overdue payments:', suspensionError);
      // Don't fail the enrollment fetch if suspension check fails
    }

    // Add payment status to each enrollment
    console.log('📚 Processing enrollments with payment status...');
    const enrollmentsWithPaymentStatus = await Promise.all(
      enrollments.map(async (enrollment, index) => {
        try {
          console.log(`📚 Processing enrollment ${index + 1}/${enrollments.length}:`, enrollment._id);
          
          // Skip if course is null or invalid
          if (!enrollment.course || !enrollment.course._id) {
            console.log(`⚠️ Skipping enrollment ${enrollment._id} - invalid course reference`);
            return {
              ...enrollment.toObject(),
              paymentStatus: {
                totalPaid: 0,
                totalAmount: 0,
                isComplete: false,
                pendingPayment: null,
                error: 'Invalid course reference'
              }
            };
          }
          
          const payments = await Payment.find({
            user: userId,
            course: enrollment.course._id
          }).sort({ createdAt: -1 }).maxTimeMS(5000);
          
          console.log(`📚 Found ${payments.length} payments for enrollment ${enrollment._id}`);

          const totalPaid = payments
            .filter(p => p.status === 'successful')
            .reduce((sum, p) => sum + p.amount, 0);

          const pendingPayment = payments.find(p => p.status === 'pending');
          const isPaymentComplete = totalPaid >= enrollment.course.price;

          return {
            ...enrollment.toObject(),
            paymentStatus: {
              totalPaid,
              totalAmount: enrollment.course.price,
              isComplete: isPaymentComplete,
              pendingPayment: pendingPayment ? {
                id: pendingPayment._id,
                amount: pendingPayment.amount,
                dueDate: pendingPayment.dueDate
              } : null
            }
          };
        } catch (paymentError) {
          console.error('❌ Error fetching payments for enrollment:', enrollment._id, paymentError.message);
          // Return enrollment without payment status if payment query fails
          return {
            ...enrollment.toObject(),
            paymentStatus: {
              totalPaid: 0,
              totalAmount: enrollment.course ? enrollment.course.price : 0,
              isComplete: false,
              pendingPayment: null,
              error: 'Payment data unavailable'
            }
          };
        }
      })
    );

    res.json({
      success: true,
      data: enrollmentsWithPaymentStatus
    });
  } catch (error) {
    console.error('❌ Error fetching enrollments:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error code:', error.code);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout',
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        stack: error.stack
      } : undefined
    });
  }
});

// @desc    Check installment payment status and send reminders
// @route   GET /api/enrollments/installment-status
// @access  Private
const checkInstallmentStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all enrollments with installment payments
  const enrollments = await Enrollment.find({
    learner: userId,
    paymentType: 'installment',
    status: 'active'
  }).populate('course', 'title price installmentCount installmentInterval');

  const installmentStatus = await Promise.all(
    enrollments.map(async (enrollment) => {
      const payments = await Payment.find({
        user: userId,
        course: enrollment.course._id,
        paymentType: 'installment'
      }).sort({ installmentNumber: 1 });

      const totalPaid = payments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingPayment = payments.find(p => p.status === 'pending');
      const overduePayment = payments.find(p => 
        p.status === 'pending' && 
        p.dueDate && 
        new Date() > p.dueDate
      );

      return {
        enrollmentId: enrollment._id,
        courseTitle: enrollment.course.title,
        totalAmount: enrollment.course.price,
        totalPaid,
        remainingAmount: enrollment.course.price - totalPaid,
        installmentCount: enrollment.course.installmentCount,
        paidInstallments: payments.filter(p => p.status === 'successful').length,
        pendingPayment: pendingPayment ? {
          id: pendingPayment._id,
          amount: pendingPayment.amount,
          dueDate: pendingPayment.dueDate,
          installmentNumber: pendingPayment.installmentNumber
        } : null,
        overduePayment: overduePayment ? {
          id: overduePayment._id,
          amount: overduePayment.amount,
          dueDate: overduePayment.dueDate,
          daysOverdue: Math.floor((new Date() - overduePayment.dueDate) / (1000 * 60 * 60 * 24))
        } : null
      };
    })
  );

  res.json({
    success: true,
    data: installmentStatus
  });
});

// @desc    Send installment payment reminders
// @route   POST /api/enrollments/send-reminders
// @access  Private (Admin/Tutor)
const sendInstallmentReminders = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  // Get all enrollments with pending installment payments
  const query = { paymentType: 'installment', status: 'active' };
  if (courseId) {
    query.course = courseId;
  }

  const enrollments = await Enrollment.find(query)
    .populate('learner', 'name email')
    .populate('course', 'title');

  let remindersSent = 0;

  for (const enrollment of enrollments) {
    const pendingPayment = await Payment.findOne({
      user: enrollment.learner._id,
      course: enrollment.course._id,
      status: 'pending'
    });

    if (pendingPayment) {
      const daysUntilDue = Math.floor((pendingPayment.dueDate - new Date()) / (1000 * 60 * 60 * 24));
      
      // Send reminder if payment is due within 3 days or overdue
      if (daysUntilDue <= 3) {
        try {
          // Create notification
          await Notification.create({
            recipient: enrollment.learner._id,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: `Your installment payment of ₦${pendingPayment.amount} for "${enrollment.course.title}" is ${daysUntilDue < 0 ? 'overdue' : 'due soon'}`,
            data: {
              paymentId: pendingPayment._id,
              amount: pendingPayment.amount,
              dueDate: pendingPayment.dueDate,
              courseId: enrollment.course._id
            }
          });

          // Send email reminder
          await sendEmail({
            to: enrollment.learner.email,
            subject: `💳 Payment Reminder: ${enrollment.course.title}`,
            template: 'paymentReminder',
            data: {
              name: enrollment.learner.name,
              courseTitle: enrollment.course.title,
              amount: pendingPayment.amount,
              dueDate: pendingPayment.dueDate.toLocaleDateString(),
              daysUntilDue: daysUntilDue,
              paymentLink: `${process.env.FRONTEND_URL}/payment/${pendingPayment._id}`
            }
          });

          remindersSent++;
        } catch (error) {
          console.error('Error sending reminder:', error);
        }
      }
    }
  }

  res.json({
    success: true,
    message: `Sent ${remindersSent} payment reminders`,
    remindersSent
  });
});

// @desc    Suspend enrollment due to overdue payment
// @route   POST /api/enrollments/:id/suspend
// @access  Private (Admin/Tutor)
const suspendEnrollment = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { reason = 'Overdue payment' } = req.body;

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('learner', 'name email')
    .populate('course', 'title');

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  if (enrollment.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Enrollment is not active'
    });
  }

  // Suspend enrollment
  enrollment.status = 'suspended';
  enrollment.suspensionReason = reason;
  enrollment.suspendedAt = new Date();
  await enrollment.save();

  // Create notification for learner
  try {
    await Notification.create({
      recipient: enrollment.learner._id,
      type: 'enrollment_suspended',
      title: 'Enrollment Suspended',
      message: `Your enrollment in "${enrollment.course.title}" has been suspended due to overdue payment. Please complete your payment to reactivate access.`,
      data: {
        enrollmentId: enrollment._id,
        courseId: enrollment.course._id,
        reason: reason
      }
    });

    // Send email notification
    await sendEmail({
      to: enrollment.learner.email,
      subject: `⚠️ Enrollment Suspended: ${enrollment.course.title}`,
      template: 'enrollmentSuspended',
      data: {
        name: enrollment.learner.name,
        courseTitle: enrollment.course.title,
        reason: reason,
        supportEmail: 'support@skilllift.com'
      }
    });
  } catch (error) {
    console.error('Error sending suspension notification:', error);
  }

  res.json({
    success: true,
    message: 'Enrollment suspended successfully',
    data: enrollment
  });
});

// @desc    Reactivate enrollment after payment
// @route   POST /api/enrollments/:id/reactivate
// @access  Private (Admin/Tutor)
const reactivateEnrollment = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('learner', 'name email')
    .populate('course', 'title');

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  if (enrollment.status !== 'suspended') {
    return res.status(400).json({
      success: false,
      message: 'Enrollment is not suspended'
    });
  }

  // Reactivate enrollment
  enrollment.status = 'active';
  enrollment.suspensionReason = undefined;
  enrollment.suspendedAt = undefined;
  enrollment.reactivatedAt = new Date();
  await enrollment.save();

  // Create notification for learner
  try {
    await Notification.create({
      recipient: enrollment.learner._id,
      type: 'enrollment_reactivated',
      title: 'Enrollment Reactivated!',
      message: `Your enrollment in "${enrollment.course.title}" has been reactivated. Welcome back!`,
      data: {
        enrollmentId: enrollment._id,
        courseId: enrollment.course._id
      }
    });

    // Send email notification
    await sendEmail({
      to: enrollment.learner.email,
      subject: `✅ Enrollment Reactivated: ${enrollment.course.title}`,
      template: 'enrollmentReactivated',
      data: {
        name: enrollment.learner.name,
        courseTitle: enrollment.course.title
      }
    });
  } catch (error) {
    console.error('Error sending reactivation notification:', error);
  }

  res.json({
    success: true,
    message: 'Enrollment reactivated successfully',
    data: enrollment
  });
});

// @desc    Check enrollment status for a specific course
// @route   GET /api/enrollments/check-status/:courseId
// @access  Private
const checkEnrollmentStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  console.log('🔍 Checking enrollment status:', { courseId, userId });

  try {
    // Use Promise.race to add timeout and optimize queries
    const result = await Promise.race([
      // Main optimized query with timeout
      Promise.all([
        // Check enrollment with course details in one query
        Enrollment.findOne({
          learner: userId,
          course: courseId
        }).populate('course', 'title price').lean(),
        
        // Get course details
        Course.findById(courseId).select('title price').lean(),
        
        // Get payments in one optimized query
        Payment.find({
          user: userId,
          course: courseId
        }).select('status amount paymentType dueDate').sort({ createdAt: -1 }).lean()
      ]),
      
      // Timeout after 3 seconds
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Enrollment status check timeout')), 3000)
      )
    ]);

    const [enrollment, course, payments] = result;

    // Quick calculations
    const successfulPayments = payments.filter(p => p.status === 'successful');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const coursePrice = course?.price || 0;
    const isPaymentComplete = totalPaid >= coursePrice;

    if (!enrollment) {
      // User not enrolled - return quick response
      const paidInstallments = successfulPayments.length;
      const totalInstallments = 3;
      const installmentAmount = Math.ceil(coursePrice / totalInstallments);
      const nextInstallmentNumber = paidInstallments + 1;

      return res.json({
        success: true,
        data: {
          isEnrolled: false,
          hasPayment: payments.length > 0,
          successfulPayments: successfulPayments.length,
          pendingPayments: pendingPayments.length,
          totalPaid: totalPaid,
          coursePrice: coursePrice,
          isPaymentComplete: isPaymentComplete,
          enrollmentStatus: 'not_enrolled',
          paymentStatus: payments.length > 0 ? (isPaymentComplete ? 'complete' : 'incomplete') : 'no_payments',
          remainingAmount: Math.max(0, coursePrice - totalPaid),
          installmentInfo: {
            totalInstallments: totalInstallments,
            paidInstallments: paidInstallments,
            nextInstallmentAmount: installmentAmount,
            nextInstallmentNumber: nextInstallmentNumber
          }
        }
      });
    }

    // User is enrolled - return quick response
    const paidInstallments = successfulPayments.length;
    const totalInstallments = 3;
    const installmentAmount = Math.ceil(coursePrice / totalInstallments);
    const nextInstallmentNumber = paidInstallments + 1;
    const nextInstallment = pendingPayments.find(p => p.paymentType === 'installment');
    const nextDueDate = nextInstallment?.dueDate;
    const nextInstallmentAmount = nextInstallment?.amount || installmentAmount;
    const paymentProgress = coursePrice > 0 ? (totalPaid / coursePrice) * 100 : 0;

    return res.json({
      success: true,
      data: {
        isEnrolled: true,
        enrollmentId: enrollment._id,
        enrollmentDate: enrollment.enrolledAt,
        enrollmentStatus: enrollment.status,
        hasPayment: payments.length > 0,
        successfulPayments: successfulPayments.length,
        pendingPayments: pendingPayments.length,
        totalPaid: totalPaid,
        coursePrice: coursePrice,
        isPaymentComplete: isPaymentComplete,
        paymentStatus: isPaymentComplete ? 'complete' : 'incomplete',
        remainingAmount: Math.max(0, coursePrice - totalPaid),
        paymentProgress: Math.round(paymentProgress),
        nextDueDate: nextDueDate,
        paymentType: payments.length > 0 ? payments[0].paymentType : null,
        installmentInfo: {
          totalInstallments: totalInstallments,
          paidInstallments: paidInstallments,
          nextInstallmentAmount: nextInstallmentAmount,
          nextInstallmentNumber: nextInstallmentNumber
        }
      }
    });

  } catch (error) {
    console.error('❌ Error checking enrollment status:', error);
    
    if (error.message === 'Enrollment status check timeout') {
      return res.status(408).json({
        success: false,
        message: 'Enrollment status check timed out. Please try again.',
        data: {
          isEnrolled: false,
          enrollmentStatus: 'timeout',
          paymentStatus: 'unknown'
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error checking enrollment status',
      data: {
        isEnrolled: false,
        enrollmentStatus: 'error',
        paymentStatus: 'unknown'
      }
    });
  }
});

module.exports = {
  createEnrollment,
  getMyEnrollments,
  checkEnrollmentStatus,
  checkInstallmentStatus,
  sendInstallmentReminders,
  suspendEnrollment,
  reactivateEnrollment
};