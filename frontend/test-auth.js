// Test script to check authentication
console.log('🔐 Testing authentication...');
console.log('Token in localStorage:', localStorage.getItem('token'));
console.log('Token length:', localStorage.getItem('token')?.length);

// Test the Stream API endpoint
const testStreamAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    
    const response = await fetch('http://localhost:3001/api/stream/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: '68c74fd58c47657e364d6877',
        userName: 'muiz'
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Success response:', data);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testStreamAPI();
