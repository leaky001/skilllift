const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testWithRealToken() {
  try {
    console.log('🔍 Testing with real JWT token...');
    
    // Create a test JWT token
    const testUser = {
      id: '507f1f77bcf86cd799439011', // Mock ObjectId
      email: 'test@example.com',
      role: 'tutor'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Generated test token');
    
    // Test the endpoint
    try {
      const response = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: '507f1f77bcf86cd799439012', // Mock course ID
        customMeetLink: 'https://meet.google.com/test-link'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Error details:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Data:', error.response?.data);
      console.log('Headers:', error.response?.headers);
      
      if (error.response?.data?.stack) {
        console.log('Stack trace:', error.response.data.stack);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithRealToken();
