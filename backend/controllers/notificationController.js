const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const LiveSession = require('../models/LiveSession');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Payment = require('../models/Payment');
const { sendEmail } = require('../utils/sendEmail');

// ===== GET NOTIFICATIONS =====

// @desc    Get user's notifications
// @route   GET /api/notifications/my-notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const isRead = req.query.isRead;

    console.log('🔔 Fetching notifications for user:', req.user._id);

    const filter = { recipient: req.user._id };
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email avatar')
      .maxTimeMS(15000);

    const total = await Notification.countDocuments(filter).maxTimeMS(10000);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    }).maxTimeMS(10000);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
    });
  }
});

// @desc    Get role-specific notifications
// @route   GET /api/notifications/role-notifications
// @access  Private
exports.getRoleNotifications = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  let filter = { recipient: req.user._id };
  
  // Role-specific notification types
  const roleTypes = {
    admin: [
      'course_submission',
      'course_approval',
      'course_rejection',
      'enrollment',
      'payment_received',
      'kyc_submission',
      'kyc_approval',
      'kyc_rejection',
      'system_alert',
      'user_approval',
      'user_rejection',
      'dispute_reported',
      'support_ticket'
    ],
    tutor: [
      'course_approval',
      'course_rejection',
      'enrollment',
      'payment_received',
      'assignment_submitted',
      'assignment_graded',
      'course_completed',
      'live_session_reminder',
      'live_session_started',
      'mentorship_request',
      'mentorship_accepted',
      'mentorship_rejected',
      'certificate_ready'
    ],
    learner: [
      'enrollment_confirmation',
      'course_approved',
      'course_rejected',
      'assignment_due',
      'assignment_graded',
      'course_completed',
      'live_session_reminder',
      'live_session_started',
      'certificate_ready',
      'payment_confirmation',
      'payment_reminder',
      'course_update',
      'mentorship_response'
    ]
  };

  if (roleTypes[role]) {
    filter.type = { $in: roleTypes[role] };
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email avatar');

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ 
    recipient: req.user._id, 
    isRead: false 
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount,
      role
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipient: req.user._id
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const period = req.query.period || 'week'; // week, month, year

  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'week':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
      break;
  }

  const baseFilter = { recipient: req.user._id, ...dateFilter };

  const stats = await Notification.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: ['$isRead', 0, 1] }
        }
      }
    }
  ]);

  const totalNotifications = await Notification.countDocuments(baseFilter);
  const unreadNotifications = await Notification.countDocuments({
    ...baseFilter,
    isRead: false
  });

  res.json({
    success: true,
    data: {
      stats,
      totalNotifications,
      unreadNotifications,
      period,
      role
    }
  });
});

// ===== NOTIFICATION CREATION FUNCTIONS =====

