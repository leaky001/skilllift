 const axios = require('axios');

async function testPaymentFlow() {
  console.log('🧪 Testing Student Payment Flow...\n');
  
  try {
    // Test 1: Payment Initialization
    console.log('1️⃣ Testing Payment Initialization...');
    const paymentData = {
      courseId: '68ade2522ba3b04e9b7cf432', // Use the correct course ID from database
      amount: 50000, // 500 NGN in kobo
      email: 'student@example.com'
    };
    
    console.log('📤 Sending payment request:', paymentData);
    
    const response = await axios.post('http://localhost:3001/api/payments/initialize', paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment initialization successful!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      console.log('\n2️⃣ Testing Payment Verification...');
      
      // Test 2: Payment Verification
      const verifyData = {
        reference: response.data.data.reference
      };
      
      console.log('📤 Sending verification request:', verifyData);
      
      const verifyResponse = await axios.post('http://localhost:3001/api/payments/verify', verifyData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Payment verification successful!');
      console.log('📋 Response:', JSON.stringify(verifyResponse.data, null, 2));
      
      if (verifyResponse.data.success) {
        console.log('\n3️⃣ Testing Enrollment Creation...');
        
        // Test 3: Enrollment Creation
        const enrollmentData = {
          courseId: '68ade2522ba3b04e9b7cf432', // Use the same course ID
          paymentReference: response.data.data.reference,
          email: 'student@example.com'
        };
        
        console.log('📤 Sending enrollment request:', enrollmentData);
        
        const enrollmentResponse = await axios.post('http://localhost:3001/api/enrollments', enrollmentData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Enrollment creation successful!');
        console.log('📋 Response:', JSON.stringify(enrollmentResponse.data, null, 2));
        
        console.log('\n🎉 Complete Payment Flow Test PASSED!');
        console.log('✅ Students can now enroll and make payments successfully');
        
      } else {
        console.log('❌ Payment verification failed');
      }
    } else {
      console.log('❌ Payment initialization failed');
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Error:', error.response?.data?.error);
    console.log('Full response:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n🔐 Authentication Issue:');
      console.log('- Payment endpoint requires authentication');
      console.log('- Students need to be logged in to make payments');
      console.log('- Solution: Remove authentication from payment initialization');
    } else if (error.response?.status === 404) {
      console.log('\n🔍 Course Not Found:');
      console.log('- Course ID "1" does not exist in database');
      console.log('- Solution: Use a valid course ID or create test courses');
    } else if (error.response?.status === 500) {
      console.log('\n💥 Server Error:');
      console.log('- Database connection issue');
      console.log('- Payment controller error');
      console.log('- Solution: Check server logs and database connection');
    }
  }
}

testPaymentFlow();
