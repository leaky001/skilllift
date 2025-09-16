const axios = require('axios');

async function testPaymentVerification() {
  try {
    console.log('🔍 Testing payment verification endpoint...');
    
    // Test 1: Check if endpoint exists
    const response = await axios.get('http://localhost:5000/api/payments/verify?reference=test123');
    
    console.log('✅ Endpoint is accessible');
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error testing endpoint:');
    console.log('📊 Status:', error.response?.status);
    console.log('📄 Message:', error.response?.data);
    console.log('🔗 URL:', error.config?.url);
  }
}

testPaymentVerification();
