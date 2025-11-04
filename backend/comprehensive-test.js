const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function comprehensiveTest() {
  try {
    console.log('🔍 Comprehensive Google Meet Test...');
    console.log('Environment check:');
    console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    console.log('- MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    
    // Test 1: Basic server connectivity
    console.log('\n1. Testing server connectivity...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Server is running:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }

    // Test 2: Google Meet test endpoint
    console.log('\n2. Testing Google Meet test endpoint...');
    try {
      const testResponse = await axios.get('http://localhost:5000/api/google-meet/test');
      console.log('✅ Google Meet test endpoint:', testResponse.data);
    } catch (error) {
      console.log('❌ Google Meet test endpoint failed:', error.response?.data || error.message);
    }

    // Test 3: Test with authentication
    console.log('\n3. Testing with authentication...');
    const testUser = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'tutor'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    try {
      const authResponse = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: '507f1f77bcf86cd799439012',
        customMeetLink: 'https://meet.google.com/test-link'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      console.log('✅ Live class start response:', authResponse.data);
    } catch (error) {
      console.log('❌ Live class start failed:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - server might not be running');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('❌ Request timed out');
      } else if (error.response?.data?.stack) {
        console.log('Stack trace:', error.response.data.stack);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

comprehensiveTest();