// @desc    Create course approval notification for tutor
// @route   POST /api/notifications/course-approval
// @access  Private (Admin only)
exports.createCourseApprovalNotification = asyncHandler(async (req, res) => {
  const { courseId, action, reason } = req.body;

  const course = await Course.findById(courseId).populate('tutor');
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const notificationData = {
    recipient: course.tutor._id,
    sender: req.user._id,
    type: action === 'approved' ? 'course_approval' : 'course_rejection',
    title: action === 'approved' ? 'Course Approved!' : 'Course Update Required',
    message: action === 'approved' 
      ? `Your course "${course.title}" has been approved by admin and is now live.`
      : `Your course "${course.title}" needs updates before approval. Reason: ${reason}`,
    data: {
      courseId: course._id,
      courseTitle: course.title,
      action,
      reason: reason || null,
      approvedBy: req.user._id
    },
    priority: action === 'approved' ? 'medium' : 'high'
  };

  const notification = await Notification.create(notificationData);

  // Send email notification to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: action === 'approved' 
        ? '🎉 Your Course Has Been Approved!' 
        : '⚠️ Course Update Required',
      html: `
        <h2>${action === 'approved' ? '🎉 Course Approved!' : '⚠️ Course Update Required'}</h2>
        <p>Hello ${course.tutor.name},</p>
        <p>${notificationData.message}</p>
        ${action === 'approved' 
          ? '<p>Your course is now live and students can enroll!</p>'
          : `<p><strong>Reason:</strong> ${reason}</p>`
        }
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to tutor:', error);
  }

  res.json({
    success: true,
    data: notification
  });
});

// @desc    Create enrollment notification for tutor and admin
// @route   POST /api/notifications/enrollment
// @access  Private
exports.createEnrollmentNotification = asyncHandler(async (req, res) => {
  const { courseId, studentId, enrollmentId } = req.body;

  const course = await Course.findById(courseId).populate('tutor');
  const student = await User.findById(studentId);
  
  if (!course || !student) {
    return res.status(404).json({
      success: false,
      message: 'Course or student not found'
    });
  }

  // Create notification for tutor
  const tutorNotification = await Notification.create({
    recipient: course.tutor._id,
    sender: student._id,
    type: 'enrollment',
    title: 'New Student Enrollment',
    message: `${student.name} has enrolled in your course "${course.title}".`,
    data: {
      courseId: course._id,
      courseTitle: course.title,
      studentName: student.name,
      studentId: student._id,
      enrollmentId
    },
    priority: 'medium'
  });

  // Create notification for admin
  const adminUsers = await User.find({ role: 'admin' });
  const adminNotifications = await Promise.all(
    adminUsers.map(admin => 
      Notification.create({
        recipient: admin._id,
        sender: student._id,
        type: 'enrollment',
        title: 'New Course Enrollment',
        message: `${student.name} has enrolled in "${course.title}" by ${course.tutor.name}.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          studentName: student.name,
          tutorName: course.tutor.name,
          enrollmentId
        },
        priority: 'low'
      })
    )
  );

  // Send email to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: '🎓 New Student Enrolled in Your Course!',
      html: `
        <h2>🎓 New Student Enrollment</h2>
        <p>Hello ${course.tutor.name},</p>
        <p>Great news! <strong>${student.name}</strong> has just enrolled in your course <strong>"${course.title}"</strong>.</p>
        <p>You can now start teaching them and track their progress!</p>
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to tutor:', error);
  }

  res.json({
    success: true,
    data: {
      tutorNotification,
      adminNotifications
    }
  });
});

// @desc    Create payment notification
// @route   POST /api/notifications/payment
// @access  Private
exports.createPaymentNotification = asyncHandler(async (req, res) => {
  const { courseId, studentId, amount, paymentId, paymentType } = req.body;

  const course = await Course.findById(courseId).populate('tutor');
  const student = await User.findById(studentId);
  
  if (!course || !student) {
    return res.status(404).json({
      success: false,
      message: 'Course or student not found'
    });
  }

  // Calculate commission (10-15%)
  const commission = Math.round(amount * 0.12); // 12% commission
  const tutorAmount = amount - commission;

  // Create notification for tutor
  const tutorNotification = await Notification.create({
    recipient: course.tutor._id,
    sender: student._id,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of ₦${amount.toLocaleString()} received for course "${course.title}". Your earnings: ₦${tutorAmount.toLocaleString()}`,
    data: {
      courseId: course._id,
      courseTitle: course.title,
      amount,
      tutorAmount,
      commission,
      studentName: student.name,
      paymentId,
      paymentType
    },
    priority: 'high'
  });

  // Create notification for admin
  const adminUsers = await User.find({ role: 'admin' });
  const adminNotifications = await Promise.all(
    adminUsers.map(admin => 
      Notification.create({
        recipient: admin._id,
        sender: student._id,
        type: 'payment_received',
        title: 'New Payment Received',
        message: `Payment of ₦${amount.toLocaleString()} received for course "${course.title}". Commission: ₦${commission.toLocaleString()}`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          amount,
          commission,
          studentName: student.name,
          tutorName: course.tutor.name,
          paymentId,
          paymentType
        },
        priority: 'medium'
      })
    )
  );

  // Create notification for student
  const studentNotification = await Notification.create({
    recipient: student._id,
    type: 'payment_confirmation',
    title: 'Payment Confirmed',
    message: `Your payment of ₦${amount.toLocaleString()} for "${course.title}" has been confirmed.`,
    data: {
      courseId: course._id,
      courseTitle: course.title,
      amount,
      paymentId,
      paymentType
    },
    priority: 'medium'
  });

  // Send email to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: '💰 Payment Received for Your Course!',
      html: `
        <h2>💰 Payment Received</h2>
        <p>Hello ${course.tutor.name},</p>
        <p>Great news! You've received a payment for your course <strong>"${course.title}"</strong>.</p>
        <ul>
          <li><strong>Student:</strong> ${student.name}</li>
          <li><strong>Amount:</strong> ₦${amount.toLocaleString()}</li>
          <li><strong>Your Earnings:</strong> ₦${tutorAmount.toLocaleString()}</li>
          <li><strong>Commission:</strong> ₦${commission.toLocaleString()}</li>
        </ul>
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to tutor:', error);
  }

  // Send email to student
  try {
    await sendEmail({
      to: student.email,
      subject: '✅ Payment Confirmed - Welcome to Your Course!',
      html: `
        <h2>✅ Payment Confirmed</h2>
        <p>Hello ${student.name},</p>
        <p>Your payment of <strong>₦${amount.toLocaleString()}</strong> for <strong>"${course.title}"</strong> has been confirmed!</p>
        <p>You can now access your course and start learning. Welcome to SkillLift!</p>
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to student:', error);
  }

  res.json({
    success: true,
    data: {
      tutorNotification,
      adminNotifications,
      studentNotification
    }
  });
});

