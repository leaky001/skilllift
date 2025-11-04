const mongoose = require('mongoose');

const liveClassSessionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  meetLink: {
    type: String,
    required: true
  },
  calendarEventId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  enrolledLearners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date
  }],
  notificationsSent: {
    type: Boolean,
    default: false
  },
  recordingUrl: String,
  recordingId: String,
  botMetadata: {
    startedAt: Date,
    stoppedAt: Date,
    status: {
      type: String,
      enum: ['idle', 'recording', 'uploading', 'completed', 'error']
    },
    recordingPath: String,
    driveFileId: String,
    error: String
  },
  chatMessages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
liveClassSessionSchema.index({ courseId: 1, status: 1 });
liveClassSessionSchema.index({ tutorId: 1 });
liveClassSessionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('LiveClassSession', liveClassSessionSchema);
