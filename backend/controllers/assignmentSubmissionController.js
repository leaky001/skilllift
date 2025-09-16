const asyncHandler = require('express-async-handler');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// Debug endpoint to test assignment data
exports.debugAssignment = asyncHandler(async (req, res) => {
  try {
    const { assignmentId } = req.params;
    console.log('🔍 Debug - Assignment ID:', assignmentId);
    
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', '_id title')
      .populate('tutor', '_id name');
    
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }
    
    console.log('🔍 Debug - Assignment found:', {
      id: assignment._id,
      title: assignment.title,
      course: assignment.course,
      courseId: assignment.course._id,
      tutor: assignment.tutor,
      tutorId: assignment.tutor._id,
      status: assignment.status
    });
    
    res.json({
      success: true,
      data: {
        assignment: assignment,
        courseId: assignment.course._id,
        tutorId: assignment.tutor._id
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
});

// Learner actions
exports.submitAssignment = asyncHandler(async (req, res) => {
  try {
    const { assignment: assignmentId, content, links, submissionNotes } = req.body;
    const learnerId = req.user._id;

    console.log('🔍 Debug - Request body:', req.body);
    console.log('🔍 Debug - Request files:', req.files);
    console.log('🔍 Debug - Assignment ID:', assignmentId);

    // Validate required fields
    if (!assignmentId) {
      console.log('❌ Missing assignment ID');
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment ID is required' 
      });
    }

    // Validate ObjectId format
    if (!assignmentId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid assignment ID format:', assignmentId);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid assignment ID format' 
      });
    }

    // Validate assignment exists and is active
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', '_id title')
      .populate('tutor', '_id name');
    console.log('🔍 Debug - Assignment lookup result:', assignment);
    
    if (!assignment) {
      console.log('❌ Assignment not found for ID:', assignmentId);
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }
    
    console.log('🔍 Debug - Assignment details:', {
      id: assignment._id,
      title: assignment.title,
      course: assignment.course,
      courseType: typeof assignment.course,
      tutor: assignment.tutor,
      tutorType: typeof assignment.tutor,
      points: assignment.points,
      status: assignment.status
    });

    // Validate that assignment has required fields
    if (!assignment.course) {
      console.log('❌ Assignment missing course field');
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment is missing course information' 
      });
    }

    if (!assignment.tutor) {
      console.log('❌ Assignment missing tutor field');
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment is missing tutor information' 
      });
    }

    // Validate ObjectId fields
    const courseId = assignment.course._id || assignment.course;
    const tutorId = assignment.tutor._id || assignment.tutor;
    
    console.log('🔍 Debug - Extracted IDs:', {
      courseId: courseId,
      courseIdType: typeof courseId,
      tutorId: tutorId,
      tutorIdType: typeof tutorId
    });

    if (!courseId || !tutorId) {
      console.log('❌ Missing course or tutor ID');
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment is missing course or tutor ID' 
      });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment is not available for submission. Please contact your tutor.' 
      });
    }

    // Check if already submitted (get the most recent one)
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      learner: learnerId
    }).sort({ submittedAt: -1 });

    if (existingSubmission && existingSubmission.status !== 'returned') {
      console.log('⚠️ Assignment already submitted:', existingSubmission._id);
      return res.status(200).json({ 
        success: false, 
        alreadySubmitted: true,
        message: 'Assignment already submitted',
        submissionId: existingSubmission._id,
        status: existingSubmission.status
      });
    }

    // Process file uploads
    const attachments = [];
    if (req.files && req.files.attachments) {
      console.log('🔍 Debug - Processing attachments:', req.files.attachments);
      // Ensure req.files.attachments is an array
      const filesArray = Array.isArray(req.files.attachments) ? req.files.attachments : [req.files.attachments];
      for (const file of filesArray) {
        console.log('🔍 Debug - Processing file:', {
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          sizeType: typeof file.size
        });
        
        // Validate file path exists
        if (!file.path) {
          console.error('❌ File path is missing for file:', file.originalname);
          continue; // Skip this file
        }
        
        attachments.push({
          name: file.originalname || 'Unknown',
          url: file.path,
          type: file.mimetype || 'application/octet-stream',
          size: parseInt(file.size) || 0
        });
      }
    }
    console.log('🔍 Debug - Final attachments array:', attachments);

    // Process video uploads
    const videos = [];
    if (req.files && req.files.videos) {
      // Ensure req.files.videos is an array
      const videosArray = Array.isArray(req.files.videos) ? req.files.videos : [req.files.videos];
      for (const file of videosArray) {
        // Validate file path exists
        if (!file.path) {
          console.error('❌ Video file path is missing for file:', file.originalname);
          continue; // Skip this file
        }
        
        videos.push({
          name: file.originalname || 'Unknown',
          url: file.path,
          type: file.mimetype || 'application/octet-stream',
          size: parseInt(file.size) || 0
        });
      }
    }

    // Process links safely
    let parsedLinks = [];
    if (links && links.trim()) {
      try {
        parsedLinks = JSON.parse(links);
      } catch (error) {
        console.error('Error parsing links:', error);
        parsedLinks = [];
      }
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;
    const lateBy = isLate ? Math.floor((now - dueDate) / (1000 * 60)) : 0;

    // Create submission
    console.log('🔍 Debug - Creating submission with data:', {
      assignment: assignmentId,
      learner: learnerId,
      course: assignment.course,
      courseId: assignment.course._id || assignment.course,
      tutor: assignment.tutor,
      tutorId: assignment.tutor._id || assignment.tutor,
      content,
      attachments: attachments.length,
      videos: videos.length,
      links: parsedLinks.length,
      submissionNotes,
      isLate,
      lateBy,
      maxScore: assignment.points,
      status: 'submitted'
    });

    console.log('🔍 Debug - About to create submission...');
    console.log('🔍 Debug - Attachments data:', JSON.stringify(attachments, null, 2));
    console.log('🔍 Debug - Videos data:', JSON.stringify(videos, null, 2));
    console.log('🔍 Debug - Combined attachments:', JSON.stringify([...attachments, ...videos], null, 2));
    
    // Temporary fix: Create submission without attachments first
    const submissionData = {
      assignment: assignmentId,
      learner: learnerId,
      course: courseId,
      tutor: tutorId,
      content,
      attachments: [], // Temporarily empty to test
      links: parsedLinks,
      submissionNotes,
      isLate,
      lateBy,
      maxScore: assignment.points,
      status: 'submitted'
    };
    
    console.log('🔍 Debug - Final submission data:', submissionData);
    
    const submission = new AssignmentSubmission(submissionData);

    console.log('🔍 Debug - Submission object created, about to save...');
    console.log('🔍 Debug - Submission attachments:', submission.attachments);
    
    try {
      await submission.save();
      console.log('🔍 Debug - Submission saved successfully:', submission._id);
      
      // Now add attachments if there are any
      if (attachments.length > 0 || videos.length > 0) {
        console.log('📎 Adding attachments to saved submission...');
        submission.attachments = [...attachments, ...videos];
        await submission.save();
        console.log('✅ Attachments added successfully');
      }
      
    } catch (saveError) {
      console.error('❌ Error saving submission:', saveError);
      console.error('❌ Save error details:', {
        name: saveError.name,
        message: saveError.message,
        code: saveError.code,
        errors: saveError.errors
      });
      
      // Handle specific MongoDB errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));
        console.error('❌ Validation errors:', validationErrors);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors.map(err => `${err.field}: ${err.message}`)
        });
      }
      
      if (saveError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate submission detected'
        });
      }
      
      throw saveError; // Re-throw to be caught by outer try-catch
    }

    // Update assignment statistics
    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        $inc: { totalSubmissions: 1 }
      });
    } catch (updateError) {
      console.error('Error updating assignment statistics:', updateError);
      // Don't fail the submission if stats update fails
    }

    // Create notification for tutor about new submission
    try {
      const Notification = require('../models/Notification');
      const tutorNotification = new Notification({
        recipient: assignment.tutor,
        type: 'assignment_submitted',
        title: 'New Assignment Submission',
        message: `A student has submitted an assignment: ${assignment.title}`,
        isRead: false,
        data: {
          assignmentId: assignment._id,
          submissionId: submission._id,
          learnerId: learnerId,
          courseId: assignment.course
        }
      });
      await tutorNotification.save();
    } catch (notificationError) {
      console.error('Error creating tutor notification:', notificationError);
      // Don't fail the submission if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('❌ Assignment submission error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

exports.getMySubmissions = asyncHandler(async (req, res) => {
  try {
    const learnerId = req.user._id;
    
    const submissions = await AssignmentSubmission.find({ learner: learnerId })
      .populate('assignment', 'title description dueDate totalPoints points')
      .populate('course', 'title')
      .populate('tutor', 'name')
      .select('+grade') // Include grade field
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
});

exports.getSubmission = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const learnerId = req.user._id;

    const submission = await AssignmentSubmission.findOne({
      _id: id,
      learner: learnerId
    }).populate('assignment course tutor');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission',
      error: error.message
    });
  }
});

