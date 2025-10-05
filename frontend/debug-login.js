// Comprehensive Login Debug Script
console.log('🔍 Starting comprehensive login debug...');

// Test 1: Check API URL configuration
console.log('🔧 Testing API URL configuration...');
const apiUrl = 'http://localhost:5000/api';
console.log('API URL:', apiUrl);

// Test 2: Test backend connection
async function testBackendConnection() {
  try {
    console.log('🌐 Testing backend connection...');
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      })
    });
    
    const data = await response.json();
    console.log('✅ Backend response:', data);
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User data:', data.data);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Backend connection error:', error);
  }
}

// Test 3: Test with different roles
async function testRoleValidation() {
  console.log('🔐 Testing role validation...');
  
  const testCases = [
    { email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { email: 'admin@test.com', password: 'admin123', role: 'tutor' }, // Should fail
    { email: 'admin@test.com', password: 'admin123', role: 'learner' }, // Should fail
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`🧪 Testing: ${testCase.email} as ${testCase.role}`);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase)
      });
      
      const data = await response.json();
      console.log(`Result for ${testCase.role}:`, data);
      
    } catch (error) {
      console.error(`Error for ${testCase.role}:`, error);
    }
  }
}

// Test 4: Check frontend environment
function checkFrontendEnvironment() {
  console.log('🔧 Checking frontend environment...');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_STREAM_API_KEY:', import.meta.env.VITE_STREAM_API_KEY);
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
}

// Test 5: Check session storage
function checkSessionStorage() {
  console.log('💾 Checking session storage...');
  const keys = Object.keys(sessionStorage);
  console.log('Session storage keys:', keys);
  
  keys.forEach(key => {
    if (key.includes('skilllift')) {
      console.log(`${key}:`, sessionStorage.getItem(key));
    }
  });
}

// Run all tests
async function runAllTests() {
  checkFrontendEnvironment();
  checkSessionStorage();
  await testBackendConnection();
  await testRoleValidation();
  
  console.log('🎯 Debug complete! Check the results above.');
}

// Run the tests
runAllTests();
