const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');
const { notifyNewAssignment } = require('../services/courseNotificationService');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Tutors only)
exports.createAssignment = asyncHandler(async (req, res) => {
  console.log('📝 Assignment creation request received:', req.body);
  console.log('👤 User ID:', req.user._id);
  
  const {
    courseId,
    title,
    description,
    assignmentType,
    instructions,
    dueDate,
    points,
    weight,
    submissionType,
    allowedFileTypes,
    maxFileSize,
    maxSubmissions,
    allowLateSubmission,
    latePenalty,
    resources,
    rubric,
    tags
  } = req.body;

  // Validate required fields
  if (!courseId || !title || !description || !instructions || !dueDate || !points) {
    console.log('❌ Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if course exists and belongs to the tutor
  const course = await Course.findById(courseId);
  if (!course) {
    console.log('❌ Course not found:', courseId);
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  console.log('📚 Course found:', {
    id: course._id,
    title: course.title,
    status: course.status,
    tutor: course.tutor
  });

  if (course.tutor.toString() !== req.user._id.toString()) {
    console.log('❌ Tutor mismatch:', {
      courseTutor: course.tutor.toString(),
      userTutor: req.user._id.toString()
    });
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create assignments for this course'
    });
  }

  // Check if course is published
  if (course.status !== 'published') {
    console.log('❌ Course not published:', {
      status: course.status
    });
    return res.status(400).json({
      success: false,
      message: 'Cannot create assignments for unpublished courses'
    });
  }

  console.log('✅ Course validation passed, creating assignment...');
  // Create assignment
  const assignment = new Assignment({
    course: courseId,
    tutor: req.user._id,
    title,
    description,
    assignmentType,
    instructions,
    dueDate: new Date(dueDate),
    points,
    weight: weight || 10,
    submissionType,
    allowedFileTypes,
    maxFileSize: maxFileSize || 10,
    maxSubmissions: maxSubmissions || 1,
    allowLateSubmission: allowLateSubmission || false,
    latePenalty: latePenalty || 10,
    resources: resources || [],
    rubric: rubric || [],
    tags: tags || [],
    status: 'published' // Set to published so students can submit
  });

  await assignment.save();

  // Notify enrolled students about the new assignment
  try {
    const enrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'active' 
    }).populate('learner', 'name email');

    for (const enrollment of enrollments) {
      // Create notification
      await Notification.create({
        recipient: enrollment.learner._id,
        type: 'assignment_created',
        title: '📝 New Assignment Posted!',
        message: `Your tutor has posted a new assignment "${title}" for ${course.title}. Due date: ${new Date(dueDate).toLocaleDateString()} at ${new Date(dueDate).toLocaleTimeString()}. Points: ${points}`,
        isRead: false,
        data: {
          assignmentId: assignment._id,
          courseId: courseId,
          courseTitle: course.title,
          assignmentTitle: title,
          dueDate: new Date(dueDate),
          points: points,
          assignmentType: assignmentType,
          submissionType: submissionType
        },
        priority: 'high'
      });

      // Send email notification
      await sendEmail({
        to: enrollment.learner.email,
        subject: `📝 New Assignment: ${title}`,
        template: 'assignmentCreated',
        data: {
          name: enrollment.learner.name,
          courseTitle: course.title,
          assignmentTitle: title,
          description: description,
          instructions: instructions,
          dueDate: new Date(dueDate).toLocaleDateString(),
          dueTime: new Date(dueDate).toLocaleTimeString(),
          points: points,
          assignmentType: assignmentType,
          submissionType: submissionType,
          tutorName: req.user.name
        }
      });
    }

    console.log(`✅ Notified ${enrollments.length} students about new assignment`);
  } catch (error) {
    console.error('❌ Error notifying students:', error);
  }

  res.status(201).json({
    success: true,
    data: assignment,
    message: 'Assignment created successfully'
  });
});

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Public (for enrolled students) / Private (for tutors)
exports.getCourseAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { status = 'published' } = req.query;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // If user is not the tutor, check if they're enrolled
  if (req.user && req.user._id.toString() !== course.tutor.toString()) {
    // Check if user is enrolled in the course
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to view assignments'
      });
    }
  }

  const assignments = await Assignment.find({
    course: courseId,
    status,
    isVisible: true
  })
    .populate('tutor', 'name profilePicture')
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    data: assignments
  });
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private (enrolled students and tutors)
exports.getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title category enrolledStudents')
    .populate('tutor', 'name profilePicture');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user is authorized to view this assignment
  const isTutor = assignment.tutor._id.toString() === req.user._id.toString();
  const isEnrolled = assignment.course.enrolledStudents.includes(req.user._id);

  if (!isTutor && !isEnrolled) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this assignment'
    });
  }

  res.json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Tutors only)
exports.updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  // Update fields
  const updateFields = [
    'title', 'description', 'assignmentType', 'instructions', 'dueDate',
    'points', 'weight', 'submissionType', 'allowedFileTypes', 'maxFileSize',
    'maxSubmissions', 'allowLateSubmission', 'latePenalty', 'resources',
    'rubric', 'tags'
  ];

  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'dueDate') {
        assignment[field] = new Date(req.body[field]);
      } else {
        assignment[field] = req.body[field];
      }
    }
  });

  await assignment.save();

  res.json({
    success: true,
    data: assignment,
    message: 'Assignment updated successfully'
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Tutors only)
exports.deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assignment'
    });
  }

  // Check if assignment has submissions
  if (assignment.totalSubmissions > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete assignment with existing submissions'
    });
  }

  await assignment.remove();

  res.json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Publish assignment
