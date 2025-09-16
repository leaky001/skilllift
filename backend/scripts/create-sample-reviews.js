const mongoose = require('mongoose');
const Rating = require('./models/Rating');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilllift');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createSampleReviews = async () => {
  try {
    // Get a learner user
    const learner = await User.findOne({ role: 'learner' });
    if (!learner) {
      console.log('❌ No learner user found. Please create a learner account first.');
      return;
    }

    // Get published courses
    const courses = await Course.find({ status: 'published', isApproved: true });
    if (courses.length === 0) {
      console.log('❌ No published courses found. Please create some courses first.');
      return;
    }

    const sampleReviews = [
      {
        ratingId: `R_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rater: learner._id,
        ratedEntity: courses[0]._id,
        entityType: 'course',
        overallRating: 5,
        title: 'Excellent Course!',
        review: 'This course exceeded my expectations. The instructor explains complex concepts in a very clear way. The practical examples and real-world projects really helped me understand the material better. Highly recommended for anyone looking to learn this subject.',
        pros: ['Clear explanations', 'Practical examples', 'Real-world projects'],
        cons: [],
        suggestions: [],
        status: 'approved'
      },
      {
        ratingId: `R_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rater: learner._id,
        ratedEntity: courses[1]?._id || courses[0]._id,
        entityType: 'course',
        overallRating: 4,
        title: 'Great Introduction',
        review: 'Great introduction to the subject. The course covers all the basics well and the exercises are practical. Some sections could be explained in more detail, but overall very good.',
        pros: ['Good basics coverage', 'Practical exercises'],
        cons: ['Some sections need more detail'],
        suggestions: ['Add more examples'],
        status: 'approved'
      },
      {
        ratingId: `R_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rater: learner._id,
        ratedEntity: courses[2]?._id || courses[0]._id,
        entityType: 'course',
        overallRating: 5,
        title: 'Outstanding Learning Experience',
        review: 'Outstanding course! The instructor brings real industry experience. The strategies taught here are immediately applicable. I\'ve already seen results in my learning journey.',
        pros: ['Industry experience', 'Immediately applicable', 'Great results'],
        cons: [],
        suggestions: [],
        status: 'pending'
      }
    ];

    // Create reviews
    for (const reviewData of sampleReviews) {
      const review = new Rating(reviewData);
      await review.save();
      console.log(`✅ Created review: ${reviewData.title}`);
    }

    console.log(`\n🎉 Successfully created ${sampleReviews.length} sample reviews!`);
    console.log('📊 Review Status:');
    console.log(`   - Approved: ${sampleReviews.filter(r => r.status === 'approved').length}`);
    console.log(`   - Pending: ${sampleReviews.filter(r => r.status === 'pending').length}`);

  } catch (error) {
    console.error('❌ Error creating sample reviews:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSampleReviews();
  mongoose.connection.close();
};

main();
