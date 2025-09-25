const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  subcategory: String,
  tags: [String],
  
  // Pricing
  price: { type: Number, required: true },
  originalPrice: Number,
  discountPercentage: { type: Number, default: 0 },
  
  // Course details
  duration: String,
  durationInMonths: { 
    type: Number, 
    min: 1, 
    max: 12, 
    default: 1,
    required: true 
  },
  startDate: Date,
  endDate: Date,
  enrollmentDeadline: Date,
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  language: { type: String, default: 'English' },
  
  // Course type and delivery
  courseType: { 
    type: String, 
    enum: ['online-prerecorded', 'online-live', 'physical'], 
    required: true 
  },
  
  // Content and materials
  previewVideo: String,
  thumbnail: String,
  
  // Enhanced content structure
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  liveClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass' }],
  totalLessons: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in minutes
  
  // Legacy content (for backward compatibility)
  content: [{
    title: String,
    type: { type: String, enum: ['video', 'document', 'assignment', 'quiz', 'image'] },
    url: String,
    duration: Number, // in minutes
    description: String,
    isFree: { type: Boolean, default: false }
  }],
  
  // Live class specific
  liveClassDetails: {
    meetingLink: String,
    meetingPlatform: { type: String, enum: ['zoom', 'google-meet', 'teams', 'other'] },
    schedule: mongoose.Schema.Types.Mixed, // Allow both string and array
    maxParticipants: Number
  },
  
  // Physical class specific
  physicalClassDetails: {
    location: String,
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    schedule: mongoose.Schema.Types.Mixed, // Allow both string and array
    maxParticipants: Number,
  },
  
  // Course status and approval
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  
  // Enrollment and statistics
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalEnrollments: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  // Enrollment management
  enrollmentStatus: {
    type: String,
    enum: ['open', 'closed', 'waitlist'],
    default: 'open'
  },
  maxEnrollments: { type: Number, default: 100 },
  currentEnrollments: { type: Number, default: 0 },
  
  // Payment tracking
  paymentType: {
    type: String,
    enum: ['full'],
    default: 'full'
  },
  
  // Requirements and outcomes
  prerequisites: [String],
  learningOutcomes: [String],
  
  
  // SEO and visibility
  slug: String,
  metaDescription: String,
  featured: { type: Boolean, default: false },
  
  // Timestamps
  publishedAt: Date,
  lastUpdated: Date
}, { 
  timestamps: true 
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ tutor: 1, status: 1 });
courseSchema.index({ price: 1, status: 1 });
courseSchema.index({ startDate: 1, endDate: 1 });
courseSchema.index({ enrollmentDeadline: 1 });

// Pre-save middleware to calculate dates
courseSchema.pre('save', function(next) {
  // Calculate end date based on duration
  if (this.startDate && this.durationInMonths && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.durationInMonths);
    this.endDate = endDate;
  }
  
  // Set enrollment deadline (1 week before start date)
  if (this.startDate && !this.enrollmentDeadline) {
    const deadline = new Date(this.startDate);
    deadline.setDate(deadline.getDate() - 7);
    this.enrollmentDeadline = deadline;
  }
  
  // Update current enrollments count
  this.currentEnrollments = this.enrolledStudents.length;
  
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Virtual for discounted price
courseSchema.virtual('discountedPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * this.discountPercentage / 100);
  }
  return this.price;
});

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Methods for enhanced course functionality


// Method to calculate course progress for a learner
courseSchema.methods.calculateLearnerProgress = async function(learnerId) {
  const LessonProgress = mongoose.model('LessonProgress');
  
  const lessonProgress = await LessonProgress.find({ 
    learner: learnerId, 
    course: this._id 
  });
  
  if (lessonProgress.length === 0) {
    return { progress: 0, completedLessons: 0, totalLessons: 0 };
  }
  
  const completedLessons = lessonProgress.filter(lp => lp.status === 'completed').length;
  const totalLessons = lessonProgress.length;
  const progress = Math.round((completedLessons / totalLessons) * 100);
  
  return {
    progress,
    completedLessons,
    totalLessons,
    lessonProgress: lessonProgress.map(lp => ({
      lessonId: lp.lesson,
      status: lp.status,
      completionPercentage: lp.completionPercentage,
      completedAt: lp.completedAt
    }))
  };
};

// Method to get course statistics
courseSchema.methods.getCourseStatistics = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const LessonProgress = mongoose.model('LessonProgress');
  const LiveClassSession = mongoose.model('LiveClassSession');
  
  const enrollments = await Enrollment.find({ course: this._id });
  const lessonProgress = await LessonProgress.find({ course: this._id });
  const liveSessions = await LiveClassSession.find({ course: this._id });
  
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  
  const averageProgress = lessonProgress.length > 0 
    ? lessonProgress.reduce((sum, lp) => sum + lp.completionPercentage, 0) / lessonProgress.length 
    : 0;
  
  const completionRate = enrollments.length > 0 
    ? (completedEnrollments / enrollments.length) * 100 
    : 0;
  
  return {
    totalEnrollments: enrollments.length,
    activeEnrollments,
    completedEnrollments,
    completionRate: Math.round(completionRate),
    averageProgress: Math.round(averageProgress),
    totalLessons: this.totalLessons,
    totalLiveSessions: liveSessions.length,
    totalRevenue: this.totalRevenue,
    rating: this.rating,
    totalRatings: this.totalRatings
  };
};

// Method to update course statistics
courseSchema.methods.updateStatistics = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const Lesson = mongoose.model('Lesson');
  
  // Update enrollment count
  const enrollmentCount = await Enrollment.countDocuments({ course: this._id });
  this.totalEnrollments = enrollmentCount;
  
  // Update lesson count and duration
  const lessons = await Lesson.find({ course: this._id, status: 'published' });
  this.totalLessons = lessons.length;
  this.totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);
  
  // Update enrolled students
  const enrollments = await Enrollment.find({ course: this._id });
  this.enrolledStudents = enrollments.map(e => e.learner);
  this.currentEnrollments = enrollments.length;
  
  return this.save();
};

module.exports = mongoose.model('Course', courseSchema);
