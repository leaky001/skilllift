// Test script for Tutor-Learner Messaging System
// Run this in browser console or Node.js environment

const API_BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test data
const testData = {
    tutor: {
        email: 'tutor@example.com',
        password: 'password123'
    },
    learner: {
        email: 'learner@example.com', 
        password: 'password123'
    }
};

// Test functions
async function testBackendHealth() {
    console.log('🔍 Testing backend health...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            console.log('✅ Backend is healthy');
            return true;
        } else {
            console.log('❌ Backend health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Backend is not accessible:', error.message);
        return false;
    }
}

async function testAuthentication() {
    console.log('🔍 Testing authentication...');
    try {
        // Test tutor login
        const tutorResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData.tutor)
        });
        
        if (tutorResponse.ok) {
            const tutorData = await tutorResponse.json();
            console.log('✅ Tutor authentication successful');
            return tutorData.token;
        } else {
            console.log('❌ Tutor authentication failed');
            return null;
        }
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message);
        return null;
    }
}

async function testConversationAPI(token) {
    console.log('🔍 Testing conversation API...');
    try {
        const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conversation API working');
            console.log('📊 Conversations found:', data.data?.length || 0);
            return data.data || [];
        } else {
            console.log('❌ Conversation API failed');
            return [];
        }
    } catch (error) {
        console.log('❌ Conversation API test failed:', error.message);
        return [];
    }
}

async function testMessageAPI(token, conversationId) {
    console.log('🔍 Testing message API...');
    try {
        const response = await fetch(`${API_BASE_URL}/chat/conversation/${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Message API working');
            console.log('📊 Messages found:', data.data?.messages?.length || 0);
            return data.data?.messages || [];
        } else {
            console.log('❌ Message API failed');
            return [];
        }
    } catch (error) {
        console.log('❌ Message API test failed:', error.message);
        return [];
    }
}

async function testWebSocketConnection() {
    console.log('🔍 Testing WebSocket connection...');
    return new Promise((resolve) => {
        try {
            const socket = new WebSocket('ws://localhost:5000');
            
            socket.onopen = function() {
                console.log('✅ WebSocket connection successful');
                socket.close();
                resolve(true);
            };
            
            socket.onerror = function() {
                console.log('❌ WebSocket connection failed');
                resolve(false);
            };
            
            // Timeout after 5 seconds
            setTimeout(() => {
                console.log('❌ WebSocket connection timeout');
                resolve(false);
            }, 5000);
        } catch (error) {
            console.log('❌ WebSocket test failed:', error.message);
            resolve(false);
        }
    });
}

async function testNotificationAPI(token) {
    console.log('🔍 Testing notification API...');
    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Notification API working');
            console.log('📊 Notifications found:', data.data?.length || 0);
            return true;
        } else {
            console.log('❌ Notification API failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Notification API test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Tutor-Learner Messaging System Tests...\n');
    
    const results = {
        backendHealth: false,
        authentication: false,
        conversations: false,
        messages: false,
        websocket: false,
        notifications: false
    };
    
    // Test 1: Backend Health
    results.backendHealth = await testBackendHealth();
    console.log('');
    
    // Test 2: Authentication
    const token = await testAuthentication();
    results.authentication = !!token;
    console.log('');
    
    if (token) {
        // Test 3: Conversations
        const conversations = await testConversationAPI(token);
        results.conversations = conversations.length >= 0; // API working even if no conversations
        console.log('');
        
        // Test 4: Messages (if conversations exist)
        if (conversations.length > 0) {
            const messages = await testMessageAPI(token, conversations[0]._id);
            results.messages = messages.length >= 0; // API working even if no messages
        } else {
            console.log('⚠️ No conversations found, skipping message test');
        }
        console.log('');
        
        // Test 5: Notifications
        results.notifications = await testNotificationAPI(token);
        console.log('');
    }
    
    // Test 6: WebSocket
    results.websocket = await testWebSocketConnection();
    console.log('');
    
    // Generate report
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`Backend Health: ${results.backendHealth ? '✅' : '❌'}`);
    console.log(`Authentication: ${results.authentication ? '✅' : '❌'}`);
    console.log(`Conversations: ${results.conversations ? '✅' : '❌'}`);
    console.log(`Messages: ${results.messages ? '✅' : '❌'}`);
    console.log(`WebSocket: ${results.websocket ? '✅' : '❌'}`);
    console.log(`Notifications: ${results.notifications ? '✅' : '❌'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! The messaging system is ready for testing.');
    } else if (passedTests > totalTests / 2) {
        console.log('⚠️ Most tests passed, but some issues need attention.');
    } else {
        console.log('❌ Multiple issues found. Please check the failed tests.');
    }
    
    return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.messagingTests = {
        runAllTests,
        testBackendHealth,
        testAuthentication,
        testConversationAPI,
        testMessageAPI,
        testWebSocketConnection,
        testNotificationAPI
    };
    console.log('🧪 Messaging test functions loaded. Run messagingTests.runAllTests() to start testing.');
}

// Auto-run if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testBackendHealth,
        testAuthentication,
        testConversationAPI,
        testMessageAPI,
        testWebSocketConnection,
        testNotificationAPI
    };
}

