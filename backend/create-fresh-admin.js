const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createFreshAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Delete the problematic admin user
    const oldAdmin = await User.findOne({ email: 'admin@test.com' });
    if (oldAdmin) {
      await User.findByIdAndDelete(oldAdmin._id);
      console.log('🗑️ Deleted old admin user');
    }
    
    // Create a completely fresh admin user
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    const newAdmin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'admin',
      accountStatus: 'approved',
      isEmailVerified: true,
      loginAttempts: 0
    });
    
    await newAdmin.save();
    console.log('✅ Created fresh admin user');
    
    // Test the password immediately
    const testAdmin = await User.findOne({ email: 'admin@test.com' });
    const passwordMatch = await bcrypt.compare('admin123', testAdmin.password);
    
    console.log(`✅ Password test: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`);
    
    if (passwordMatch) {
      console.log('\n🎉 ADMIN LOGIN WORKING!');
      console.log('='.repeat(40));
      console.log('   Email: admin@test.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('='.repeat(40));
    } else {
      console.log('❌ Password still not working - there might be a deeper issue');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createFreshAdmin();
