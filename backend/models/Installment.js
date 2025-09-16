const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  installmentNumber: {
    type: Number,
    required: true,
    min: 1
  },
  totalInstallments: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'paystack'
  },
  paystackReference: {
    type: String,
    sparse: true
  },
  paidAt: {
    type: Date
  },
  createdAt: {
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

// Index for efficient queries
installmentSchema.index({ course: 1, learner: 1 });
installmentSchema.index({ status: 1, dueDate: 1 });
installmentSchema.index({ paystackReference: 1 });

// Virtual for remaining amount
installmentSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.dueDate;
});

// Virtual for progress
installmentSchema.virtual('progress').get(function() {
  return (this.installmentNumber / this.totalInstallments) * 100;
});

// Pre-save middleware
installmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get overdue installments
installmentSchema.statics.getOverdueInstallments = function() {
  return this.find({
    status: 'pending',
    dueDate: { $lt: new Date() }
  }).populate('course learner');
};

// Static method to get installment summary
installmentSchema.statics.getInstallmentSummary = function(courseId, learnerId) {
  return this.aggregate([
    {
      $match: {
        course: mongoose.Types.ObjectId(courseId),
        learner: mongoose.Types.ObjectId(learnerId)
      }
    },
    {
      $group: {
        _id: null,
        totalInstallments: { $first: '$totalInstallments' },
        paidInstallments: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        totalAmount: { $sum: '$amount' },
        paidAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
        },
        remainingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Installment', installmentSchema);
