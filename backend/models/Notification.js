const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    default: function() {
      return `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Course related
      'course_update',
      'course_completed',
      'course_available',
      
      // Enrollment related
      'enrollment',
      'new_enrollment',
      'enrollment_confirmation',
      
      // Payment related
      'payment_received',
      'payment_confirmation',
      'payment_reminder',
      
      // Assignment related
      'assignment_created',
      'assignment_published',
      'assignment_submitted',
      'assignment_graded',
      'assignment_due',
      
      // Live session related
      'live_session_reminder',
      'live_session_started',
      'live_session_updated',
      'live_class_scheduled',
      'live_class_started',
      'live_class_ended',
      
      // Replay related
      'replay_uploaded',
      
      // User management
      'user_approval',
      'user_rejection',
      'account_approved',
      'account_rejected',
      
      // KYC related
      'kyc_submission',
      'kyc_approval',
      'kyc_rejection',
      
      // Mentorship related
      'mentorship_request',
      'mentorship_accepted',
      'mentorship_rejected',
      'mentorship_response',
      
      // Certificate related
      'certificate_ready',
      
      // System related
      'system_alert',
      'system_maintenance',
      'system_update',
      
      // Message related
      'message_received',
      'message_reply',
      
      // Support related
      'support_ticket',
      'support_response',
      
      // Dispute related
      'dispute_reported',
      'dispute_resolved',
      
      // General
      'general'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
});

// Virtual for notification icon
notificationSchema.virtual('icon').get(function() {
  const iconMap = {
    // Course related
    course_submission: '📚',
    course_approval: '✅',
    course_rejection: '❌',
    course_update: '🔄',
    course_completed: '🎓',
    course_available: '🎓',
    
    // Enrollment related
    enrollment: '👨‍🎓',
    new_enrollment: '👨‍🎓',
    enrollment_confirmation: '✅',
    
    // Payment related
    payment_received: '💰',
    payment_confirmation: '✅',
    payment_reminder: '⏰',
    
    // Assignment related
    assignment_created: '📝',
    assignment_published: '📝',
    assignment_submitted: '📝',
    assignment_graded: '📊',
    assignment_due: '⏰',
    
    // Live session related
    live_session_reminder: '📅',
    live_session_started: '🎥',
    live_session_updated: '🔄',
    live_class_scheduled: '📅',
    live_class_started: '🎥',
    live_class_ended: '🏁',
    
    // Replay related
    replay_uploaded: '🎬',
    
    // User management
    user_approval: '👤',
    user_rejection: '❌',
    account_approved: '✅',
    account_rejected: '❌',
    
    // KYC related
    kyc_submission: '🆔',
    kyc_approval: '✅',
    kyc_rejection: '❌',
    
    // Mentorship related
    mentorship_request: '🎓',
    mentorship_accepted: '✅',
    mentorship_rejected: '❌',
    mentorship_response: '💬',
    
    // Certificate related
    certificate_ready: '🏆',
    
    // System related
    system_alert: '⚠️',
    system_maintenance: '🔧',
    system_update: '🔄',
    
    // Message related
    message_received: '📨',
    message_reply: '💬',
    
    // Support related
    support_ticket: '🎫',
    support_response: '💬',
    
    // Dispute related
    dispute_reported: '🚨',
    dispute_resolved: '✅',
    
    // General
    general: '📢'
  };
  
  return iconMap[this.type] || '📢';
});

// Virtual for notification color
notificationSchema.virtual('color').get(function() {
  const colorMap = {
    // Success/Positive
    course_approval: 'green',
    course_available: 'green',
    enrollment_confirmation: 'green',
    new_enrollment: 'green',
    payment_confirmation: 'green',
    assignment_graded: 'green',
    assignment_published: 'green',
    course_completed: 'green',
    account_approved: 'green',
    kyc_approval: 'green',
    mentorship_accepted: 'green',
    certificate_ready: 'green',
    dispute_resolved: 'green',
    
    // Warning/Reminder
    payment_reminder: 'yellow',
    assignment_created: 'blue',
    assignment_due: 'yellow',
    live_session_reminder: 'yellow',
    live_class_scheduled: 'yellow',
    system_maintenance: 'yellow',
    
    // Message related
    message_received: 'blue',
    message_reply: 'blue',
    
    // Error/Rejection
    course_rejection: 'red',
    user_rejection: 'red',
    account_rejected: 'red',
    kyc_rejection: 'red',
    mentorship_rejected: 'red',
    dispute_reported: 'red',
    
    // Info/Neutral
    course_submission: 'blue',
    enrollment: 'blue',
    payment_received: 'blue',
    assignment_submitted: 'blue',
    live_session_started: 'blue',
    live_session_updated: 'blue',
    live_class_started: 'blue',
    live_class_ended: 'blue',
    replay_uploaded: 'blue',
    course_update: 'blue',
    user_approval: 'blue',
    kyc_submission: 'blue',
    mentorship_request: 'blue',
    mentorship_response: 'blue',
    system_alert: 'blue',
    system_update: 'blue',
    support_ticket: 'blue',
    support_response: 'blue',
    general: 'blue'
  };
  
  return colorMap[this.type] || 'blue';
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get notifications by type
notificationSchema.statics.getByType = function(userId, type) {
  return this.find({ recipient: userId, type }).sort({ createdAt: -1 });
};

// Static method to get recent notifications
notificationSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email avatar');
};

// Pre-save middleware to set readAt when marking as read
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
