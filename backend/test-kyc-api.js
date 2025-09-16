const axios = require('axios');

async function testKYCAPI() {
  try {
    console.log('🧪 Testing KYC API endpoint...');
    
    // First, let's test if the server is running
    try {
      const healthCheck = await axios.get('http://localhost:3001/api/auth/health');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('⚠️ Health check failed, but server might be running');
    }
    
    // Test KYC status endpoint (this should work without auth for testing)
    try {
      const statusResponse = await axios.get('http://localhost:3001/api/kyc/status');
      console.log('✅ KYC status endpoint accessible');
    } catch (error) {
      console.log('⚠️ KYC status endpoint error:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Server connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3001');
    }
  }
}

testKYCAPI();
