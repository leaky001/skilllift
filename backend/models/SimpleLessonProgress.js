const mongoose = require('mongoose');

/**
 * SIMPLIFIED LESSON PROGRESS MODEL
 * 
 * Key Simplifications:
 * 1. Single progress record per user per lesson
 * 2. Simple completion tracking
 * 3. Minimal metadata
 * 4. Easy to query and update
 */
const simpleLessonProgressSchema = new mongoose.Schema({
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
    ref: 'SimpleLesson',
    required: true
  },
  
  // Progress tracking
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  
  // Video progress
  watchPercentage: { type: Number, default: 0, min: 0, max: 100 },
  watchTime: { type: Number, default: 0 }, // in seconds
  
  // Quiz progress
  quizScore: { type: Number, default: 0, min: 0, max: 100 },
  quizAttempts: { type: Number, default: 0 },
  quizAnswers: [Number], // array of selected answer indices
  
  // Assignment progress
  assignmentSubmitted: { type: Boolean, default: false },
  assignmentScore: { type: Number, default: 0, min: 0, max: 100 },
  
  // Document progress
  readPercentage: { type: Number, default: 0, min: 0, max: 100 },
  
  // Completion tracking
  completedAt: Date,
  lastAccessedAt: { type: Date, default: Date.now },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Unique compound index
simpleLessonProgressSchema.index({ learner: 1, lesson: 1 }, { unique: true });

// Method to update progress
simpleLessonProgressSchema.methods.updateProgress = function(progressData) {
  Object.assign(this, progressData);
  this.lastAccessedAt = new Date();
  this.updatedAt = new Date();
  
  // Auto-update status based on progress
  if (this.watchPercentage >= 90 || this.quizScore >= 70 || 
      this.assignmentSubmitted || this.readPercentage >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.watchPercentage > 0 || this.quizAttempts > 0 || 
             this.readPercentage > 0) {
    this.status = 'in-progress';
  }
  
  return this.save();
};

// Method to check if lesson is completed
simpleLessonProgressSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

// Static method to get user's course progress
simpleLessonProgressSchema.statics.getCourseProgress = function(learnerId, courseId) {
  return this.find({ learner: learnerId, course: courseId })
    .populate('lesson', 'title contentType order')
    .sort({ 'lesson.order': 1 });
};

// Static method to get course completion percentage
simpleLessonProgressSchema.statics.getCourseCompletionPercentage = function(learnerId, courseId) {
  return this.aggregate([
    { $match: { learner: mongoose.Types.ObjectId(learnerId), course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        completedLessons: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    },
    {
      $project: {
        completionPercentage: {
          $cond: [
            { $eq: ['$totalLessons', 0] },
            0,
            { $multiply: [{ $divide: ['$completedLessons', '$totalLessons'] }, 100] }
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('SimpleLessonProgress', simpleLessonProgressSchema);
