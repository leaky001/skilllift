const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Enrollment = require('../models/Enrollment');
const Mentorship = require('../models/Mentorship');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { sendEmail } = require('../utils/sendEmail');
const { reactivateAccount } = require('../utils/accountSuspension');

// ===== DASHBOARD & STATISTICS =====

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalTutors = await User.countDocuments({ role: 'tutor' });
  const totalLearners = await User.countDocuments({ role: 'learner' });
  
  // KYC Statistics
  const kycStats = await User.aggregate([
    { $match: { role: 'tutor' } },
    {
      $group: {
        _id: '$tutorProfile.kycStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const formattedKYCStats = {
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };

  kycStats.forEach(stat => {
    formattedKYCStats[stat._id || 'pending'] = stat.count;
  });

  const totalCourses = await Course.countDocuments({ status: 'published' });
  const totalEnrollments = await Enrollment.countDocuments();
  const totalRevenue = await Transaction.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role accountStatus createdAt');

  const recentCourses = await Course.find({ status: 'pending' })
    .populate('tutor', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get monthly growth
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date(currentMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const thisMonthUsers = await User.countDocuments({ createdAt: { $gte: currentMonth } });
  const lastMonthUsers = await User.countDocuments({ 
    createdAt: { $gte: lastMonth, $lt: currentMonth } 
  });

  const userGrowth = lastMonthUsers > 0 ? 
    ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(2) : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalTutors,
        totalLearners,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      kycStats: formattedKYCStats,
      recentActivities: {
        users: recentUsers,
        courses: recentCourses
      },
      growth: {
        userGrowth: parseFloat(userGrowth)
      }
    }
  });
});

// ===== USER MANAGEMENT =====

exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { role, status, search, kycStatus } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.accountStatus = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Add KYC status filter for tutors
  if (kycStatus && role === 'tutor') {
    filter['tutorProfile.kycStatus'] = kycStatus;
  }

  const users = await User.find(filter)
    .select('-password -loginAttempts -lockUntil -emailVerificationToken -emailVerificationExpires -emailVerificationCode -emailVerificationCodeExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Add KYC status to each user
  const usersWithKYC = users.map(user => {
    const userObj = user.toObject();
    if (user.role === 'tutor') {
      userObj.kycStatus = user.getKYCStatus();
      userObj.canCreateCourses = user.canCreateCourses();
      userObj.canReceivePayments = user.canReceivePayments();
    } else {
      userObj.kycStatus = 'not_required';
      userObj.canCreateCourses = false;
      userObj.canReceivePayments = false;
    }
    return userObj;
  });

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: usersWithKYC,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('tutorProfile.skills')
    .populate('learnerProfile.completedCourses');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body;

  if (!['pending', 'approved', 'blocked'].includes(accountStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid account status'
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.accountStatus = accountStatus;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'User status updated successfully'
  });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'tutor', 'learner'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'User role updated successfully'
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user has active enrollments or courses
  const hasEnrollments = await Enrollment.exists({ learner: user._id, status: 'active' });
  const hasCourses = await Course.exists({ tutor: user._id, totalEnrollments: { $gt: 0 } });

  if (hasEnrollments || hasCourses) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with active enrollments or courses'
    });
  }

  await user.remove();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});











// ===== COURSE MANAGEMENT =====

