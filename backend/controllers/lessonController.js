const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Private (Tutor)
exports.createLesson = asyncHandler(async (req, res) => {
  const {
    course,
    title,
    description,
    lessonNumber,
    type,
    content,
    completionCriteria,
    requiredForCompletion,
    isFree,
    isPreview,
    tags,
    difficulty
  } = req.body;

  // Validate required fields
  if (!course || !title || !description || !lessonNumber || !type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if course exists and belongs to tutor
  const courseExists = await Course.findOne({ 
    _id: course, 
    tutor: req.user._id 
  });

  if (!courseExists) {
    return res.status(404).json({
      success: false,
      message: 'Course not found or you are not authorized to add lessons to this course'
    });
  }

  // Check if lesson number already exists for this course
  const existingLesson = await Lesson.findOne({ 
    course, 
    lessonNumber 
  });

  if (existingLesson) {
    return res.status(400).json({
      success: false,
      message: 'Lesson number already exists for this course'
    });
  }

  // Handle file uploads based on lesson type
  let processedContent = content;

  if (type === 'video' && req.files?.video) {
    try {
      const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: 'video',
        folder: 'skilllift/lessons/videos',
        use_filename: true,
        unique_filename: true
      });
      
      processedContent = {
        ...content,
        videoUrl: videoResult.secure_url,
        videoDuration: videoResult.duration || 0,
        videoThumbnail: videoResult.thumbnail_url
      };
    } catch (error) {
      console.error('Video upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload video'
      });
    }
  }

  if (type === 'document' && req.files?.document) {
    try {
      const docResult = await cloudinary.uploader.upload(req.files.document[0].path, {
        resource_type: 'raw',
        folder: 'skilllift/lessons/documents',
        use_filename: true,
        unique_filename: true
      });
      
      processedContent = {
        ...content,
        documentUrl: docResult.secure_url,
        documentType: req.files.document[0].mimetype,
        documentSize: req.files.document[0].size
      };
    } catch (error) {
      console.error('Document upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload document'
      });
    }
  }

  // Create lesson
  const lesson = await Lesson.create({
    course,
    tutor: req.user._id,
    title,
    description,
    lessonNumber,
    type,
    content: processedContent,
    completionCriteria,
    requiredForCompletion,
    isFree,
    isPreview,
    tags,
    difficulty
  });

  // Update course statistics
  await courseExists.updateStatistics();

  res.status(201).json({
    success: true,
    data: lesson,
    message: 'Lesson created successfully'
  });
});

// @desc    Get lessons for a course
// @route   GET /api/lessons/course/:courseId
// @access  Private
exports.getLessonsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { status = 'published', includeProgress = false } = req.query;

  // Check if user is enrolled in the course (for learners) or is the tutor
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const isTutor = course.tutor.toString() === req.user._id.toString();
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: courseId 
  });

  if (!isTutor && !enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  // Get lessons
  const lessons = await Lesson.findByCourse(courseId, { status });

  // Include progress for learners
  let lessonsWithProgress = lessons;
  if (includeProgress === 'true' && enrollment) {
    const progressRecords = await LessonProgress.find({
      learner: req.user._id,
      course: courseId
    });

    lessonsWithProgress = lessons.map(lesson => {
      const progress = progressRecords.find(p => p.lesson.toString() === lesson._id.toString());
      return {
        ...lesson.toObject(),
        progress: progress || {
          status: 'not-started',
          completionPercentage: 0,
          lastAccessedAt: null
        }
      };
    });
  }

  res.json({
    success: true,
    data: lessonsWithProgress,
    count: lessonsWithProgress.length
  });
});

// @desc    Get a single lesson
// @route   GET /api/lessons/:id
// @access  Private
exports.getLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { includeProgress = false } = req.query;

  const lesson = await Lesson.findById(id)
    .populate('course', 'title tutor')
    .populate('tutor', 'name profilePicture');

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check access permissions
  const isTutor = lesson.tutor._id.toString() === req.user._id.toString();
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: lesson.course._id 
  });

  if (!isTutor && !enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this lesson'
    });
  }

  // Check if lesson is free or user is enrolled
  if (!lesson.isFree && !enrollment) {
    return res.status(403).json({
      success: false,
      message: 'This lesson requires enrollment'
    });
  }

  let lessonData = lesson.toObject();

  // Include progress for learners
  if (includeProgress === 'true' && enrollment) {
    const progress = await LessonProgress.findOne({
      learner: req.user._id,
      course: lesson.course._id,
      lesson: lesson._id
    });

    lessonData.progress = progress || {
      status: 'not-started',
      completionPercentage: 0,
      lastAccessedAt: null
    };
  }

  res.json({
    success: true,
    data: lessonData
  });
});

