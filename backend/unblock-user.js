const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const unblockUserAccount = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and unblock the user
    const user = await User.findOne({ email: 'abdulkabir0600@gmail.com' });
    
    if (user) {
      console.log('👤 Found user:', user.email);
      console.log('📊 Current account status:', user.accountStatus);
      console.log('🔒 Current login attempts:', user.loginAttempts);
      console.log('⏰ Current lock until:', user.lockUntil);
      
      // Unblock the account
      user.accountStatus = 'approved';
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.roleValidationAttempts = 0;
      
      await user.save();
      
      console.log('✅ Account unblocked successfully!');
      console.log('📊 New account status:', user.accountStatus);
      console.log('🔒 New login attempts:', user.loginAttempts);
      console.log('⏰ New lock until:', user.lockUntil);
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

unblockUserAccount();
