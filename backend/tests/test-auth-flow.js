const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  console.log('🔐 Testing Authentication Flow');
  console.log('================================');

  try {
    // Step 1: Register a new user
    console.log('\n1️⃣ Registering a new user...');
    const registerData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'learner',
      phone: `+234${Date.now()}`
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('   User ID:', registerResponse.data.data.user._id);
    console.log('   Token:', registerResponse.data.data.token.substring(0, 20) + '...');

    const token = registerResponse.data.data.token;

    // Step 2: Test protected route with the token
    console.log('\n2️⃣ Testing protected route...');
    const protectedResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected route access successful');
    console.log('   User profile:', protectedResponse.data.data.name);

    // Step 3: Test live sessions route
    console.log('\n3️⃣ Testing live sessions route...');
    const liveSessionsResponse = await axios.get(`${API_BASE_URL}/live-sessions/public`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Live sessions route access successful');
    console.log('   Sessions found:', liveSessionsResponse.data.data?.length || 0);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.log('\n❌ Authentication test failed');
    console.log('   Error:', error.response?.data?.message || error.message);
    console.log('   Status:', error.response?.status);
    console.log('   URL:', error.config?.url);
  }
}

testAuthentication();
