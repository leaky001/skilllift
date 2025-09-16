
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');
const { updateCourseRating } = require('../utils/courseRatingUtils');

// @desc    Create a new rating/review
// @route   POST /api/reviews
// @access  Private (Learners only)
exports.createRating = asyncHandler(async (req, res) => {
  console.log('🔍 Review creation request:', {
    body: req.body,
    user: req.user ? { id: req.user._id, role: req.user.role } : 'No user',
    headers: req.headers.authorization ? 'Authorization present' : 'No authorization'
  });

  const { courseId, rating, title, review, overallExperience } = req.body;

  // Validate required fields
  if (!courseId || !rating || !title || !review) {
    console.log('❌ Missing required fields:', { courseId, rating, title, review });
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if course exists and is approved
  const course = await Course.findById(courseId).populate('tutor', 'name email');
  if (!course) {
    console.log('❌ Course not found:', courseId);
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.status !== 'published') {
    console.log('❌ Course not published:', { status: course.status });
    return res.status(400).json({
      success: false,
      message: 'Cannot review unpublished courses'
    });
  }

  // Check if user has already reviewed this course
  const existingRating = await Rating.findOne({
    rater: req.user._id,
    ratedEntity: courseId,
    entityType: 'course'
  });

  if (existingRating) {
    console.log('❌ User already reviewed this course:', { userId: req.user._id, courseId });
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this course'
    });
  }

  // Create rating
  const newRating = new Rating({
    ratingId: `R_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rater: req.user._id,
    ratedEntity: courseId,
    entityType: 'course',
    overallRating: rating,
    title,
    review: review,
    overallExperience: overallExperience || 'positive',
    status: 'approved' // Reviews are now immediately visible
  });

  await newRating.save();

  // Update course rating statistics
  try {
    console.log('🔄 Updating course rating for courseId:', courseId);
    console.log('🔄 CourseId type:', typeof courseId);
    
    const courseStats = await Rating.aggregate([
      {
        $match: {
          ratedEntity: new mongoose.Types.ObjectId(courseId),
          entityType: 'course',
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$overallRating' }
        }
      }
    ]);
    
    console.log('📊 Course stats aggregation result:', courseStats);

    if (courseStats.length > 0) {
      const { totalRatings, averageRating } = courseStats[0];
      console.log('📈 Updating course with:', { totalRatings, averageRating });
      
      await Course.findByIdAndUpdate(courseId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalRatings: totalRatings
      });
      
      console.log(`✅ Updated course rating: ${Math.round(averageRating * 10) / 10} (${totalRatings} reviews)`);
    } else {
      console.log('⚠️ No approved reviews found for course rating update');
    }
  } catch (error) {
    console.error('❌ Error updating course rating:', error);
  }

  // Notify tutor about new review
  try {
    const tutor = await User.findById(course.tutor);
    if (tutor) {
      // Create notification for tutor
      await Notification.create({
        recipient: tutor._id,
        type: 'general',
        title: '⭐ New Course Review!',
        message: `${req.user.name} has submitted a ${rating}-star review for your course "${course.title}". The review is now live and visible to other learners.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          ratingId: newRating._id,
          rating: rating,
          reviewerName: req.user.name,
          reviewerId: req.user._id,
          reviewTitle: title,
          reviewText: review
        },
        priority: 'medium'
      });

      // Send email notification to tutor
      await sendEmail({
        to: tutor.email,
        subject: `⭐ New Review for "${course.title}"`,
        template: 'courseReviewed',
        data: {
          name: tutor.name,
          courseTitle: course.title,
          reviewerName: req.user.name,
          rating: rating,
          reviewTitle: title,
          reviewText: review
        }
      });

      console.log(`✅ Notified tutor ${tutor.name} about new review`);
    }
  } catch (error) {
    console.error('❌ Error notifying tutor about review:', error);
  }

  // Notify admin about new review for monitoring
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin && course.tutor) {
      await Notification.create({
        recipient: admin._id,
        type: 'general',
        title: '📊 New Tutor Review',
        message: `${req.user.name} reviewed "${course.title}" by ${course.tutor.name} with ${rating} stars. Review is now live.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          tutorId: course.tutor._id,
          tutorName: course.tutor.name,
          ratingId: newRating._id,
          rating: rating,
          reviewerName: req.user.name,
          reviewerId: req.user._id,
          reviewTitle: title,
          reviewText: review,
          isNegative: rating <= 2
        },
        priority: rating <= 2 ? 'high' : 'low' // High priority for negative reviews, low for others since no approval needed
      });

      console.log(`✅ Notified admin about new review for tutor ${course.tutor.name}`);
    } else {
      console.log('⚠️ Admin or tutor not found for notification');
    }
  } catch (error) {
    console.error('❌ Error notifying admin about review:', error);
  }

  res.status(201).json({
    success: true,
    data: newRating,
    message: 'Review submitted successfully and is now visible to other learners'
  });
});

// @desc    Update a rating/review
// @route   PUT /api/reviews/:id
// @access  Private (Learners only)
exports.updateRating = asyncHandler(async (req, res) => {
  const { rating, title, review, overallExperience } = req.body;

  const ratingDoc = await Rating.findById(req.params.id);
  if (!ratingDoc) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check ownership
  if (ratingDoc.rater.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Update fields
  if (rating) ratingDoc.overallRating = rating;
  if (title) ratingDoc.title = title;
  if (review) ratingDoc.review = review;
  if (overallExperience) ratingDoc.overallExperience = overallExperience;
  
  // Reset status to pending for re-approval
  ratingDoc.status = 'pending';

  await ratingDoc.save();

  // Update course rating statistics
  try {
    const courseStats = await Rating.aggregate([
      {
        $match: {
          ratedEntity: new mongoose.Types.ObjectId(ratingDoc.ratedEntity),
          entityType: 'course',
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$overallRating' }
        }
      }
    ]);

    if (courseStats.length > 0) {
      const { totalRatings, averageRating } = courseStats[0];
      await Course.findByIdAndUpdate(ratingDoc.ratedEntity, {
        rating: Math.round(averageRating * 10) / 10,
        totalRatings: totalRatings
      });
      
      console.log(`✅ Updated course rating after review update: ${Math.round(averageRating * 10) / 10} (${totalRatings} reviews)`);
    }
  } catch (error) {
    console.error('❌ Error updating course rating after review update:', error);
  }

  res.json({
    success: true,
    data: ratingDoc,
    message: 'Review updated successfully and awaiting approval'
  });
});

// @desc    Delete a rating/review
// @route   DELETE /api/reviews/:id
// @access  Private (Learners only)
exports.deleteRating = asyncHandler(async (req, res) => {
  const ratingDoc = await Rating.findById(req.params.id);
  if (!ratingDoc) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check ownership
  if (ratingDoc.rater.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  const courseId = ratingDoc.ratedEntity;
  await ratingDoc.remove();

  // Update course rating statistics after deletion
  try {
    const courseStats = await Rating.aggregate([
      {
        $match: {
          ratedEntity: new mongoose.Types.ObjectId(courseId),
          entityType: 'course',
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$overallRating' }
        }
      }
    ]);

    if (courseStats.length > 0) {
      const { totalRatings, averageRating } = courseStats[0];
      await Course.findByIdAndUpdate(courseId, {
        rating: Math.round(averageRating * 10) / 10,
        totalRatings: totalRatings
      });
      
      console.log(`✅ Updated course rating after review deletion: ${Math.round(averageRating * 10) / 10} (${totalRatings} reviews)`);
    } else {
      // No more reviews, reset to 0
      await Course.findByIdAndUpdate(courseId, {
        rating: 0,
        totalRatings: 0
      });
      
      console.log(`✅ Reset course rating to 0 after review deletion`);
    }
  } catch (error) {
    console.error('❌ Error updating course rating after review deletion:', error);
  }

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get course ratings/reviews
// @route   GET /api/reviews/course/:courseId
// @access  Public
exports.getCourseRatings = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  const skip = (page - 1) * limit;
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    rating: { overallRating: -1 }
  };

  const ratings = await Rating.find({
    ratedEntity: courseId,
    entityType: 'course',
    status: 'approved'
  })
    .populate('rater', 'name profilePicture')
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Rating.countDocuments({
    ratedEntity: courseId,
    entityType: 'course',
    status: 'approved'
  });

  res.json({
    success: true,
    data: ratings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get course rating statistics
// @route   GET /api/reviews/course/:courseId/stats
// @access  Public
exports.getCourseReviewStats = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  console.log('🔍 Getting course review stats for:', courseId);
  console.log('🔍 CourseId type:', typeof courseId);

  const stats = await Rating.aggregate([
    {
      $match: {
        ratedEntity: new mongoose.Types.ObjectId(courseId),
        entityType: 'course',
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: {
          $push: '$overallRating'
        }
      }
    }
  ]);
  
  console.log('📊 Stats aggregation result:', stats);
  
  // Also check what reviews exist for this course
  const allReviews = await Rating.find({
    ratedEntity: courseId,
    entityType: 'course'
  });
  
  console.log('📝 All reviews for course:', allReviews.length);
  allReviews.forEach(review => {
    console.log(`  - Review ${review._id}: status=${review.status}, rating=${review.overallRating}`);
  });

  if (stats.length === 0) {
    return res.json({
      success: true,
      data: {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats[0].ratingDistribution.forEach(rating => {
    ratingDistribution[rating]++;
  });

  res.json({
    success: true,
    data: {
      totalRatings: stats[0].totalRatings,
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      ratingDistribution
    }
  });
});

// @desc    Get user's own ratings/reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Learners only)
exports.getMyRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const ratings = await Rating.find({
    rater: req.user._id,
    entityType: 'course'
  })
    .populate('ratedEntity', 'title category thumbnail')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Rating.countDocuments({
    rater: req.user._id,
    entityType: 'course'
  });

  res.json({
    success: true,
    data: ratings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Like a rating/review
// @route   POST /api/reviews/:id/like
// @access  Private
exports.likeRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  if (rating.helpfulUsers.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You have already liked this review'
    });
  }

  rating.helpfulUsers.push(req.user._id);
  rating.helpfulCount = rating.helpfulUsers.length;
  await rating.save();

  res.json({
    success: true,
    data: rating,
    message: 'Review liked successfully'
  });
});

// @desc    Unlike a rating/review
// @route   DELETE /api/reviews/:id/like
// @access  Private
exports.unlikeRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  rating.helpfulUsers = rating.helpfulUsers.filter(
    userId => userId.toString() !== req.user._id.toString()
  );
  rating.helpfulCount = rating.helpfulUsers.length;
  await rating.save();

  res.json({
    success: true,
    data: rating,
    message: 'Review unliked successfully'
  });
});

// @desc    Report a rating/review
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportRating = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a reason for reporting'
    });
  }

  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  if (rating.reportedBy.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You have already reported this review'
    });
  }

  rating.reportedBy.push(req.user._id);
  rating.reportCount = rating.reportedBy.length;
  
  // Auto-flag if multiple reports
  if (rating.reportCount >= 3) {
    rating.status = 'flagged';
  }

  await rating.save();

  res.json({
    success: true,
    message: 'Review reported successfully'
  });
});

// @desc    Get all ratings for admin
// @route   GET /api/ratings/admin/all
// @access  Private (Admin only)
exports.getAllRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'all' } = req.query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (status !== 'all') {
    filter.status = status;
  }

  const ratings = await Rating.find(filter)
    .populate('rater', 'name email')
    .populate('ratedEntity', 'title category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Rating.countDocuments(filter);

  res.json({
    success: true,
    data: ratings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get pending ratings for admin approval
// @route   GET /api/reviews/admin/pending
// @access  Private (Admin only)
exports.getPendingRatings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const ratings = await Rating.find({
    status: { $in: ['pending', 'flagged'] }
  })
    .populate('rater', 'name email')
    .populate('ratedEntity', 'title category')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Rating.countDocuments({
    status: { $in: ['pending', 'flagged'] }
  });

  res.json({
    success: true,
    data: ratings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Approve a rating/review
// @route   PUT /api/reviews/:id/approve
// @access  Private (Admin only)
exports.approveRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  rating.status = 'approved';
  rating.moderatedBy = req.user._id;
  rating.moderatedAt = new Date();
  await rating.save();

  // Notify learner that their review was approved
  try {
    const learner = await User.findById(rating.rater);
    const course = await Course.findById(rating.ratedEntity);
    
    if (learner && course) {
      await Notification.create({
        recipient: learner._id,
        type: 'review_approved',
        title: '✅ Review Approved!',
        message: `Your review for "${course.title}" has been approved and is now visible to other learners.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          ratingId: rating._id,
          rating: rating.overallRating
        },
        priority: 'low'
      });

      console.log(`✅ Notified learner ${learner.name} about review approval`);
    }
  } catch (error) {
    console.error('❌ Error notifying learner about review approval:', error);
  }

  res.json({
    success: true,
    data: rating,
    message: 'Review approved successfully'
  });
});

