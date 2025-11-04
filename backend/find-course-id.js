require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const LiveClass = require('./models/LiveClass');

async function findCourseId() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all courses with live classes
    const courses = await Course.find({
      liveClasses: { $exists: true, $not: { $size: 0 } }
    }).populate('liveClasses');

    console.log('\n🔍 Courses with Live Classes:');
    console.log('================================');

    if (courses.length > 0) {
      courses.forEach(course => {
        console.log(`\n📚 Course: ${course.title}`);
        console.log(`   Course ID: ${course._id}`);
        console.log('   Live Classes:');
        course.liveClasses.forEach(liveClass => {
          console.log(`     - Live Class ID: ${liveClass._id}`);
          console.log(`       Title: ${liveClass.title}`);
          console.log(`       Status: ${liveClass.status}`);
        });
      });

      console.log(`\n🎯 CORRECT URLS TO USE:`);
      console.log('=======================');
      courses.forEach(course => {
        console.log(`📚 ${course.title}:`);
        console.log(`   http://localhost:5173/live-class/${course._id}`);
      });

    } else {
      console.log('No courses found with live classes.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

findCourseId();
