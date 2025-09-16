const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Mentorship = require('../models/Mentorship');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Replay = require('../models/Replay');
const Rating = require('../models/Rating'); // Added Rating model
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// ===== DASHBOARD & STATISTICS =====

// @desc    Get tutor dashboard statistics
// @route   GET /api/tutor/dashboard/stats
// @access  Private (Tutor)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  
  console.log('🔍 Getting dashboard stats for tutor:', tutorId);
  console.log('🔍 TutorId type:', typeof tutorId);
  console.log('🔍 User object:', req.user);
  console.log('🔍 User name:', req.user.name);
  console.log('🔍 User role:', req.user.role);

  // Get course count
  const courseCount = await Course.countDocuments({ tutor: tutorId });
  console.log('📚 Course count for tutor:', courseCount);

  // Debug: Get actual courses
  const courses = await Course.find({ tutor: tutorId });
  console.log('📚 Courses found for tutor:', courses.length);
  courses.forEach((course, index) => {
    console.log(`  Course ${index + 1}: ${course.title} (ID: ${course._id})`);
  });

  // Get upcoming live sessions count
  const upcomingSessionsCount = 0; // LiveSession functionality removed

  // Get total learners
  const totalLearners = await Enrollment.distinct('learner', {
    course: { $in: await Course.find({ tutor: tutorId }).select('_id') }
  });
  console.log('👥 Total learners for tutor:', totalLearners.length);

  // Get monthly earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyEarnings = await Payment.aggregate([
    {
      $match: {
        tutor: tutorId,
        status: 'successful',
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  console.log('📊 Monthly earnings aggregation result:', monthlyEarnings);
  console.log('💰 Monthly earnings total:', monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0);

  const stats = [
    {
      title: 'Total Courses',
      value: courseCount.toString(),
      change: '+2 this month',
      icon: 'FaBookOpen',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingSessionsCount.toString(),
      change: 'Next in 2 hours',
      icon: 'FaVideo',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Learners',
      value: totalLearners.length.toString(),
      change: '+18 this week',
      icon: 'FaUsers',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Monthly Earnings',
      value: `₦${(monthlyEarnings[0]?.total || 0).toLocaleString()}`,
      change: '+12% vs last month',
      icon: 'FaDollarSign',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    }
  ];

  console.log('📊 Final stats array:', stats);
  console.log('📊 Stats array length:', stats.length);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get recent learners
// @route   GET /api/tutor/dashboard/recent-learners
// @access  Private (Tutor)
exports.getRecentLearners = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  const recentLearners = await Enrollment.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseData'
      }
    },
    {
      $unwind: '$courseData'
    },
    {
      $match: {
        'courseData.tutor': tutorId
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'learner',
        foreignField: '_id',
        as: 'learnerData'
      }
    },
    {
      $unwind: '$learnerData'
    },
    {
      $project: {
        id: '$learnerData._id',
        name: '$learnerData.name',
        course: '$courseData.title',
        signupDate: '$createdAt',
        avatar: { $substr: ['$learnerData.name', 0, 2] },
        progress: '$progress',
        rating: '$rating'
      }
    },
    {
      $sort: { signupDate: -1 }
    },
    {
      $limit: limit
    }
  ]);

  res.status(200).json({
    success: true,
    data: recentLearners
  });
});

// @desc    Get upcoming sessions
// @route   GET /api/tutor/dashboard/upcoming-sessions
// @access  Private (Tutor)
exports.getUpcomingSessions = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;

  // LiveSession functionality removed - return empty array
  const upcomingSessions = [];

  res.status(200).json({
    success: true,
    data: upcomingSessions
  });
});

// @desc    Get recent notifications
// @route   GET /api/tutor/dashboard/notifications
// @access  Private (Tutor)
exports.getRecentNotifications = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  const notifications = await Notification.find({
    recipient: tutorId,
    type: { $in: ['enrollment', 'live', 'payment_received', 'assignment', 'course_approval', 'course_rejection', 'assignment_submitted', 'assignment_graded', 'course_completed', 'live_session_reminder', 'live_session_started', 'mentorship_request', 'mentorship_accepted', 'mentorship_rejected', 'certificate_ready'] }
  })
  .sort('-createdAt')
  .limit(limit);

  res.status(200).json({
    success: true,
    data: notifications
  });
});

