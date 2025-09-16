const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function approveExistingLearners() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find all learners with pending status
    const pendingLearners = await User.find({ 
      role: 'learner', 
      accountStatus: 'pending' 
    });
    
    console.log(`📊 Found ${pendingLearners.length} learners with pending status`);

    if (pendingLearners.length === 0) {
      console.log('✅ No pending learners found - all learners are already approved!');
      return;
    }

    // Update all pending learners to approved
    const result = await User.updateMany(
      { role: 'learner', accountStatus: 'pending' },
      { accountStatus: 'approved' }
    );

    console.log(`✅ Updated ${result.modifiedCount} learners to approved status`);

    // Verify the update
    const remainingPendingLearners = await User.countDocuments({ 
      role: 'learner', 
      accountStatus: 'pending' 
    });
    
    console.log(`📊 Remaining pending learners: ${remainingPendingLearners}`);

    if (remainingPendingLearners === 0) {
      console.log('🎉 All learners are now approved!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
approveExistingLearners();
