const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilllift');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const unlockAdminAccount = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Unlock the account
    adminUser.loginAttempts = 0;
    adminUser.lockUntil = undefined;
    adminUser.accountStatus = 'approved';
    adminUser.isEmailVerified = true;
    
    await adminUser.save();
    
    console.log('🎉 Admin account unlocked successfully!');
    console.log('📧 Email: admin@skilllift.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', adminUser.name);
    console.log('✅ Status: Approved & Unlocked');
    console.log('🔓 Login Attempts: Reset to 0');
    console.log('');
    console.log('You can now login with the admin credentials!');

  } catch (error) {
    console.error('❌ Error unlocking admin account:', error);
  }
};

const main = async () => {
  await connectDB();
  await unlockAdminAccount();
  mongoose.connection.close();
};

main();
