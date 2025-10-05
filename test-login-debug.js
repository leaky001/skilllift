// Test login with different scenarios
const testLogin = async () => {
  console.log('🧪 Testing login scenarios...');
  
  // Test 1: Check if backend is responding
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
        role: 'tutor'
      })
    });
    
    const data = await response.json();
    console.log('✅ Backend response:', data);
  } catch (error) {
    console.error('❌ Backend error:', error);
  }
  
  // Test 2: Check frontend API service
  try {
    const apiResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@skilllift.com',
        password: 'admin123',
        role: 'admin'
      })
    });
    
    const apiData = await apiResponse.json();
    console.log('✅ API test response:', apiData);
  } catch (error) {
    console.error('❌ API test error:', error);
  }
};

// Run the test
testLogin();