// @route   PUT /api/assignments/:id/publish
// @access  Private (Tutors only)
exports.publishAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.tutor._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to publish this assignment'
    });
  }

  await assignment.publish();

  // Notify enrolled students when assignment is published
  try {
    const course = await Course.findById(assignment.course);
    const enrollments = await Enrollment.find({ 
      course: assignment.course, 
      status: 'active' 
    }).populate('learner', 'name email');

    for (const enrollment of enrollments) {
      // Create notification
      await Notification.create({
        recipient: enrollment.learner._id,
        type: 'assignment_published',
        title: '📝 Assignment Now Available!',
        message: `Assignment "${assignment.title}" for ${course.title} is now available. Due date: ${assignment.dueDate.toLocaleDateString()} at ${assignment.dueDate.toLocaleTimeString()}. Points: ${assignment.points}`,
        data: {
          assignmentId: assignment._id,
          courseId: assignment.course,
          courseTitle: course.title,
          assignmentTitle: assignment.title,
          dueDate: assignment.dueDate,
          points: assignment.points,
          assignmentType: assignment.assignmentType,
          submissionType: assignment.submissionType
        },
        priority: 'high'
      });

      // Send email notification
      await sendEmail({
        to: enrollment.learner.email,
        subject: `📝 Assignment Available: ${assignment.title}`,
        template: 'assignmentPublished',
        data: {
          name: enrollment.learner.name,
          courseTitle: course.title,
          assignmentTitle: assignment.title,
          description: assignment.description,
          instructions: assignment.instructions,
          dueDate: assignment.dueDate.toLocaleDateString(),
          dueTime: assignment.dueDate.toLocaleTimeString(),
          points: assignment.points,
          assignmentType: assignment.assignmentType,
          submissionType: assignment.submissionType,
          tutorName: req.user.name
        }
      });
    }

    console.log(`✅ Notified ${enrollments.length} students about published assignment`);
  } catch (error) {
    console.error('❌ Error notifying students about published assignment:', error);
  }

  res.json({
    success: true,
    data: assignment,
    message: 'Assignment published successfully'
  });
});

// @desc    Archive assignment
// @route   PUT /api/assignments/:id/archive
// @access  Private (Tutors only)
exports.archiveAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.tutor._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to archive this assignment'
    });
  }

  await assignment.archive();

  res.json({
    success: true,
    data: assignment,
    message: 'Assignment archived successfully'
  });
});

// @desc    Get tutor's assignments
// @route   GET /api/assignments/tutor/my-assignments
// @access  Private (Tutors only)
exports.getTutorAssignments = asyncHandler(async (req, res) => {
  const { status, courseId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  let query = { tutor: req.user._id };
  if (status) query.status = status;
  if (courseId) query.course = courseId;

  const assignments = await Assignment.find(query)
    .populate('course', 'title category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Add submission counts to each assignment
  const assignmentsWithStats = await Promise.all(assignments.map(async (assignment) => {
    const submissionCount = await AssignmentSubmission.countDocuments({ assignment: assignment._id });
    const gradedCount = await AssignmentSubmission.countDocuments({ 
      assignment: assignment._id, 
      status: 'graded' 
    });
    
    return {
      ...assignment.toObject(),
      submissionCount,
      gradedCount
    };
  }));

  const total = await Assignment.countDocuments(query);

  res.json({
    success: true,
    data: assignmentsWithStats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get assignment statistics
// @route   GET /api/assignments/:id/stats
// @access  Private (Tutors only)
exports.getAssignmentStats = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (assignment.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this assignment'
    });
  }

  // Get course enrollment count
  const course = await Course.findById(assignment.course);
  const totalStudents = course ? course.enrolledStudents.length : 0;

  const stats = {
    totalStudents,
    totalSubmissions: assignment.totalSubmissions,
    submissionRate: totalStudents > 0 ? (assignment.totalSubmissions / totalStudents) * 100 : 0,
    averageScore: assignment.averageScore,
    isOverdue: assignment.isOverdue,
    isUpcoming: assignment.isUpcoming,
    daysUntilDue: Math.ceil((assignment.dueDate - new Date()) / (1000 * 60 * 60 * 24))
  };

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Duplicate assignment
// @route   POST /api/assignments/:id/duplicate
// @access  Private (Tutors only)
exports.duplicateAssignment = asyncHandler(async (req, res) => {
  const { newCourseId, newDueDate } = req.body;
  
  const originalAssignment = await Assignment.findById(req.params.id);
  if (!originalAssignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check ownership
  if (originalAssignment.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to duplicate this assignment'
    });
  }

  // Create duplicate
  const duplicatedAssignment = new Assignment({
    ...originalAssignment.toObject(),
    _id: undefined,
    assignmentId: undefined,
    course: newCourseId || originalAssignment.course,
    dueDate: newDueDate ? new Date(newDueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week from now
    status: 'draft',
    isVisible: false,
    totalSubmissions: 0,
    averageScore: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await duplicatedAssignment.save();

  res.status(201).json({
    success: true,
    data: duplicatedAssignment,
    message: 'Assignment duplicated successfully'
  });
});

// @desc    Get learner's assignments
// @route   GET /api/assignments/my-assignments
// @access  Private (Learners)
exports.getMyAssignments = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get courses the learner is enrolled in
    const enrollments = await Enrollment.find({ learner: userId, status: 'active' })
      .populate('course', 'title category');
    
    const courseIds = enrollments
      .filter(enrollment => enrollment.course && enrollment.course._id)
      .map(enrollment => enrollment.course._id);
    
    // Get assignments for enrolled courses
    const assignments = await Assignment.find({
      course: { $in: courseIds }
    })
    .populate('course', 'title category')
    .populate('tutor', 'name email')
    .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching learner assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});
