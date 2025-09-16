const asyncHandler = require('express-async-handler');
const SimpleLesson = require('../models/SimpleLesson');
const SimpleLessonProgress = require('../models/SimpleLessonProgress');
const Course = require('../models/Course');

/**
 * SIMPLIFIED LESSON CONTROLLER
 * 
 * Key Simplifications:
 * 1. Single endpoint per action
 * 2. Simple progress tracking
 * 3. Minimal validation
 * 4. Easy to understand and maintain
 */

// @desc    Create a new lesson
// @route   POST /api/simple-lessons
// @access  Private (Tutor)
exports.createLesson = asyncHandler(async (req, res) => {
  const {
    courseId,
    title,
    description,
    contentType,
    order,
    videoUrl,
    videoDuration,
    videoThumbnail,
    documentUrl,
    documentName,
    quizQuestions,
    quizTimeLimit,
    assignmentInstructions,
    assignmentDueDate,
    isFree,
    isPreview,
    difficulty
  } = req.body;

  // Validate required fields
  if (!courseId || !title || !description || !contentType || !order) {
    return res.status(400).json({
      success: false,
      message: 'Course ID, title, description, content type, and order are required'
    });
  }

  // Validate content based on type
  if (contentType === 'video' && !videoUrl) {
    return res.status(400).json({
      success: false,
      message: 'Video URL is required for video lessons'
    });
  }

  if (contentType === 'document' && !documentUrl) {
    return res.status(400).json({
      success: false,
      message: 'Document URL is required for document lessons'
    });
  }

  if (contentType === 'quiz' && (!quizQuestions || quizQuestions.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Quiz questions are required for quiz lessons'
    });
  }

  if (contentType === 'assignment' && !assignmentInstructions) {
    return res.status(400).json({
      success: false,
      message: 'Assignment instructions are required for assignment lessons'
    });
  }

  // Check if course exists and user is the tutor
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only create lessons for your own courses'
    });
  }

  // Create lesson
  const lesson = await SimpleLesson.create({
    course: courseId,
    tutor: req.user._id,
    title,
    description,
    order,
    contentType,
    videoUrl,
    videoDuration,
    videoThumbnail,
    documentUrl,
    documentName,
    quizQuestions,
    quizTimeLimit,
    assignmentInstructions,
    assignmentDueDate,
    isFree,
    isPreview,
    difficulty,
    status: 'published' // Auto-publish for simplicity
  });

  // Update course lesson count
  await Course.findByIdAndUpdate(courseId, {
    $inc: { totalLessons: 1 },
    $push: { lessons: lesson._id }
  });

  res.status(201).json({
    success: true,
    data: lesson,
    message: 'Lesson created successfully'
  });
});

// @desc    Get lessons for a course
// @route   GET /api/simple-lessons/course/:courseId
// @access  Private (Enrolled users)
exports.getLessonsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if user is enrolled in course
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: courseId,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to view lessons'
    });
  }

  const lessons = await SimpleLesson.findByCourse(courseId);

  // Get user's progress for each lesson
  const lessonsWithProgress = await Promise.all(
    lessons.map(async (lesson) => {
      const progress = await SimpleLessonProgress.findOne({
        learner: req.user._id,
        lesson: lesson._id
      });

      return {
        ...lesson.toObject(),
        progress: progress || {
          status: 'not-started',
          watchPercentage: 0,
          quizScore: 0,
          assignmentSubmitted: false,
          readPercentage: 0
        }
      };
    })
  );

  res.json({
    success: true,
    data: lessonsWithProgress
  });
});

// @desc    Get a single lesson
// @route   GET /api/simple-lessons/:lessonId
// @access  Private (Enrolled users)
exports.getLessonById = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await SimpleLesson.findById(lessonId)
    .populate('course', 'title')
    .populate('tutor', 'name profilePicture');

  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is enrolled in course
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: lesson.course._id,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to view this lesson'
    });
  }

  // Get user's progress
  const progress = await SimpleLessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  res.json({
    success: true,
    data: {
      lesson,
      progress: progress || {
        status: 'not-started',
        watchPercentage: 0,
        quizScore: 0,
        assignmentSubmitted: false,
        readPercentage: 0
      }
    }
  });
});

