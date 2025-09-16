const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: { type: String, unique: true, required: true },
  paystackReference: { type: String, required: true },
  paystackTransactionId: String,
  
  // User and course details
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Allow null for guest payments
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  
  // Payment details
  amount: { type: Number, required: true }, // Amount paid by user
  currency: { type: String, default: 'NGN' },
  paymentMethod: { 
    type: String, 
    enum: ['paystack', 'installment', 'refund'], 
    required: true 
  },
  paymentType: { 
    type: String, 
    enum: ['full', 'installment', 'certificate', 'mentorship'], 
    required: true 
  },
  
  // Commission and fees
  commissionPercentage: { type: Number, default: 15 }, // Platform commission
  commissionAmount: { type: Number, required: true }, // Actual commission amount
  tutorAmount: { type: Number, required: true }, // Amount after commission
  platformFee: { type: Number, default: 0 }, // Additional platform fees
  
  // Installment details
  installmentNumber: Number, // For installment payments
  totalInstallments: Number,
  installmentAmount: Number,
  nextInstallmentDate: Date,
  
  // Payment status
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  
  // Paystack specific fields
  paystackData: {
    authorizationUrl: String,
    accessCode: String,
    domain: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Payment processing
  processedAt: Date,
  failedAt: Date,
  failureReason: String,
  
  // Refund information
  refundRequested: { type: Boolean, default: false },
  refundAmount: Number,
  refundReason: String,
  refundStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processed'] 
  },
  refundProcessedAt: Date,
  
  // Notification and reminders
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: Date,
  reminderCount: { type: Number, default: 0 },
  
  // Timestamps
  dueDate: Date, // For installment payments
  expiresAt: Date, // Payment link expiration
}, { 
  timestamps: true 
});

// Indexes for better performance
paymentSchema.index({ paystackReference: 1 });
paymentSchema.index({ user: 1, course: 1 });
paymentSchema.index({ tutor: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: 1 });
paymentSchema.index({ dueDate: 1, status: 1 });

// Virtual for payment status
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'successful';
});

paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

paymentSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// Virtual for overdue payments
paymentSchema.virtual('isOverdue').get(function() {
  if (this.paymentType === 'installment' && this.dueDate) {
    return this.status === 'pending' && this.dueDate < new Date();
  }
  return false;
});

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.paymentId) {
    this.paymentId = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  
  // Calculate commission and tutor amount
  if (this.amount && this.commissionPercentage) {
    this.commissionAmount = (this.amount * this.commissionPercentage) / 100;
    this.tutorAmount = this.amount - this.commissionAmount;
  }
  
  next();
});

// Static method to calculate commission
paymentSchema.statics.calculateCommission = function(amount, percentage = 15) {
  const commission = (amount * percentage) / 100;
  const tutorAmount = amount - commission;
  return { commission, tutorAmount };
};

// Instance method to process successful payment
paymentSchema.methods.processPayment = async function() {
  this.status = 'successful';
  this.processedAt = new Date();
  
  // Update enrollment payment status
  if (this.enrollment) {
    const Enrollment = mongoose.model('Enrollment');
    await Enrollment.findByIdAndUpdate(this.enrollment, {
      paymentStatus: this.paymentType === 'installment' ? 'installment' : 'paid',
      amountPaid: this.amount,
      lastUpdated: new Date()
    });
  }
  
  // Update tutor earnings
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.tutor, {
    $inc: { 'tutorProfile.totalEarnings': this.tutorAmount }
  });
  
  // Update course revenue
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { totalRevenue: this.amount }
  });
  
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