// @desc    Create assignment submission notification
// @route   POST /api/notifications/assignment-submitted
// @access  Private
exports.createAssignmentSubmissionNotification = asyncHandler(async (req, res) => {
  const { assignmentId, studentId, submissionId } = req.body;

  const assignment = await Assignment.findById(assignmentId).populate('course');
  const student = await User.findById(studentId);
  const course = await Course.findById(assignment.course).populate('tutor');
  
  if (!assignment || !student || !course) {
    return res.status(404).json({
      success: false,
      message: 'Assignment, student, or course not found'
    });
  }

  // Create notification for tutor
  const tutorNotification = await Notification.create({
    recipient: course.tutor._id,
    sender: student._id,
    type: 'assignment_submitted',
    title: 'New Assignment Submission',
    message: `${student.name} has submitted an assignment for "${assignment.title}".`,
    data: {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      courseId: course._id,
      courseTitle: course.title,
      studentName: student.name,
      studentId: student._id,
      submissionId
    },
    priority: 'medium'
  });

  // Create notification for student
  const studentNotification = await Notification.create({
    recipient: student._id,
    type: 'assignment_submitted',
    title: 'Assignment Submitted Successfully',
    message: `Your assignment "${assignment.title}" has been submitted successfully.`,
    data: {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      courseId: course._id,
      courseTitle: course.title,
      submissionId
    },
    priority: 'low'
  });

  // Send email to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: '📝 New Assignment Submission',
      html: `
        <h2>📝 New Assignment Submission</h2>
        <p>Hello ${course.tutor.name},</p>
        <p><strong>${student.name}</strong> has submitted an assignment for <strong>"${assignment.title}"</strong> in your course <strong>"${course.title}"</strong>.</p>
        <p>Please review and grade the submission.</p>
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to tutor:', error);
  }

  res.json({
    success: true,
    data: {
      tutorNotification,
      studentNotification
    }
  });
});

// @desc    Create assignment graded notification
// @route   POST /api/notifications/assignment-graded
// @access  Private
exports.createAssignmentGradedNotification = asyncHandler(async (req, res) => {
  const { assignmentId, studentId, grade, feedback } = req.body;

  const assignment = await Assignment.findById(assignmentId).populate('course');
  const student = await User.findById(studentId);
  const course = await Course.findById(assignment.course).populate('tutor');
  
  if (!assignment || !student || !course) {
    return res.status(404).json({
      success: false,
      message: 'Assignment, student, or course not found'
    });
  }

  // Create notification for student
  const studentNotification = await Notification.create({
    recipient: student._id,
    sender: course.tutor._id,
    type: 'assignment_graded',
    title: 'Assignment Graded',
    message: `Your assignment "${assignment.title}" has been graded. Grade: ${grade}`,
    data: {
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      courseId: course._id,
      courseTitle: course.title,
      grade,
      feedback,
      gradedBy: course.tutor._id
    },
    priority: 'high'
  });

  // Send email to student
  try {
    await sendEmail({
      to: student.email,
      subject: '📊 Assignment Graded',
      html: `
        <h2>📊 Assignment Graded</h2>
        <p>Hello ${student.name},</p>
        <p>Your assignment <strong>"${assignment.title}"</strong> has been graded.</p>
        <ul>
          <li><strong>Grade:</strong> ${grade}</li>
          <li><strong>Course:</strong> ${course.title}</li>
          <li><strong>Tutor:</strong> ${course.tutor.name}</li>
        </ul>
        ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to student:', error);
  }

  res.json({
    success: true,
    data: studentNotification
  });
});

