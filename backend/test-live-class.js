const axios = require('axios');
require('dotenv').config();

async function testLiveClassStart() {
  try {
    console.log('🔍 Testing Google Meet Live Class Start...');
    
    // First, let's test the endpoint without authentication
    console.log('\n1. Testing endpoint without auth...');
    try {
      const response = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: 'test-course-id',
        customMeetLink: 'https://meet.google.com/test-link'
      });
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Expected auth error:', error.response?.status, error.response?.data?.message);
    }

    // Test with a mock JWT token
    console.log('\n2. Testing with mock JWT...');
    try {
      const response = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: 'test-course-id',
        customMeetLink: 'https://meet.google.com/test-link'
      }, {
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        }
      });
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Auth error:', error.response?.status, error.response?.data?.message);
    }

    // Test the test endpoint
    console.log('\n3. Testing test endpoint...');
    try {
      const response = await axios.get('http://localhost:5000/api/google-meet/test');
      console.log('✅ Test endpoint response:', response.data);
    } catch (error) {
      console.log('❌ Test endpoint error:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLiveClassStart();
