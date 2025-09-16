const axios = require('axios');

// Test payment endpoints
async function testPaymentEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Payment Integration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Server is running:', healthResponse.data.status);
    
    // Test 2: Check payment routes are available
    console.log('\n2️⃣ Testing payment routes availability...');
    const routesResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    if (routesResponse.data.endpoints.payments) {
      console.log('✅ Payment routes are configured');
    } else {
      console.log('❌ Payment routes not found');
    }

    console.log('\n🎉 Payment integration test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login as a learner');
    console.log('3. Go to Courses page');
    console.log('4. Try to enroll in a course');
    console.log('5. You should see the payment modal');
    console.log('6. Enter your email and click "Pay Now"');
    console.log('7. You will be redirected to Paystack payment page');
    console.log('8. After payment, you will be redirected back to verify payment');
    console.log('9. If payment is successful, you will be enrolled in the course');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
}

testPaymentEndpoints();
