// Test Rating System - Simple Example
const axios = require('axios');

async function testRatingSystem() {
  console.log('🎯 TESTING RATING SYSTEM - STEP BY STEP\n');
  
  try {
    // Step 1: Check if we can get course reviews
    console.log('1️⃣ Testing: Get Course Reviews');
    const reviewsResponse = await axios.get('http://localhost:3001/api/reviews/course/507f1f77bcf86cd799439011');
    console.log('✅ Course Reviews API Working');
    console.log('📊 Reviews found:', reviewsResponse.data.data?.length || 0);
    
    // Step 2: Check course rating stats
    console.log('\n2️⃣ Testing: Get Course Rating Stats');
    const statsResponse = await axios.get('http://localhost:3001/api/reviews/course/507f1f77bcf86cd799439011/stats');
    console.log('✅ Course Stats API Working');
    console.log('📈 Stats:', statsResponse.data.data);
    
    // Step 3: Check admin tutor analytics
    console.log('\n3️⃣ Testing: Get Admin Tutor Analytics');
    const analyticsResponse = await axios.get('http://localhost:3001/api/reviews/admin/tutor-analytics');
    console.log('✅ Admin Analytics API Working');
    console.log('👥 Tutors analyzed:', analyticsResponse.data.data?.totalTutors || 0);
    
    console.log('\n🎉 ALL RATING SYSTEM APIs ARE WORKING!');
    console.log('\n📋 HOW IT WORKS:');
    console.log('1. Learner submits review → API saves it');
    console.log('2. Tutor gets notified → Notification sent');
    console.log('3. Admin gets notified → Notification sent');
    console.log('4. Admin approves review → Review goes live');
    console.log('5. Other learners see review → Course rating updates');
    
  } catch (error) {
    console.error('❌ Error testing rating system:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testRatingSystem();
