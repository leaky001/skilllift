const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check for admin users
    const adminUsers = await User.find({ role: 'admin' }).select('name email role accountStatus');
    console.log(`👑 Admin users found: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found!');
      console.log('💡 Creating a default admin user...');
      
      const adminUser = new User({
        name: 'System Admin',
        email: 'admin@skilllift.com',
        password: 'admin123',
        phone: '+1234567890',
        role: 'admin',
        accountStatus: 'approved',
        isEmailVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@skilllift.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('\n👑 Admin users:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.accountStatus}`);
        console.log('');
      });
    }

    // Check all users
    const allUsers = await User.find().select('name email role accountStatus');
    console.log(`👥 Total users: ${allUsers.length}`);
    
    const roleCounts = {};
    allUsers.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('📊 User role distribution:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkAdminUsers();
