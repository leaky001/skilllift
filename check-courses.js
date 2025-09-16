const mongoose = require('mongoose');
const Course = require('./backend/models/Course');

async function checkCourses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/skilllift', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    const courses = await Course.find({}).populate('tutor', 'name email');
    
    console.log(`📚 Found ${courses.length} courses in database:`);
    
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. Course: ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Tutor: ${course.tutor?.name || 'Unknown'} (${course.tutor?.email || 'No email'})`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Type: ${course.courseType}`);
      console.log(`   Created: ${course.createdAt}`);
      console.log(`   Lessons: ${course.lessons?.length || 0}`);
      console.log(`   Certificate Requirements: ${course.certificateRequirements ? 'Yes' : 'No'}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCourses();
