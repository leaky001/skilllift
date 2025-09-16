const mongoose = require('mongoose');

const ReplaySchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  tutor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Tutor is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  deleteAt: {
    type: Date,
    default: null // Auto-delete after 24 hours
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed', 'deleted'],
    default: 'ready'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted file size
ReplaySchema.virtual('formattedFileSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for isReady
ReplaySchema.virtual('isReady').get(function() {
  return this.status === 'ready';
});

// Virtual for isProcessing
ReplaySchema.virtual('isProcessing').get(function() {
  return this.status === 'processing';
});

// Virtual for isFailed
ReplaySchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// Virtual for isDeleted
ReplaySchema.virtual('isDeleted').get(function() {
  return this.status === 'deleted';
});

// Index for better query performance
ReplaySchema.index({ tutor: 1, createdAt: -1 });
ReplaySchema.index({ course: 1 });
ReplaySchema.index({ status: 1 });
ReplaySchema.index({ isPublic: 1, status: 1 });

// Pre-save middleware
ReplaySchema.pre('save', function(next) {
  // Set deleteAt to 24 hours from now if not set
  if (!this.deleteAt) {
    this.deleteAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to get replays by tutor
ReplaySchema.statics.getByTutor = function(tutorId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  
  let query = { tutor: tutorId };
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  return this.find(query)
    .populate('course', 'title')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get replays by course
ReplaySchema.statics.getByCourse = function(courseId) {
  return this.find({ 
    course: courseId,
    status: 'ready',
    deleteAt: { $gt: new Date() } // Only show replays that haven't expired
  })
  .populate('tutor', 'name avatar')
  .sort('-createdAt');
};

// Instance method to increment view count
ReplaySchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Replay', ReplaySchema);
