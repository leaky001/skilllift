const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create test tutor
    let testTutor = await User.findOne({ email: 'testtutor@skilllift.com' });
    if (!testTutor) {
      testTutor = new User({
        name: 'Test Tutor',
        email: 'testtutor@skilllift.com',
        password: 'tutor123',
        phone: '1234567890',
        role: 'tutor',
        accountStatus: 'approved',
        isEmailVerified: true
      });
      await testTutor.save();
    } else {
      testTutor.password = 'tutor123';
      testTutor.accountStatus = 'approved';
      testTutor.isEmailVerified = true;
      testTutor.markModified('password');
      await testTutor.save();
    }

    console.log('✅ Test tutor created/updated:', testTutor.email);

    // Create test learner
    let testLearner = await User.findOne({ email: 'testlearner@skilllift.com' });
    if (!testLearner) {
      testLearner = new User({
        name: 'Test Learner',
        email: 'testlearner@skilllift.com',
        password: 'learner123',
        phone: '1234567890',
        role: 'learner',
        accountStatus: 'approved',
        isEmailVerified: true
      });
      await testLearner.save();
    } else {
      testLearner.password = 'learner123';
      testLearner.accountStatus = 'approved';
      testLearner.isEmailVerified = true;
      testLearner.markModified('password');
      await testLearner.save();
    }

    console.log('✅ Test learner created/updated:', testLearner.email);

    // Test login for tutor
    console.log('🧪 Testing tutor login...');
    console.log('Tutor password hash:', testTutor.password);
    console.log('Tutor password length:', testTutor.password.length);
    const tutorLogin = await testTutor.matchPassword('tutor123');
    console.log('Tutor password match:', tutorLogin);

    // Test login for learner
    console.log('🧪 Testing learner login...');
    console.log('Learner password hash:', testLearner.password);
    console.log('Learner password length:', testLearner.password.length);
    const learnerLogin = await testLearner.matchPassword('learner123');
    console.log('Learner password match:', learnerLogin);

    console.log('🎯 Test credentials created:');
    console.log('Tutor: testtutor@skilllift.com / tutor123');
    console.log('Learner: testlearner@skilllift.com / learner123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTestUsers();
