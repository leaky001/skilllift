const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAllAdminUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check ALL users to see what admin accounts exist
    const allUsers = await User.find().select('name email role accountStatus createdAt');
    console.log(`👥 Total users: ${allUsers.length}`);
    
    console.log('\n📋 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.accountStatus}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Specifically check admin users
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    console.log(`👑 Admin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\n👑 Admin users:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.accountStatus}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkAllAdminUsers();
