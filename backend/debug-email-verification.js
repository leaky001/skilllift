// Debug email verification endpoint
require('dotenv').config();

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Endpoint...');
  console.log('='.repeat(50));
  
  try {
    // Test with a real user from the database
    const testData = {
      email: 'lakybass19@gmail.com',
      verificationCode: '123456' // This will likely fail, but let's see the error
    };
    
    console.log('📤 Sending request to verify-email endpoint...');
    console.log('Data:', testData);
    
    const response = await fetch('http://localhost:3001/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('📥 Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Email verification successful!');
    } else {
      console.log('❌ Email verification failed:', responseData.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testEmailVerification();
