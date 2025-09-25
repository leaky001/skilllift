require('dotenv').config({ path: './.env' });
const connectDB = require('./config/db');
const Enrollment = require('./models/Enrollment');
const Course = require('./models/Course');
const User = require('./models/User');

connectDB();

const createEnrollment = async () => {
  try {
    console.log('🔍 Creating enrollment...');
    
    const courseId = '68c8520c0fec18aa4b8e1015'; // smart contract course
    const learnerId = '68c74fd58c47657e364d6877'; // muiz learner
    
    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      learner: learnerId,
      course: courseId
    });
    
    if (existingEnrollment) {
      console.log('✅ Enrollment already exists:');
      console.log(`   Learner: ${existingEnrollment.learner}`);
      console.log(`   Course: ${existingEnrollment.course}`);
      console.log(`   Status: ${existingEnrollment.status}`);
      return;
    }
    
    // Create new enrollment
    const enrollment = new Enrollment({
      learner: learnerId,
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0,
      completedLessons: [],
      lastAccessedAt: new Date()
    });
    
    await enrollment.save();
    
    console.log('✅ Enrollment created successfully:');
    console.log(`   Learner ID: ${learnerId}`);
    console.log(`   Course ID: ${courseId}`);
    console.log(`   Status: ${enrollment.status}`);
    console.log(`   Enrolled At: ${enrollment.enrolledAt}`);
    
    // Verify the enrollment
    const verifyEnrollment = await Enrollment.findById(enrollment._id)
      .populate('learner', 'name email')
      .populate('course', 'title');
    
    console.log('\n🔍 Verification:');
    console.log(`   Learner: ${verifyEnrollment.learner.name} (${verifyEnrollment.learner.email})`);
    console.log(`   Course: ${verifyEnrollment.course.title}`);
    console.log(`   Status: ${verifyEnrollment.status}`);

  } catch (error) {
    console.error('Error creating enrollment:', error);
  } finally {
    process.exit();
  }
};

createEnrollment();
