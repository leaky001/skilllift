// Test script to check tutor dashboard data
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Payment = require('./models/Payment');

async function testTutorDashboard() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/skilllift', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find a tutor user
    const tutor = await User.findOne({ role: 'tutor' });
    if (!tutor) {
      console.log('❌ No tutor found in database');
      return;
    }
    console.log('👨‍🏫 Found tutor:', tutor.name, tutor._id);

    // Test course count
    const courseCount = await Course.countDocuments({ tutor: tutor._id });
    console.log('📚 Course count:', courseCount);

    // Test total learners
    const tutorCourses = await Course.find({ tutor: tutor._id }).select('_id');
    const courseIds = tutorCourses.map(course => course._id);
    console.log('📚 Tutor course IDs:', courseIds);

    const totalLearners = await Enrollment.distinct('learner', {
      course: { $in: courseIds }
    });
    console.log('👥 Total learners:', totalLearners.length);

    // Test monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          tutor: tutor._id,
          status: 'successful',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    console.log('💰 Monthly earnings:', monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0);

    // Test recent learners
    const recentLearners = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      },
      {
        $match: {
          'courseData.tutor': tutor._id
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'learner',
          foreignField: '_id',
          as: 'learnerData'
        }
      },
      {
        $unwind: '$learnerData'
      },
      {
        $project: {
          id: '$learnerData._id',
          name: '$learnerData.name',
          course: '$courseData.title',
          signupDate: '$createdAt',
          avatar: { $substr: ['$learnerData.name', 0, 2] },
          progress: '$progress',
          rating: '$rating'
        }
      },
      {
        $sort: { signupDate: -1 }
      },
      {
        $limit: 5
      }
    ]);

    console.log('👥 Recent learners:', recentLearners.length);

    console.log('✅ All tests completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testTutorDashboard();