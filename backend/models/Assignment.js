const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assignmentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `A_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    trim: true
  },
  
  assignmentType: {
    type: String,
    enum: ['homework', 'project', 'quiz', 'assessment', 'reading', 'discussion'],
    default: 'homework'
  },
  
  instructions: {
    type: String,
    required: true
  },
  
  dueDate: {
    type: Date,
    required: true
  },
  
  points: {
    type: Number,
    required: true,
    min: 0,
    max: 1000
  },
  
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  
  submissionType: {
    type: String,
    enum: ['file', 'text', 'multiple-choice', 'link', 'none'],
    default: 'file'
  },
  
  allowedFileTypes: [{
    type: String,
    enum: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'mp4', 'mp3', 'zip']
  }],
  
  maxFileSize: {
    type: Number, // in MB
    default: 10
  },
  
  maxSubmissions: {
    type: Number,
    default: 1
  },
  
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  
  latePenalty: {
    type: Number, // percentage deduction per day
    default: 10,
    min: 0,
    max: 100
  },
  
  resources: [{
    title: String,
    url: String,
    description: String
  }],
  
  rubric: [{
    criterion: String,
    points: Number,
    description: String
  }],
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  isVisible: {
    type: Boolean,
    default: false
  },
  
  publishedAt: Date,
  
  // Statistics
  totalSubmissions: {
    type: Number,
    default: 0
  },
  
  averageScore: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [String],
  
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
assignmentSchema.index({ course: 1, status: 1 });
assignmentSchema.index({ tutor: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });
// Note: assignmentId already has unique index from field definition

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status === 'published';
});

// Virtual for checking if assignment is upcoming
assignmentSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return this.dueDate > now && this.dueDate <= weekFromNow && this.status === 'published';
});

// Pre-save middleware to update timestamps
assignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to publish assignment
assignmentSchema.methods.publish = function() {
  this.status = 'published';
  this.isVisible = true;
  this.publishedAt = new Date();
  return this.save();
};

// Method to archive assignment
assignmentSchema.methods.archive = function() {
  this.status = 'archived';
  this.isVisible = false;
  return this.save();
};

// Method to calculate late penalty
assignmentSchema.methods.calculateLatePenalty = function(submissionDate) {
  if (!this.allowLateSubmission || submissionDate <= this.dueDate) {
    return 0;
  }
  
  const daysLate = Math.ceil((submissionDate - this.dueDate) / (1000 * 60 * 60 * 24));
  const penalty = Math.min(daysLate * this.latePenalty, 100);
  return penalty;
};

// Static method to get assignments by course
assignmentSchema.statics.findByCourse = function(courseId, status = 'published') {
  return this.find({ course: courseId, status }).populate('tutor', 'name profilePicture');
};

// Static method to get assignments by tutor
assignmentSchema.statics.findByTutor = function(tutorId, status = null) {
  const query = { tutor: tutorId };
  if (status) query.status = status;
  return this.find(query).populate('course', 'title category');
};

module.exports = mongoose.model('Assignment', assignmentSchema);
