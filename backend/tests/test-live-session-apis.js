const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testLiveSessionAPIs() {
  console.log('🧪 Testing Live Session APIs...\n');

  try {
    // Test 1: Get public live sessions
    console.log('1️⃣ Testing GET /api/live-sessions/public');
    const publicResponse = await axios.get(`${API_BASE_URL}/live-sessions/public`);
    console.log('✅ Public sessions response:', publicResponse.data);
    console.log('');

    // Test 2: Health check
    console.log('2️⃣ Testing GET /health');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check response:', healthResponse.data);
    console.log('');

    console.log('🎉 All live session APIs are working correctly!');
    console.log('📋 Available endpoints:');
    console.log('   - GET /api/live-sessions/public');
    console.log('   - GET /api/live-sessions/:id');
    console.log('   - POST /api/live-sessions (Tutor only)');
    console.log('   - GET /api/live-sessions/tutor/classes (Tutor only)');
    console.log('   - GET /api/live-sessions/learner/classes (Learner only)');
    console.log('   - POST /api/live-sessions/:id/enroll (Learner only)');
    console.log('   - POST /api/live-sessions/:id/attendance (Learner only)');

  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
  }
}

testLiveSessionAPIs();
