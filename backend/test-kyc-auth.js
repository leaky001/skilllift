const axios = require('axios');

async function testKYCWithAuth() {
  try {
    console.log('🧪 Testing KYC submission with authentication...');
    
    // First, login as a tutor
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'tutor@skilllift.com',
      password: 'password123',
      role: 'tutor'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    
    // Test KYC status endpoint
    const statusResponse = await axios.get('http://localhost:3001/api/kyc/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ KYC status endpoint working');
    console.log('   KYC Status:', statusResponse.data.data.kycStatus);
    
    // Test KYC submission (without files for now)
    const formData = new FormData();
    formData.append('idDocumentType', 'passport');
    formData.append('addressDocumentType', 'utility_bill');
    formData.append('notes', 'Test submission');
    
    try {
      const submitResponse = await axios.post('http://localhost:3001/api/kyc/submit', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ KYC submission successful');
      console.log('   Response:', submitResponse.data);
      
    } catch (submitError) {
      console.log('❌ KYC submission failed:');
      console.log('   Status:', submitError.response?.status);
      console.log('   Message:', submitError.response?.data?.message);
      console.log('   Error:', submitError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testKYCWithAuth();
