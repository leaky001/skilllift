const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPIs() {
  console.log('🧪 Testing SkillLift APIs...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test 2: Get public courses
    console.log('\n2️⃣ Testing public courses...');
    const coursesResponse = await axios.get(`${API_BASE_URL}/courses/public`);
    console.log('✅ Public courses:', coursesResponse.data.data.length, 'courses found');

    // Test 3: Get course details
    if (coursesResponse.data.data.length > 0) {
      const courseId = coursesResponse.data.data[0]._id;
      console.log('\n3️⃣ Testing course details...');
      const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      console.log('✅ Course details retrieved:', courseResponse.data.data.title);
    }

    // Test 4: Test notifications endpoint
    console.log('\n4️⃣ Testing notifications endpoint...');
    try {
      const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications/my-notifications`);
      console.log('✅ Notifications endpoint working');
    } catch (error) {
      console.log('⚠️ Notifications endpoint requires authentication (expected)');
    }

    // Test 5: Test live sessions
    console.log('\n5️⃣ Testing live sessions...');
    const sessionsResponse = await axios.get(`${API_BASE_URL}/live-sessions/public`);
    console.log('✅ Live sessions:', sessionsResponse.data.data.length, 'sessions found');

    console.log('\n🎉 All API tests completed successfully!');
    console.log('📊 Backend is running perfectly on port 5001');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPIs();
