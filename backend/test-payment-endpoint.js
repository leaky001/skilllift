// Test Payment Endpoint
const axios = require('axios');

async function testPaymentEndpoint() {
  console.log('🧪 Testing Payment Endpoint...');
  console.log('='.repeat(50));

  try {
    // Test health endpoint first
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health endpoint working:', healthResponse.status);

    // Test payment endpoint with mock data
    console.log('\n2. Testing payment initialization...');
    
    const paymentData = {
      courseId: '507f1f77bcf86cd799439012',
      amount: 5000,
      email: 'test@example.com'
    };

    // This will likely fail due to authentication, but let's see the error
    try {
      const paymentResponse = await axios.post('http://localhost:3001/api/payments/initialize', paymentData);
      console.log('✅ Payment endpoint working:', paymentResponse.status);
    } catch (error) {
      console.log('❌ Payment endpoint error:', error.response?.status);
      console.log('Error message:', error.response?.data?.message);
      console.log('Full error:', error.response?.data);
    }

  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testPaymentEndpoint();