exports.getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, category, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const courses = await Course.find(filter)
    .populate('tutor', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Course.countDocuments(filter);

  res.json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.toggleCourseFeature = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('tutor');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Toggle course status between published and archived
  if (course.status === 'published') {
    course.status = 'archived';
    course.archivedAt = new Date();
  } else if (course.status === 'archived') {
    course.status = 'published';
    course.publishedAt = new Date();
  } else {
    // If course is in any other status, publish it
    course.status = 'published';
    course.publishedAt = new Date();
  }

  await course.save();

  // Create notification for tutor
  try {
    await Notification.create({
      recipient: course.tutor._id,
      type: 'course_status_changed',
      title: `Course ${course.status === 'published' ? 'Published' : 'Archived'}`,
      message: `Your course "${course.title}" has been ${course.status === 'published' ? 'published' : 'archived'}`,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        status: course.status
      }
    });
  } catch (error) {
    console.error('Error creating course approval notification:', error);
  }

  // Send professional email notification to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: '🎉 Your Course Has Been Approved!',
      template: 'courseApproved',
      data: {
        name: course.tutor.name,
        email: course.tutor.email,
        courseTitle: course.title
      }
    });
    console.log('✅ Course approval email sent successfully');
  } catch (error) {
    console.error('❌ Error sending course approval email:', error);
  }

  // Notify learners about new course availability
  try {
    console.log('🔔 Notifying learners about new course availability...');
    
    // Get all learners who might be interested in this course
    // Strategy: Notify learners who have enrolled in similar courses or have matching preferences
    const interestedLearners = await User.find({
      role: 'learner',
      accountStatus: 'approved',
      $or: [
        // Learners who have enrolled in courses with same category
        { 'learnerProfile.preferences': course.category },
        // Learners who have enrolled in courses with same subcategory
        { 'learnerProfile.preferences': course.subcategory },
        // Learners who have enrolled in courses with same level
        { 'learnerProfile.preferences': course.level }
      ]
    }).limit(100); // Limit to prevent spam

    console.log(`📧 Found ${interestedLearners.length} potentially interested learners`);

    // Send notifications to interested learners
    for (const learner of interestedLearners) {
      // Create notification
      await Notification.create({
        recipient: learner._id,
        type: 'course_available',
        title: '🎓 New Course Available!',
        message: `A new course "${course.title}" in ${course.category} is now available for enrollment. Check it out!`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          courseCategory: course.category,
          courseSubcategory: course.subcategory,
          courseLevel: course.level,
          coursePrice: course.price,
          tutorName: course.tutor.name,
          courseDescription: course.description,
          courseDuration: course.duration
        },
        priority: 'medium'
      });

      // Send email notification
      await sendEmail({
        to: learner.email,
        subject: `🎓 New Course Available: ${course.title}`,
        template: 'courseAvailable',
        data: {
          name: learner.name,
          courseTitle: course.title,
          courseDescription: course.description,
          courseCategory: course.category,
          courseLevel: course.level,
          coursePrice: course.price,
          courseDuration: course.duration,
          tutorName: course.tutor.name
        }
      });
    }

    console.log(`✅ Notified ${interestedLearners.length} learners about new course availability`);
  } catch (error) {
    console.error('❌ Error notifying learners about course availability:', error);
  }

  res.json({
    success: true,
    data: course,
    message: 'Course status updated successfully'
  });
});

exports.rejectCourse = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const course = await Course.findById(req.params.id).populate('tutor');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Course is not pending approval'
    });
  }

  course.status = 'rejected';
  course.rejectionReason = rejectionReason;

  await course.save();

  // Create notification for tutor
  try {
    await Notification.create({
      recipient: course.tutor._id,
      type: 'course_rejection',
      title: 'Course Update Required',
      message: `Your course "${course.title}" needs updates before approval. Reason: ${rejectionReason}`,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        action: 'rejected',
        reason: rejectionReason
      }
    });
  } catch (error) {
    console.error('Error creating course rejection notification:', error);
  }

  // Send professional email notification to tutor
  try {
    await sendEmail({
      to: course.tutor.email,
      subject: 'Course Update Required',
      template: 'courseRejected',
      data: {
        name: course.tutor.name,
        email: course.tutor.email,
        courseTitle: course.title,
        rejectionReason: rejectionReason
      }
    });
    console.log('✅ Course rejection email sent successfully');
  } catch (error) {
    console.error('❌ Error sending course rejection email:', error);
  }

  res.json({
    success: true,
    data: course,
    message: 'Course rejected successfully'
  });
});

exports.toggleCourseFeature = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  course.isFeatured = !course.isFeatured;
  await course.save();

  res.json({
    success: true,
    data: course,
    message: `Course ${course.isFeatured ? 'featured' : 'unfeatured'} successfully`
  });
});

// ===== PAYMENT & TRANSACTION MANAGEMENT =====

exports.getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, paymentType, startDate, endDate } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (paymentType) filter.paymentType = paymentType;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(filter)
    .populate('user', 'name email')
    .populate('course', 'title')
    .populate('tutor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(filter);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, type, startDate, endDate } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter)
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(filter);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getPendingPayouts = asyncHandler(async (req, res) => {
  const payouts = await Transaction.find({ 
    type: 'payout', 
    status: 'pending' 
  })
  .populate('user', 'name email')
  .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: payouts
  });
});

exports.processPayout = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Transaction is not pending'
    });
  }

  // In a real implementation, this would integrate with a payment processor
  transaction.status = 'completed';
  transaction.processedAt = new Date();
  transaction.processedBy = req.user._id;
  await transaction.save();

  res.json({
    success: true,
    data: transaction,
    message: 'Payout processed successfully'
  });
});

