require('dotenv').config();
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testPaymentInitialization() {
  try {
    console.log('🧪 Testing Payment Initialization...\n');

    // Generate unique email and phone
    const timestamp = Date.now();
    const uniqueEmail = `paymenttest${timestamp}@example.com`;
    const uniquePhone = `08012345${timestamp.toString().slice(-4)}`;

    console.log('🔍 Using unique credentials:', { email: uniqueEmail, phone: uniquePhone });

    // Step 1: Register a new user
    console.log('\n🔍 Step 1: Registering new user...');
    let userToken;

    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        name: 'Test Payment User',
        email: uniqueEmail,
        password: 'password123',
        phone: uniquePhone,
        role: 'learner'
      });

      if (registerResponse.data.success) {
        console.log('✅ User registered successfully');
        userToken = registerResponse.data.data.token;
      } else {
        throw new Error('Failed to register user: ' + registerResponse.data.message);
      }
    } catch (registerError) {
      console.log('❌ Registration failed:', registerError.response?.data?.message || registerError.message);
      return;
    }

    // Step 2: Get available courses
    console.log('\n🔍 Step 2: Getting available courses...');
    let courseId;
    let coursePrice;

    try {
      const coursesResponse = await axios.get(`${baseURL}/courses?status=published&isApproved=true`);
      
      if (coursesResponse.data.success && coursesResponse.data.data.length > 0) {
        const course = coursesResponse.data.data[0]; // Get first available course
        courseId = course._id;
        coursePrice = course.price;
        console.log('✅ Found course:', { id: courseId, title: course.title, price: coursePrice });
      } else {
        throw new Error('No courses available');
      }
    } catch (coursesError) {
      console.log('❌ Failed to get courses:', coursesError.response?.data?.message || coursesError.message);
      return;
    }

    // Step 3: Initialize payment
    console.log('\n🔍 Step 3: Initializing payment...');
    
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
        console.log('✅ Payment initialized successfully');
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
        console.log('🔍 400 Bad Request - Checking possible causes:');
        console.log('- Course ID valid:', !!courseId);
        console.log('- Amount valid:', !!coursePrice);
        console.log('- Email valid:', !!uniqueEmail);
        console.log('- Token valid:', !!userToken);
        console.log('- Paystack configured:', !!(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_SECRET_KEY !== 'sk_test_your_secret_key_here'));
      }
    }

    console.log('\n🎯 Payment initialization testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📝 Error details:', error.response.data);
    }
  }
}

// Run the test
testPaymentInitialization();
