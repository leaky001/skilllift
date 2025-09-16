// Test real email verification (not console logging)
require('dotenv').config();
const { sendEmailVerification } = require('./utils/sendEmail');

async function testRealEmailVerification() {
  console.log('📧 Testing REAL Email Verification (Not Console Logging)...');
  console.log('='.repeat(60));
  
  try {
    // Simulate a user registration
    const testUser = {
      name: 'Test User',
      email: 'lakybass19@gmail.com'
    };
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('📤 Sending verification email to:', testUser.email);
    console.log('🔐 Verification code:', verificationCode);
    
    // This should now send REAL email, not console log
    const result = await sendEmailVerification(testUser, verificationCode);
    
    console.log('📥 Result:', result.message);
    
    if (result.success) {
      console.log('✅ SUCCESS! Check your Gmail inbox!');
      console.log('📬 Email should be in: lakybass19@gmail.com');
      console.log('🔐 Look for verification code:', verificationCode);
    } else {
      console.log('❌ Failed to send email');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testRealEmailVerification();
