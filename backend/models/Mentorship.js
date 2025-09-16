const mongoose = require('mongoose');

const MentorshipSchema = new mongoose.Schema({
  learner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Learner is required']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    required: [true, 'Request message is required'],
    maxlength: [1000, 'Request message cannot be more than 1000 characters']
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['learner', 'admin']
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
  },
  duration: {
    type: Number, // in weeks
    default: 4,
    min: [1, 'Minimum duration is 1 week'],
    max: [52, 'Maximum duration is 52 weeks']
  },
  goals: [{
    type: String,
    trim: true,
    maxlength: [200, 'Goal cannot be more than 200 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [100, 'Skill cannot be more than 100 characters']
  }],
  schedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    },
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'evening'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  pricing: {
    type: {
      type: String,
      enum: ['hourly', 'weekly', 'monthly', 'fixed'],
      default: 'hourly'
    },
    amount: {
      type: Number,
      required: [true, 'Pricing amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'NGN'
    }
  },
  sessions: [{
    date: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: [30, 'Minimum session duration is 30 minutes'],
      max: [480, 'Maximum session duration is 8 hours']
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters']
    },
    feedback: {
      rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
      },
      comment: {
        type: String,
        maxlength: [500, 'Feedback comment cannot be more than 500 characters']
      }
    }
  }],
  progress: {
    currentWeek: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    milestones: [{
      title: {
        type: String,
        required: true,
        maxlength: [200, 'Milestone title cannot be more than 200 characters']
      },
      description: {
        type: String,
        maxlength: [500, 'Milestone description cannot be more than 500 characters']
      },
      targetDate: {
        type: Date
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date
      }
    }]
  },
  communication: {
    preferredMethod: {
      type: String,
      enum: ['email', 'phone', 'video-call', 'chat'],
      default: 'email'
    },
    availability: {
      type: String,
      enum: ['flexible', 'weekdays', 'weekends', 'evenings'],
      default: 'flexible'
    }
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters']
  },
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    feedback: {
      type: String,
      maxlength: [500, 'Admin feedback cannot be more than 500 characters']
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
MentorshipSchema.index({ learner: 1 });
MentorshipSchema.index({ status: 1 });
MentorshipSchema.index({ createdAt: -1 });
MentorshipSchema.index({ 'adminReview.status': 1 });

// Virtual for time ago
MentorshipSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
});

// Instance method to accept mentorship
MentorshipSchema.methods.accept = function() {
  if (this.status !== 'pending') {
    throw new Error('Only pending mentorships can be accepted');
  }
  
  this.status = 'active';
  this.acceptedAt = new Date();
  this.startedAt = new Date();
  return this.save();
};

// Instance method to reject mentorship
MentorshipSchema.methods.reject = function(reason) {
  if (this.status !== 'pending') {
    throw new Error('Only pending mentorships can be rejected');
  }
  
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedAt = new Date();
  return this.save();
};

// Instance method to complete mentorship
MentorshipSchema.methods.complete = function() {
  if (!['active', 'pending'].includes(this.status)) {
    throw new Error('Only active or pending mentorships can be completed');
  }
  
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to cancel mentorship
MentorshipSchema.methods.cancel = function(reason, cancelledBy) {
  if (!['pending', 'active'].includes(this.status)) {
    throw new Error('Only pending or active mentorships can be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

// Instance method to add session
MentorshipSchema.methods.addSession = function(sessionData) {
  this.sessions.push(sessionData);
  this.progress.totalSessions = this.sessions.length;
  return this.save();
};

// Instance method to complete session
MentorshipSchema.methods.completeSession = function(sessionId, feedback) {
  const session = this.sessions.id(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  session.status = 'completed';
  if (feedback) {
    session.feedback = feedback;
  }
  
  this.progress.completedSessions = this.sessions.filter(s => s.status === 'completed').length;
  return this.save();
};

// Instance method to add milestone
MentorshipSchema.methods.addMilestone = function(milestoneData) {
  this.progress.milestones.push(milestoneData);
  return this.save();
};

// Instance method to complete milestone
MentorshipSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.progress.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }
  
  milestone.completed = true;
  milestone.completedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Mentorship', MentorshipSchema);
