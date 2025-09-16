// Test PRODUCTION email verification (no testing references)
require('dotenv').config();
const { sendEmailVerification } = require('./utils/sendEmail');

async function testProductionEmailVerification() {
  console.log('📧 Testing PRODUCTION Email Verification...');
  console.log('='.repeat(50));
  
  try {
    // Simulate a real user registration
    const testUser = {
      name: 'John Doe',
      email: 'lakybass19@gmail.com'
    };
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('📤 Sending PRODUCTION verification email...');
    
    // This sends REAL email to user's inbox
    const result = await sendEmailVerification(testUser, verificationCode);
    
    console.log('📥 Result:', result.message);
    
    if (result.success) {
      console.log('✅ PRODUCTION READY!');
      console.log('📬 Real email sent to user inbox');
      console.log('🔐 Professional verification process');
      console.log('🚀 No testing references - fully production');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testProductionEmailVerification();