// @desc    Get course performance
// @route   GET /api/tutor/dashboard/course-performance
// @access  Private (Tutor)
exports.getCoursePerformance = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const period = req.query.period || 'month';

  const courses = await Course.find({ tutor: tutorId })
    .populate({
      path: 'enrolledStudents',
      select: 'name profilePicture'
    });

  const performance = courses.map(course => {
    const totalLearners = course.enrolledStudents.length;
    const completedLearners = 0; // We'll implement progress tracking later
    const avgRating = course.rating || 0;
    const totalEarnings = totalLearners * course.price;

    return {
      id: course._id,
      title: course.title,
      learners: totalLearners,
      completion: Math.round((completedLearners / totalLearners) * 100) || 0,
      rating: Math.round(avgRating * 10) / 10,
      earnings: `₦${totalEarnings.toLocaleString()}`
    };
  });

  res.status(200).json({
    success: true,
    data: performance
  });
});

// @desc    Get earnings
// @route   GET /api/tutor/dashboard/earnings
// @access  Private (Tutor)
exports.getEarnings = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const period = req.query.period || 'month';
  
  console.log('🔍 Getting earnings for tutor:', tutorId);
  console.log('🔍 TutorId type:', typeof tutorId);

  let startDate;
  switch (period) {
    case 'week':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
  }

  const earnings = await Payment.aggregate([
    {
      $match: {
        tutor: tutorId,
        status: 'successful',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  console.log('📊 Earnings aggregation result:', earnings);
  console.log('💰 Total earnings:', earnings.reduce((sum, e) => sum + e.total, 0));

  res.status(200).json({
    success: true,
    data: {
      period,
      earnings,
      total: earnings.reduce((sum, e) => sum + e.total, 0)
    }
  });
});

// ===== LEARNER MANAGEMENT =====

// @desc    Get all learners for tutor
// @route   GET /api/tutor/learners
// @access  Private (Tutor)
exports.getLearners = asyncHandler(async (req, res, next) => {
  try {
    const tutorId = req.user._id;
    const { page = 1, limit = 10, search, status } = req.query;

    console.log('🔍 Getting learners for tutor:', tutorId);

    const courses = await Course.find({ tutor: tutorId }).select('_id');
    const courseIds = courses.map(course => course._id);

    if (courseIds.length === 0) {
      console.log('📝 No courses found for tutor, returning sample learners');
      
      // Return sample learners when no courses exist
      const sampleLearners = [
        {
          _id: 'sample_learner_001',
          id: 'sample_learner_001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          status: 'active',
          enrolledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          coursesEnrolled: 2,
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          progress: 75,
          rating: 4.8,
          avatar: 'JD'
        },
        {
          _id: 'sample_learner_002',
          id: 'sample_learner_002',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          phone: '+1 (555) 234-5678',
          status: 'active',
          enrolledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          coursesEnrolled: 1,
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          progress: 45,
          rating: 4.5,
          avatar: 'SW'
        },
        {
          _id: 'sample_learner_003',
          id: 'sample_learner_003',
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          phone: '+1 (555) 345-6789',
          status: 'active',
          enrolledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          coursesEnrolled: 3,
          lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          progress: 90,
          rating: 4.9,
          avatar: 'MB'
        },
        {
          _id: 'sample_learner_004',
          id: 'sample_learner_004',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          phone: '+1 (555) 456-7890',
          status: 'inactive',
          enrolledDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          coursesEnrolled: 1,
          lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          progress: 30,
          rating: 4.2,
          avatar: 'ED'
        }
      ];
      
      // Filter sample learners based on search and status
      let filteredLearners = sampleLearners;
      
      if (search) {
        filteredLearners = sampleLearners.filter(learner => 
          learner.name.toLowerCase().includes(search.toLowerCase()) ||
          learner.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status && status !== 'all') {
        filteredLearners = filteredLearners.filter(learner => learner.status === status);
      }
      
      console.log('📥 Returning', filteredLearners.length, 'sample learners for tutor:', tutorId);
      
      return res.status(200).json({
        success: true,
        data: filteredLearners,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredLearners.length / limit),
          total: filteredLearners.length
        }
      });
    }

    let query = {
      course: { $in: courseIds }
    };

    if (search) {
      const learnerIds = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.learner = { $in: learnerIds.map(u => u._id) };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const enrollments = await Enrollment.find(query)
      .populate('learner', 'name email phone avatar')
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    const learners = enrollments.map(enrollment => ({
      _id: enrollment.learner?._id || enrollment.learner,
      id: enrollment.learner?._id || enrollment.learner, // Keep both for compatibility
      name: enrollment.learner?.name || 'Unknown',
      email: enrollment.learner?.email || 'No email',
      phone: enrollment.learner?.phone || 'No phone',
      status: enrollment.status,
      enrolledDate: enrollment.createdAt,
      coursesEnrolled: 1, // This would need to be calculated across all courses
      lastActive: enrollment.lastActive || enrollment.createdAt,
      progress: enrollment.progress || 0,
      rating: enrollment.rating || 0,
      avatar: enrollment.learner?.avatar || (enrollment.learner?.name ? enrollment.learner.name.substring(0, 2).toUpperCase() : 'U')
    }));

    console.log('📥 Found', learners.length, 'real learners for tutor:', tutorId);

    res.status(200).json({
      success: true,
      data: learners,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (error) {
    console.error('❌ Error in getLearners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learners',
      error: error.message
    });
  }
});

// @desc    Get specific learner
// @route   GET /api/tutor/learners/:id
// @access  Private (Tutor)
exports.getLearner = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const learnerId = req.params.id;

  const courses = await Course.find({ tutor: tutorId }).select('_id');
  const courseIds = courses.map(course => course._id);

  const enrollments = await Enrollment.find({
    learner: learnerId,
    course: { $in: courseIds }
  })
  .populate('course', 'title description')
  .populate('learner', 'name email phone avatar bio');

  if (!enrollments.length) {
            return res.status(404).json({ success: false, message: 'Learner not found' });
  }

  const learner = enrollments[0].learner;
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const avgProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses;
  const avgRating = enrollments.reduce((sum, e) => sum + (e.rating || 0), 0) / totalCourses;

  res.status(200).json({
    success: true,
    data: {
      id: learner._id,
      name: learner.name,
      email: learner.email,
      phone: learner.phone,
      avatar: learner.avatar,
      bio: learner.bio,
      enrollments: enrollments.map(e => ({
        courseId: e.course._id,
        courseTitle: e.course.title,
        progress: e.progress,
        rating: e.rating,
        status: e.status,
        enrolledDate: e.createdAt
      })),
      stats: {
        totalCourses,
        completedCourses,
        avgProgress: Math.round(avgProgress),
        avgRating: Math.round(avgRating * 10) / 10
      }
    }
  });
});

// @desc    Get learner progress for specific course
// @route   GET /api/tutor/learners/:id/courses/:courseId/progress
// @access  Private (Tutor)
exports.getLearnerProgress = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { id: learnerId, courseId } = req.params;

  // Verify tutor owns the course
  const course = await Course.findOne({ _id: courseId, tutor: tutorId });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  const enrollment = await Enrollment.findOne({
    learner: learnerId,
    course: courseId
  }).populate('learner', 'name');

      if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

  // Get assignment submissions
  const assignments = await Assignment.find({ course: courseId });
  const submissions = await AssignmentSubmission.find({
    learner: learnerId,
    assignment: { $in: assignments.map(a => a._id) }
  });

  res.status(200).json({
    success: true,
    data: {
      learner: enrollment.learner.name,
      course: course.title,
      progress: enrollment.progress,
      rating: enrollment.rating,
      enrolledDate: enrollment.createdAt,
      lastActive: enrollment.lastActive,
      assignments: assignments.map(assignment => {
        const submission = submissions.find(s => s.assignment.equals(assignment._id));
        return {
          id: assignment._id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          submitted: !!submission,
          submittedDate: submission?.submittedAt,
          grade: submission?.grade,
          feedback: submission?.feedback
        };
      })
    }
  });
});