exports.getFinancialSummary = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Transaction statistics
  const transactionStats = await Transaction.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCommission: { $sum: '$commissionAmount' },
        totalPayouts: { $sum: '$tutorAmount' }
      }
    }
  ]);

  // Payment statistics
  const paymentStats = await Payment.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'successful'
      } 
    },
    {
      $group: {
        _id: '$paymentType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      timeframe,
      transactionStats: transactionStats[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        totalCommission: 0,
        totalPayouts: 0
      },
      paymentStats
    }
  });
});

// ===== CONTENT MODERATION =====

exports.getReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, type } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  // This would typically come from a Report model
  // For now, returning mock data
  const reports = [
    {
      id: 1,
      type: 'course',
      reason: 'Inappropriate content',
      status: 'pending',
      reportedBy: 'user123',
      reportedItem: 'course456',
      description: 'Course contains inappropriate material',
      createdAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: reports,
    pagination: {
      page,
      limit,
      total: reports.length,
      pages: 1
    }
  });
});

exports.resolveReport = asyncHandler(async (req, res) => {
  const { resolution, notes } = req.body;

  // This would typically update a Report model
  res.json({
    success: true,
    message: 'Report resolved successfully'
  });
});

exports.getFlaggedContent = asyncHandler(async (req, res) => {
  // This would typically fetch content flagged by users or automated systems
  const flaggedContent = [
    {
      id: 1,
      type: 'course',
      contentId: 'course123',
      reason: 'Inappropriate content',
      flaggedBy: 'user456',
      status: 'pending',
      createdAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: flaggedContent
  });
});

exports.moderateContent = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const { type, id } = req.params;

  // This would typically moderate content based on type and action
  res.json({
    success: true,
    message: 'Content moderated successfully'
  });
});

// ===== SYSTEM SETTINGS =====

exports.getSystemSettings = asyncHandler(async (req, res) => {
  // This would typically fetch from a Settings model
  const settings = {
    platformCommission: 15,
    maxFileSize: 100, // MB
    allowedFileTypes: ['jpg', 'png', 'pdf', 'mp4'],
    emailNotifications: true,
    maintenanceMode: false,
    registrationEnabled: true
  };

  res.json({
    success: true,
    data: settings
  });
});

exports.updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = req.body;

  // This would typically update a Settings model
  res.json({
    success: true,
    message: 'Settings updated successfully'
  });
});

exports.getSystemLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // This would typically fetch from a Log model
  const logs = [
    {
      id: 1,
      level: 'info',
      message: 'User registered successfully',
      userId: 'user123',
      timestamp: new Date(),
      ip: '192.168.1.1'
    }
  ];

  res.json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total: logs.length,
      pages: 1
    }
  });
});

// ===== ANALYTICS =====

exports.getPlatformStatistics = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const userStats = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        verified: { $sum: { $cond: ['$isEmailVerified', 1, 0] } }
      }
    }
  ]);

  const courseStats = await Course.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEnrollments: { $sum: '$totalEnrollments' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);

  const revenueStats = await Transaction.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCommission: { $sum: '$commissionAmount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      timeframe,
      userStats,
      courseStats,
      revenueStats
    }
  });
});

exports.getUserAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // User registration trends
  const registrationTrends = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Role distribution
  const roleDistribution = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      timeframe,
      registrationTrends,
      roleDistribution
    }
  });
});

exports.getCourseAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Course creation trends
  const creationTrends = await Course.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Category performance
  const categoryPerformance = await Course.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalEnrollments: { $sum: '$totalEnrollments' },
        totalRevenue: { $sum: '$totalRevenue' },
        averageRating: { $avg: '$rating' }
      }
    },
    { $sort: { totalEnrollments: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      timeframe,
      creationTrends,
      categoryPerformance
    }
  });
});

exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Revenue trends
  const revenueTrends = await Transaction.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        totalCommission: { $sum: '$commissionAmount' },
        transactionCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Revenue by type
  const revenueByType = await Transaction.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: '$type',
        totalRevenue: { $sum: '$amount' },
        totalCommission: { $sum: '$commissionAmount' },
        transactionCount: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      timeframe,
      revenueTrends,
      revenueByType
    }
  });
});