// @desc    Reject a rating/review
// @route   PUT /api/reviews/:id/reject
// @access  Private (Admin only)
exports.rejectRating = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a reason for rejection'
    });
  }

  const rating = await Rating.findById(req.params.id);
  if (!rating) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  rating.status = 'rejected';
  rating.rejectionReason = reason;
  rating.moderatedBy = req.user._id;
  rating.moderatedAt = new Date();
  await rating.save();

  res.json({
    success: true,
    data: rating,
    message: 'Review rejected successfully'
  });
});

// @desc    Get rating statistics for admin
// @route   GET /api/reviews/admin/statistics
// @access  Private (Admin only)
exports.getRatingStatistics = asyncHandler(async (req, res) => {
  const totalRatings = await Rating.countDocuments();
  const pendingRatings = await Rating.countDocuments({ status: 'pending' });
  const approvedRatings = await Rating.countDocuments({ status: 'approved' });
  const rejectedRatings = await Rating.countDocuments({ status: 'rejected' });
  const flaggedRatings = await Rating.countDocuments({ status: 'flagged' });

  const averageRating = await Rating.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$overallRating' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalRatings,
      pendingRatings,
      approvedRatings,
      rejectedRatings,
      flaggedRatings,
      averageRating: averageRating.length > 0 ? Math.round(averageRating[0].avg * 10) / 10 : 0
    }
  });
});