// @desc    Get learner assignments for specific course
// @route   GET /api/tutor/learners/:id/courses/:courseId/assignments
// @access  Private (Tutor)
exports.getLearnerAssignments = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { id: learnerId, courseId } = req.params;

  // Verify tutor owns the course
  const course = await Course.findOne({ _id: courseId, tutor: tutorId });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  const assignments = await Assignment.find({ course: courseId });
  const submissions = await AssignmentSubmission.find({
    learner: learnerId,
    assignment: { $in: assignments.map(a => a._id) }
  }).populate('assignment', 'title dueDate');

  const assignmentData = assignments.map(assignment => {
    const submission = submissions.find(s => s.assignment._id.equals(assignment._id));
    return {
      id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      submitted: !!submission,
      submittedDate: submission?.submittedAt,
      grade: submission?.grade,
      feedback: submission?.feedback,
      files: submission?.files || []
    };
  });

  res.status(200).json({
    success: true,
    data: assignmentData
  });
});

// @desc    Send message to learner
// @route   POST /api/tutor/learners/:id/message
// @access  Private (Tutor)
exports.sendMessageToLearner = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const learnerId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return next(new ErrorResponse('Message is required', 400));
  }

  // Verify tutor has courses with this learner
  const courses = await Course.find({ tutor: tutorId }).select('_id');
  const hasEnrollment = await Enrollment.findOne({
    learner: learnerId,
    course: { $in: courses.map(c => c._id) }
  });

  if (!hasEnrollment) {
    return next(new ErrorResponse('Learner not found in your courses', 404));
  }

  // Create notification for learner
  await Notification.create({
    recipient: learnerId,
    sender: tutorId,
    type: 'message',
    title: 'New Message from Tutor',
    message,
    read: false
  });

  res.status(200).json({
    success: true,
    message: 'Message sent successfully'
  });
});

