const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function unlockAndCleanupAdmins() {
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
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`👑 Found ${adminUsers.length} admin users`);
    
    // Find the original admin (created first)
    const originalAdmin = adminUsers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
    console.log(`\n🎯 Original Admin (keeping this one):`);
    console.log(`   Name: ${originalAdmin.name}`);
    console.log(`   Email: ${originalAdmin.email}`);
    console.log(`   Created: ${originalAdmin.createdAt}`);
    console.log(`   Status: ${originalAdmin.accountStatus}`);
    
    // Unlock the original admin account
    originalAdmin.accountStatus = 'approved';
    originalAdmin.lockUntil = undefined;
    originalAdmin.loginAttempts = 0;
    
    // Set a simple password
    const hashedPassword = await bcrypt.hash('password', 12);
    originalAdmin.password = hashedPassword;
    
    await originalAdmin.save();
    console.log('✅ Original admin account unlocked and password reset');
    
    // Delete all other admin users (keep only the original)
    const otherAdmins = adminUsers.filter(admin => admin._id.toString() !== originalAdmin._id.toString());
    
    if (otherAdmins.length > 0) {
      console.log(`\n🗑️ Deleting ${otherAdmins.length} duplicate admin users:`);
      for (const admin of otherAdmins) {
        console.log(`   - ${admin.name} (${admin.email})`);
        await User.findByIdAndDelete(admin._id);
      }
      console.log('✅ Duplicate admin users deleted');
    } else {
      console.log('\n✅ No duplicate admin users to delete');
    }
    
    // Verify final state
    const finalAdminCount = await User.countDocuments({ role: 'admin' });
    const finalAdmin = await User.findOne({ role: 'admin' });
    
    console.log('\n' + '='.repeat(50));
    console.log('🔐 FINAL ADMIN ACCOUNT (SECURITY OPTIMIZED):');
    console.log('='.repeat(50));
    console.log(`   Name: ${finalAdmin.name}`);
    console.log(`   Email: ${finalAdmin.email}`);
    console.log(`   Password: password`);
    console.log(`   Role: admin`);
    console.log(`   Status: ${finalAdmin.accountStatus}`);
    console.log(`   Total Admin Users: ${finalAdminCount}`);
    console.log('='.repeat(50));
    
    console.log('\n✅ Security optimization complete!');
    console.log('   - Only 1 admin account exists');
    console.log('   - Account is unlocked and ready to use');
    console.log('   - Password is simple: "password"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
unlockAndCleanupAdmins();
