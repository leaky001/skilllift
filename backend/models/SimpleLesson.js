const mongoose = require('mongoose');

/**
 * SIMPLIFIED LESSON MODEL
 * 
 * Key Simplifications:
 * 1. Single content type per lesson (not mixed)
 * 2. Simple progress tracking
 * 3. Minimal metadata
 * 4. Clear completion criteria
 */
const simpleLessonSchema = new mongoose.Schema({
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
  
  // Basic lesson info
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
    maxlength: 500
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Content (one type per lesson)
  contentType: {
    type: String,
    enum: ['video', 'document', 'quiz', 'assignment'],
    required: true
  },
  
  // Video content
  videoUrl: String,
  videoDuration: Number, // in minutes
  videoThumbnail: String,
  
  // Document content
  documentUrl: String,
  documentName: String,
  
  // Quiz content (simplified)
  quizQuestions: [{
    question: String,
    options: [String], // 4 options max
    correctAnswer: Number, // index of correct option (0-3)
    explanation: String
  }],
  quizTimeLimit: { type: Number, default: 10 }, // minutes
  
  // Assignment content
  assignmentInstructions: String,
  assignmentDueDate: Date,
  
  // Access and completion
  isFree: { type: Boolean, default: false },
  isPreview: { type: Boolean, default: false },
  completionRequired: { type: Boolean, default: true },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  
  // Simple metadata
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Simple indexes
simpleLessonSchema.index({ course: 1, order: 1 });
simpleLessonSchema.index({ tutor: 1, status: 1 });

// Virtual for lesson duration in minutes
simpleLessonSchema.virtual('durationMinutes').get(function() {
  if (this.contentType === 'video' && this.videoDuration) {
    return this.videoDuration;
  }
  if (this.contentType === 'quiz' && this.quizQuestions) {
    return this.quizTimeLimit || 10;
  }
  if (this.contentType === 'assignment') {
    return 30; // Estimated time for assignments
  }
  if (this.contentType === 'document') {
    return 15; // Estimated reading time
  }
  return 0;
});

// Method to publish lesson
simpleLessonSchema.methods.publish = function() {
  this.status = 'published';
  this.updatedAt = new Date();
  return this.save();
};

// Method to check if lesson is completed by user
simpleLessonSchema.methods.isCompletedByUser = function(userProgress) {
  if (!userProgress) return false;
  
  switch (this.contentType) {
    case 'video':
      return userProgress.watchPercentage >= 90;
    case 'quiz':
      return userProgress.quizScore >= 70;
    case 'assignment':
      return userProgress.assignmentSubmitted;
    case 'document':
      return userProgress.readPercentage >= 100;
    default:
      return false;
  }
};

// Static method to get lessons by course
simpleLessonSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId, status: 'published' })
    .populate('tutor', 'name profilePicture')
    .sort({ order: 1 });
};

module.exports = mongoose.model('SimpleLesson', simpleLessonSchema);