exports.getEngagementAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Enrollment trends
  const enrollmentTrends = await Enrollment.aggregate([
    { $match: { enrolledAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$enrolledAt' },
          month: { $month: '$enrolledAt' },
          day: { $dayOfMonth: '$enrolledAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Course completion rates
  const completionRates = await Enrollment.aggregate([
    { $match: { enrolledAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedEnrollments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        averageProgress: { $avg: '$progress' }
      }
    }
  ]);

  // Rating distribution
  const ratingDistribution = await Rating.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$overallRating',
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      timeframe,
      enrollmentTrends,
      completionRates: completionRates[0] || {
        totalEnrollments: 0,
        completedEnrollments: 0,
        averageProgress: 0
      },
      ratingDistribution
    }
  });
});

// ===== USER APPROVAL MANAGEMENT =====

exports.approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if this is a tutor with submitted KYC
  if (user.role === 'tutor' && user.tutorProfile?.kycStatus === 'submitted') {
    // Approve KYC
    await user.approveKYC(req.user._id, 'Approved via admin panel');

    // Create notification for tutor
    await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: 'kyc_approval',
      title: 'KYC Verification Approved',
      message: 'Congratulations! Your KYC verification has been approved. You can now create courses and receive payments.',
      isRead: false,
      priority: 'high'
    });

    return res.json({
      success: true,
      message: 'Tutor KYC approved successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.tutorProfile.kycStatus,
        approvedAt: user.tutorProfile.kycDocuments.reviewedAt
      }
    });
  }

  // For non-tutors or tutors without submitted KYC, just approve account
  if (user.accountStatus === 'pending') {
    user.accountStatus = 'approved';
    await user.save();

    // Create notification for the user
    try {
      await Notification.create({
        user: user._id,
        type: 'account_approved',
        title: 'Account Approved!',
        message: `Congratulations! Your account has been approved by admin. You can now login and start using SkillLift.`,
        isRead: false,
        priority: 'high',
        metadata: {
          action: 'approved',
          approvedBy: req.user._id
        }
      });
    } catch (error) {
      console.error('Error creating approval notification:', error);
    }

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus
      },
      message: 'User approved successfully'
    });
  }

  return res.status(400).json({
    success: false,
    message: 'User is not pending approval'
  });
});

exports.rejectUser = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if this is a tutor with submitted KYC
  if (user.role === 'tutor' && user.tutorProfile?.kycStatus === 'submitted') {
    // Reject KYC
    await user.rejectKYC(req.user._id, rejectionReason, 'Rejected via admin panel');

    // Create notification for tutor
    await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: 'kyc_rejection',
      title: 'KYC Verification Rejected',
      message: `Your KYC verification has been rejected. Reason: ${rejectionReason}. Please resubmit your documents with the required corrections.`,
      isRead: false,
      priority: 'high',
      data: { rejectionReason: rejectionReason }
    });

    return res.json({
      success: true,
      message: 'Tutor KYC rejected successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.tutorProfile.kycStatus,
        rejectionReason: rejectionReason,
        rejectedAt: user.tutorProfile.kycDocuments.reviewedAt
      }
    });
  }

  // For non-tutors or tutors without submitted KYC, reject account
  if (user.accountStatus === 'pending') {
    user.accountStatus = 'blocked';
    await user.save();

    // Create notification for the user
    try {
      await Notification.create({
        user: user._id,
        type: 'account_rejected',
        title: 'Account Application Rejected',
        message: `Your account application has been rejected. Reason: ${rejectionReason}. Please contact support if you have any questions.`,
        isRead: false,
        priority: 'high',
        metadata: {
          action: 'rejected',
          reason: rejectionReason,
          rejectedBy: req.user._id
        }
      });
    } catch (error) {
      console.error('Error creating rejection notification:', error);
    }

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus
      },
      message: 'User rejected successfully'
    });
  }

  return res.status(400).json({
    success: false,
    message: 'User is not pending approval'
  });
});

exports.getPendingUsers = asyncHandler(async (req, res) => {
  // Get tutors with pending KYC submissions
  const pendingTutors = await User.find({
    role: 'tutor',
    'tutorProfile.kycStatus': 'submitted'
  }).select('-password -loginAttempts -lockUntil -emailVerificationToken -emailVerificationExpires -emailVerificationCode -emailVerificationCodeExpires')
    .sort({ 'tutorProfile.kycDocuments.submittedAt': 1 });

  // Add KYC status to each user
  const usersWithKYC = pendingTutors.map(user => {
    const userObj = user.toObject();
    userObj.kycStatus = user.getKYCStatus();
    userObj.canCreateCourses = user.canCreateCourses();
    userObj.canReceivePayments = user.canReceivePayments();
    return userObj;
  });

  res.json({
    success: true,
    data: usersWithKYC
  });
});

