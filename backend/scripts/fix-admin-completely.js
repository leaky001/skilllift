const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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

const fixAdminCompletely = async () => {
  try {
    console.log('🔧 Starting complete admin user fix...');
    
    // Step 1: Delete ALL admin users
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing admin user(s)`);
    
    // Step 2: Create a completely new admin user
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('🔑 Creating new password hash...');
    console.log(`   Original password: ${password}`);
    console.log(`   Hashed password: ${hashedPassword.substring(0, 20)}...`);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@skilllift.com',
      password: hashedPassword,
      phone: '+234-800-000-0000',
      role: 'admin',
      accountStatus: 'approved',
      isEmailVerified: true,
      loginAttempts: 0,
      lockUntil: undefined,
      roleValidationAttempts: 0,
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('💾 Saving new admin user to database...');
    await adminUser.save();
    
    // Step 3: Test the password immediately after saving
    console.log('🧪 Testing password after save...');
    const passwordTest = await adminUser.matchPassword(password);
    const bcryptTest = await bcrypt.compare(password, adminUser.password);
    
    // Step 4: Verify the user was saved correctly
    const savedUser = await User.findOne({ role: 'admin' });
    
    console.log('');
    console.log('🎉 ADMIN USER COMPLETELY FIXED!');
    console.log('================================');
    console.log(`📧 Email: ${savedUser.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${savedUser.name}`);
    console.log(`🎭 Role: ${savedUser.role}`);
    console.log(`✅ Account Status: ${savedUser.accountStatus}`);
    console.log(`📧 Email Verified: ${savedUser.isEmailVerified}`);
    console.log(`🔓 Login Attempts: ${savedUser.loginAttempts}`);
    console.log(`🔒 Lock Until: ${savedUser.lockUntil || 'None'}`);
    console.log('');
    console.log('🧪 PASSWORD TESTS:');
    console.log(`   matchPassword method: ${passwordTest ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`   bcrypt.compare: ${bcryptTest ? '✅ VALID' : '❌ INVALID'}`);
    console.log('');
    
    if (passwordTest && bcryptTest) {
      console.log('✅ SUCCESS! Admin login should work now!');
      console.log('');
      console.log('🔐 LOGIN CREDENTIALS:');
      console.log('   Email: admin@skilllift.com');
      console.log('   Password: admin123');
      console.log('   Role: admin (automatically sent by frontend)');
      console.log('');
      console.log('🌐 Try logging in at: http://localhost:5173/admin/login');
    } else {
      console.log('❌ ERROR: Password tests failed!');
      console.log('   There may be an issue with the User model or bcrypt.');
    }

  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
    console.error('Stack trace:', error.stack);
  }
};

const main = async () => {
  await connectDB();
  await fixAdminCompletely();
  mongoose.connection.close();
  console.log('');
  console.log('🔌 Database connection closed.');
  console.log('✅ Script completed successfully!');
};

main();