exports.updateSubmission = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const learnerId = req.user._id;
    const { content, links, submissionNotes } = req.body;

    const submission = await AssignmentSubmission.findOne({
      _id: id,
      learner: learnerId,
      status: { $in: ['submitted', 'returned'] }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or cannot be updated'
      });
    }

    // Update fields
    if (content) submission.content = content;
    if (links) submission.links = JSON.parse(links);
    if (submissionNotes) submission.submissionNotes = submissionNotes;
    
    submission.status = 'submitted';
    submission.lastUpdated = new Date();

    await submission.save();

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission',
      error: error.message
    });
  }
});

exports.deleteSubmission = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const learnerId = req.user._id;

    const submission = await AssignmentSubmission.findOne({
      _id: id,
      learner: learnerId,
      status: 'submitted'
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or cannot be deleted'
      });
    }

    await AssignmentSubmission.findByIdAndDelete(id);

    // Update assignment statistics
    await Assignment.findByIdAndUpdate(submission.assignment, {
      $inc: { totalSubmissions: -1 }
    });

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
});

// Tutor actions
exports.getAssignmentSubmissions = asyncHandler(async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const tutorId = req.user._id;

    // Verify tutor owns this assignment
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      tutor: tutorId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('learner', 'name email')
      .populate('assignment', 'title totalPoints')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
});