// ===== ADDITIONAL DASHBOARD FUNCTIONS =====

exports.getRecentUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name email role accountStatus createdAt');

  res.json({
    success: true,
    data: recentUsers
  });
});

exports.getRecentTransactions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const recentTransactions = await Transaction.find()
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('amount status paymentMethod createdAt');

  res.json({
    success: true,
    data: recentTransactions
  });
});

exports.getComplaints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;

  const complaints = await Notification.find({
    type: 'complaint',
    ...filter
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments({
    type: 'complaint',
    ...filter
  });

  res.json({
    success: true,
    data: complaints,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// ===== RATING MANAGEMENT =====

exports.getPendingRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const ratings = await Rating.find({
    status: { $in: ['pending', 'flagged'] }
  })
    .populate('rater', 'name email')
    .populate({
      path: 'ratedEntity',
      select: 'title category tutor',
      populate: {
        path: 'tutor',
        select: 'name email'
      }
    })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Rating.countDocuments({
    status: { $in: ['pending', 'flagged'] }
  });

  res.json({
    success: true,
    data: ratings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getAllRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, tutorId } = req.query;
  const skip = (page - 1) * limit;

  console.log('🔍 Admin getAllRatings called with:', { page, limit, status, tutorId });

  const filter = {};
  if (status) filter.status = status;
  if (tutorId) filter.tutorId = tutorId;

  console.log('🔍 Filter applied:', filter);

  // First check total count
  const total = await Rating.countDocuments(filter);
  console.log('📊 Total ratings found:', total);

  const ratings = await Rating.find(filter)
    .populate('rater', 'name email')
    .populate({
      path: 'ratedEntity',
      select: 'title category tutor',
      populate: {
        path: 'tutor',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  console.log('📋 Ratings returned:', ratings.length);
  console.log('📋 Sample rating:', ratings[0] ? {
    id: ratings[0]._id,
    rater: ratings[0].rater?.name,
    course: ratings[0].ratedEntity?.title,
    rating: ratings[0].overallRating,
    status: ratings[0].status
  } : 'No ratings');

  res.json({
    success: true,
    data: ratings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.approveRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Rating not found'
    });
  }

  rating.status = 'approved';
  rating.approvedBy = req.user._id;
  rating.approvedAt = new Date();
  await rating.save();

  res.json({
    success: true,
    data: rating,
    message: 'Rating approved successfully'
  });
});

exports.rejectRating = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Rating not found'
    });
  }

  rating.status = 'rejected';
  rating.rejectionReason = rejectionReason;
  rating.rejectedBy = req.user._id;
  rating.rejectedAt = new Date();
  await rating.save();

  res.json({
    success: true,
    data: rating,
    message: 'Rating rejected successfully'
  });
});

exports.flagRating = asyncHandler(async (req, res) => {
  const { flagReason } = req.body;
  
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Rating not found'
    });
  }

  rating.status = 'flagged';
  rating.flagReason = flagReason;
  rating.flaggedBy = req.user._id;
  rating.flaggedAt = new Date();
  await rating.save();

  res.json({
    success: true,
    data: rating,
    message: 'Rating flagged successfully'
  });
});

exports.getRatingStatistics = asyncHandler(async (req, res) => {
  const totalRatings = await Rating.countDocuments();
  const pendingRatings = await Rating.countDocuments({ status: 'pending' });
  const approvedRatings = await Rating.countDocuments({ status: 'approved' });
  const rejectedRatings = await Rating.countDocuments({ status: 'rejected' });
  const flaggedRatings = await Rating.countDocuments({ status: 'flagged' });

  const averageRating = await Rating.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$overallRating' } } }
  ]);

  // Get top-rated tutors
  const topTutors = await Rating.aggregate([
    { $match: { status: 'approved', tutorId: { $exists: true } } },
    { $group: { 
      _id: '$tutorId', 
      averageRating: { $avg: '$overallRating' },
      totalRatings: { $sum: 1 }
    }},
    { $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'tutor'
    }},
    { $unwind: '$tutor' },
    { $sort: { averageRating: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      totalRatings,
      pendingRatings,
      approvedRatings,
      rejectedRatings,
      flaggedRatings,
      averageRating: averageRating.length > 0 ? Math.round(averageRating[0].avg * 10) / 10 : 0,
      topTutors
    }
  });
});