// @desc    Get tutor review analytics for admin
// @route   GET /api/reviews/admin/tutor-analytics
// @access  Private (Admin only)
exports.getTutorReviewAnalytics = asyncHandler(async (req, res) => {
  const { tutorId, timeRange = '30d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Build match criteria
  const matchCriteria = {
    entityType: 'course',
    status: 'approved',
    createdAt: { $gte: startDate }
  };

  if (tutorId) {
    // Get courses by this tutor
    const courses = await Course.find({ tutor: tutorId }).select('_id');
    const courseIds = courses.map(course => course._id);
    matchCriteria.ratedEntity = { $in: courseIds };
  }

  // Get tutor review analytics
  const analytics = await Rating.aggregate([
    { $match: matchCriteria },
    {
      $lookup: {
        from: 'courses',
        localField: 'ratedEntity',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $lookup: {
        from: 'users',
        localField: 'course.tutor',
        foreignField: '_id',
        as: 'tutor'
      }
    },
    { $unwind: '$tutor' },
    {
      $group: {
        _id: '$tutor._id',
        tutorName: { $first: '$tutor.name' },
        tutorEmail: { $first: '$tutor.email' },
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: {
          $push: '$overallRating'
        },
        courses: {
          $addToSet: {
            courseId: '$course._id',
            courseTitle: '$course.title'
          }
        },
        negativeReviews: {
          $sum: { $cond: [{ $lte: ['$overallRating', 2] }, 1, 0] }
        },
        recentReviews: {
          $push: {
            ratingId: '$_id',
            courseTitle: '$course.title',
            rating: '$overallRating',
            title: '$title',
            review: '$review',
            reviewerName: '$rater',
            createdAt: '$createdAt'
          }
        }
      }
    },
    {
      $project: {
        tutorName: 1,
        tutorEmail: 1,
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: 1,
        courses: 1,
        negativeReviews: 1,
        negativeReviewPercentage: {
          $round: [
            { $multiply: [{ $divide: ['$negativeReviews', '$totalReviews'] }, 100] },
            1
          ]
        },
        recentReviews: {
          $slice: ['$recentReviews', 5] // Last 5 reviews
        }
      }
    },
    { $sort: { averageRating: -1 } }
  ]);

  // Calculate rating distribution for each tutor
  const enhancedAnalytics = analytics.map(tutor => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    tutor.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });
    
    return {
      ...tutor,
      ratingDistribution: distribution
    };
  });

  res.json({
    success: true,
    data: {
      tutors: enhancedAnalytics,
      timeRange,
      totalTutors: enhancedAnalytics.length,
      summary: {
        totalReviews: enhancedAnalytics.reduce((sum, tutor) => sum + tutor.totalReviews, 0),
        averageRating: enhancedAnalytics.length > 0 
          ? Math.round(enhancedAnalytics.reduce((sum, tutor) => sum + tutor.averageRating, 0) / enhancedAnalytics.length * 10) / 10
          : 0,
        tutorsWithNegativeReviews: enhancedAnalytics.filter(tutor => tutor.negativeReviews > 0).length
      }
    }
  });
});

