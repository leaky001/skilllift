const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Payment details
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['full'], 
    required: true 
  },
  amountPaid: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  
  // Course progress
  progress: { type: Number, default: 0 }, // 0-100%
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  lastAccessedAt: Date,
  
  // Assignment submissions
  assignments: [{
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    submittedAt: Date,
    score: Number,
    feedback: String,
    status: { 
      type: String, 
      enum: ['not-submitted', 'submitted', 'graded', 'passed', 'failed'] 
    }
  }],
  
  // Course completion
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled', 'suspended'], 
    default: 'active' 
  },
  completedAt: Date,
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  
  // Live class attendance (for live courses)
  liveClassAttendance: [{
    sessionId: String,
    date: Date,
    attended: Boolean,
    duration: Number, // minutes attended
    recordingWatched: Boolean
  }],
  
  // Physical class attendance (for physical courses)
  physicalClassAttendance: [{
    sessionId: String,
    date: Date,
    attended: Boolean,
    location: String
  }],
  
  // Notes and feedback
  learnerNotes: String,
  tutorNotes: String,
  
  // Timestamps
  enrolledAt: { type: Date, default: Date.now },
  expiresAt: Date, // Course access expiration
  
  // Refund information
  refundRequested: { type: Boolean, default: false },
  refundReason: String,
  refundAmount: Number,
  refundStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processed'] 
  },
  refundProcessedAt: Date
}, { 
  timestamps: true 
});

// Indexes for better performance
enrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ tutor: 1, status: 1 });
enrollmentSchema.index({ paymentStatus: 1, status: 1 });
enrollmentSchema.index({ enrolledAt: 1 });

// Virtual for completion status
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Pre-save middleware to update course enrollment count
enrollmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, {
      $inc: { totalEnrollments: 1 },
      $addToSet: { enrolledStudents: this.learner }
    });
  }
  next();
});

// Pre-remove middleware to update course enrollment count
enrollmentSchema.pre('remove', async function(next) {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { totalEnrollments: -1 },
    $pull: { enrolledStudents: this.learner }
  });
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
