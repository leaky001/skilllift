require('dotenv').config({ path: './.env' });
const connectDB = require('./config/db');
const Enrollment = require('./models/Enrollment');
const Course = require('./models/Course');
const User = require('./models/User');

connectDB();

const checkEnrollments = async () => {
  try {
    console.log('🔍 Checking enrollments...');
    
    // Get all enrollments
    const enrollments = await Enrollment.find({ status: 'active' })
      .populate('learner', 'name email')
      .populate('course', 'title');
    
    console.log(`📊 Found ${enrollments.length} active enrollments:`);
    
    enrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. Learner: ${enrollment.learner.name} (${enrollment.learner.email})`);
      console.log(`   Course: ${enrollment.course.title}`);
      console.log(`   Status: ${enrollment.status}`);
      console.log(`   Enrolled: ${enrollment.enrolledAt}`);
      console.log('---');
    });

    // Check specific course enrollments
    const courseId = '68c8520c0fec18aa4b8e1015'; // Replace with actual course ID
    const courseEnrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'active' 
    }).populate('learner', 'name email');
    
    console.log(`\n🎯 Enrollments for course ${courseId}:`);
    console.log(`Found ${courseEnrollments.length} enrollments`);
    
    courseEnrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. ${enrollment.learner.name} (${enrollment.learner.email})`);
    });

  } catch (error) {
    console.error('Error checking enrollments:', error);
  } finally {
    process.exit();
  }
};

checkEnrollments();
