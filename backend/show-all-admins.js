const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function showAllAdminUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find ALL admin users
    const adminUsers = await User.find({ role: 'admin' }).select('name email role accountStatus createdAt');
    
    console.log(`\n👑 TOTAL ADMIN USERS: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('❌ NO ADMIN USERS FOUND!');
      return;
    }
    
    console.log('\n📋 ALL ADMIN USERS:');
    console.log('='.repeat(50));
    
    adminUsers.forEach((admin, index) => {
      console.log(`\n${index + 1}. ADMIN USER #${index + 1}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.accountStatus}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log(`   ID: ${admin._id}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Admin Users: ${adminUsers.length}`);
    console.log(`   Active Admins: ${adminUsers.filter(a => a.accountStatus === 'approved').length}`);
    console.log(`   Pending Admins: ${adminUsers.filter(a => a.accountStatus === 'pending').length}`);
    
    // Show the FIRST admin user (most likely the original one)
    if (adminUsers.length > 0) {
      const firstAdmin = adminUsers[0];
      console.log(`\n🎯 RECOMMENDED ADMIN LOGIN:`);
      console.log(`   Email: ${firstAdmin.email}`);
      console.log(`   Password: password (reset to simple password)`);
      console.log(`   Role: admin`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
showAllAdminUsers();