// ===== ENROLLMENT MANAGEMENT =====

exports.getAllEnrollments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, courseId } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (courseId) filter.course = courseId;

  const enrollments = await Enrollment.find(filter)
    .populate('learner', 'name email')
    .populate('course', 'title category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Enrollment.countDocuments(filter);

  res.json({
    success: true,
    data: enrollments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getEnrollmentStats = asyncHandler(async (req, res) => {
  const totalEnrollments = await Enrollment.countDocuments();
  const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
  const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
  const droppedEnrollments = await Enrollment.countDocuments({ status: 'dropped' });

  // Monthly enrollment trends
  const monthlyEnrollments = await Enrollment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    data: {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      droppedEnrollments,
      monthlyEnrollments
    }
  });
});

// ===== TUTOR PERFORMANCE =====

exports.getTutorPerformance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const tutors = await User.find({ role: 'tutor' })
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get performance data for each tutor
  const tutorsWithPerformance = await Promise.all(
    tutors.map(async (tutor) => {
      const courses = await Course.countDocuments({ tutor: tutor._id });
      const enrollments = await Enrollment.countDocuments({ 
        course: { $in: await Course.find({ tutor: tutor._id }).distinct('_id') }
      });
      const ratings = await Rating.find({ tutorId: tutor._id, status: 'approved' });
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length 
        : 0;

      return {
        ...tutor.toObject(),
        courses,
        enrollments,
        totalRatings: ratings.length,
        averageRating: Math.round(averageRating * 10) / 10
      };
    })
  );

  const total = await User.countDocuments({ role: 'tutor' });

  res.json({
    success: true,
    data: tutorsWithPerformance,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getTutorStats = asyncHandler(async (req, res) => {
  const tutorId = req.params.tutorId;
  
  const tutor = await User.findById(tutorId);
  if (!tutor || tutor.role !== 'tutor') {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  const courses = await Course.find({ tutor: tutorId });
  const enrollments = await Enrollment.countDocuments({ 
    course: { $in: courses.map(c => c._id) }
  });
  const ratings = await Rating.find({ tutorId, status: 'approved' });
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length 
    : 0;

  const monthlyRevenue = await Transaction.aggregate([
    { $match: { status: 'completed', course: { $in: courses.map(c => c._id) } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      tutor: {
        name: tutor.name,
        email: tutor.email,
        joinDate: tutor.createdAt
      },
      courses: courses.length,
      enrollments,
      totalRatings: ratings.length,
      averageRating: Math.round(averageRating * 10) / 10,
      monthlyRevenue
    }
  });
});

// ===== LEARNER ACTIVITY =====

exports.getLearnerActivity = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const learners = await User.find({ role: 'learner' })
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get activity data for each learner
  const learnersWithActivity = await Promise.all(
    learners.map(async (learner) => {
      const enrollments = await Enrollment.countDocuments({ learner: learner._id });
      const completedCourses = await Enrollment.countDocuments({ 
        learner: learner._id, 
        status: 'completed' 
      });
      const ratings = await Rating.countDocuments({ rater: learner._id });

      return {
        ...learner.toObject(),
        enrollments,
        completedCourses,
        ratings
      };
    })
  );

  const total = await User.countDocuments({ role: 'learner' });

  res.json({
    success: true,
    data: learnersWithActivity,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getLearnerStats = asyncHandler(async (req, res) => {
  const learnerId = req.params.learnerId;
  
  const learner = await User.findById(learnerId);
  if (!learner || learner.role !== 'learner') {
    return res.status(404).json({
      success: false,
      message: 'Learner not found'
    });
  }

  const enrollments = await Enrollment.find({ learner: learnerId })
    .populate('course', 'title category')
    .sort({ createdAt: -1 });

  const ratings = await Rating.find({ rater: learnerId })
    .populate('ratedEntity', 'title category');

  const totalSpent = await Transaction.aggregate([
    { $match: { user: learnerId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    data: {
      learner: {
        name: learner.name,
        email: learner.email,
        joinDate: learner.createdAt
      },
      enrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      ratings: ratings.length,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
      enrollments: enrollments.slice(0, 10),
      ratings: ratings.slice(0, 10)
    }
  });
});

// ===== KYC MANAGEMENT =====

// Get pending KYC submissions
exports.getPendingKYC = asyncHandler(async (req, res) => {
  const pendingTutors = await User.find({
    role: 'tutor',
    'tutorProfile.kycStatus': 'submitted'
  }).select('name email phone tutorProfile createdAt')
    .sort({ 'tutorProfile.kycDocuments.submittedAt': 1 });

  res.json({
    success: true,
    data: pendingTutors
  });
});

// Get all tutors with KYC status
exports.getAllTutorsKYC = asyncHandler(async (req, res) => {
  const tutors = await User.find({ role: 'tutor' })
    .select('name email phone tutorProfile createdAt')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: tutors
  });
});

// Get KYC statistics
exports.getKYCStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    { $match: { role: 'tutor' } },
    {
      $group: {
        _id: '$tutorProfile.kycStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const formattedStats = {
    total: 0,
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    formattedStats.total += stat.count;
    formattedStats[stat._id || 'pending'] = stat.count;
  });

  res.json({
    success: true,
    data: formattedStats
  });
});

// Approve KYC
exports.approveKYC = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { notes } = req.body;

  const tutor = await User.findById(tutorId);
  
  if (!tutor) {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  if (tutor.role !== 'tutor') {
    return res.status(400).json({
      success: false,
      message: 'User is not a tutor'
    });
  }

  if (tutor.tutorProfile?.kycStatus !== 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'KYC is not in submitted status'
    });
  }

  await tutor.approveKYC(req.user._id, notes);

  // Create notification for tutor
  await Notification.create({
    recipient: tutor._id,
    sender: req.user._id,
    type: 'kyc_approval',
    title: 'KYC Verification Approved',
    message: 'Congratulations! Your KYC verification has been approved. You can now create courses and receive payments.',
    isRead: false,
    priority: 'high'
  });

  res.json({
    success: true,
    message: 'KYC approved successfully',
    data: {
      tutorId: tutor._id,
      tutorName: tutor.name,
      kycStatus: tutor.tutorProfile.kycStatus,
      approvedAt: tutor.tutorProfile.kycDocuments.reviewedAt
    }
  });
});

// Reject KYC
exports.rejectKYC = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { reason, notes } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const tutor = await User.findById(tutorId);
  
  if (!tutor) {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  if (tutor.role !== 'tutor') {
    return res.status(400).json({
      success: false,
      message: 'User is not a tutor'
    });
  }

  if (tutor.tutorProfile?.kycStatus !== 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'KYC is not in submitted status'
    });
  }

  await tutor.rejectKYC(req.user._id, reason, notes);

  // Create notification for tutor
  await Notification.create({
    recipient: tutor._id,
    sender: req.user._id,
    type: 'kyc_rejection',
    title: 'KYC Verification Rejected',
    message: `Your KYC verification has been rejected. Reason: ${reason}. Please resubmit your documents with the required corrections.`,
    isRead: false,
    priority: 'high',
    data: { rejectionReason: reason }
  });

  res.json({
    success: true,
    message: 'KYC rejected successfully',
    data: {
      tutorId: tutor._id,
      tutorName: tutor.name,
      kycStatus: tutor.tutorProfile.kycStatus,
      rejectionReason: reason,
      rejectedAt: tutor.tutorProfile.kycDocuments.reviewedAt
    }
  });
});

