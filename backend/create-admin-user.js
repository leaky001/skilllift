const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createNewAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check if admin@skilllift.com already exists
    const existingAdmin = await User.findOne({ email: 'admin@skilllift.com' });
    
    if (existingAdmin) {
      console.log('👑 Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.accountStatus}`);
      
      // Reset password to something simple
      const hashedPassword = await bcrypt.hash('admin123', 12);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('✅ Password reset to: admin123');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@skilllift.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'admin',
        accountStatus: 'approved',
        isEmailVerified: true
      });
      
      await adminUser.save();
      console.log('✅ New admin user created');
    }
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('   Email: admin@skilllift.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createNewAdmin();