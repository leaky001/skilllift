const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function testWithRealCourse() {
  try {
    console.log('🔍 Testing with real course from database...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find a tutor user
    const tutor = await User.findOne({ role: 'tutor' });
    if (!tutor) {
      console.log('❌ No tutor found in database');
      return;
    }
    
    console.log('✅ Found tutor:', {
      id: tutor._id,
      name: tutor.name,
      email: tutor.email,
      role: tutor.role
    });
    
    // Find a course owned by this tutor
    const course = await Course.findOne({ tutor: tutor._id });
    if (!course) {
      console.log('❌ No course found for this tutor');
      return;
    }
    
    console.log('✅ Found course:', {
      id: course._id,
      title: course.title,
      tutor: course.tutor,
      enrolledStudents: course.enrolledStudents?.length || 0
    });
    
    // Create JWT token
    const token = jwt.sign(
      { id: tutor._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    console.log('✅ Generated JWT token for tutor');
    
    // Test the endpoint with real course ID
    const axios = require('axios');
    try {
      console.log('🔍 Testing with course ID:', course._id.toString());
      const response = await axios.post('http://localhost:5000/api/google-meet/live/start', {
        courseId: course._id.toString(),
        customMeetLink: 'https://meet.google.com/test-link'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ Live class start response:', response.data);
    } catch (error) {
      console.log('❌ Live class start failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.data?.stack) {
        console.log('Stack trace:', error.response.data.stack);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

testWithRealCourse();
