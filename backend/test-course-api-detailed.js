require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');

async function testCourseAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const courseId = '68c8520c0fec18aa4b8e1015';
    
    // Test 1: Find course without populate
    console.log('\n🔍 Test 1: Find course without populate');
    const courseBasic = await Course.findById(courseId);
    if (courseBasic) {
      console.log(`   Title: ${courseBasic.title}`);
      console.log(`   Status: ${courseBasic.status}`);
      console.log(`   Tutor ID: ${courseBasic.tutor}`);
    } else {
      console.log('   ❌ Course not found');
      return;
    }

    // Test 2: Find course with populate
    console.log('\n🔍 Test 2: Find course with populate');
    try {
      const coursePopulated = await Course.findById(courseId)
        .populate('tutor', 'name profilePicture tutorProfile.bio tutorProfile.skills tutorProfile.rating')
        .populate('enrolledStudents', 'name profilePicture');
      
      if (coursePopulated) {
        console.log(`   Title: ${coursePopulated.title}`);
        console.log(`   Status: ${coursePopulated.status}`);
        console.log(`   Tutor populated: ${!!coursePopulated.tutor}`);
        console.log(`   Tutor name: ${coursePopulated.tutor?.name || 'N/A'}`);
        console.log(`   Enrolled students: ${coursePopulated.enrolledStudents?.length || 0}`);
      } else {
        console.log('   ❌ Course not found after populate');
      }
    } catch (populateError) {
      console.log('   ❌ Populate error:', populateError.message);
    }

    // Test 3: Check if User model works
    console.log('\n🔍 Test 3: Check User model');
    try {
      const tutorId = courseBasic.tutor;
      const tutor = await User.findById(tutorId);
      if (tutor) {
        console.log(`   Tutor found: ${tutor.name}`);
        console.log(`   Tutor email: ${tutor.email}`);
      } else {
        console.log('   ❌ Tutor not found');
      }
    } catch (userError) {
      console.log('   ❌ User model error:', userError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCourseAPI();

