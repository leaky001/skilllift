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

const resetAdminPassword = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Reset password to a known value
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    adminUser.password = hashedPassword;
    adminUser.accountStatus = 'approved';
    adminUser.isEmailVerified = true;
    
    await adminUser.save();
    
    console.log('🎉 Admin password reset successfully!');
    console.log('📧 Email: admin@skilllift.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', adminUser.name);
    console.log('✅ Status: Approved');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  }
};

const main = async () => {
  await connectDB();
  await resetAdminPassword();
  mongoose.connection.close();
};

main();
