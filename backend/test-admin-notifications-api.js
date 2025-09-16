const axios = require('axios');

async function testAdminNotificationsAPI() {
  try {
    console.log('🔗 Testing admin notifications API...');
    
    // First, let's login as admin to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com', // Correct admin email from database
      password: 'admin123', // Reset password
      role: 'admin' // Required role field
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed with admin@test.com');
      console.log('Response:', loginResponse.data);
      return;
    }
    
    var token = loginResponse.data.data.token;
    
    console.log('✅ Admin login successful');
    
    // Now test the admin notifications endpoint
    const notificationsResponse = await axios.get('http://localhost:3001/api/admin/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Admin notifications API response:');
    console.log('Status:', notificationsResponse.status);
    console.log('Success:', notificationsResponse.data.success);
    console.log('Data count:', notificationsResponse.data.data?.length || 0);
    
    if (notificationsResponse.data.data && notificationsResponse.data.data.length > 0) {
      console.log('\n📋 Sample notifications:');
      notificationsResponse.data.data.slice(0, 3).forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.title}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Status: ${notification.status}`);
        console.log(`   Priority: ${notification.priority}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No notifications returned by API');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - check admin credentials');
    } else if (error.response?.status === 404) {
      console.log('🔍 API endpoint not found - check if server is running');
    }
  }
}

// Run the test
testAdminNotificationsAPI();
