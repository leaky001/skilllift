require('dotenv').config({ path: './.env' });
const connectDB = require('./config/db');
const LiveClass = require('./models/LiveClass');
const Course = require('./models/Course');
const User = require('./models/User');

connectDB();

const checkLiveClass = async () => {
  try {
    console.log('🔍 Checking live class...');
    
    const liveClassId = '68d45542b298d2944a49098a';
    const liveClass = await LiveClass.findById(liveClassId)
      .populate('courseId', 'title')
      .populate('tutorId', 'name email');
    
    if (!liveClass) {
      console.log('❌ Live class not found');
      return;
    }
    
    console.log('✅ Live class found:');
    console.log(`   Title: ${liveClass.title}`);
    console.log(`   Course: ${liveClass.courseId.title}`);
    console.log(`   Tutor: ${liveClass.tutorId.name} (${liveClass.tutorId.email})`);
    console.log(`   Status: ${liveClass.status}`);
    console.log(`   Call ID: ${liveClass.callId}`);
    console.log(`   Course ID: ${liveClass.courseId._id}`);
    
    // Check if there are any users
    const users = await User.find({ role: 'learner' });
    console.log(`\n👥 Found ${users.length} learners:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });

  } catch (error) {
    console.error('Error checking live class:', error);
  } finally {
    process.exit();
  }
};

checkLiveClass();