// @desc    Update lesson progress
// @route   PUT /api/lessons/:id/progress
// @access  Private (Learner)
exports.updateLessonProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    watchPercentage, 
    watchTime, 
    position, 
    readPercentage, 
    readTime, 
    readPosition,
    action 
  } = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: lesson.course 
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  // Get or create progress record
  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    course: lesson.course,
    lesson: lesson._id
  });

  if (!progress) {
    progress = await LessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lesson._id,
      enrollment: enrollment._id
    });
  }

  // Update progress based on action
  switch (action) {
    case 'start':
      await progress.startLesson();
      break;
      
    case 'video_progress':
      if (watchPercentage !== undefined && watchTime !== undefined && position !== undefined) {
        await progress.updateVideoProgress(watchPercentage, watchTime, position);
      }
      break;
      
    case 'reading_progress':
      if (readPercentage !== undefined && readTime !== undefined && readPosition !== undefined) {
        await progress.updateReadingProgress(readPercentage, readTime, readPosition);
      }
      break;
      
    case 'watch_session':
      if (req.body.startTime && req.body.endTime && req.body.watchPercentage) {
        await progress.addWatchSession(req.body.startTime, req.body.endTime, req.body.watchPercentage);
      }
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
  }

  // Update enrollment progress
  const courseProgress = await lesson.course.calculateLearnerProgress(req.user._id);
  enrollment.progress = courseProgress.progress;
  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  res.json({
    success: true,
    data: progress,
    message: 'Progress updated successfully'
  });
});

