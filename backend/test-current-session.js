const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function testGoogleMeetCurrentSession() {
  try {
    console.log('🔍 Testing Google Meet current session endpoint...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find a tutor and course
    const tutor = await User.findOne({ role: 'tutor' });
    const course = await Course.findOne({ tutor: tutor._id });
    
    console.log('✅ Using course:', course._id.toString());
    
    // Create JWT token
    const token = jwt.sign(
      { id: tutor._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // Test the Google Meet current session endpoint
    try {
      const response = await axios.get(`http://localhost:5000/api/google-meet/live/current/${course._id.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Google Meet current session response:');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Google Meet current session error:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test the old live classes endpoint
    try {
      const response = await axios.get('http://localhost:5000/api/live-classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('\n✅ Old live classes response:');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('\n❌ Old live classes error:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testGoogleMeetCurrentSession();
