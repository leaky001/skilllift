const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function testExactFrontendScenario() {
  try {
    console.log('🔍 Testing exact frontend scenario...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the tutor and course (same as before)
    const tutor = await User.findOne({ role: 'tutor' });
    const course = await Course.findOne({ tutor: tutor._id });
    
    console.log('✅ Using course:', course._id.toString());
    
    // Create JWT token
    const token = jwt.sign(
      { id: tutor._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // Test the exact request that frontend would make
    console.log('\n🔍 Testing frontend request...');
    console.log('Request data:', {
      courseId: course._id.toString(),
      customMeetLink: null
    });
    
    try {
      const response = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: course._id.toString(),
        customMeetLink: null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: function (status) {
          // Don't throw for any status code
          return true;
        }
      });
      
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
      console.log('✅ Response headers:', response.headers);
      
      // Check if this matches what frontend expects
      if (response.status === 200 && response.data.success) {
        console.log('✅ This should work in frontend');
        if (response.data.message === 'Live class is already active') {
          console.log('ℹ️ This is the "already active" case - frontend should handle this');
        }
      } else {
        console.log('❌ This would cause frontend error');
      }
      
    } catch (error) {
      console.log('❌ Request failed:');
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testExactFrontendScenario();
