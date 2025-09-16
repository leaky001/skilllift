require('dotenv').config();
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function captureExactError() {
  try {
    console.log('🔍 Capturing Exact 400 Error Details...\n');

    // Wait a moment for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 1: Check backend health
    console.log('🔍 Step 1: Checking backend health...');
    try {
      const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
      console.log('✅ Backend is running');
    } catch (healthError) {
      console.log('❌ Backend not responding:', healthError.message);
      return;
    }

    // Step 2: Test payment without any authentication (should show exact error)
    console.log('\n🔍 Step 2: Testing payment without authentication...');
    try {
      const noAuthResponse = await axios.post(`${baseURL}/payments/initialize`, {
        courseId: 'test-course-id',
        amount: 15000,
        email: 'test@example.com'
      });
      console.log('❌ Unexpected success:', noAuthResponse.data);
    } catch (noAuthError) {
      console.log('📝 Error Status:', noAuthError.response?.status);
      console.log('📝 Error Message:', noAuthError.response?.data?.message);
      console.log('📝 Full Error Response:', JSON.stringify(noAuthError.response?.data, null, 2));
    }

    // Step 3: Test with invalid token
    console.log('\n🔍 Step 3: Testing with invalid token...');
    try {
      const invalidTokenResponse = await axios.post(`${baseURL}/payments/initialize`, {
        courseId: 'test-course-id',
        amount: 15000,
        email: 'test@example.com'
      }, {
        headers: {
          'Authorization': 'Bearer invalid_token_123',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Unexpected success with invalid token:', invalidTokenResponse.data);
    } catch (invalidTokenError) {
      console.log('📝 Error Status:', invalidTokenError.response?.status);
      console.log('📝 Error Message:', invalidTokenError.response?.data?.message);
      console.log('📝 Full Error Response:', JSON.stringify(invalidTokenError.response?.data, null, 2));
    }

    // Step 4: Test with missing required fields
    console.log('\n🔍 Step 4: Testing with missing fields...');
    try {
      const missingFieldsResponse = await axios.post(`${baseURL}/payments/initialize`, {
        // Missing courseId, amount, email
      }, {
        headers: {
          'Authorization': 'Bearer some_token',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Unexpected success with missing fields:', missingFieldsResponse.data);
    } catch (missingFieldsError) {
      console.log('📝 Error Status:', missingFieldsError.response?.status);
      console.log('📝 Error Message:', missingFieldsError.response?.data?.message);
      console.log('📝 Full Error Response:', JSON.stringify(missingFieldsError.response?.data, null, 2));
    }

    console.log('\n🎯 Error capture completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📝 Error details:', error.response.data);
    }
  }
}

// Run the test
captureExactError();
