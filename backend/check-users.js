const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Checking existing users...');
    const users = await User.find({}).select('name email role');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 You need to register users first or create test users');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Check for admin user specifically
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('✅ Admin user found:', admin.email);
    } else {
      console.log('❌ No admin user found');
    }

    // Check for tutor users
    const tutors = await User.find({ role: 'tutor' });
    console.log(`📚 Found ${tutors.length} tutor(s)`);

    // Check for learner users
    const learners = await User.find({ role: 'learner' });
    console.log(`👨‍🎓 Found ${learners.length} learner(s)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkUsers();
