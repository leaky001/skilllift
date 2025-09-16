// Simple test to check if courses are being created and retrieved
const axios = require('axios');

async function testCoursesAPI() {
  try {
    console.log('🔍 Testing courses API...');
    
    // Test 1: Check if backend is running
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend is running');
    
    // Test 2: Check public courses endpoint
    console.log('\n2. Testing public courses endpoint...');
    const publicCoursesResponse = await axios.get('http://localhost:3001/api/courses');
    console.log('✅ Public courses endpoint working');
    console.log(`📚 Found ${publicCoursesResponse.data.data?.length || 0} public courses`);
    
    // Test 3: Check if we can access tutor courses without auth (should fail)
    console.log('\n3. Testing tutor courses without auth (should fail)...');
    try {
      await axios.get('http://localhost:3001/api/courses/tutor/my-courses');
      console.log('❌ This should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected without auth:', error.response?.status);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Open browser console (F12)');
    console.log('2. Go to /tutor/courses');
    console.log('3. Check for any error messages');
    console.log('4. Look for authentication issues');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCoursesAPI();
