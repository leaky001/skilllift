const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'course_purchase',
      'payout',
      'refund',
      'commission',
      'bonus',
      'penalty',
      'subscription',
      'other'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'bank_transfer', 'wallet', 'manual', 'other'],
    default: 'paystack'
  },
  bankDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String,
    bankCode: String
  },
  paymentReference: String,
  paystackReference: String,
  commission: {
    type: Number,
    default: 0,
    min: 0
  },
  tutorAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  metadata: {
    installmentNumber: Number,
    totalInstallments: Number,
    installmentPlan: String,
    originalTransaction: mongoose.Schema.Types.ObjectId,
    refundReason: String,
    adminNotes: String,
    processedBy: mongoose.Schema.Types.ObjectId,
    processedAt: Date,
    completedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    adminId: mongoose.Schema.Types.ObjectId
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: String,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  nextRetryAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ user: 1, type: 1, status: 1 });
transactionSchema.index({ tutor: 1, type: 1, status: 1 });
transactionSchema.index({ course: 1, type: 1 });
transactionSchema.index({ status: 1, type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ paymentReference: 1 });
transactionSchema.index({ paystackReference: 1 });
transactionSchema.index({ type: 1, status: 1, createdAt: -1 });

// Virtual for transaction age
transactionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for isOverdue (pending transactions older than 24 hours)
transactionSchema.virtual('isOverdue').get(function() {
  if (this.status === 'pending') {
    const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
    return hoursSinceCreation > 24;
  }
  return false;
});

// Virtual for canRetry
transactionSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.retryCount < 3;
});

// Method to check if transaction can be processed
transactionSchema.methods.canBeProcessed = function() {
  return this.status === 'pending';
};

// Method to check if transaction can be cancelled
transactionSchema.methods.canBeCancelled = function() {
  return this.status === 'pending' || this.status === 'processing';
};

// Method to check if transaction can be refunded
transactionSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && this.type === 'course_purchase';
};

// Method to check if transaction can be retried
transactionSchema.methods.canBeRetried = function() {
  return this.status === 'failed' && this.retryCount < 3;
};

// Method to mark as processing
transactionSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this;
};

// Method to mark as completed
transactionSchema.methods.markAsCompleted = function(adminId = null) {
  this.status = 'completed';
  this.processedAt = new Date();
  if (adminId) this.processedBy = adminId;
  this.metadata.completedAt = new Date();
  return this;
};

// Method to mark as failed
transactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.retryCount += 1;
  
  if (this.retryCount < 3) {
    // Schedule next retry in 1 hour
    this.nextRetryAt = new Date(Date.now() + 60 * 60 * 1000);
  }
  
  return this;
};

// Method to mark as cancelled
transactionSchema.methods.markAsCancelled = function(reason, adminId = null) {
  this.status = 'cancelled';
  this.failureReason = reason;
  if (adminId) this.processedBy = adminId;
  this.metadata.rejectedAt = new Date();
  this.metadata.rejectionReason = reason;
  return this;
};

// Method to calculate commission
transactionSchema.methods.calculateCommission = function(commissionRate = 0.15) {
  if (this.type === 'course_purchase') {
    this.commission = Math.round(this.amount * commissionRate);
    this.tutorAmount = this.amount - this.commission;
  }
  return this;
};

// Pre-save middleware to validate transaction
transactionSchema.pre('save', function(next) {
  // Validate amount
  if (this.amount <= 0) {
    return next(new Error('Transaction amount must be greater than 0'));
  }

  // Validate commission and tutor amount for course purchases
  if (this.type === 'course_purchase') {
    if (this.commission < 0 || this.tutorAmount < 0) {
      return next(new Error('Commission and tutor amount cannot be negative'));
    }
    
    if (this.commission + this.tutorAmount !== this.amount) {
      return next(new Error('Commission + tutor amount must equal total amount'));
    }
  }

  // Validate retry count
  if (this.retryCount > 3) {
    return next(new Error('Maximum retry count exceeded'));
  }

  next();
});

// Static method to get transactions by user
transactionSchema.statics.getByUser = function(userId, options = {}) {
  const query = { user: userId };
  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('course', 'title thumbnail')
    .populate('tutor', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get transactions by tutor
transactionSchema.statics.getByTutor = function(tutorId, options = {}) {
  const query = { tutor: tutorId };
  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('course', 'title')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get pending transactions
transactionSchema.statics.getPendingTransactions = function(type = null) {
  const query = { status: 'pending' };
  if (type) query.type = type;
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('tutor', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: 1 });
};

// Static method to get overdue transactions
transactionSchema.statics.getOverdueTransactions = function() {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  return this.find({
    status: 'pending',
    createdAt: { $lt: cutoffTime }
  })
    .populate('user', 'name email')
    .populate('tutor', 'name email')
    .sort({ createdAt: 1 });
};

// Static method to get failed transactions that can be retried
transactionSchema.statics.getRetryableTransactions = function() {
  return this.find({
    status: 'failed',
    retryCount: { $lt: 3 },
    $or: [
      { nextRetryAt: { $lte: new Date() } },
      { nextRetryAt: { $exists: false } }
    ]
  })
    .populate('user', 'name email')
    .populate('tutor', 'name email')
    .sort({ createdAt: 1 });
};

// Static method to get transaction statistics
transactionSchema.statics.getStatistics = function(filters = {}) {
  const matchStage = {};
  
  if (filters.dateFrom) {
    matchStage.createdAt = { $gte: new Date(filters.dateFrom) };
  }
  if (filters.dateTo) {
    matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(filters.dateTo) };
  }
  if (filters.type) {
    matchStage.type = filters.type;
  }
  if (filters.status) {
    matchStage.status = filters.status;
  }
  if (filters.userId) {
    matchStage.user = filters.userId;
  }
  if (filters.tutorId) {
    matchStage.tutor = filters.tutorId;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCommission: { $sum: '$commission' },
        totalTutorAmount: { $sum: '$tutorAmount' },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } }
      }
    }
  ]);
};

// Static method to get transactions by type
transactionSchema.statics.getByType = function(type, options = {}) {
  const query = { type };
  if (options.status) query.status = options.status;
  if (options.userId) query.user = options.userId;
  if (options.tutorId) query.tutor = options.tutorId;
  
  return this.find(query)
    .populate('user', 'name email')
    .populate('tutor', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 });
};

// Static method to get monthly transaction trends
transactionSchema.statics.getMonthlyTrends = function(year = new Date().getFullYear()) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCommission: { $sum: '$commission' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// Static method to bulk update overdue transactions
transactionSchema.statics.updateOverdueTransactions = function() {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.updateMany(
    {
      status: 'pending',
      createdAt: { $lt: cutoffTime }
    },
    {
      $set: { 
        status: 'failed',
        failureReason: 'Transaction timed out'
      }
    }
  );
};

module.exports = mongoose.model('Transaction', transactionSchema);
