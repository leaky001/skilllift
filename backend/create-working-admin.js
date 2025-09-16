const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createWorkingAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Delete any existing admin users
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Deleted all existing admin users');
    
    // Create admin user with PLAIN password (pre-save hook will hash it)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123', // Plain password - pre-save hook will hash it
      phone: '+1234567890',
      role: 'admin',
      accountStatus: 'approved',
      isEmailVerified: true,
      loginAttempts: 0
    });
    
    await adminUser.save(); // This will trigger the pre-save hook to hash the password
    console.log('✅ Created admin user (password auto-hashed by pre-save hook)');
    
    // Test the password
    const testAdmin = await User.findOne({ email: 'admin@test.com' });
    const bcrypt = require('bcryptjs');
    const passwordMatch = await bcrypt.compare('admin123', testAdmin.password);
    
    console.log(`✅ Password test: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`);
    
    if (passwordMatch) {
      console.log('\n🎉 ADMIN LOGIN IS NOW WORKING!');
      console.log('='.repeat(50));
      console.log('   Email: admin@test.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   Status: approved');
      console.log('='.repeat(50));
      console.log('\n✅ You can now login successfully!');
    } else {
      console.log('❌ Still having issues - checking password hash...');
      console.log('Password hash:', testAdmin.password.substring(0, 20) + '...');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createWorkingAdmin();