// @desc    Update lesson progress
// @route   PUT /api/simple-lessons/:lessonId/progress
// @access  Private (Enrolled users)
exports.updateProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { watchPercentage, watchTime, quizScore, quizAnswers, assignmentSubmitted, readPercentage } = req.body;

  const lesson = await SimpleLesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({
      success: false,
      message: 'Lesson not found'
    });
  }

  // Check if user is enrolled in course
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: lesson.course,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to update progress'
    });
  }

  // Find or create progress record
  let progress = await SimpleLessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  if (!progress) {
    progress = await SimpleLessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lessonId
    });
  }

  // Update progress
  const updateData = {};
  if (watchPercentage !== undefined) updateData.watchPercentage = watchPercentage;
  if (watchTime !== undefined) updateData.watchTime = watchTime;
  if (quizScore !== undefined) updateData.quizScore = quizScore;
  if (quizAnswers !== undefined) updateData.quizAnswers = quizAnswers;
  if (assignmentSubmitted !== undefined) updateData.assignmentSubmitted = assignmentSubmitted;
  if (readPercentage !== undefined) updateData.readPercentage = readPercentage;

  await progress.updateProgress(updateData);

  res.json({
    success: true,
    data: progress,
    message: 'Progress updated successfully'
  });
});

// @desc    Submit quiz
// @route   POST /api/simple-lessons/:lessonId/quiz
// @access  Private (Enrolled users)
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { answers } = req.body; // Array of selected answer indices

  const lesson = await SimpleLesson.findById(lessonId);
  if (!lesson || lesson.contentType !== 'quiz') {
    return res.status(404).json({
      success: false,
      message: 'Quiz lesson not found'
    });
  }

  // Check if user is enrolled in course
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: lesson.course,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to take quizzes'
    });
  }

  // Calculate score
  let correctAnswers = 0;
  lesson.quizQuestions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      correctAnswers++;
    }
  });

  const score = Math.round((correctAnswers / lesson.quizQuestions.length) * 100);

  // Find or create progress record
  let progress = await SimpleLessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  if (!progress) {
    progress = await SimpleLessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lessonId
    });
  }

  // Update progress
  await progress.updateProgress({
    quizScore: score,
    quizAttempts: progress.quizAttempts + 1,
    quizAnswers: answers
  });

  res.json({
    success: true,
    data: {
      score,
      correctAnswers,
      totalQuestions: lesson.quizQuestions.length,
      passed: score >= 70,
      progress
    },
    message: score >= 70 ? 'Quiz passed!' : 'Quiz failed. Try again.'
  });
});

// @desc    Submit assignment
// @route   POST /api/simple-lessons/:lessonId/assignment
// @access  Private (Enrolled users)
exports.submitAssignment = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { submissionText, files } = req.body;

  const lesson = await SimpleLesson.findById(lessonId);
  if (!lesson || lesson.contentType !== 'assignment') {
    return res.status(404).json({
      success: false,
      message: 'Assignment lesson not found'
    });
  }

  // Check if user is enrolled in course
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: lesson.course,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to submit assignments'
    });
  }

  // Find or create progress record
  let progress = await SimpleLessonProgress.findOne({
    learner: req.user._id,
    lesson: lessonId
  });

  if (!progress) {
    progress = await SimpleLessonProgress.create({
      learner: req.user._id,
      course: lesson.course,
      lesson: lessonId
    });
  }

  // Update progress
  await progress.updateProgress({
    assignmentSubmitted: true
  });

  // TODO: Save assignment submission to database
  // For now, just mark as submitted

  res.json({
    success: true,
    data: progress,
    message: 'Assignment submitted successfully'
  });
});

// @desc    Get course completion percentage
// @route   GET /api/simple-lessons/course/:courseId/completion
// @access  Private (Enrolled users)
exports.getCourseCompletion = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if user is enrolled in course
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    learner: req.user._id,
    course: courseId,
    status: 'active'
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to view completion'
    });
  }

  const completionData = await SimpleLessonProgress.getCourseCompletionPercentage(req.user._id, courseId);
  const completionPercentage = completionData[0]?.completionPercentage || 0;

  res.json({
    success: true,
    data: {
      completionPercentage: Math.round(completionPercentage),
      enrollmentDate: enrollment.enrolledAt,
      lastAccessed: enrollment.lastAccessedAt
    }
  });
});

module.exports = {
  createLesson: exports.createLesson,
  getLessonsByCourse: exports.getLessonsByCourse,
  getLessonById: exports.getLessonById,
  updateProgress: exports.updateProgress,
  submitQuiz: exports.submitQuiz,
  submitAssignment: exports.submitAssignment,
  getCourseCompletion: exports.getCourseCompletion
};
