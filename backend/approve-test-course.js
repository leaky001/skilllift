const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function approveTestCourse() {
  try {
    console.log('🔍 Looking for pending courses...');
    
    // Find a pending course
    const pendingCourse = await Course.findOne({ status: 'pending' });
    
    if (!pendingCourse) {
      console.log('❌ No pending courses found. Creating a test course...');
      
      // Create a test course if none exists
      const testCourse = new Course({
        title: 'Test Course for Assignments',
        description: 'This is a test course to enable assignment creation testing',
        category: 'Technology',
        subcategory: 'Programming',
        price: 5000,
        duration: '8 weeks',
        level: 'beginner',
        language: 'English',
        tutor: '65f8a1b2c3d4e5f6a7b8c9d0', // You'll need to replace this with a real tutor ID
        status: 'pending',
        isApproved: false
      });
      
      await testCourse.save();
      console.log('✅ Test course created:', testCourse._id);
    } else {
      console.log('📚 Found pending course:', pendingCourse.title);
    }
    
    // Now approve the course
    const courseToApprove = pendingCourse || await Course.findOne({ status: 'pending' });
    
    if (courseToApprove) {
      courseToApprove.status = 'published';
      courseToApprove.isApproved = true;
      courseToApprove.approvedBy = '65f8a1b2c3d4e5f6a7b8c9d0'; // Replace with real admin ID
      courseToApprove.approvedAt = new Date();
      courseToApprove.publishedAt = new Date();
      
      await courseToApprove.save();
      
      console.log('✅ Course approved successfully!');
      console.log('📝 Course ID:', courseToApprove._id);
      console.log('📚 Course Title:', courseToApprove.title);
      console.log('✅ Status:', courseToApprove.status);
      console.log('✅ Is Approved:', courseToApprove.isApproved);
      console.log('\n🎯 Now you can create assignments for this course!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
approveTestCourse();