// @desc    Get detailed tutor review analytics
// @route   GET /api/reviews/admin/tutor/:tutorId/analytics
// @access  Private (Admin only)
exports.getTutorDetailedAnalytics = asyncHandler(async (req, res) => {
  const { tutorId } = req.params;
  const { timeRange = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get tutor info
  const tutor = await User.findById(tutorId);
  if (!tutor) {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  // Get tutor's courses
  const courses = await Course.find({ tutor: tutorId });
  const courseIds = courses.map(course => course._id);

  // Get all reviews for this tutor's courses
  const reviews = await Rating.find({
    ratedEntity: { $in: courseIds },
    entityType: 'course',
    status: 'approved',
    createdAt: { $gte: startDate }
  })
  .populate('rater', 'name email')
  .populate('ratedEntity', 'title')
  .sort({ createdAt: -1 });

  // Calculate analytics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? Math.round(reviews.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews * 10) / 10
    : 0;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    ratingDistribution[review.overallRating]++;
  });

  const negativeReviews = reviews.filter(review => review.overallRating <= 2);
  const positiveReviews = reviews.filter(review => review.overallRating >= 4);

  // Course-wise analytics
  const courseAnalytics = courses.map(course => {
    const courseReviews = reviews.filter(review => review.ratedEntity._id.toString() === course._id.toString());
    const courseAverage = courseReviews.length > 0
      ? Math.round(courseReviews.reduce((sum, review) => sum + review.overallRating, 0) / courseReviews.length * 10) / 10
      : 0;

    return {
      courseId: course._id,
      courseTitle: course.title,
      totalReviews: courseReviews.length,
      averageRating: courseAverage,
      negativeReviews: courseReviews.filter(review => review.overallRating <= 2).length
    };
  });

  res.json({
    success: true,
    data: {
      tutor: {
        id: tutor._id,
        name: tutor.name,
        email: tutor.email
      },
      analytics: {
        totalReviews,
        averageRating,
        ratingDistribution,
        negativeReviews: negativeReviews.length,
        positiveReviews: positiveReviews.length,
        negativeReviewPercentage: totalReviews > 0 
          ? Math.round((negativeReviews.length / totalReviews) * 100)
          : 0,
        positiveReviewPercentage: totalReviews > 0 
          ? Math.round((positiveReviews.length / totalReviews) * 100)
          : 0
      },
      courses: courseAnalytics,
      recentReviews: reviews.slice(0, 10), // Last 10 reviews
      timeRange
    }
  });
});

