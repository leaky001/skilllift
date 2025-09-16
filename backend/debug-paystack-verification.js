const axios = require('axios');

async function debugPaystackIssue() {
  try {
    console.log('🔍 Debugging Paystack Payment Verification Issue...\n');
    
    // Test 1: Check Paystack configuration
    console.log('📋 Step 1: Checking Paystack Configuration');
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey || paystackKey === 'sk_test_your_secret_key_here') {
      console.log('❌ Paystack not configured properly');
      console.log('🔧 Please check your .env file');
      return;
    }
    console.log('✅ Paystack key configured\n');
    
    // Test 2: Check if we can access Paystack API
    console.log('📋 Step 2: Testing Paystack API Access');
    try {
      const testResponse = await axios.get('https://api.paystack.co/transaction/verify/test123', {
        headers: {
          'Authorization': `Bearer ${paystackKey}`
        }
      });
      console.log('✅ Paystack API accessible');
    } catch (error) {
      console.log('❌ Paystack API error:', error.response?.status);
      console.log('📄 Error message:', error.response?.data?.message);
    }
    console.log('');
    
    // Test 3: Check our backend verification endpoint
    console.log('📋 Step 3: Testing Backend Verification Endpoint');
    try {
      const backendResponse = await axios.get('http://localhost:5000/api/payments/verify?reference=test123');
      console.log('✅ Backend endpoint working');
    } catch (error) {
      console.log('❌ Backend verification error:', error.response?.status);
      console.log('📄 Error message:', error.response?.data);
    }
    
    console.log('\n🎯 **SOLUTION**:');
    console.log('The issue is that Paystack test mode has limitations.');
    console.log('Try these steps:');
    console.log('1. Use a real Paystack account (not test mode)');
    console.log('2. Or create a mock payment verification for testing');
    console.log('3. Or use Paystack\'s webhook instead of manual verification');
    
  } catch (error) {
    console.log('❌ Debug error:', error.message);
  }
}

debugPaystackIssue();
