const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugAdminLogin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('👑 Admin user found:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.accountStatus}`);
    console.log(`   Locked: ${admin.lockUntil ? 'YES' : 'NO'}`);
    console.log(`   Login Attempts: ${admin.loginAttempts}`);
    console.log(`   Email Verified: ${admin.isEmailVerified}`);
    
    // Test different passwords
    const testPasswords = ['password', 'admin123', 'admin', '123456', 'test123'];
    
    console.log('\n🔍 Testing passwords:');
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log(`   "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    // Reset to a password that definitely works
    console.log('\n🔧 Resetting password to "admin123"...');
    const newHashedPassword = await bcrypt.hash('admin123', 12);
    admin.password = newHashedPassword;
    admin.accountStatus = 'approved';
    admin.lockUntil = undefined;
    admin.loginAttempts = 0;
    await admin.save();
    
    console.log('✅ Password reset complete!');
    
    // Verify the new password works
    const verifyPassword = await bcrypt.compare('admin123', admin.password);
    console.log(`✅ Password verification: ${verifyPassword ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\n🔐 FINAL ADMIN LOGIN CREDENTIALS:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Status: approved (unlocked)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
debugAdminLogin();