const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Live class title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Live class description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Course and Tutor Information
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tutor ID is required']
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Minimum duration is 15 minutes'],
    max: [480, 'Maximum duration is 8 hours']
  },
  
  // Google Meet Integration
  callId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['scheduled', 'ready', 'live', 'ended', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Session Timing
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  
  // Participants
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Recording Information
  recording: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    recordingId: {
      type: String
    },
    recordingUrl: {
      type: String
    },
    recordingDuration: {
      type: Number // Duration in seconds
    },
    recordingStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending'
    }
  },
  
  // Settings
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowLearnerScreenShare: {
      type: Boolean,
      default: false
    },
    maxParticipants: {
      type: Number,
      default: 50,
      min: [1, 'Minimum participants is 1'],
      max: [100, 'Maximum participants is 100']
    },
    autoRecord: {
      type: Boolean,
      default: true
    }
  },
  
  // Chat Messages (for live class chat)
  chatMessages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text'
    }
  }],
  
  // Metadata
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

// Indexes for better performance
LiveClassSchema.index({ courseId: 1, scheduledDate: 1 });
LiveClassSchema.index({ tutorId: 1, status: 1 });
LiveClassSchema.index({ status: 1, scheduledDate: 1 });

// Pre-save middleware to generate callId and sessionId
LiveClassSchema.pre('save', function(next) {
  if (this.isNew && !this.callId) {
    this.callId = `live-class-${this._id}-${Date.now()}`;
  }
  if (this.isNew && !this.sessionId) {
    this.sessionId = `session-${this._id}-${Date.now()}`;
  }
  this.updatedAt = new Date();
  next();
});

// Instance methods
LiveClassSchema.methods.addAttendee = function(userId) {
  const existingAttendee = this.attendees.find(attendee => 
    attendee.userId.toString() === userId.toString()
  );
  
  if (!existingAttendee) {
    this.attendees.push({
      userId: userId,
      joinedAt: new Date(),
      isActive: true
    });
  } else if (!existingAttendee.isActive) {
    existingAttendee.isActive = true;
    existingAttendee.joinedAt = new Date();
    existingAttendee.leftAt = undefined;
  }
  
  return this.save();
};

LiveClassSchema.methods.removeAttendee = function(userId) {
  const attendee = this.attendees.find(attendee => 
    attendee.userId.toString() === userId.toString()
  );
  
  if (attendee && attendee.isActive) {
    attendee.isActive = false;
    attendee.leftAt = new Date();
  }
  
  return this.save();
};

LiveClassSchema.methods.addChatMessage = function(senderId, message, messageType = 'text') {
  this.chatMessages.push({
    senderId: senderId,
    message: message,
    messageType: messageType,
    timestamp: new Date()
  });
  
  return this.save();
};

LiveClassSchema.methods.startSession = function() {
  this.status = 'live';
  this.startedAt = new Date();
  return this.save();
};

LiveClassSchema.methods.endSession = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  
  // Mark all attendees as inactive
  this.attendees.forEach(attendee => {
    if (attendee.isActive) {
      attendee.isActive = false;
      attendee.leftAt = new Date();
    }
  });
  
  return this.save();
};

// Static methods
LiveClassSchema.statics.findByCallId = function(callId) {
  return this.findOne({ callId: callId });
};

LiveClassSchema.statics.findActiveByCourse = function(courseId) {
  return this.findOne({ 
    courseId: courseId, 
    status: { $in: ['ready', 'live'] } 
  });
};

LiveClassSchema.statics.findUpcomingByCourse = function(courseId) {
  return this.find({ 
    courseId: courseId, 
    status: 'scheduled',
    scheduledDate: { $gte: new Date() }
  }).sort({ scheduledDate: 1 });
};

module.exports = mongoose.model('LiveClass', LiveClassSchema);
