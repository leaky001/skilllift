const axios = require('axios');

// Complete Test Payment Flow with Authentication
async function testCompletePaymentFlow() {
  console.log('🚀 Testing Complete Payment Flow with Paystack Test Mode\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Step 1: Test if server is running
    console.log('🔍 Step 1: Checking if server is running...');
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);
    
    // Step 2: Try to login with existing user or register new one
    console.log('\n🔐 Step 2: Authenticating user...');
    let userToken;
    
    try {
      // Try to login first with existing user
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'paymenttest@example.com',
        password: 'password123',
        role: 'learner'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ User logged in successfully');
        userToken = loginResponse.data.data.token;
      }
    } catch (loginError) {
      // If login fails, try to register with a different email
      console.log('⚠️  Login failed, trying to register with new email...');
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        name: 'Test Payment User',
        email: 'paymenttest4@example.com',
        password: 'password123',
        phone: '08012345683',
        role: 'learner'
      });
      
      if (registerResponse.data.success) {
        console.log('✅ User registered successfully');
        userToken = registerResponse.data.data.token;
      } else {
        throw new Error('Failed to register user: ' + registerResponse.data.message);
      }
    }
    
    if (!userToken) {
      throw new Error('Failed to authenticate user');
    }
    
    // Step 3: Get available courses
    console.log('\n📚 Step 3: Getting available courses...');
    const coursesResponse = await axios.get(`${baseURL}/courses`);
    console.log('✅ Courses available:', coursesResponse.data.data.length);
    
    if (coursesResponse.data.data.length > 0) {
      const course = coursesResponse.data.data[0];
      console.log('📚 Using course:', course.title);
      console.log('💰 Price: ₦' + course.price);
      
      // Step 4: Test payment initialization with authentication
      console.log('\n💳 Step 4: Testing payment initialization...');
      
      try {
        const paymentResponse = await axios.post(`${baseURL}/payments/initialize`, {
          courseId: course._id,
          amount: course.price,
          email: 'paymenttest4@example.com'
        }, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Payment initialized successfully!');
        console.log('🔗 Authorization URL:', paymentResponse.data.data.authorizationUrl);
        console.log('📝 Reference:', paymentResponse.data.data.reference);
        console.log('💳 Payment ID:', paymentResponse.data.data.paymentId);
        
        console.log('\n🎉 Payment Flow Test Completed Successfully!');
        console.log('\n💡 Next Steps:');
        console.log('1. Visit the authorization URL to complete payment');
        console.log('2. Use test card: 4084 0840 8408 4081');
        console.log('3. Expiry: 12/25, CVV: 123, PIN: 1234');
        console.log('4. Complete the payment flow');
        
      } catch (paymentError) {
        console.log('❌ Payment initialization failed:');
        console.log('📝 Message:', paymentError.response?.data?.message);
        
        if (paymentError.response?.data?.message?.includes('Paystack is not configured')) {
          console.log('\n💡 Solution:');
          console.log('1. Create a .env file in your backend directory');
          console.log('2. Add your Paystack test keys:');
          console.log('   PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key');
          console.log('   PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key');
          console.log('3. Restart your backend server');
          console.log('4. Run this test again');
        }
      }
    } else {
      console.log('❌ No courses available for testing');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response?.data?.message) {
      console.log('📝 Error details:', error.response.data.message);
    }
  }
}

// Run the test
testCompletePaymentFlow();
