// Test script to verify tutor dashboard API
// Run this in browser console on the tutor dashboard page

async function testTutorDashboardAPI() {
    console.log('🧪 Testing Tutor Dashboard API...');
    
    try {
        // Test the dashboard stats endpoint
        const response = await fetch('/api/tutor/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('skilllift_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', data);
            
            if (data.success && data.data) {
                console.log('✅ Dashboard stats loaded successfully!');
                console.log('📊 Stats count:', data.data.length);
                
                data.data.forEach((stat, index) => {
                    console.log(`📊 Stat ${index + 1}:`, {
                        title: stat.title,
                        value: stat.value,
                        change: stat.change,
                        icon: stat.icon
                    });
                });
                
                return data;
            } else {
                console.error('❌ API response format incorrect:', data);
                return null;
            }
        } else {
            console.error('❌ API request failed:', response.status, response.statusText);
            const errorData = await response.text();
            console.error('❌ Error details:', errorData);
            return null;
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
        return null;
    }
}

// Test authentication
async function testAuthentication() {
    console.log('🔐 Testing authentication...');
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('skilllift_token');
    const user = localStorage.getItem('user') || sessionStorage.getItem('skilllift_user');
    
    console.log('🔐 Token found:', !!token);
    console.log('🔐 User found:', !!user);
    
    if (token) {
        console.log('🔐 Token preview:', token.substring(0, 20) + '...');
    }
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('🔐 User data:', {
                name: userData.name,
                role: userData.role,
                email: userData.email
            });
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
        }
    }
    
    return { token, user };
}

// Main test function
async function runDashboardTests() {
    console.log('🚀 Starting Tutor Dashboard Tests...\n');
    
    // Test 1: Authentication
    console.log('Test 1: Authentication');
    const authResult = await testAuthentication();
    console.log('');
    
    // Test 2: Dashboard API
    console.log('Test 2: Dashboard API');
    const apiResult = await testDashboardAPI();
    console.log('');
    
    // Summary
    console.log('📊 Test Summary:');
    console.log('================');
    console.log(`Authentication: ${authResult.token ? '✅' : '❌'}`);
    console.log(`Dashboard API: ${apiResult ? '✅' : '❌'}`);
    
    if (apiResult && apiResult.success) {
        console.log('🎉 All tests passed! Dashboard should be working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the issues above.');
    }
    
    return { authResult, apiResult };
}

// Export for use
window.dashboardTests = {
    testTutorDashboardAPI,
    testAuthentication,
    runDashboardTests
};

console.log('🧪 Dashboard test functions loaded. Run dashboardTests.runDashboardTests() to start testing.');

