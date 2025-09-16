require('dotenv').config();
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing Payment Verification...\n');

    // Test 1: Valid payment verification
    console.log('🔍 Test 1: Testing valid payment verification...');
    
    const validReference = 'PAY_1756981651792_68adb5599bdf6463918971f2_68b7126f79c0d42ede258ef3';
    
    try {
      const verifyResponse = await axios.get(`${baseURL}/payments/verify?reference=${validReference}`);
      console.log('✅ Payment verification response:', verifyResponse.data);
    } catch (verifyError) {
      console.log('⚠️  Payment verification failed (expected for test):', verifyError.response?.data?.message || verifyError.message);
    }

    // Test 2: Invalid payment reference
    console.log('\n🔍 Test 2: Testing invalid payment reference...');
    
    const invalidReference = 'INVALID_REFERENCE_123';
    
    try {
      const invalidResponse = await axios.get(`${baseURL}/payments/verify?reference=${invalidReference}`);
      console.log('❌ Unexpected success:', invalidResponse.data);
    } catch (invalidError) {
      console.log('✅ Invalid reference handled correctly:', invalidError.response?.data?.message || invalidError.message);
    }

    // Test 3: Missing reference parameter
    console.log('\n🔍 Test 3: Testing missing reference parameter...');
    
    try {
      const noRefResponse = await axios.get(`${baseURL}/payments/verify`);
      console.log('❌ Unexpected success:', noRefResponse.data);
    } catch (noRefError) {
      console.log('✅ Missing reference handled correctly:', noRefError.response?.data?.message || noRefError.message);
    }

    // Test 4: Check if route exists
    console.log('\n🔍 Test 4: Testing route availability...');
    
    try {
      const routeResponse = await axios.get(`${baseURL}/payments/verify?reference=test`);
      console.log('✅ Route exists and responds');
    } catch (routeError) {
      if (routeError.response?.status === 404) {
        console.log('❌ Route not found (404 error)');
      } else {
        console.log('✅ Route exists but returned error:', routeError.response?.status, routeError.response?.data?.message);
      }
    }

    console.log('\n🎯 Payment verification testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📝 Error details:', error.response.data);
    }
  }
}

// Run the test
testPaymentVerification();