// @desc    Submit quiz
// @route   POST /api/lessons/:id/quiz/submit
// @access  Private (Learner)
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  if (lesson.type !== 'quiz') {
    return res.status(400).json({
      success: false,
      message: 'This lesson is not a quiz'
    });
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: lesson.course 
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  // Get or create progress record
  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    course: lesson.course,
    lesson: lesson._id
  });

  if (!progress) {
    progress = await LessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lesson._id,
      enrollment: enrollment._id
    });
  }

  // Calculate score
  let score = 0;
  const totalQuestions = lesson.content.quizQuestions.length;
  
  answers.forEach(answer => {
    const question = lesson.content.quizQuestions.find(q => q._id.toString() === answer.questionId);
    if (question && answer.answer === question.correctAnswer) {
      score += question.points || 1;
    }
  });

  const percentage = Math.round((score / totalQuestions) * 100);

  // Submit quiz
  await progress.submitQuiz(answers, percentage);

  // Update enrollment progress
  const courseProgress = await lesson.course.calculateLearnerProgress(req.user._id);
  enrollment.progress = courseProgress.progress;
  await enrollment.save();

  res.json({
    success: true,
    data: {
      score: percentage,
      passed: percentage >= lesson.content.passingScore,
      answers: answers,
      correctAnswers: lesson.content.quizQuestions.map(q => ({
        questionId: q._id,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    },
    message: 'Quiz submitted successfully'
  });
});

// @desc    Submit assignment
// @route   POST /api/lessons/:id/assignment/submit
// @access  Private (Learner)
exports.submitAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, links } = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  if (lesson.type !== 'assignment') {
    return res.status(400).json({
      success: false,
      message: 'This lesson is not an assignment'
    });
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: lesson.course 
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  // Get or create progress record
  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    course: lesson.course,
    lesson: lesson._id
  });

  if (!progress) {
    progress = await LessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lesson._id,
      enrollment: enrollment._id
    });
  }

  // Handle file uploads
  let submissionFiles = [];
  if (req.files && req.files.length > 0) {
    try {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'skilllift/assignments/submissions',
          use_filename: true,
          unique_filename: true
        });
        
        submissionFiles.push({
          name: file.originalname,
          url: result.secure_url,
          type: file.mimetype,
          size: file.size
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload files'
      });
    }
  }

  // Submit assignment
  await progress.submitAssignment({
    files: submissionFiles,
    text,
    links
  });

  // Notify tutor
  try {
    await Notification.create({
      recipient: lesson.tutor,
      sender: req.user._id,
      type: 'assignment_submitted',
      title: 'New Assignment Submission',
      message: `${req.user.name} submitted an assignment for lesson: ${lesson.title}`,
      data: {
        lessonId: lesson._id,
        courseId: lesson.course,
        learnerId: req.user._id,
        submissionId: progress._id
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }

  res.json({
    success: true,
    data: progress,
    message: 'Assignment submitted successfully'
  });
});

// @desc    Grade assignment
// @route   PUT /api/lessons/:id/assignment/grade
// @access  Private (Tutor)
exports.gradeAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { learnerId, score, feedback } = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  if (lesson.type !== 'assignment') {
    return res.status(400).json({
      success: false,
      message: 'This lesson is not an assignment'
    });
  }

  // Check if user is the tutor
  if (lesson.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to grade this assignment'
    });
  }

  // Get progress record
  const progress = await LessonProgress.findOne({
    learner: learnerId,
    course: lesson.course,
    lesson: lesson._id
  });

  if (!progress) {
    return res.status(404).json({
      success: false,
      message: 'Assignment submission not found'
    });
  }

  // Grade assignment
  await progress.gradeAssignment(score, feedback, req.user._id);

  // Notify learner
  try {
    await Notification.create({
      recipient: learnerId,
      sender: req.user._id,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your assignment for lesson: ${lesson.title} has been graded`,
      data: {
        lessonId: lesson._id,
        courseId: lesson.course,
        score,
        feedback
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }

  res.json({
    success: true,
    data: progress,
    message: 'Assignment graded successfully'
  });
});

// @desc    Add note to lesson
// @route   POST /api/lessons/:id/notes
// @access  Private (Learner)
exports.addNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, timestamp = 0 } = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: lesson.course 
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  // Get or create progress record
  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    course: lesson.course,
    lesson: lesson._id
  });

  if (!progress) {
    progress = await LessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lesson._id,
      enrollment: enrollment._id
    });
  }

  // Add note
  await progress.addNote(content, timestamp);

  res.json({
    success: true,
    data: progress,
    message: 'Note added successfully'
  });
});

// @desc    Add bookmark to lesson
// @route   POST /api/lessons/:id/bookmarks
// @access  Private (Learner)
exports.addBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, timestamp = 0 } = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is enrolled
  const enrollment = await Enrollment.findOne({ 
    learner: req.user._id, 
    course: lesson.course 
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  // Get or create progress record
  let progress = await LessonProgress.findOne({
    learner: req.user._id,
    course: lesson.course,
    lesson: lesson._id
  });

  if (!progress) {
    progress = await LessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lesson._id,
      enrollment: enrollment._id
    });
  }

  // Add bookmark
  await progress.addBookmark(title, timestamp);

  res.json({
    success: true,
    data: progress,
    message: 'Bookmark added successfully'
  });
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Tutor)
exports.updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is the tutor
  if (lesson.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this lesson'
    });
  }

  // Handle file uploads if needed
  if (req.files) {
    // Process file uploads similar to createLesson
    // Implementation depends on specific requirements
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedLesson,
    message: 'Lesson updated successfully'
  });
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Tutor)
exports.deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is the tutor
  if (lesson.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to delete this lesson'
    });
  }

  await Lesson.findByIdAndDelete(id);

  // Update course statistics
  const course = await Course.findById(lesson.course);
  if (course) {
    await course.updateStatistics();
  }

  res.json({
    success: true,
    message: 'Lesson deleted successfully'
  });
});

// @desc    Get lesson statistics
// @route   GET /api/lessons/:id/statistics
// @access  Private (Tutor)
exports.getLessonStatistics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await Lesson.findById(id);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is the tutor
  if (lesson.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view lesson statistics'
    });
  }

  const statistics = await Lesson.getStatistics({
    courseId: lesson.course,
    tutorId: lesson.tutor
  });

  res.json({
    success: true,
    data: statistics[0] || {}
  });
});
