// Detailed Payment Test
console.log('🧪 Detailed Payment Test...');
console.log('='.repeat(50));

// Test 1: Check if server is responding
console.log('1. Testing server connection...');
fetch('http://localhost:3001/health')
  .then(response => {
    console.log('✅ Server responding:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Health data:', data.status);
    
    // Test 2: Check payment endpoint
    console.log('\n2. Testing payment endpoint...');
    return fetch('http://localhost:3001/api/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: JSON.stringify({
        courseId: '507f1f77bcf86cd799439012',
        amount: 5000,
        email: 'test@example.com'
      })
    });
  })
  .then(response => {
    console.log('Payment endpoint status:', response.status);
    if (!response.ok) {
      return response.text().then(text => {
        console.log('Error response:', text);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ Payment response:', data);
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  });
