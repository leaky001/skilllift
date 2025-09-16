const axios = require('axios');

// Test Payment Flow for Paystack Test Mode
class TestPaymentFlow {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.testData = {
      // Test user data
      user: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '08012345678',
        role: 'learner'
      },
      
      // Test course data
      course: {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        price: 5000, // 5000 Naira
        category: 'Technology',
        courseType: 'online-prerecorded'
      },
      
      // Test payment data
      payment: {
        amount: 5000,
        email: 'test@example.com'
      }
    };
  }

  // Step 1: Register a test user
  async registerTestUser() {
    console.log('🔐 Step 1: Registering test user...');
    
    try {
      const response = await axios.post(`${this.baseURL}/auth/register`, {
        name: this.testData.user.name,
        email: this.testData.user.email,
        password: this.testData.user.password,
        phone: this.testData.user.phone,
        role: this.testData.user.role
      });

      if (response.data.success) {
        console.log('✅ User registered successfully');
        console.log('👤 User ID:', response.data.data._id);
        console.log('🔑 Token:', response.data.data.token);
        return response.data.data;
      } else {
        console.log('❌ User registration failed:', response.data.message);
        return null;
      }
    } catch (error) {
      console.log('❌ User registration error:', error.response?.data?.message || error.message);
      return null;
    }
  }

  // Step 2: Login the test user
  async loginTestUser() {
    console.log('🔐 Step 2: Logging in test user...');
    
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.testData.user.email,
        password: this.testData.user.password,
        role: this.testData.user.role
      });

      if (response.data.success) {
        console.log('✅ User logged in successfully');
        console.log('🔑 Token:', response.data.data.token);
        return response.data.data;
      } else {
        console.log('❌ User login failed:', response.data.message);
        return null;
      }
    } catch (error) {
      console.log('❌ User login error:', error.response?.data?.message || error.message);
      return null;
    }
  }

  // Step 3: Create a test course (as tutor)
  async createTestCourse(authToken) {
    console.log('📚 Step 3: Creating test course...');
    
    try {
      const response = await axios.post(`${this.baseURL}/courses`, {
        title: this.testData.course.title,
        description: this.testData.course.description,
        price: this.testData.course.price,
        category: this.testData.course.category,
        courseType: this.testData.course.courseType,
        level: 'beginner',
        language: 'English',
        duration: '4 weeks'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ Course created successfully');
        console.log('📚 Course ID:', response.data.data._id);
        return response.data.data;
      } else {
        console.log('❌ Course creation failed:', response.data.message);
        return null;
      }
    } catch (error) {
      console.log('❌ Course creation error:', error.response?.data?.message || error.message);
      return null;
    }
  }

  // Step 4: Get available courses
  async getAvailableCourses() {
    console.log('📚 Step 4: Getting available courses...');
    
    try {
      const response = await axios.get(`${this.baseURL}/courses`);

      if (response.data.success) {
        console.log('✅ Courses retrieved successfully');
        console.log('📚 Number of courses:', response.data.data.length);
        return response.data.data;
      } else {
        console.log('❌ Failed to get courses:', response.data.message);
        return [];
      }
    } catch (error) {
      console.log('❌ Get courses error:', error.response?.data?.message || error.message);
      return [];
    }
  }

  // Step 5: Initialize payment
  async initializePayment(authToken, courseId) {
    console.log('💳 Step 5: Initializing payment...');
    
    try {
      const response = await axios.post(`${this.baseURL}/payments/initialize`, {
        courseId: courseId,
        amount: this.testData.payment.amount,
        email: this.testData.payment.email
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ Payment initialized successfully');
        console.log('🔗 Authorization URL:', response.data.data.authorizationUrl);
        console.log('📝 Reference:', response.data.data.reference);
        console.log('💳 Payment ID:', response.data.data.paymentId);
        return response.data.data;
      } else {
        console.log('❌ Payment initialization failed:', response.data.message);
        return null;
      }
    } catch (error) {
      console.log('❌ Payment initialization error:', error.response?.data?.message || error.message);
      return null;
    }
  }

  // Step 6: Simulate payment verification (for testing)
  async simulatePaymentVerification(reference) {
    console.log('✅ Step 6: Simulating payment verification...');
    console.log('📝 Reference:', reference);
    
    // In test mode, we can simulate a successful payment
    console.log('🎉 Payment simulation completed successfully!');
    console.log('💰 Amount: ₦' + this.testData.payment.amount);
    console.log('📚 Course: ' + this.testData.course.title);
    
    return {
      success: true,
      reference: reference,
      status: 'success'
    };
  }

  // Step 7: Get payment history
  async getPaymentHistory(authToken) {
    console.log('📋 Step 7: Getting payment history...');
    
    try {
      const response = await axios.get(`${this.baseURL}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        console.log('✅ Payment history retrieved successfully');
        console.log('📋 Number of payments:', response.data.data.length);
        return response.data.data;
      } else {
        console.log('❌ Failed to get payment history:', response.data.message);
        return [];
      }
    } catch (error) {
      console.log('❌ Get payment history error:', error.response?.data?.message || error.message);
      return [];
    }
  }

  // Run complete test flow
  async runCompleteTestFlow() {
    console.log('🚀 Starting Complete Test Payment Flow...\n');
    
    // Step 1: Register user
    const userData = await this.registerTestUser();
    if (!userData) {
      console.log('❌ Test flow stopped: User registration failed');
      return;
    }
    
    // Step 2: Login user
    const loginData = await this.loginTestUser();
    if (!loginData) {
      console.log('❌ Test flow stopped: User login failed');
      return;
    }
    
    const authToken = loginData.token;
    
    // Step 3: Get available courses
    const courses = await this.getAvailableCourses();
    if (courses.length === 0) {
      console.log('❌ Test flow stopped: No courses available');
      return;
    }
    
    const courseId = courses[0]._id; // Use first available course
    console.log('📚 Using course:', courses[0].title);
    
    // Step 4: Initialize payment
    const paymentData = await this.initializePayment(authToken, courseId);
    if (!paymentData) {
      console.log('❌ Test flow stopped: Payment initialization failed');
      return;
    }
    
    // Step 5: Simulate payment verification
    await this.simulatePaymentVerification(paymentData.reference);
    
    // Step 6: Get payment history
    await this.getPaymentHistory(authToken);
    
    console.log('\n🎉 Test Payment Flow Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('👤 User:', this.testData.user.name);
    console.log('📚 Course:', this.testData.course.title);
    console.log('💰 Amount: ₦' + this.testData.payment.amount);
    console.log('🔗 Payment URL:', paymentData.authorizationUrl);
    
    console.log('\n💡 Next Steps:');
    console.log('1. Visit the authorization URL to complete payment');
    console.log('2. Use test card: 4084 0840 8408 4081');
    console.log('3. Expiry: 12/25, CVV: 123, PIN: 1234');
    console.log('4. Complete the payment flow');
  }
}

// Export the test class
module.exports = TestPaymentFlow;

// If running this file directly, execute the test
if (require.main === module) {
  const testFlow = new TestPaymentFlow();
  testFlow.runCompleteTestFlow().catch(console.error);
}
