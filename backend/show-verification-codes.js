const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function showVerificationCodes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find users with pending email verification
    const pendingUsers = await User.find({ 
      isEmailVerified: false,
      emailVerificationCode: { $exists: true }
    }).select('name email emailVerificationCode emailVerificationExpires');

    console.log('\n📧 PENDING EMAIL VERIFICATIONS:');
    console.log('='.repeat(60));
    
    if (pendingUsers.length === 0) {
      console.log('No pending email verifications found.');
    } else {
      pendingUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Verification Code: ${user.emailVerificationCode}`);
        console.log(`   Expires: ${user.emailVerificationExpires}`);
        console.log(`   Status: ${new Date() > new Date(user.emailVerificationExpires) ? 'EXPIRED' : 'VALID'}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 TO VERIFY EMAIL:');
    console.log('1. Copy the verification code above');
    console.log('2. Go to the frontend verification page');
    console.log('3. Enter the code to verify your email');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
showVerificationCodes();
