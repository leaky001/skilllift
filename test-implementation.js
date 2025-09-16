const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testImplementation() {
  console.log('🚀 TESTING SKILLLIFT ENHANCED COURSE SYSTEM IMPLEMENTATION');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Health Check
    console.log('\n1. Testing Backend Health...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend is running');
    console.log('📊 Available endpoints:', Object.keys(healthResponse.data.endpoints));
    
    // Test 2: Check if new endpoints exist
    console.log('\n2. Testing New API Endpoints...');
    
    const endpoints = [
      '/lessons',
      '/live-sessions', 
      '/certificates',
      '/complaints',
      '/messages'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          validateStatus: () => true // Don't throw on 401/403
        });
        if (response.status === 401 || response.status === 403) {
          console.log(`✅ ${endpoint} - Endpoint exists (requires auth)`);
        } else if (response.status === 200) {
          console.log(`✅ ${endpoint} - Endpoint working`);
        } else {
          console.log(`⚠️  ${endpoint} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
    
    // Test 3: Check Models
    console.log('\n3. Testing Database Models...');
    const mongoose = require('mongoose');
    
    try {
      await mongoose.connect('mongodb://localhost:27017/skilllift', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ Database connected');
      
      // Check if new models exist
      const models = ['Lesson', 'LessonProgress', 'LiveClassSession'];
      for (const modelName of models) {
        try {
          const Model = require(`./backend/models/${modelName}`);
          console.log(`✅ ${modelName} model exists`);
        } catch (error) {
          console.log(`❌ ${modelName} model missing: ${error.message}`);
        }
      }
      
      await mongoose.disconnect();
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
    }
    
    console.log('\n4. Frontend Components Check...');
    const fs = require('fs');
    const path = require('path');
    
    const components = [
      'frontend/src/components/LessonManagement.jsx',
      'frontend/src/components/LessonPlayer.jsx', 
      'frontend/src/components/CertificateManagement.jsx',
      'frontend/src/components/LiveSession.jsx',
      'frontend/src/components/ComplaintsManagement.jsx'
    ];
    
    for (const component of components) {
      if (fs.existsSync(component)) {
        console.log(`✅ ${path.basename(component)} - Component exists`);
      } else {
        console.log(`❌ ${path.basename(component)} - Component missing`);
      }
    }
    
    console.log('\n5. Integration Check...');
    
    // Check if ViewCourse has lessons tab
    const viewCourseContent = fs.readFileSync('frontend/src/pages/tutor/ViewCourse.jsx', 'utf8');
    if (viewCourseContent.includes('lessons') && viewCourseContent.includes('LessonManagement')) {
      console.log('✅ Tutor ViewCourse has Lessons tab integrated');
    } else {
      console.log('❌ Tutor ViewCourse missing Lessons integration');
    }
    
    // Check if CourseDetail has lessons and certificates tabs
    const courseDetailContent = fs.readFileSync('frontend/src/pages/learner/CourseDetail.jsx', 'utf8');
    if (courseDetailContent.includes('lessons') && courseDetailContent.includes('certificates')) {
      console.log('✅ Learner CourseDetail has Lessons and Certificates tabs');
    } else {
      console.log('❌ Learner CourseDetail missing tabs integration');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 IMPLEMENTATION TEST COMPLETE!');
    console.log('\n📋 WHAT TO DO NEXT:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Login as tutor or learner');
    console.log('3. Go to courses and click on any course');
    console.log('4. Look for new tabs: "Lessons", "Certificates"');
    console.log('5. Test the new features!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImplementation();