// ===== ACCOUNT MANAGEMENT =====

// Reactivate suspended account
exports.reactivateAccount = asyncHandler(async (req, res) => {
  try {
    const { learnerId } = req.params;
    const adminId = req.user._id;

    console.log(`🔄 Admin ${req.user.name} reactivating account for learner: ${learnerId}`);

    // Check if learner exists and is suspended
    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({
        success: false,
        message: 'Learner not found'
      });
    }

    if (learner.accountStatus !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Account is not suspended'
      });
    }

    // Reactivate the account
    await reactivateAccount(learnerId, adminId);

    res.json({
      success: true,
      message: 'Account reactivated successfully',
      data: {
        learnerId: learnerId,
        reactivatedBy: adminId,
        reactivatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error reactivating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate account',
      error: error.message
    });
  }
});

// Get suspended accounts
exports.getSuspendedAccounts = asyncHandler(async (req, res) => {
  try {
    const suspendedUsers = await User.find({ 
      accountStatus: 'suspended',
      role: 'learner'
    }).select('name email suspensionReason suspendedAt createdAt');

    res.json({
      success: true,
      data: suspendedUsers
    });

  } catch (error) {
    console.error('❌ Error fetching suspended accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suspended accounts',
      error: error.message
    });
  }
});

// ===== NOTIFICATION MANAGEMENT =====