exports.gradeSubmission = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback, rubricScores, overallFeedback } = req.body;
    const tutorId = req.user._id;

    const submission = await AssignmentSubmission.findById(id)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify tutor owns this assignment
    if (submission.assignment.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this submission'
      });
    }

    // Calculate percentage and grade
    const percentage = (score / submission.maxScore) * 100;
    const isPassed = percentage >= (submission.assignment.passingScore || 60);

    // Determine letter grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    // Update submission
    submission.score = score;
    submission.percentage = percentage;
    submission.grade = grade;
    submission.isPassed = isPassed;
    submission.tutorFeedback = feedback;
    submission.rubricScores = rubricScores;
    submission.overallFeedback = overallFeedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.reviewedBy = tutorId;

    await submission.save();

    // Create notification for learner about grading
    try {
      const Notification = require('../models/Notification');
      const learnerNotification = new Notification({
        recipient: submission.learner,
        type: 'assignment_graded',
        title: 'Assignment Graded',
        message: `Your assignment "${submission.assignment.title}" has been graded. Score: ${score}/${submission.maxScore} (${grade})`,
        data: {
          assignmentId: submission.assignment._id,
          submissionId: submission._id,
          score: score,
          maxScore: submission.maxScore,
          grade: grade,
          percentage: percentage,
          tutorId: tutorId
        }
      });
      await learnerNotification.save();
    } catch (notificationError) {
      console.error('Error creating learner notification:', notificationError);
      // Don't fail the grading if notification fails
    }

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    });
  }
});

exports.addFeedback = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const tutorId = req.user._id;

    const submission = await AssignmentSubmission.findById(id)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify tutor owns this assignment
    if (submission.assignment.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback to this submission'
      });
    }

    submission.tutorFeedback = feedback;
    submission.lastUpdated = new Date();

    await submission.save();

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: submission
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feedback',
      error: error.message
    });
  }
});

exports.getUngradedSubmissions = asyncHandler(async (req, res) => {
  try {
    const tutorId = req.user._id;

    const submissions = await AssignmentSubmission.find({
      'assignment.tutor': tutorId,
      status: { $in: ['submitted', 'under-review'] }
    })
      .populate('assignment', 'title dueDate totalPoints')
      .populate('learner', 'name email')
      .populate('course', 'title')
      .sort({ submittedAt: 1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get ungraded submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ungraded submissions',
      error: error.message
    });
  }
});

// Admin actions
exports.getAllSubmissions = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, status, course, assignment } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (course) filter.course = course;
    if (assignment) filter.assignment = assignment;

    const submissions = await AssignmentSubmission.find(filter)
      .populate('learner', 'name email')
      .populate('tutor', 'name email')
      .populate('assignment', 'title')
      .populate('course', 'title')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssignmentSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubmissions: total
      }
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
});

exports.getSubmissionStatistics = asyncHandler(async (req, res) => {
  try {
    const stats = await AssignmentSubmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    const totalSubmissions = await AssignmentSubmission.countDocuments();
    const gradedSubmissions = await AssignmentSubmission.countDocuments({ status: 'graded' });
    const averageScore = await AssignmentSubmission.aggregate([
      { $match: { status: 'graded' } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        gradedSubmissions,
        averageScore: averageScore[0]?.avg || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Get submission statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission statistics',
      error: error.message
    });
  }
});

exports.moderateSubmission = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const submission = await AssignmentSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    switch (action) {
      case 'approve':
        submission.status = 'submitted';
        break;
      case 'reject':
        submission.status = 'returned';
        break;
      case 'flag':
        submission.status = 'under-review';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    submission.adminNotes = reason;
    submission.lastUpdated = new Date();

    await submission.save();

    res.json({
      success: true,
      message: `Submission ${action}d successfully`,
      data: submission
    });
  } catch (error) {
    console.error('Moderate submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate submission',
      error: error.message
    });
  }
});
