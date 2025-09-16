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

const fixAdminPassword = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Fix password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    adminUser.password = hashedPassword;
    adminUser.loginAttempts = 0;
    adminUser.lockUntil = undefined;
    adminUser.accountStatus = 'approved';
    adminUser.isEmailVerified = true;
    
    await adminUser.save();
    
    // Test the new password
    const isPasswordValid = await bcrypt.compare(newPassword, adminUser.password);
    const matchPasswordResult = await adminUser.matchPassword(newPassword);
    
    console.log('🎉 Admin password fixed successfully!');
    console.log('📧 Email: admin@skilllift.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', adminUser.name);
    console.log('✅ Status: Approved');
    console.log('🔓 Login Attempts: Reset to 0');
    console.log(`🔑 Password Test: ${isPasswordValid ? 'VALID' : 'INVALID'}`);
    console.log(`🔑 matchPassword Method: ${matchPasswordResult ? 'VALID' : 'INVALID'}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Make sure your frontend sends the "role" field!');
    console.log('   The login request must include:');
    console.log('   {');
    console.log('     "email": "admin@skilllift.com",');
    console.log('     "password": "admin123",');
    console.log('     "role": "admin"');
    console.log('   }');

  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixAdminPassword();
  mongoose.connection.close();
};

main();