// Get system notifications for admin
exports.getSystemNotifications = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const isRead = req.query.isRead;
    const priority = req.query.priority;

    console.log('🔔 Fetching system notifications for admin:', req.user._id);

    // Build filter - admin can see all notifications or specific ones
    const filter = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recipient', 'name email role')
      .populate('sender', 'name email role')
      .maxTimeMS(15000);

    const total = await Notification.countDocuments(filter);

    // Format notifications for admin view
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority || 'medium',
      status: notification.isRead ? 'read' : 'unread',
      recipient: notification.recipient ? 
        `${notification.recipient.name} (${notification.recipient.role})` : 
        'System',
      sender: notification.sender ? 
        `${notification.sender.name} (${notification.sender.role})` : 
        'System',
      createdAt: notification.createdAt,
      readBy: notification.readBy || [],
      actions: getNotificationActions(notification.type)
    }));

    res.json({
      success: true,
      data: formattedNotifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching system notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system notifications',
      error: error.message
    });
  }
});

// Create system notification
exports.createSystemNotification = asyncHandler(async (req, res) => {
  try {
    const { title, message, type, priority, recipientIds, recipientRole } = req.body;

    console.log('🔔 Creating system notification:', { title, type, priority });

    const notificationData = {
      title,
      message,
      type: type || 'system',
      priority: priority || 'medium',
      sender: req.user._id,
      isRead: false,
      metadata: req.body.metadata || {}
    };

    // Determine recipients
    if (recipientIds && recipientIds.length > 0) {
      // Send to specific users
      const notifications = recipientIds.map(recipientId => ({
        ...notificationData,
        recipient: recipientId
      }));
      
      const createdNotifications = await Notification.insertMany(notifications);
      
      res.json({
        success: true,
        message: 'System notification created successfully',
        data: {
          notifications: createdNotifications,
          count: createdNotifications.length
        }
      });
    } else if (recipientRole) {
      // Send to all users with specific role
      const users = await User.find({ role: recipientRole }).select('_id');
      const recipientIds = users.map(user => user._id);
      
      const notifications = recipientIds.map(recipientId => ({
        ...notificationData,
        recipient: recipientId
      }));
      
      const createdNotifications = await Notification.insertMany(notifications);
      
      res.json({
        success: true,
        message: `System notification sent to all ${recipientRole}s`,
        data: {
          notifications: createdNotifications,
          count: createdNotifications.length
        }
      });
    } else {
      // Send to all users
      const users = await User.find().select('_id');
      const recipientIds = users.map(user => user._id);
      
      const notifications = recipientIds.map(recipientId => ({
        ...notificationData,
        recipient: recipientId
      }));
      
      const createdNotifications = await Notification.insertMany(notifications);
      
      res.json({
        success: true,
        message: 'System notification sent to all users',
        data: {
          notifications: createdNotifications,
          count: createdNotifications.length
        }
      });
    }

  } catch (error) {
    console.error('❌ Error creating system notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system notification',
      error: error.message
    });
  }
});

// Mark notification as read
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const notificationId = req.params.id;

    console.log('🔔 Marking notification as read:', notificationId);

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readBy = notification.readBy || [];
    
    // Add admin to readBy list if not already there
    if (!notification.readBy.includes(req.user._id.toString())) {
      notification.readBy.push(req.user._id);
    }
    
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notificationId: notification._id,
        isRead: notification.isRead,
        readBy: notification.readBy
      }
    });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Delete notification
exports.deleteNotification = asyncHandler(async (req, res) => {
  try {
    const notificationId = req.params.id;

    console.log('🗑️ Deleting notification:', notificationId);

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        notificationId: notificationId
      }
    });

  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Helper function to get notification actions based on type
function getNotificationActions(type) {
  const actionMap = {
    'kyc_submitted': ['approve', 'reject', 'view'],
    'kyc_approved': ['view'],
    'kyc_rejected': ['view'],
    'new_tutor_registration': ['view', 'approve'],
    'course_approval': ['approve', 'reject', 'view'],
    'payment_issue': ['investigate', 'resolve', 'view'],
    'content_moderation': ['review', 'approve', 'reject'],
    'system': ['view'],
    'default': ['view', 'delete']
  };
  
  return actionMap[type] || actionMap['default'];
}