require('dotenv').config({ path: './.env' });
const connectDB = require('./config/db');
const Enrollment = require('./models/Enrollment');
const Course = require('./models/Course');
const User = require('./models/User');

connectDB();

const enrollAllLearners = async () => {
  try {
    console.log('🔍 Enrolling all learners in smart contract course...');
    
    const courseId = '68c8520c0fec18aa4b8e1015'; // smart contract course
    
    // Get all learners
    const learners = await User.find({ role: 'learner' });
    console.log(`👥 Found ${learners.length} learners`);
    
    for (const learner of learners) {
      // Check if enrollment already exists
      const existingEnrollment = await Enrollment.findOne({
        learner: learner._id,
        course: courseId
      });
      
      if (existingEnrollment) {
        console.log(`✅ ${learner.name} already enrolled`);
        continue;
      }
      
      // Create new enrollment
      const enrollment = new Enrollment({
        learner: learner._id,
        course: courseId,
        enrolledAt: new Date(),
        status: 'active',
        progress: 0,
        completedLessons: [],
        lastAccessedAt: new Date()
      });
      
      await enrollment.save();
      console.log(`✅ Enrolled ${learner.name} (${learner.email})`);
    }
    
    console.log('\n🎯 All learners enrolled successfully!');

  } catch (error) {
    console.error('Error enrolling learners:', error);
  } finally {
    process.exit();
  }
};

enrollAllLearners();