// @desc    Create course completion notification
// @route   POST /api/notifications/course-completed
// @access  Private
exports.createCourseCompletionNotification = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.body;

  const course = await Course.findById(courseId).populate('tutor');
  const student = await User.findById(studentId);
  
  if (!course || !student) {
    return res.status(404).json({
      success: false,
      message: 'Course or student not found'
    });
  }

  // Create notification for tutor
  const tutorNotification = await Notification.create({
    recipient: course.tutor._id,
    sender: student._id,
    type: 'course_completed',
    title: 'Student Completed Course',
    message: `${student.name} has successfully completed your course "${course.title}".`,
    data: {
      courseId: course._id,
      courseTitle: course.title,
      studentName: student.name,
      studentId: student._id,
      completedAt: new Date()
    },
    priority: 'medium'
  });

  // Create notification for student
  const studentNotification = await Notification.create({
    recipient: student._id,
    type: 'course_completed',
    title: 'Course Completed Successfully!',
    message: `Congratulations! You have successfully completed "${course.title}" by ${course.tutor.name}.`,
    data: {
      courseId: course._id,
      courseTitle: course.title,
      tutorName: course.tutor.name,
      completedAt: new Date()
    },
    priority: 'high'
  });

  // Send email to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: '🎓 Student Completed Your Course!',
      html: `
        <h2>🎓 Student Completed Your Course!</h2>
        <p>Hello ${course.tutor.name},</p>
        <p>Congratulations! <strong>${student.name}</strong> has successfully completed your course <strong>"${course.title}"</strong>.</p>
        <p>This is a great achievement for both you and your student!</p>
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to tutor:', error);
  }

  // Send email to student
  try {
    await sendEmail({
      to: student.email,
      subject: '🎓 Course Completed Successfully!',
      html: `
        <h2>🎓 Course Completed Successfully!</h2>
        <p>Hello ${student.name},</p>
        <p>Congratulations! You have successfully completed <strong>"${course.title}"</strong> by <strong>${course.tutor.name}</strong>.</p>
        <p>You can now download your certificate from your dashboard.</p>
        <p>Best regards,<br>The SkillLift Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending email to student:', error);
  }

  res.json({
    success: true,
    data: {
      tutorNotification,
      studentNotification
    }
  });
});

// @desc    Create live session notification
// @route   POST /api/notifications/live-session
// @access  Private
exports.createLiveSessionNotification = asyncHandler(async (req, res) => {
  const { sessionId, type, message } = req.body;

  const session = await LiveSession.findById(sessionId).populate('tutor course');
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Live session not found'
    });
  }

  // Get enrolled students
  const enrollments = await Enrollment.find({ 
    course: session.course._id,
    status: 'active'
  }).populate('student');

  const notifications = [];

  // Create notifications for enrolled students
  for (const enrollment of enrollments) {
    const notification = await Notification.create({
      recipient: enrollment.student._id,
      sender: session.tutor._id,
      type: `live_session_${type}`,
      title: `Live Session ${type === 'reminder' ? 'Reminder' : 'Update'}`,
      message: message || `Live session "${session.title}" ${type === 'reminder' ? 'is starting soon' : 'has been updated'}.`,
      data: {
        sessionId: session._id,
        sessionTitle: session.title,
        courseId: session.course._id,
        courseTitle: session.course.title,
        tutorName: session.tutor.name,
        sessionDate: session.scheduledDate,
        meetingLink: session.meetingLink
      },
      priority: type === 'reminder' ? 'high' : 'medium'
    });
    notifications.push(notification);
  }

  res.json({
    success: true,
    data: notifications
  });
});

// @desc    Create system notification
// @route   POST /api/notifications/system
// @access  Private (Admin only)
exports.createSystemNotification = asyncHandler(async (req, res) => {
  const { title, message, recipients, type, priority } = req.body;

  let userFilter = {};
  if (recipients && recipients !== 'all') {
    userFilter.role = recipients;
  }

  const users = await User.find(userFilter);
  const notifications = [];

  for (const user of users) {
    const notification = await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: type || 'system_alert',
      title,
      message,
      data: {
        systemNotification: true,
        createdBy: req.user._id
      },
      priority: priority || 'medium'
    });
    notifications.push(notification);
  }

  res.json({
    success: true,
    data: {
      notifications,
      totalRecipients: users.length
    }
  });
});

// Helper function to get admin user ID
const getAdminUserId = async () => {
  const admin = await User.findOne({ role: 'admin' });
  return admin ? admin._id : null;
};
