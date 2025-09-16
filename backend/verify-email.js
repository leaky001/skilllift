const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function verifyEmail(email, code) {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    console.log('👤 User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Current Verification Code: ${user.emailVerificationCode}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);
    
    // Check if code matches
    if (user.emailVerificationCode === code) {
      // Verify the email
      user.isEmailVerified = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      console.log('\n✅ EMAIL VERIFIED SUCCESSFULLY!');
      console.log('='.repeat(50));
      console.log(`   User: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: Verified`);
      console.log('='.repeat(50));
      console.log('\n🎉 You can now login with this account!');
      
    } else {
      console.log('\n❌ VERIFICATION CODE DOES NOT MATCH!');
      console.log(`   Expected: ${user.emailVerificationCode}`);
      console.log(`   Provided: ${code}`);
      console.log('\n💡 Try using the correct verification code.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Verify the email with the correct code
const email = 'lakybass19@gmail.com';
const code = '277590'; // The correct verification code from our earlier check

console.log('🔐 VERIFYING EMAIL:');
console.log(`   Email: ${email}`);
console.log(`   Code: ${code}`);
console.log('');

verifyEmail(email, code);
