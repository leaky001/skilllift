const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  lessonNumber: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['video', 'document', 'quiz', 'assignment', 'reading', 'interactive'],
    required: true
  },
  content: {
    // Video content
    videoUrl: String,
    videoDuration: Number, // in seconds
    videoThumbnail: String,
    videoTranscript: String,
    
    // Document content
    documentUrl: String,
    documentType: String, // pdf, doc, ppt, etc.
    documentSize: Number, // in bytes
    
    // Quiz content
    quizQuestions: [{
      question: String,
      type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'] },
      options: [String], // for multiple choice
      correctAnswer: mongoose.Schema.Types.Mixed,
      points: { type: Number, default: 1 },
      explanation: String
    }],
    quizTimeLimit: Number, // in minutes
    passingScore: { type: Number, default: 70 }, // percentage
    
    // Assignment content
    assignmentInstructions: String,
    assignmentFiles: [{
      name: String,
      url: String,
      type: String
    }],
    assignmentDueDate: Date,
    assignmentPoints: Number,
    
    // Reading content
    readingText: String,
    readingResources: [{
      title: String,
      url: String,
      type: String
    }],
    
    // Interactive content
    interactiveContent: mongoose.Schema.Types.Mixed
  },
  
  // Progress tracking
  completionCriteria: {
    type: String,
    enum: ['watch-90-percent', 'watch-complete', 'pass-quiz', 'submit-assignment', 'read-complete'],
    default: 'watch-90-percent'
  },
  requiredForCompletion: {
    type: Boolean,
    default: true
  },
  
  // Access control
  isFree: {
    type: Boolean,
    default: false
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  
  // Metadata
  tags: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Statistics
  totalViews: { type: Number, default: 0 },
  averageCompletionTime: Number, // in minutes
  completionRate: { type: Number, default: 0 }, // percentage
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better performance
lessonSchema.index({ course: 1, lessonNumber: 1 });
lessonSchema.index({ tutor: 1, status: 1 });
lessonSchema.index({ course: 1, status: 1 });
lessonSchema.index({ type: 1, status: 1 });

// Virtual for lesson duration
lessonSchema.virtual('duration').get(function() {
  if (this.type === 'video' && this.content.videoDuration) {
    return this.content.videoDuration;
  }
  if (this.type === 'reading' && this.content.readingText) {
    // Estimate reading time (200 words per minute)
    const wordCount = this.content.readingText.split(' ').length;
    return Math.ceil(wordCount / 200) * 60; // Convert to seconds
  }
  return 0;
});

// Virtual for lesson duration in minutes
lessonSchema.virtual('durationMinutes').get(function() {
  return Math.ceil(this.duration / 60);
});

// Virtual for checking if lesson is published
lessonSchema.virtual('isPublished').get(function() {
  return this.status === 'published';
});

// Method to publish lesson
lessonSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to archive lesson
lessonSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to calculate completion percentage for a user
lessonSchema.methods.calculateCompletionPercentage = function(userProgress) {
  if (!userProgress) return 0;
  
  switch (this.completionCriteria) {
    case 'watch-90-percent':
      return userProgress.watchPercentage || 0;
    case 'watch-complete':
      return userProgress.watchPercentage >= 100 ? 100 : 0;
    case 'pass-quiz':
      return userProgress.quizScore >= this.content.passingScore ? 100 : 0;
    case 'submit-assignment':
      return userProgress.assignmentSubmitted ? 100 : 0;
    case 'read-complete':
      return userProgress.readPercentage >= 100 ? 100 : 0;
    default:
      return 0;
  }
};

// Static method to get lessons by course
lessonSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { course: courseId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  
  return this.find(query)
    .populate('tutor', 'name profilePicture')
    .sort({ lessonNumber: 1 });
};

// Static method to get lessons by tutor
lessonSchema.statics.findByTutor = function(tutorId, options = {}) {
  const query = { tutor: tutorId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  
  return this.find(query)
    .populate('course', 'title thumbnail')
    .sort({ createdAt: -1 });
};

// Static method to get lesson statistics
lessonSchema.statics.getStatistics = function(filters = {}) {
  const matchStage = {};
  
  if (filters.courseId) matchStage.course = filters.courseId;
  if (filters.tutorId) matchStage.tutor = filters.tutorId;
  if (filters.type) matchStage.type = filters.type;
  if (filters.status) matchStage.status = filters.status;
  if (filters.dateFrom) matchStage.createdAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(filters.dateTo) };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
        videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
        documents: { $sum: { $cond: [{ $eq: ['$type', 'document'] }, 1, 0] } },
        quizzes: { $sum: { $cond: [{ $eq: ['$type', 'quiz'] }, 1, 0] } },
        assignments: { $sum: { $cond: [{ $eq: ['$type', 'assignment'] }, 1, 0] } },
        readings: { $sum: { $cond: [{ $eq: ['$type', 'reading'] }, 1, 0] } },
        interactive: { $sum: { $cond: [{ $eq: ['$type', 'interactive'] }, 1, 0] } },
        totalViews: { $sum: '$totalViews' },
        averageCompletionRate: { $avg: '$completionRate' }
      }
    }
  ]);
};

module.exports = mongoose.model('Lesson', lessonSchema);
