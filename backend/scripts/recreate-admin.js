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

const recreateAdminUser = async () => {
  try {
    // Delete all admin users
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Removed all existing admin users');

    // Create new admin user with proper password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
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
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    });

    await adminUser.save();
    
    // Test the password immediately after saving
    const passwordTest = await adminUser.matchPassword(password);
    const bcryptTest = await bcrypt.compare(password, adminUser.password);
    
    console.log('🎉 Admin user recreated successfully!');
    console.log('📧 Email: admin@skilllift.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name: System Administrator');
    console.log('✅ Status: Approved');
    console.log('🔓 Login Attempts: 0');
    console.log(`🔑 Password Test: ${passwordTest ? 'VALID' : 'INVALID'}`);
    console.log(`🔑 bcrypt Test: ${bcryptTest ? 'VALID' : 'INVALID'}`);
    console.log('');
    console.log('✅ Login should work now!');
    console.log('⚠️  Make sure to include role: "admin" in the login request');

  } catch (error) {
    console.error('❌ Error recreating admin user:', error);
  }
};

const main = async () => {
  await connectDB();
  await recreateAdminUser();
  mongoose.connection.close();
};

main();
