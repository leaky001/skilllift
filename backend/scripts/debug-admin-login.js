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

const debugAdminLogin = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('🔍 Admin User Details:');
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Account Status: ${adminUser.accountStatus}`);
    console.log(`   Email Verified: ${adminUser.isEmailVerified}`);
    console.log(`   Login Attempts: ${adminUser.loginAttempts}`);
    console.log(`   Lock Until: ${adminUser.lockUntil}`);
    console.log(`   Phone: ${adminUser.phone}`);
    console.log('');

    // Test password
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`🔑 Password Test: ${isPasswordValid ? 'VALID' : 'INVALID'}`);

    // Test the matchPassword method
    const matchPasswordResult = await adminUser.matchPassword(testPassword);
    console.log(`🔑 matchPassword Method: ${matchPasswordResult ? 'VALID' : 'INVALID'}`);

    // Check if account is locked
    const isLocked = adminUser.isLocked();
    console.log(`🔒 Account Locked: ${isLocked}`);

    console.log('');
    console.log('📋 Login Requirements:');
    console.log('   ✅ Email: admin@skilllift.com');
    console.log('   ✅ Password: admin123');
    console.log('   ✅ Role: admin (REQUIRED!)');
    console.log('');
    console.log('⚠️  IMPORTANT: The login API requires a "role" field!');
    console.log('   Make sure your frontend sends:');
    console.log('   {');
    console.log('     "email": "admin@skilllift.com",');
    console.log('     "password": "admin123",');
    console.log('     "role": "admin"');
    console.log('   }');

  } catch (error) {
    console.error('❌ Error debugging admin login:', error);
  }
};

const main = async () => {
  await connectDB();
  await debugAdminLogin();
  mongoose.connection.close();
};

main();