// ===== LIVE SESSIONS =====

// @desc    Get all live sessions for tutor
// @route   GET /api/tutor/live-sessions
// @access  Private (Tutor)
exports.getLiveSessions = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  let query = { tutor: tutorId };

  if (status && status !== 'all') {
    query.status = status;
  }

  const sessions = await LiveSession.find(query)
    .populate('course', 'title')
    .sort('-startTime')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await LiveSession.countDocuments(query);

  res.status(200).json({
    success: true,
    data: sessions,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Create new live session
// @route   POST /api/tutor/live-sessions
// @access  Private (Tutor)
exports.createLiveSession = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { title, description, courseId, startTime, endTime, maxStudents, price } = req.body;

  // Verify tutor owns the course
  if (courseId) {
    const course = await Course.findOne({ _id: courseId, tutor: tutorId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
  }

  const session = await LiveSession.create({
    title,
    description,
    course: courseId,
    tutor: tutorId,
    startTime,
    endTime,
    maxStudents: maxStudents || 25,
    price: price || 0,
    status: 'scheduled'
  });

  res.status(201).json({
    success: true,
    data: session
  });
});

// @desc    Update live session
// @route   PUT /api/tutor/live-sessions/:id
// @access  Private (Tutor)
exports.updateLiveSession = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const sessionId = req.params.id;

  let session = await LiveSession.findOne({ _id: sessionId, tutor: tutorId });

  if (!session) {
    return next(new ErrorResponse('Session not found', 404));
  }

  session = await LiveSession.findByIdAndUpdate(sessionId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: session
  });
});

// @desc    Delete live session
// @route   DELETE /api/tutor/live-sessions/:id
// @access  Private (Tutor)
exports.deleteLiveSession = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const sessionId = req.params.id;

  const session = await LiveSession.findOne({ _id: sessionId, tutor: tutorId });

  if (!session) {
    return next(new ErrorResponse('Session not found', 404));
  }

  await session.remove();

  res.status(200).json({
    success: true,
    message: 'Session deleted successfully'
  });
});

// @desc    Get session participants
// @route   GET /api/tutor/live-sessions/:id/participants
// @access  Private (Tutor)
exports.getSessionParticipants = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const sessionId = req.params.id;

  const session = await LiveSession.findOne({ _id: sessionId, tutor: tutorId })
    .populate('enrolledLearners', 'name email avatar');

  if (!session) {
    return next(new ErrorResponse('Session not found', 404));
  }

  res.status(200).json({
    success: true,
    data: session.enrolledLearners
  });
});

