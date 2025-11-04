require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

async function checkCourseStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const courseId = '68c8520c0fec18aa4b8e1015';
    const course = await Course.findById(courseId);

    if (course) {
      console.log(`\n📚 Course Details:`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Tutor: ${course.tutor}`);
      console.log(`   Published: ${course.status === 'published' ? 'YES' : 'NO'}`);
      
      if (course.status !== 'published') {
        console.log(`\n❌ ISSUE FOUND: Course is not published!`);
        console.log(`   Current status: ${course.status}`);
        console.log(`   Required status: published`);
        console.log(`\n🔧 SOLUTION: Publish the course or update the getCourse controller`);
      } else {
        console.log(`\n✅ Course is published and should be accessible`);
      }
    } else {
      console.log(`\n❌ Course not found in database`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkCourseStatus();
