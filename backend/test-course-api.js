require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Course = require('./models/Course');

async function testCourseAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create a test token for the tutor
    const tutorId = '68c84b9067287d08e49e1264'; // From the course data
    const testToken = jwt.sign(
      { 
        id: tutorId,
        role: 'tutor',
        email: 'test@example.com'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`\n🔑 Test token created for tutor: ${tutorId}`);
    console.log(`   Token: ${testToken.substring(0, 50)}...`);

    // Test the course API endpoint
    const courseId = '68c8520c0fec18aa4b8e1015';
    const course = await Course.findById(courseId);

    if (course) {
      console.log(`\n📚 Course found:`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Tutor: ${course.tutor}`);
      
      // Simulate the getCourse controller logic
      if (course.status !== 'published') {
        console.log(`\n❌ Course not published - would return 404`);
      } else {
        console.log(`\n✅ Course is published - would return course data`);
        
        // Populate the course like the controller does
        const populatedCourse = await Course.findById(courseId)
          .populate('tutor', 'name profilePicture tutorProfile.bio tutorProfile.skills tutorProfile.rating')
          .populate('enrolledStudents', 'name profilePicture');
        
        console.log(`\n📊 Populated course data:`);
        console.log(`   Tutor populated: ${!!populatedCourse.tutor}`);
        console.log(`   Enrolled students: ${populatedCourse.enrolledStudents?.length || 0}`);
      }
    } else {
      console.log(`\n❌ Course not found`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCourseAPI();
