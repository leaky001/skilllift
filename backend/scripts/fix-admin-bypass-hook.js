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

const fixAdminBypassHook = async () => {
  try {
    console.log('🔧 Fixing admin user by bypassing pre-save hook...');
    
    // Step 1: Delete ALL admin users
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing admin user(s)`);
    
    // Step 2: Create admin user data
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10); // Use same salt rounds as pre-save hook
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('🔑 Creating password hash with correct salt rounds (10)...');
    console.log(`   Original password: ${password}`);
    console.log(`   Hashed password: ${hashedPassword.substring(0, 20)}...`);
    
    // Step 3: Insert directly into database to bypass pre-save hook
    const adminData = {
      name: 'System Administrator',
      email: 'admin@skilllift.com',
      password: hashedPassword, // Already hashed, won't trigger pre-save hook
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
    };

    console.log('💾 Inserting admin user directly into database...');
    const result = await User.collection.insertOne(adminData);
    console.log(`✅ Admin user inserted with ID: ${result.insertedId}`);
    
    // Step 4: Test the password
    console.log('🧪 Testing password...');
    const adminUser = await User.findOne({ role: 'admin' });
    const passwordTest = await adminUser.matchPassword(password);
    const bcryptTest = await bcrypt.compare(password, adminUser.password);
    
    console.log('');
    console.log('🎉 ADMIN USER FIXED!');
    console.log('===================');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`🎭 Role: ${adminUser.role}`);
    console.log(`✅ Account Status: ${adminUser.accountStatus}`);
    console.log(`📧 Email Verified: ${adminUser.isEmailVerified}`);
    console.log(`🔓 Login Attempts: ${adminUser.loginAttempts}`);
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
      console.log('❌ ERROR: Password tests still failed!');
    }

  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
    console.error('Stack trace:', error.stack);
  }
};

const main = async () => {
  await connectDB();
  await fixAdminBypassHook();
  mongoose.connection.close();
  console.log('');
  console.log('🔌 Database connection closed.');
  console.log('✅ Script completed successfully!');
};

main();
