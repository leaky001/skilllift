const axios = require('axios');

async function testServerConnection() {
  console.log('🔍 Testing Server Connection');
  console.log('============================');

  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running');
    console.log('   Status:', healthResponse.status);
    console.log('   Message:', healthResponse.data.message);
    console.log('   Endpoints:', Object.keys(healthResponse.data.endpoints).length);

    // Test auth endpoint
    console.log('\n2️⃣ Testing auth endpoint...');
    const authResponse = await axios.get('http://localhost:5000/api/auth');
    console.log('✅ Auth endpoint accessible');
    console.log('   Status:', authResponse.status);

  } catch (error) {
    console.log('\n❌ Server connection failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Please start the server with:');
      console.log('   node server.js');
    }
  }
}

testServerConnection();
