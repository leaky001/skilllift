const axios = require('axios');

async function testEnvironmentVariable() {
  try {
    console.log('🔍 Testing environment variable in server...');
    
    // Test payment initialization to see what URL is generated
    const response = await axios.post('http://localhost:3001/api/payments/initialize', {
      courseId: '68ade2522ba3b04e9b7cf432',
      amount: 50000,
      email: 'test@example.com'
    });
    
    console.log('📋 Authorization URL from server:', response.data.data.authorizationUrl);
    
    // Check if it contains localhost:3000 or localhost:5173
    if (response.data.data.authorizationUrl.includes('localhost:3000')) {
      console.log('❌ Server is still using localhost:3000');
      console.log('🔧 This means FRONTEND_URL environment variable is set to localhost:3000');
    } else if (response.data.data.authorizationUrl.includes('localhost:5173')) {
      console.log('✅ Server is using localhost:5173 (correct)');
    } else {
      console.log('🤔 Server is using a different URL:', response.data.data.authorizationUrl);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEnvironmentVariable();
