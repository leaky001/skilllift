const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  // Submission identification
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Submission content
  content: String, // Text content if any
  attachments: {
    type: [{
      name: String,
      url: String,
      type: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  links: [{
    title: String,
    url: String,
    description: String
  }],
  
  // Submission details
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  lateBy: Number, // Minutes late
  submissionNotes: String, // Notes from learner
  
  // Grading
  score: Number,
  maxScore: Number,
  percentage: Number,
  grade: String, // A, B, C, D, F, or Pass/Fail
  isPassed: Boolean,
  
  // Feedback and comments
  tutorFeedback: String,
  rubricScores: [{
    criterion: String,
    points: Number,
    maxPoints: Number,
    feedback: String
  }],
  overallFeedback: String,
  
  // Status
  status: { 
    type: String, 
    enum: ['submitted', 'under-review', 'graded', 'returned', 'resubmitted'], 
    default: 'submitted' 
  },
  
  // Review process
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewTime: Number, // Time taken to review in minutes
  
  // Resubmission
  resubmissionCount: { type: Number, default: 0 },
  originalSubmission: { type: mongoose.Schema.Types.ObjectId, ref: 'AssignmentSubmission' },
  
  // Timestamps
  gradedAt: Date,
  lastUpdated: Date
}, { 
  timestamps: true 
});

// Indexes for better performance
assignmentSubmissionSchema.index({ assignment: 1, learner: 1 }); // Removed unique constraint to allow resubmissions
assignmentSubmissionSchema.index({ course: 1, status: 1 });
assignmentSubmissionSchema.index({ tutor: 1, status: 1 });
assignmentSubmissionSchema.index({ submittedAt: 1 });

// Virtual for submission status
assignmentSubmissionSchema.virtual('isGraded').get(function() {
  return this.status === 'graded';
});

assignmentSubmissionSchema.virtual('isLateSubmission').get(function() {
  return this.isLate;
});

// Pre-save middleware
assignmentSubmissionSchema.pre('save', function(next) {
  // Calculate percentage if score is provided
  if (this.score && this.maxScore) {
    this.percentage = (this.score / this.maxScore) * 100;
  }
  
  // Determine if passed
  if (this.percentage !== undefined) {
    this.isPassed = this.percentage >= 60; // Default passing score
  }
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Static method to get submission statistics
assignmentSubmissionSchema.statics.getSubmissionStats = async function(assignmentId) {
  const stats = await this.aggregate([
    { $match: { assignment: new mongoose.Types.ObjectId(assignmentId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        passedCount: { $sum: { $cond: ['$isPassed', 1, 0] } },
        lateSubmissions: { $sum: { $cond: ['$isLate', 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalSubmissions: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passedCount: 0,
    lateSubmissions: 0
  };
};

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
