const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint', 'report', 'dispute', 'suggestion', 'bug_report'],
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
    maxlength: 2000
  },
  category: {
    type: String,
    enum: [
      'course_quality',
      'payment_issue',
      'technical_problem',
      'user_behavior',
      'content_violation',
      'billing_dispute',
      'platform_bug',
      'feature_request',
      'other'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'under_review', 'resolved', 'closed'],
    default: 'pending'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'document', 'link', 'screenshot']
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  resolution: {
    type: String,
    maxlength: 1000
  },
  actionTaken: {
    type: String,
    maxlength: 1000
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: Date,
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminResponses: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ submittedAt: -1 });
complaintSchema.index({ priority: -1, submittedAt: -1 });

// Virtual for complaint age
complaintSchema.virtual('age').get(function() {
  return Date.now() - this.submittedAt;
});

// Virtual for isOverdue (complaints older than 48 hours with high/urgent priority)
complaintSchema.virtual('isOverdue').get(function() {
  if (this.priority === 'high' || this.priority === 'urgent') {
    const hoursSinceSubmission = (Date.now() - this.submittedAt) / (1000 * 60 * 60);
    return hoursSinceSubmission > 48;
  }
  return false;
});

// Method to check if complaint can be updated by user
complaintSchema.methods.canBeUpdatedByUser = function() {
  return this.status === 'pending' || this.status === 'under_review';
};

// Method to check if complaint can be assigned
complaintSchema.methods.canBeAssigned = function() {
  return this.status === 'pending';
};

// Method to check if complaint can be resolved
complaintSchema.methods.canBeResolved = function() {
  return this.status === 'assigned' || this.status === 'under_review';
};

// Method to check if complaint can be closed
complaintSchema.methods.canBeClosed = function() {
  return this.status === 'resolved';
};

// Method to get priority score for sorting
complaintSchema.methods.getPriorityScore = function() {
  const priorityScores = {
    'urgent': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  };
  return priorityScores[this.priority] || 0;
};

// Pre-save middleware to update timestamps
complaintSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to validate evidence
complaintSchema.pre('save', function(next) {
  if (this.evidence && this.evidence.length > 10) {
    return next(new Error('Maximum 10 evidence items allowed'));
  }
  next();
});

// Static method to get complaints by status
complaintSchema.statics.getByStatus = function(status, options = {}) {
  const query = { status };
  if (options.userId) query.user = options.userId;
  if (options.category) query.category = options.category;
  if (options.priority) query.priority = options.priority;
  
  return this.find(query)
    .populate('user', 'name email avatar')
    .populate('relatedCourse', 'title thumbnail')
    .populate('relatedUser', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, submittedAt: -1 });
};

// Static method to get overdue complaints
complaintSchema.statics.getOverdueComplaints = function() {
  const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
  
  return this.find({
    status: { $in: ['pending', 'assigned'] },
    priority: { $in: ['high', 'urgent'] },
    submittedAt: { $lt: cutoffTime }
  })
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, submittedAt: 1 });
};

// Static method to get complaint statistics
complaintSchema.statics.getStatistics = function(filters = {}) {
  const matchStage = {};
  
  if (filters.dateFrom) {
    matchStage.submittedAt = { $gte: new Date(filters.dateFrom) };
  }
  if (filters.dateTo) {
    matchStage.submittedAt = { ...matchStage.submittedAt, $lte: new Date(filters.dateTo) };
  }
  if (filters.category) {
    matchStage.category = filters.category;
  }
  if (filters.priority) {
    matchStage.priority = filters.priority;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
        underReview: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }
    }
  ]);
};

// Static method to get complaints by category
complaintSchema.statics.getByCategory = function(category, options = {}) {
  const query = { category };
  if (options.status) query.status = options.status;
  if (options.priority) query.priority = options.priority;
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('relatedCourse', 'title')
    .sort({ priority: -1, submittedAt: -1 });
};

module.exports = mongoose.model('Complaint', complaintSchema);
