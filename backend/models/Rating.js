const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Rating identification
  ratingId: { type: String, unique: true, required: true },
  
  // Rating details
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User giving rating
  ratedEntity: { type: mongoose.Schema.Types.ObjectId, required: true }, // What's being rated
  entityType: { 
    type: String, 
    enum: ['course', 'platform'], 
    required: true 
  },
  
  // Rating scores
  overallRating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  
  // Detailed ratings (for courses only)
  detailedRatings: {
    contentQuality: { type: Number, min: 1, max: 5 },
    teachingStyle: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    practicalApplication: { type: Number, min: 1, max: 5 },
    support: { type: Number, min: 1, max: 5 }
  },
  
  // Review content
  title: String, // Review title
  review: { type: String, required: true }, // Detailed review
  pros: [String], // Positive aspects
  cons: [String], // Negative aspects
  suggestions: [String], // Improvement suggestions
  
  // Course-specific ratings (if rating a course)
  courseRating: {
    courseId: mongoose.Schema.Types.ObjectId,
    enrollmentId: mongoose.Schema.Types.ObjectId,
    completionStatus: { 
      type: String, 
      enum: ['in-progress', 'completed', 'dropped'] 
    },
    timeSpent: Number, // Hours spent on course
    difficulty: { 
      type: String, 
      enum: ['too-easy', 'just-right', 'challenging', 'too-hard'] 
    }
  },
  
  // Verification and authenticity
  isVerified: { type: Boolean, default: false }, // Verified purchase/enrollment
  verificationMethod: { 
    type: String, 
    enum: ['enrollment', 'completion', 'admin-verified'] 
  },
  
  // Moderation
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'flagged'], 
    default: 'pending' 
  },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,
  moderationNotes: String,
  rejectionReason: String,
  
  // Helpfulness and engagement
  helpfulCount: { type: Number, default: 0 },
  helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportCount: { type: Number, default: 0 },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Media attachments
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  videos: [{
    url: String,
    thumbnail: String,
    duration: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  lastActivity: Date
}, { 
  timestamps: true 
});

// Indexes for better performance
ratingSchema.index({ ratedEntity: 1, entityType: 1 });
ratingSchema.index({ rater: 1, entityType: 1 });
ratingSchema.index({ status: 1 });
ratingSchema.index({ createdAt: -1 });
ratingSchema.index({ helpfulCount: -1 });
ratingSchema.index({ reportCount: -1 });

// Virtual for time ago
ratingSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
});

// Pre-save middleware to set updatedAt
ratingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActivity = new Date();
  next();
});

// Pre-save middleware to auto-approve if user is admin
ratingSchema.pre('save', function(next) {
  if (this.isNew && this.rater && this.rater.role === 'admin') {
    this.status = 'approved';
  }
  
  next();
});

// Static method to get average rating for an entity
ratingSchema.statics.getAverageRating = async function(entityId, entityType) {
  const result = await this.aggregate([
    { 
      $match: { 
        ratedEntity: mongoose.Types.ObjectId(entityId), 
        entityType, 
        status: 'approved' 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$overallRating'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return { averageRating: 0, totalRatings: 0, ratingDistribution: [] };
  }
  
  const rating = result[0];
  const distribution = {
    1: rating.ratingDistribution.filter(r => r === 1).length,
    2: rating.ratingDistribution.filter(r => r === 2).length,
    3: rating.ratingDistribution.filter(r => r === 3).length,
    4: rating.ratingDistribution.filter(r => r === 4).length,
    5: rating.ratingDistribution.filter(r => r === 5).length
  };
  
  return {
    averageRating: Math.round(rating.averageRating * 10) / 10,
    totalRatings: rating.totalRatings,
    ratingDistribution: distribution
  };
};

// Static method to get user's rating
ratingSchema.statics.getUserRating = async function(userId, entityId, entityType) {
  return await this.findOne({
    rater: userId,
    ratedEntity: entityId,
    entityType
  });
};

// Instance method to mark as helpful
ratingSchema.methods.markHelpful = async function(userId) {
  if (!this.helpfulUsers.includes(userId)) {
    this.helpfulUsers.push(userId);
    this.helpfulCount += 1;
    return await this.save();
  }
  throw new Error('User already marked this rating as helpful');
};

// Instance method to report rating
ratingSchema.methods.reportRating = async function(userId, reason) {
  if (!this.reportedBy.includes(userId)) {
    this.reportedBy.push(userId);
    this.reportCount += 1;
    
    if (this.reportCount >= 5) {
      this.status = 'flagged';
    }
    
    return await this.save();
  }
  throw new Error('User already reported this rating');
};

module.exports = mongoose.model('Rating', ratingSchema);
