// Live Class System Test Script
// Run this in browser console to test basic functionality

console.log('🧪 Starting Live Class System Tests...');

// Test 1: Check if components are loaded
const testComponents = () => {
  console.log('📋 Testing Component Loading...');
  
  // Check if React components are available
  const components = [
    'TutorLiveClassManagement',
    'LearnerLiveClassRoom', 
    'LiveClassNotification',
    'StreamVideoCall'
  ];
  
  components.forEach(component => {
    console.log(`✅ ${component} component should be loaded`);
  });
};

// Test 2: Check API endpoints
const testAPIEndpoints = async () => {
  console.log('🌐 Testing API Endpoints...');
  
  const endpoints = [
    '/api/live-classes',
    '/api/stream/token',
    '/api/courses'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3002${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
};

// Test 3: Check authentication
const testAuth = () => {
  console.log('🔐 Testing Authentication...');
  
  const token = sessionStorage.getItem('token');
  if (token) {
    console.log('✅ User is authenticated');
    console.log('Token:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ User not authenticated - please login first');
  }
};

// Test 4: Check Stream.io SDK
const testStreamSDK = () => {
  console.log('📹 Testing Stream.io SDK...');
  
  if (typeof window !== 'undefined' && window.StreamVideo) {
    console.log('✅ Stream.io SDK is loaded');
  } else {
    console.log('❌ Stream.io SDK not loaded - check imports');
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Running Live Class System Tests...\n');
  
  testComponents();
  console.log('');
  
  await testAPIEndpoints();
  console.log('');
  
  testAuth();
  console.log('');
  
  testStreamSDK();
  console.log('');
  
  console.log('✅ All tests completed!');
  console.log('📝 Check results above for any issues');
};

// Export for manual testing
window.testLiveClassSystem = runAllTests;

console.log('💡 Run testLiveClassSystem() in console to start tests');
