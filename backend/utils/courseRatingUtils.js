const Rating = require('../models/Rating');
const Course = require('../models/Course');

// Utility function to update course rating statistics
const updateCourseRating = async (courseId) => {
  try {
    const courseStats = await Rating.aggregate([
      {
        $match: {
          ratedEntity: courseId,
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
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalRatings: totalRatings
      });
      
      console.log(`✅ Updated course rating: ${Math.round(averageRating * 10) / 10} (${totalRatings} reviews)`);
      return { success: true, rating: Math.round(averageRating * 10) / 10, totalRatings };
    } else {
      // No approved reviews, reset to 0
      await Course.findByIdAndUpdate(courseId, {
        rating: 0,
        totalRatings: 0
      });
      
      console.log(`✅ Reset course rating to 0 (no approved reviews)`);
      return { success: true, rating: 0, totalRatings: 0 };
    }
  } catch (error) {
    console.error('❌ Error updating course rating:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  updateCourseRating
};
