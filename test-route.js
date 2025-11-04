// Test script to check if the route handler is working
const axios = require('axios');

async function testRoute() {
  try {
    console.log('Testing /google-meet/live/start route...');
    
    // Test without auth first
    const response = await axios.post('http://localhost:5000/api/google-meet/live/start', {
      courseId: '68c8520c0fec18aa4b8e1015',
      customMeetLink: 'https://meet.google.com/test'
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error (expected):', error.response?.data || error.message);
  }
}

testRoute();