// @desc    Get tutor's course ratings
// @route   GET /api/ratings/tutor/my-courses
// @access  Private (Tutors only)
exports.getTutorCourseRatings = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  
  console.log('🔄 getTutorCourseRatings called for tutor:', tutorId);
  console.log('📊 Query params:', { page, limit, sort });
  
  const skip = (page - 1) * limit;
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    rating: { overallRating: -1 },
    'rating-low': { overallRating: 1 }
  };

  // Get tutor's courses
  console.log('🔄 Fetching tutor courses...');
  const courses = await Course.find({ tutor: tutorId }).select('_id title');
  console.log('📚 Found courses:', courses.length);
  
  const courseIds = courses.map(course => course._id);

  if (courseIds.length === 0) {
    console.log('⚠️ No courses found for tutor');
    return res.json({
      success: true,
      data: {
        ratings: [],
        courseStats: [],
        overallStats: {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        courses: []
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      },
      message: 'No courses found for this tutor'
    });
  }

  // Get ratings for tutor's courses
  const ratings = await Rating.find({
    ratedEntity: { $in: courseIds },
    entityType: 'course',
    status: 'approved'
  })
    .populate('rater', 'name profilePicture')
    .populate('ratedEntity', 'title thumbnail')
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Rating.countDocuments({
    ratedEntity: { $in: courseIds },
    entityType: 'course',
    status: 'approved'
  });

  // Get course-wise rating statistics
  const courseStats = await Rating.aggregate([
    {
      $match: {
        ratedEntity: { $in: courseIds },
        entityType: 'course',
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$ratedEntity',
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: { $push: '$overallRating' }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $project: {
        courseId: '$_id',
        courseTitle: '$course.title',
        courseThumbnail: '$course.thumbnail',
        totalRatings: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: 1
      }
    }
  ]);

  // Calculate overall tutor statistics
  const tutorStats = await Rating.aggregate([
    {
      $match: {
        ratedEntity: { $in: courseIds },
        entityType: 'course',
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: { $push: '$overallRating' }
      }
    }
  ]);

  const overallStats = tutorStats.length > 0 ? {
    totalRatings: tutorStats[0].totalRatings,
    averageRating: Math.round(tutorStats[0].averageRating * 10) / 10,
    ratingDistribution: {
      1: tutorStats[0].ratingDistribution.filter(r => r === 1).length,
      2: tutorStats[0].ratingDistribution.filter(r => r === 2).length,
      3: tutorStats[0].ratingDistribution.filter(r => r === 3).length,
      4: tutorStats[0].ratingDistribution.filter(r => r === 4).length,
      5: tutorStats[0].ratingDistribution.filter(r => r === 5).length
    }
  } : {
    totalRatings: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  res.json({
    success: true,
    data: {
      ratings,
      courseStats,
      overallStats,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title
      }))
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get course ratings for enrollment page
// @route   GET /api/ratings/course/:courseId/enrollment
// @access  Public
exports.getCourseRatingsForEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { limit = 5 } = req.query;

  // Get course info
  const course = await Course.findById(courseId).populate('tutor', 'name profilePicture');
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Get recent ratings
  const ratings = await Rating.find({
    ratedEntity: courseId,
    entityType: 'course',
    status: 'approved'
  })
    .populate('rater', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  // Get rating statistics
  const stats = await Rating.aggregate([
    {
      $match: {
        ratedEntity: new mongoose.Types.ObjectId(courseId),
        entityType: 'course',
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: { $push: '$overallRating' }
      }
    }
  ]);

  const ratingStats = stats.length > 0 ? {
    totalRatings: stats[0].totalRatings,
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    ratingDistribution: {
      1: stats[0].ratingDistribution.filter(r => r === 1).length,
      2: stats[0].ratingDistribution.filter(r => r === 2).length,
      3: stats[0].ratingDistribution.filter(r => r === 3).length,
      4: stats[0].ratingDistribution.filter(r => r === 4).length,
      5: stats[0].ratingDistribution.filter(r => r === 5).length
    }
  } : {
    totalRatings: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  res.json({
    success: true,
    data: {
      course: {
        id: course._id,
        title: course.title,
        tutor: {
          id: course.tutor._id,
          name: course.tutor.name,
          profilePicture: course.tutor.profilePicture
        }
      },
      ratings,
      stats: ratingStats
    }
  });
});

// @desc    Get tutor's rating analytics
// @route   GET /api/ratings/tutor/analytics
// @access  Private (Tutors only)
exports.getTutorRatingAnalytics = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;
  const { timeRange = '30d' } = req.query;

  console.log('🔄 getTutorRatingAnalytics called for tutor:', tutorId);
  console.log('📊 Time range:', timeRange);

  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get tutor's courses
  console.log('🔄 Fetching tutor courses for analytics...');
  const courses = await Course.find({ tutor: tutorId });
  console.log('📚 Found courses for analytics:', courses.length);
  
  const courseIds = courses.map(course => course._id);

  if (courseIds.length === 0) {
    console.log('⚠️ No courses found for tutor analytics');
    return res.json({
      success: true,
      data: {
        overallStats: {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        courseStats: [],
        recentRatings: [],
        timeRange
      }
    });
  }

  // Get overall statistics
  const overallStats = await Rating.aggregate([
    {
      $match: {
        ratedEntity: { $in: courseIds },
        entityType: 'course',
        status: 'approved',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: { $push: '$overallRating' }
      }
    }
  ]);

  // Get course-wise statistics
  const courseStats = await Rating.aggregate([
    {
      $match: {
        ratedEntity: { $in: courseIds },
        entityType: 'course',
        status: 'approved',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$ratedEntity',
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        ratingDistribution: { $push: '$overallRating' }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $project: {
        courseId: '$_id',
        courseTitle: '$course.title',
        courseThumbnail: '$course.thumbnail',
        totalRatings: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: 1
      }
    }
  ]);

  // Get recent ratings
  const recentRatings = await Rating.find({
    ratedEntity: { $in: courseIds },
    entityType: 'course',
    status: 'approved',
    createdAt: { $gte: startDate }
  })
    .populate('rater', 'name profilePicture')
    .populate('ratedEntity', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  const stats = overallStats.length > 0 ? {
    totalRatings: overallStats[0].totalRatings,
    averageRating: Math.round(overallStats[0].averageRating * 10) / 10,
    ratingDistribution: {
      1: overallStats[0].ratingDistribution.filter(r => r === 1).length,
      2: overallStats[0].ratingDistribution.filter(r => r === 2).length,
      3: overallStats[0].ratingDistribution.filter(r => r === 3).length,
      4: overallStats[0].ratingDistribution.filter(r => r === 4).length,
      5: overallStats[0].ratingDistribution.filter(r => r === 5).length
    }
  } : {
    totalRatings: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  res.json({
    success: true,
    data: {
      overallStats: stats,
      courseStats,
      recentRatings,
      timeRange
    }
  });
});

// All exports are already done with exports.functionName above