// ===== PAYMENTS & EARNINGS =====

// @desc    Get tutor payments
// @route   GET /api/tutor/payments
// @access  Private (Tutor)
exports.getPayments = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;
  
  console.log('🔍 Getting payments for tutor:', tutorId);
  console.log('🔍 TutorId type:', typeof tutorId);
  console.log('🔍 Query params:', { status, page, limit });

  let query = { tutor: tutorId };

  if (status && status !== 'all') {
    query.status = status;
  }
  
  console.log('🔍 Payment query:', query);

  const payments = await Payment.find(query)
    .populate('course', 'title')
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);
  
  console.log('📊 Found payments:', payments.length);
  console.log('📊 Total payments:', total);
  payments.forEach(payment => {
    console.log(`  - Payment ${payment._id}: amount=${payment.amount}, status=${payment.status}, tutorAmount=${payment.tutorAmount}`);
  });

  res.status(200).json({
    success: true,
    data: payments,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get earnings report
// @route   GET /api/tutor/payments/earnings-report
// @access  Private (Tutor)
exports.getEarningsReport = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const period = req.query.period || 'all';
  
  console.log('🔍 Getting earnings report for tutor:', tutorId);
  console.log('🔍 Period:', period);

  let startDate = null; // Default to all-time
  switch (period) {
    case 'week':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'all':
    default:
      startDate = null; // All-time
  }

  const matchQuery = {
    tutor: tutorId,
    status: 'successful'
  };
  
  // Only add date filter if startDate is provided
  if (startDate) {
    matchQuery.createdAt = { $gte: startDate };
  }
  
  console.log('🔍 Match query:', matchQuery);

  const earnings = await Payment.aggregate([
    {
      $match: matchQuery
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  console.log('📊 Earnings aggregation result:', earnings);
  console.log('💰 Total earnings:', earnings.reduce((sum, e) => sum + e.total, 0));

  const totalEarnings = earnings.reduce((sum, e) => sum + e.total, 0);
  const totalTransactions = earnings.reduce((sum, e) => sum + e.count, 0);

  res.status(200).json({
    success: true,
    data: {
      period,
      totalEarnings,
      totalTransactions,
      earnings
    }
  });
});

// @desc    Get payment history
// @route   GET /api/tutor/payments/history
// @access  Private (Tutor)
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const payments = await Payment.find({ tutor: tutorId })
    .populate('course', 'title')
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments({ tutor: tutorId });

  res.status(200).json({
    success: true,
    data: payments,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Request withdrawal
// @route   POST /api/tutor/payments/withdraw
// @access  Private (Tutor)
exports.requestWithdrawal = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { amount, paymentMethod } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Invalid withdrawal amount', 400));
  }

  if (!paymentMethod) {
    return next(new ErrorResponse('Payment method is required', 400));
  }

  // Check available balance
  const completedPayments = await Payment.find({
    tutor: tutorId,
    status: 'successful'
  });

  const totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingWithdrawals = await Payment.find({
    tutor: tutorId,
    status: 'pending',
    type: 'withdrawal'
  });

  const totalPending = pendingWithdrawals.reduce((sum, payment) => sum + payment.amount, 0);
  const availableBalance = totalEarnings - totalPending;

  if (amount > availableBalance) {
    return next(new ErrorResponse('Insufficient balance', 400));
  }

  // Create withdrawal request
  const withdrawal = await Payment.create({
    tutor: tutorId,
    type: 'withdrawal',
    amount,
    paymentMethod,
    status: 'pending',
    description: `Withdrawal request for ₦${amount.toLocaleString()}`
  });

  res.status(201).json({
    success: true,
    data: withdrawal,
    message: 'Withdrawal request submitted successfully'
  });
});

// ===== PROFILE & SETTINGS =====

// @desc    Get tutor profile
// @route   GET /api/tutor/profile
// @access  Private (Tutor)
exports.getProfile = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;

  const profile = await User.findById(tutorId).select('-password');

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Update tutor profile
// @route   PUT /api/tutor/profile
// @access  Private (Tutor)
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;

  const profile = await User.findByIdAndUpdate(tutorId, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Get tutor settings
// @route   GET /api/tutor/settings
// @access  Private (Tutor)
exports.getSettings = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;

  // This would typically come from a separate Settings model
  // For now, we'll return default settings
  const settings = {
    emailNotifications: true,
    pushNotifications: true,
    autoPublishCourses: false,
    maxStudentsPerSession: 25,
    sessionReminderTime: 30, // minutes
    paymentMethod: 'bank_transfer'
  };

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update tutor settings
// @route   PUT /api/tutor/settings
// @access  Private (Tutor)
exports.updateSettings = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;

  // This would typically update a Settings model
  // For now, we'll just return the updated settings
  const settings = req.body;

  res.status(200).json({
    success: true,
    data: settings
  });
});

// ===== ANALYTICS =====

// @desc    Get tutor analytics
// @route   GET /api/tutor/analytics
// @access  Private (Tutor)
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const period = req.query.period || 'month';

  // Get course analytics
  const courses = await Course.find({ tutor: tutorId });
  const courseIds = courses.map(course => course._id);

  // Get enrollment analytics
  const enrollments = await Enrollment.find({
    course: { $in: courseIds }
  });

  // Get payment analytics
  const payments = await Payment.find({
    tutor: tutorId,
    status: 'successful'
  });

  const analytics = {
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
    avgCourseRating: enrollments.reduce((sum, enrollment) => sum + (enrollment.rating || 0), 0) / enrollments.length || 0,
    completionRate: (enrollments.filter(e => e.progress >= 100).length / enrollments.length) * 100 || 0
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Get course analytics
// @route   GET /api/tutor/analytics/courses/:courseId
// @access  Private (Tutor)
exports.getCourseAnalytics = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const courseId = req.params.courseId;
  const period = req.query.period || 'month';

  // Verify tutor owns the course
  const course = await Course.findOne({ _id: courseId, tutor: tutorId });
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  const enrollments = await Enrollment.find({ course: courseId });
  const payments = await Payment.find({
    course: courseId,
    status: 'successful'
  });

  const analytics = {
    courseId: course._id,
    courseTitle: course.title,
    totalEnrollments: enrollments.length,
    totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
    avgRating: enrollments.reduce((sum, enrollment) => sum + (enrollment.rating || 0), 0) / enrollments.length || 0,
    completionRate: (enrollments.filter(e => e.progress >= 100).length / enrollments.length) * 100 || 0,
    avgProgress: enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length || 0
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Get learner analytics
// @route   GET /api/tutor/analytics/learners
// @access  Private (Tutor)
exports.getLearnerAnalytics = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const period = req.query.period || 'month';

  const courses = await Course.find({ tutor: tutorId }).select('_id');
  const courseIds = courses.map(course => course._id);

  const enrollments = await Enrollment.find({
    course: { $in: courseIds }
  });

  const uniqueLearners = await Enrollment.distinct('learner', {
    course: { $in: courseIds }
  });

  const analytics = {
    totalLearners: uniqueLearners.length,
    totalEnrollments: enrollments.length,
    avgEnrollmentsPerLearner: enrollments.length / uniqueLearners.length || 0,
    activeLearners: enrollments.filter(e => e.lastActive > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    newLearnersThisMonth: enrollments.filter(e => e.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// ===== REPLAYS =====

// @desc    Get tutor replays
// @route   GET /api/tutor/replays
// @access  Private (Tutor)
exports.getReplays = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const replays = await Replay.find({ tutor: tutorId })
    .populate('course', 'title')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Replay.countDocuments({ tutor: tutorId });

  res.status(200).json({
    success: true,
    data: replays,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Upload replay
// @route   POST /api/tutor/replays/upload
// @access  Private (Tutor)
exports.uploadReplay = asyncHandler(async (req, res, next) => {
  console.log('🎬 Upload replay request received');
  console.log('📁 Request file:', req.file);
  console.log('📝 Request body:', req.body);
  
  const tutorId = req.user._id;
  const { courseId, topic, description } = req.body;

  console.log('👤 Tutor ID:', tutorId);
  console.log('📚 Course ID:', courseId);

  // Verify tutor owns the course
  const course = await Course.findOne({ _id: courseId, tutor: tutorId });
  if (!course) {
    console.log('❌ Course not found or tutor does not own course');
    return next(new ErrorResponse('Course not found or you do not own this course', 404));
  }

  console.log('✅ Course found:', course.title);

  if (!req.file) {
    console.log('❌ No file uploaded');
    return next(new ErrorResponse('Replay file is required', 400));
  }

  console.log('✅ File uploaded successfully:', req.file.originalname);

  // Create replay with auto-deletion after 24 hours
  try {
    console.log('💾 Creating replay record...');
    console.log('📁 File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    const replay = await Replay.create({
      course: courseId,
      tutor: tutorId,
      title: topic || `Replay for ${course.title}`,
      description: description || `Recorded session for ${course.title}`,
      fileUrl: req.file.path ? `/${req.file.path.replace(/\\/g, '/')}` : `/${req.file.filename}`, // Ensure forward slashes and leading slash
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadDate: new Date(),
      // Auto-delete after 24 hours (86400000 ms)
      deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    console.log('✅ Replay created successfully:', replay._id);
    console.log('📊 Replay data:', {
      id: replay._id,
      title: replay.title,
      fileUrl: replay.fileUrl,
      fileName: replay.fileName,
      fileSize: replay.fileSize
    });

    // Notify enrolled learners about new replay
    try {
    const enrollments = await Enrollment.find({ course: courseId }).populate('learner', 'name email');
    
    for (const enrollment of enrollments) {
      await Notification.create({
        recipient: enrollment.learner._id,
        sender: tutorId,
        type: 'replay_uploaded',
        title: 'New Class Replay Available',
        message: `A new recorded session "${replay.title}" is now available for ${course.title}`,
        data: {
          courseId: courseId,
          replayId: replay._id,
          courseTitle: course.title
        },
        isRead: false
      });
    }
    } catch (notificationError) {
      console.error('Error sending replay notifications:', notificationError);
      // Don't fail the upload if notifications fail
    }

    res.status(201).json({
      success: true,
      data: replay,
      message: 'Replay uploaded successfully and learners have been notified'
    });
    
  } catch (error) {
    console.error('❌ Error creating replay:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors
    });
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new ErrorResponse(`Validation failed: ${validationErrors.join(', ')}`, 400));
    }
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return next(new ErrorResponse('Duplicate replay detected', 409));
    }
    
    return next(new ErrorResponse('Failed to create replay record', 500));
  }
});

// @desc    Delete replay
// @route   DELETE /api/tutor/replays/:id
// @access  Private (Tutor)
exports.deleteReplay = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const replayId = req.params.id;

  // Find the replay and verify ownership
  const replay = await Replay.findOne({ _id: replayId, tutor: tutorId });
  
  if (!replay) {
    return next(new ErrorResponse('Replay not found or you do not own this replay', 404));
  }

  // Delete the replay
  await Replay.findByIdAndDelete(replayId);

  res.status(200).json({
    success: true,
    message: 'Replay deleted successfully'
  });
});

// ===== TUTOR NOTIFICATIONS =====

// @desc    Get tutor notifications
// @route   GET /api/tutor/notifications
// @access  Private (Tutor)
exports.getTutorNotifications = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const { page = 1, limit = 10, type, read } = req.query;

  let query = { recipient: tutorId };

  if (type && type !== 'all') {
    query.type = type;
  }

  if (read !== undefined) {
    query.read = read === 'true';
  }

  const notifications = await Notification.find(query)
    .populate('sender', 'name email avatar')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/tutor/notifications/:id/read
// @access  Private (Tutor)
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;
  const notificationId = req.params.id;

  const notification = await Notification.findOne({ 
    _id: notificationId, 
    recipient: tutorId 
  });

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
    message: 'Notification marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/tutor/notifications/read-all
// @access  Private (Tutor)
exports.markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
  const tutorId = req.user._id;

  await Notification.updateMany(
    { recipient: tutorId, read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});
