const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetOriginalAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find the original admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    
    if (!admin) {
      console.log('❌ Original admin user not found');
      return;
    }
    
    console.log(`👑 Found original admin: ${admin.name} (${admin.email})`);
    
    // Try common passwords that might have been used
    const commonPasswords = ['password', 'admin', '123456', 'admin123', 'test123', 'skilllift'];
    
    console.log('🔍 Checking common passwords...');
    
    for (const password of commonPasswords) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        console.log(`✅ Found matching password: ${password}`);
        console.log('\n🔐 Original Admin Login Credentials:');
        console.log('   Email: admin@test.com');
        console.log(`   Password: ${password}`);
        console.log('   Role: admin');
        return;
      }
    }
    
    // If no common password matches, reset to a simple one
    console.log('⚠️ No common password found, resetting to simple password');
    const hashedPassword = await bcrypt.hash('password', 12);
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('\n🔐 Original Admin Login Credentials (RESET):');
    console.log('   Email: admin@test.com');
    console.log('   Password: password');
    console.log('   Role: admin');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetOriginalAdmin();
