const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

async function testCourses() {
  try {
    console.log('🔍 Testing courses in database...');
    
    // Check if courses exist
    const allCourses = await Course.find({});
    console.log(`📚 Total courses in database: ${allCourses.length}`);
    
    if (allCourses.length > 0) {
      console.log('\n📋 All courses:');
      allCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Tutor: ${course.tutor}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   Approved: ${course.isApproved}`);
        console.log('');
      });
    }
    
    // Check for tutor users
    const tutors = await User.find({ role: 'tutor' });
    console.log(`👨‍🏫 Total tutors: ${tutors.length}`);
    
    if (tutors.length > 0) {
      console.log('\n👨‍🏫 Tutors:');
      tutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.email}) - ID: ${tutor._id}`);
      });
    }
    
    // Check courses for specific tutor
    if (tutors.length > 0) {
      const firstTutorId = tutors[0]._id;
      console.log(`\n🔍 Courses for tutor ${firstTutorId}:`);
      
      const tutorCourses = await Course.find({ tutor: firstTutorId });
      console.log(`📚 Found ${tutorCourses.length} courses for this tutor`);
      
      if (tutorCourses.length > 0) {
        tutorCourses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title} - ${course.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testCourses();
