const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Test data
const testUser = {
  name: 'Test Tutor',
  email: 'test.tutor@example.com',
  password: 'password123',
  role: 'tutor'
};

const testCourse = {
  title: 'Test Course',
  description: 'Test course description',
  price: 99.99,
  category: 'Technology'
};

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('Available endpoints:', Object.keys(healthResponse.data.endpoints).length);

    // Test 2: Register User
    console.log('\n2. Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ User registered:', registerResponse.data.success);
    authToken = registerResponse.data.token;

    // Test 3: Login
    console.log('\n3. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User logged in:', loginResponse.data.success);

    // Test 4: Get Tutor Dashboard
    console.log('\n4. Testing Tutor Dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/tutor/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Dashboard loaded:', dashboardResponse.data.success);

    // Test 5: Get Tutor Learners
    console.log('\n5. Testing Tutor Learners...');
    const learnersResponse = await axios.get(`${BASE_URL}/api/tutor/learners`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Learners loaded:', learnersResponse.data.success);

    // Test 6: Get Tutor Live Sessions
    console.log('\n6. Testing Tutor Live Sessions...');
    const sessionsResponse = await axios.get(`${BASE_URL}/api/tutor/live-sessions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Live sessions loaded:', learnersResponse.data.success);

    // Test 7: Get Tutor Mentorship Requests
    console.log('\n7. Testing Tutor Mentorship Requests...');
    const mentorshipResponse = await axios.get(`${BASE_URL}/api/tutor/mentorship/requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Mentorship requests loaded:', mentorshipResponse.data.success);

    // Test 8: Get Tutor Payments
    console.log('\n8. Testing Tutor Payments...');
    const paymentsResponse = await axios.get(`${BASE_URL}/api/tutor/payments`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Payments loaded:', paymentsResponse.data.success);

    // Test 9: Get Tutor Certificates
    console.log('\n9. Testing Tutor Certificates...');
    const certificatesResponse = await axios.get(`${BASE_URL}/api/tutor/certificates`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Certificates loaded:', certificatesResponse.data.success);

    // Test 10: Get Tutor Replays
    console.log('\n10. Testing Tutor Replays...');
    const replaysResponse = await axios.get(`${BASE_URL}/api/tutor/replays`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Replays loaded:', replaysResponse.data.success);

    // Test 11: Get Tutor Ratings
    console.log('\n11. Testing Tutor Ratings...');
    const ratingsResponse = await axios.get(`${BASE_URL}/api/tutor/ratings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Ratings loaded:', ratingsResponse.data.success);

    // Test 12: Get Tutor Notifications
    console.log('\n12. Testing Tutor Notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/api/tutor/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Notifications loaded:', notificationsResponse.data.success);

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- Health Check: ✅');
    console.log('- Authentication: ✅');
    console.log('- Tutor Dashboard: ✅');
    console.log('- Tutor Learners: ✅');
    console.log('- Live Sessions: ✅');
    console.log('- Mentorship: ✅');
    console.log('- Payments: ✅');
    console.log('- Certificates: ✅');
    console.log('- Replays: ✅');
    console.log('- Ratings: ✅');
    console.log('- Notifications: ✅');

  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
