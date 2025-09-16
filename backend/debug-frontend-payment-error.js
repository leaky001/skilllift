require('dotenv').config();
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function debugFrontendPaymentError() {
  try {
    console.log('🔍 Debugging Frontend Payment 400 Error...\n');

    // Step 1: Check if backend is accessible
    console.log('🔍 Step 1: Checking backend accessibility...');
    try {
      const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
      console.log('✅ Backend is accessible');
    } catch (healthError) {
      console.log('❌ Backend not accessible:', healthError.message);
      return;
    }

    // Step 2: Check available courses
    console.log('\n🔍 Step 2: Checking available courses...');
    let courseId;
    let coursePrice;
    
    try {
      const coursesResponse = await axios.get(`${baseURL}/courses?status=published&isApproved=true`);
      if (coursesResponse.data.success && coursesResponse.data.data.length > 0) {
        const course = coursesResponse.data.data[0];
        courseId = course._id;
        coursePrice = course.price;
        console.log('✅ Found course:', { id: courseId, title: course.title, price: coursePrice });
      } else {
        console.log('❌ No courses available');
        return;
      }
    } catch (coursesError) {
      console.log('❌ Failed to get courses:', coursesError.response?.data?.message || coursesError.message);
      return;
    }

    // Step 3: Test payment initialization without authentication (should fail with 401)
    console.log('\n🔍 Step 3: Testing payment without authentication...');
    try {
      const noAuthResponse = await axios.post(`${baseURL}/payments/initialize`, {
        courseId: courseId,
        amount: coursePrice,
        email: 'test@example.com'
      });
      console.log('❌ Unexpected success without auth:', noAuthResponse.data);
    } catch (noAuthError) {
      console.log('✅ Correctly rejected without auth:', noAuthError.response?.status, noAuthError.response?.data?.message);
    }

    // Step 4: Test with invalid token
    console.log('\n🔍 Step 4: Testing payment with invalid token...');
    try {
      const invalidTokenResponse = await axios.post(`${baseURL}/payments/initialize`, {
        courseId: courseId,
        amount: coursePrice,
        email: 'test@example.com'
      }, {
        headers: {
          'Authorization': 'Bearer invalid_token_123',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Unexpected success with invalid token:', invalidTokenResponse.data);
    } catch (invalidTokenError) {
      console.log('✅ Correctly rejected with invalid token:', invalidTokenError.response?.status, invalidTokenError.response?.data?.message);
    }

    // Step 5: Test with valid user registration and token
    console.log('\n🔍 Step 5: Testing with valid user registration...');
    const timestamp = Date.now();
    const uniqueEmail = `debugtest${timestamp}@example.com`;
    const uniquePhone = `08012345${timestamp.toString().slice(-4)}`;
    
    let userToken;
    
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        name: 'Debug Test User',
        email: uniqueEmail,
        password: 'password123',
        phone: uniquePhone,
        role: 'learner'
      });

      if (registerResponse.data.success) {
        console.log('✅ User registered successfully');
        userToken = registerResponse.data.data.token;
        console.log('📝 Token received:', userToken ? 'Yes' : 'No');
        console.log('📝 Token format:', userToken ? userToken.substring(0, 20) + '...' : 'None');
      } else {
        throw new Error('Failed to register user: ' + registerResponse.data.message);
      }
    } catch (registerError) {
      console.log('❌ Registration failed:', registerError.response?.data?.message || registerError.message);
      return;
    }

    // Step 6: Test payment with valid token
    console.log('\n🔍 Step 6: Testing payment with valid token...');
    try {
      const paymentResponse = await axios.post(`${baseURL}/payments/initialize`, {
        courseId: courseId,
        amount: coursePrice,
        email: uniqueEmail
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (paymentResponse.data.success) {
        console.log('✅ Payment initialized successfully with valid token');
        console.log('📝 Payment details:', {
          reference: paymentResponse.data.data.reference,
          authorizationUrl: paymentResponse.data.data.authorizationUrl,
          paymentId: paymentResponse.data.data.paymentId
        });
      } else {
        console.log('❌ Payment initialization failed:', paymentResponse.data.message);
      }
    } catch (paymentError) {
      console.log('❌ Payment initialization error:', paymentError.response?.status);
      console.log('📝 Error details:', paymentError.response?.data);
      
      if (paymentError.response?.status === 400) {
        console.log('\n🔍 400 Bad Request Analysis:');
        console.log('- Course ID valid:', !!courseId);
        console.log('- Amount valid:', !!coursePrice);
        console.log('- Email valid:', !!uniqueEmail);
        console.log('- Token valid:', !!userToken);
        console.log('- Token format:', userToken ? userToken.substring(0, 20) + '...' : 'None');
        console.log('- Paystack configured:', !!(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_SECRET_KEY !== 'sk_test_your_secret_key_here'));
        
        // Check specific error message
        if (paymentError.response?.data?.message) {
          console.log('- Error message:', paymentError.response.data.message);
          
          if (paymentError.response.data.message.includes('authorized') || 
              paymentError.response.data.message.includes('token') ||
              paymentError.response.data.message.includes('login')) {
            console.log('🔍 Likely authentication issue');
          } else if (paymentError.response.data.message.includes('Paystack')) {
            console.log('🔍 Likely Paystack configuration issue');
          } else if (paymentError.response.data.message.includes('course')) {
            console.log('🔍 Likely course-related issue');
          }
        }
      }
    }

    console.log('\n🎯 Debugging completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('📝 Error details:', error.response.data);
    }
  }
}

// Run the debug
debugFrontendPaymentError();
