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

const testAdminLogin = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('🔍 Testing Admin Login...');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Account Status: ${adminUser.accountStatus}`);
    console.log(`   Login Attempts: ${adminUser.loginAttempts}`);
    console.log('');

    // Test different passwords
    const passwords = ['admin123', 'admin', 'password', '123456'];
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, adminUser.password);
      const matchResult = await adminUser.matchPassword(password);
      console.log(`🔑 Testing password "${password}":`);
      console.log(`   bcrypt.compare: ${isValid ? 'VALID' : 'INVALID'}`);
      console.log(`   matchPassword: ${matchResult ? 'VALID' : 'INVALID'}`);
      console.log('');
    }

    // Create a completely new password
    console.log('🔧 Creating new password...');
    const newPassword = 'admin123';
    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user
    adminUser.password = newHashedPassword;
    adminUser.loginAttempts = 0;
    adminUser.lockUntil = undefined;
    adminUser.accountStatus = 'approved';
    adminUser.isEmailVerified = true;
    
    await adminUser.save();
    
    // Test the new password
    const finalTest = await adminUser.matchPassword(newPassword);
    console.log(`🎉 Final password test: ${finalTest ? 'VALID' : 'INVALID'}`);
    
    if (finalTest) {
      console.log('');
      console.log('✅ Admin login should work now!');
      console.log('📧 Email: admin@skilllift.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: admin (REQUIRED!)');
      console.log('');
      console.log('⚠️  Make sure your frontend sends the role field!');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
};

const main = async () => {
  await connectDB();
  await testAdminLogin();
  mongoose.connection.close();
};

main();
