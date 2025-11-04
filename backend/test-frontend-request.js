const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function testFrontendRequest() {
  try {
    console.log('🔍 Testing exact frontend request...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find a real user (tutor)
    const tutor = await User.findOne({ role: 'tutor' });
    if (!tutor) {
      console.log('❌ No tutor found');
      return;
    }
    
    console.log('✅ Found tutor:', {
      id: tutor._id.toString(),
      name: tutor.name,
      email: tutor.email,
      role: tutor.role
    });
    
    // Find a course owned by this tutor
    const course = await Course.findOne({ tutor: tutor._id });
    if (!course) {
      console.log('❌ No course found for tutor');
      return;
    }
    
    console.log('✅ Found course:', {
      id: course._id.toString(),
      title: course.title,
      tutor: course.tutor.toString()
    });
    
    // Create JWT token (same format as frontend)
    const token = jwt.sign(
      { id: tutor._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    console.log('✅ Generated JWT token');
    
    // Test 1: With custom Meet link (should work)
    console.log('\n🔍 Test 1: With custom Meet link...');
    try {
      const response1 = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: course._id.toString(),
        customMeetLink: 'https://meet.google.com/test-link'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ Custom link response:', response1.data);
    } catch (error) {
      console.log('❌ Custom link failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test 2: Without custom Meet link (should require Google OAuth)
    console.log('\n🔍 Test 2: Without custom Meet link...');
    try {
      const response2 = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: course._id.toString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ No custom link response:', response2.data);
    } catch (error) {
      console.log('❌ No custom link failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test 3: With invalid course ID
    console.log('\n🔍 Test 3: With invalid course ID...');
    try {
      const response3 = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: 'invalid-course-id',
        customMeetLink: 'https://meet.google.com/test-link'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ Invalid course response:', response3.data);
    } catch (error) {
      console.log('❌ Invalid course failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testFrontendRequest();
