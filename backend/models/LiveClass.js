const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Live class title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Live class description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
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
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  maxParticipants: {
    type: Number,
    default: 50,
    min: [1, 'Must allow at least 1 participant'],
    max: [1000, 'Cannot exceed 1000 participants']
  },
  meetingLink: {
    type: String,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['lecture', 'workshop', 'qna', 'review', 'demo'],
    default: 'lecture'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  materials: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'presentation'],
      default: 'document'
    }
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
    leftAt: Date,
    duration: Number // Time spent in minutes
  }],
  recordings: [{
    url: {
      type: String,
      required: true
    },
    duration: Number,
    size: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatMessages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'question', 'answer', 'system'],
      default: 'message'
    }
  }],
  questions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    answer: {
      type: String,
      trim: true,
      maxlength: [1000, 'Answer cannot exceed 1000 characters']
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answeredAt: Date,
    timestamp: {
      type: Date,
      default: Date.now
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  feedback: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'NGN']
  },
  platform: {
    type: String,
    enum: ['google_meet', 'zoom', 'teams', 'webex', 'custom', 'skilllift'],
    default: 'skilllift'
  },
  recordingEnabled: {
    type: Boolean,
    default: true
  },
  chatEnabled: {
    type: Boolean,
    default: true
  },
  qaEnabled: {
    type: Boolean,
    default: true
  },
  breakoutRooms: {
    type: Boolean,
    default: false
  },
  waitingRoom: {
    type: Boolean,
    default: true
  },
  screenShare: {
    type: Boolean,
    default: true
  },
  whiteboard: {
    type: Boolean,
    default: true
  },
  polls: {
    type: Boolean,
    default: false
  },
  handRaise: {
    type: Boolean,
    default: true
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
liveClassSchema.index({ courseId: 1, scheduledDate: 1 });
liveClassSchema.index({ tutorId: 1, status: 1 });
liveClassSchema.index({ scheduledDate: 1, status: 1 });
liveClassSchema.index({ 'attendees.userId': 1 });

// Virtual for average rating
liveClassSchema.virtual('averageRating').get(function() {
  if (this.feedback.length === 0) return 0;
  const totalRating = this.feedback.reduce((sum, f) => sum + f.rating, 0);
  return Math.round((totalRating / this.feedback.length) * 10) / 10;
});

// Virtual for attendee count
liveClassSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Virtual for question count
liveClassSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Virtual for unanswered questions
liveClassSchema.virtual('unansweredQuestions').get(function() {
  return this.questions.filter(q => !q.answer).length;
});

// Pre-save middleware
liveClassSchema.pre('save', function(next) {
  // Auto-generate meeting link if not provided
  if (!this.meetingLink && this.status === 'scheduled') {
    // Generate a random meeting ID since _id might not be available yet
    const meetingId = Math.random().toString(36).substring(2, 15);
    this.meetingLink = `https://meet.skilllift.com/${meetingId}`;
  }
  
  // Set meeting password if not provided
  if (!this.meetingPassword) {
    this.meetingPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  next();
});

// Instance methods
liveClassSchema.methods.addAttendee = function(userId) {
  const existingAttendee = this.attendees.find(a => a.userId.toString() === userId.toString());
  if (!existingAttendee) {
    this.attendees.push({ userId });
    return this.save();
  }
  return Promise.resolve(this);
};

liveClassSchema.methods.removeAttendee = function(userId) {
  const attendee = this.attendees.find(a => a.userId.toString() === userId.toString());
  if (attendee) {
    attendee.leftAt = new Date();
    attendee.duration = Math.floor((attendee.leftAt - attendee.joinedAt) / (1000 * 60));
  }
  return this.save();
};

liveClassSchema.methods.addQuestion = function(userId, question) {
  this.questions.push({ userId, question });
  return this.save();
};

liveClassSchema.methods.answerQuestion = function(questionId, answer, answeredBy) {
  const question = this.questions.id(questionId);
  if (question) {
    question.answer = answer;
    question.answeredBy = answeredBy;
    question.answeredAt = new Date();
  }
  return this.save();
};

liveClassSchema.methods.addChatMessage = function(userId, message, type = 'message') {
  this.chatMessages.push({ userId, message, type });
  return this.save();
};

liveClassSchema.methods.addFeedback = function(userId, rating, comment) {
  // Remove existing feedback from same user
  this.feedback = this.feedback.filter(f => f.userId.toString() !== userId.toString());
  
  // Add new feedback
  this.feedback.push({ userId, rating, comment });
  return this.save();
};

module.exports = mongoose.model('LiveClass', liveClassSchema);
