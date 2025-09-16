const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  
  // Progress tracking
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'failed'],
    default: 'not-started'
  },
  
  // Video progress
  videoProgress: {
    watchPercentage: { type: Number, default: 0, min: 0, max: 100 },
    watchTime: { type: Number, default: 0 }, // in seconds
    lastWatchedPosition: { type: Number, default: 0 }, // in seconds
    watchSessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number, // in seconds
      watchPercentage: Number
    }]
  },
  
  // Quiz progress
  quizProgress: {
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    bestScore: { type: Number, default: 0 },
    lastScore: { type: Number, default: 0 },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number,
      attemptNumber: Number,
      answeredAt: { type: Date, default: Date.now }
    }],
    completedAt: Date,
    passed: { type: Boolean, default: false }
  },
  
  // Assignment progress
  assignmentProgress: {
    submitted: { type: Boolean, default: false },
    submittedAt: Date,
    submissionFiles: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    submissionText: String,
    submissionLinks: [String],
    graded: { type: Boolean, default: false },
    score: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Reading progress
  readingProgress: {
    readPercentage: { type: Number, default: 0, min: 0, max: 100 },
    readTime: { type: Number, default: 0 }, // in seconds
    lastReadPosition: Number,
    readSessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number, // in seconds
      readPercentage: Number
    }]
  },
  
  // Document progress
  documentProgress: {
    downloaded: { type: Boolean, default: false },
    downloadedAt: Date,
    viewTime: { type: Number, default: 0 }, // in seconds
    lastViewedAt: Date
  },
  
  // Completion tracking
  completedAt: Date,
  completionTime: Number, // total time spent in minutes
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  
  // Notes and bookmarks
  notes: [{
    content: String,
    timestamp: Number, // for video/audio content
    createdAt: { type: Date, default: Date.now }
  }],
  bookmarks: [{
    title: String,
    timestamp: Number, // for video/audio content
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  startedAt: Date,
  lastAccessedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better performance
lessonProgressSchema.index({ learner: 1, course: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ learner: 1, status: 1 });
lessonProgressSchema.index({ course: 1, status: 1 });
lessonProgressSchema.index({ enrollment: 1, status: 1 });
lessonProgressSchema.index({ lastAccessedAt: -1 });

// Virtual for checking if lesson is completed
lessonProgressSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for checking if lesson is in progress
lessonProgressSchema.virtual('isInProgress').get(function() {
  return this.status === 'in-progress';
});

// Virtual for checking if lesson is failed
lessonProgressSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// Method to start lesson
lessonProgressSchema.methods.startLesson = function() {
  if (this.status === 'not-started') {
    this.status = 'in-progress';
    this.startedAt = new Date();
  }
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to update video progress
lessonProgressSchema.methods.updateVideoProgress = function(watchPercentage, watchTime, position) {
  this.videoProgress.watchPercentage = Math.max(this.videoProgress.watchPercentage, watchPercentage);
  this.videoProgress.watchTime = Math.max(this.videoProgress.watchTime, watchTime);
  this.videoProgress.lastWatchedPosition = position;
  this.lastAccessedAt = new Date();
  
  // Check if lesson should be marked as completed
  if (watchPercentage >= 90 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
    this.completionPercentage = 100;
  }
  
  return this.save();
};

// Method to add watch session
lessonProgressSchema.methods.addWatchSession = function(startTime, endTime, watchPercentage) {
  const duration = Math.floor((endTime - startTime) / 1000); // Convert to seconds
  this.videoProgress.watchSessions.push({
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration,
    watchPercentage
  });
  return this.save();
};

// Method to submit quiz
lessonProgressSchema.methods.submitQuiz = function(answers, score) {
  this.quizProgress.attempts += 1;
  this.quizProgress.lastScore = score;
  this.quizProgress.bestScore = Math.max(this.quizProgress.bestScore, score);
  
  // Add answers
  answers.forEach(answer => {
    this.quizProgress.answers.push({
      ...answer,
      attemptNumber: this.quizProgress.attempts
    });
  });
  
  // Check if quiz is passed (assuming 70% passing score)
  if (score >= 70) {
    this.quizProgress.passed = true;
    this.quizProgress.completedAt = new Date();
    this.status = 'completed';
    this.completedAt = new Date();
    this.completionPercentage = 100;
  } else if (this.quizProgress.attempts >= this.quizProgress.maxAttempts) {
    this.status = 'failed';
  }
  
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to submit assignment
lessonProgressSchema.methods.submitAssignment = function(submissionData) {
  this.assignmentProgress.submitted = true;
  this.assignmentProgress.submittedAt = new Date();
  this.assignmentProgress.submissionFiles = submissionData.files || [];
  this.assignmentProgress.submissionText = submissionData.text || '';
  this.assignmentProgress.submissionLinks = submissionData.links || [];
  
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to grade assignment
lessonProgressSchema.methods.gradeAssignment = function(score, feedback, gradedBy) {
  this.assignmentProgress.graded = true;
  this.assignmentProgress.score = score;
  this.assignmentProgress.feedback = feedback;
  this.assignmentProgress.gradedAt = new Date();
  this.assignmentProgress.gradedBy = gradedBy;
  
  // Check if assignment is passed (assuming 70% passing score)
  if (score >= 70) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.completionPercentage = 100;
  } else {
    this.status = 'failed';
  }
  
  return this.save();
};

// Method to update reading progress
lessonProgressSchema.methods.updateReadingProgress = function(readPercentage, readTime, position) {
  this.readingProgress.readPercentage = Math.max(this.readingProgress.readPercentage, readPercentage);
  this.readingProgress.readTime = Math.max(this.readingProgress.readTime, readTime);
  this.readingProgress.lastReadPosition = position;
  this.lastAccessedAt = new Date();
  
  // Check if lesson should be marked as completed
  if (readPercentage >= 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
    this.completionPercentage = 100;
  }
  
  return this.save();
};

// Method to add note
lessonProgressSchema.methods.addNote = function(content, timestamp = 0) {
  this.notes.push({
    content,
    timestamp,
    createdAt: new Date()
  });
  return this.save();
};

// Method to add bookmark
lessonProgressSchema.methods.addBookmark = function(title, timestamp = 0) {
  this.bookmarks.push({
    title,
    timestamp,
    createdAt: new Date()
  });
  return this.save();
};

// Method to calculate total completion time
lessonProgressSchema.methods.calculateCompletionTime = function() {
  let totalTime = 0;
  
  // Add video watch time
  if (this.videoProgress.watchSessions.length > 0) {
    totalTime += this.videoProgress.watchSessions.reduce((sum, session) => sum + session.duration, 0);
  }
  
  // Add reading time
  totalTime += this.readingProgress.readTime;
  
  // Add document view time
  totalTime += this.documentProgress.viewTime;
  
  // Convert to minutes
  this.completionTime = Math.ceil(totalTime / 60);
  return this.completionTime;
};

// Static method to get progress by learner and course
lessonProgressSchema.statics.getByLearnerAndCourse = function(learnerId, courseId) {
  return this.find({ learner: learnerId, course: courseId })
    .populate('lesson', 'title type lessonNumber')
    .sort({ 'lesson.lessonNumber': 1 });
};

// Static method to get progress by enrollment
lessonProgressSchema.statics.getByEnrollment = function(enrollmentId) {
  return this.find({ enrollment: enrollmentId })
    .populate('lesson', 'title type lessonNumber')
    .sort({ 'lesson.lessonNumber': 1 });
};

// Static method to get course completion statistics
lessonProgressSchema.statics.getCourseCompletionStats = function(courseId) {
  return this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$course',
        totalLearners: { $sum: 1 },
        completedLessons: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgressLessons: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        failedLessons: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        averageCompletionTime: { $avg: '$completionTime' },
        averageCompletionPercentage: { $avg: '$completionPercentage' }
      }
    }
  ]);
};

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
