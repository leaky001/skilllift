const axios = require('axios');

// Debug Payment Flow - Check Course Status
async function debugPaymentFlow() {
  console.log('🔍 Debugging Payment Flow...\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Step 1: Test if server is running
    console.log('🔍 Step 1: Checking if server is running...');
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Server is running:', healthResponse.data.message);
    
    // Step 2: Register a test user
    console.log('\n🔐 Step 2: Registering test user...');
    const registerResponse = await axios.post(`${baseURL}/auth/register`, {
      name: 'Debug Payment User',
      email: 'debugpayment2@example.com',
      password: 'password123',
      phone: '08012345682',
      role: 'learner'
    });
    
    if (registerResponse.data.success) {
      console.log('✅ User registered successfully');
      const userToken = registerResponse.data.data.token;
      
      // Step 3: Get available courses and check their status
      console.log('\n📚 Step 3: Getting available courses...');
      const coursesResponse = await axios.get(`${baseURL}/courses`);
      console.log('✅ Courses available:', coursesResponse.data.data.length);
      
      if (coursesResponse.data.data.length > 0) {
        const course = coursesResponse.data.data[0];
        console.log('📚 Course details:');
        console.log('   Title:', course.title);
        console.log('   Price: ₦' + course.price);
        console.log('   Status:', course.status);
        console.log('   Is Approved:', course.isApproved);
        console.log('   Course ID:', course._id);
        
        // Step 4: Test payment initialization with detailed error
        console.log('\n💳 Step 4: Testing payment initialization...');
        
        try {
                     const paymentResponse = await axios.post(`${baseURL}/payments/initialize`, {
             courseId: course._id,
             amount: course.price,
             email: 'debugpayment2@example.com'
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
          
        } catch (paymentError) {
          console.log('❌ Payment initialization failed:');
          console.log('📝 Status Code:', paymentError.response?.status);
          console.log('📝 Message:', paymentError.response?.data?.message);
          console.log('📝 Error:', paymentError.response?.data?.error);
          
          // Check if it's a course status issue
          if (paymentError.response?.data?.message?.includes('not available for purchase')) {
            console.log('\n💡 Issue: Course is not available for purchase');
            console.log('   - Check if course.status is "published"');
            console.log('   - Check if course.isApproved is true');
          }
        }
      } else {
        console.log('❌ No courses available for testing');
      }
    } else {
      console.log('❌ User registration failed:', registerResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    if (error.response?.data?.message) {
      console.log('📝 Error details:', error.response.data.message);
    }
  }
}

// Run the debug
debugPaymentFlow();
