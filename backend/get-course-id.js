const Course = require('./models/Course');
const { connectToDatabase, disconnectFromDatabase } = require('./utils/database');

async function getCourseId() {
  try {
    // Use centralized database connection
    await connectToDatabase();
    
    const courses = await Course.find({ status: 'published', isApproved: true }).limit(3);
    
    console.log('📚 Available courses for payment testing:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Price: ₦${course.price}`);
      console.log(`   Tutor: ${course.tutor}`);
      console.log('');
    });
    
    if (courses.length > 0) {
      console.log('✅ Use this course ID for testing:');
      console.log(`Course ID: ${courses[0]._id}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await disconnectFromDatabase();
  }
}

getCourseId();
