const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const checkAndFixAdminUser = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('🔍 Current Admin User Details:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Account Status: ${adminUser.accountStatus}`);
    console.log(`   Email Verified: ${adminUser.isEmailVerified}`);
    console.log(`   Login Attempts: ${adminUser.loginAttempts}`);
    console.log(`   Lock Until: ${adminUser.lockUntil}`);
    console.log('');

    // Test password
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`🔑 Password Test: ${isPasswordValid ? 'VALID' : 'INVALID'}`);

    if (!isPasswordValid) {
      console.log('🔧 Fixing password...');
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      adminUser.password = hashedPassword;
    }

    // Fix all account issues
    adminUser.loginAttempts = 0;
    adminUser.lockUntil = undefined;
    adminUser.accountStatus = 'approved';
    adminUser.isEmailVerified = true;
    
    await adminUser.save();
    
    console.log('');
    console.log('🎉 Admin account fixed successfully!');
    console.log('📧 Email: admin@skilllift.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', adminUser.name);
    console.log('✅ Status: Approved & Verified');
    console.log('🔓 Login Attempts: Reset to 0');
    console.log('🔑 Password: Reset to admin123');
    console.log('');
    console.log('You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error fixing admin account:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkAndFixAdminUser();
  mongoose.connection.close();
};

main();
