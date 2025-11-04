const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    default: function() {
      return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: [
      'live_class_started',
      'live_class_ended',
      'course_enrolled',
      'assignment_due',
      'general',
      'payment_received',
      'enrollment_confirmation',
      'course_approved',
      'course_rejected',
      'kyc_approved',
      'kyc_rejected',
      'message_received',
      'message_sent',
      'tutor_message',
      'learner_message',
      'chat_message'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);