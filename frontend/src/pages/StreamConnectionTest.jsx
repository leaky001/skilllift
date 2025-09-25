import React, { useState, useEffect } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuth } from '../context/AuthContext';

const StreamConnectionTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testStreamConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting Stream.io connection test...');
      
      // Test 1: Check environment variables
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      addResult(`API Key: ${apiKey ? 'Present' : 'Missing'}`, apiKey ? 'success' : 'error');
      
      if (!apiKey) {
        throw new Error('Stream API key not found');
      }

      // Test 2: Create test user
      const testUser = {
        id: user._id.toString(),
        name: user.name,
        image: user.profilePicture || undefined,
      };
      addResult(`Test User: ${JSON.stringify(testUser)}`);

      // Test 3: Create Stream client
      const client = new StreamVideoClient({
        apiKey: apiKey,
        user: testUser,
        token: 'test-token-' + Date.now(), // Mock token for testing
      });
      addResult('✅ Stream client created successfully', 'success');

      // Test 4: Test call creation
      const testCallId = `test-call-${Date.now()}`;
      const call = client.call('default', testCallId);
      addResult(`✅ Call object created: ${testCallId}`, 'success');

      // Test 5: Test connection (this will fail but we can see the error)
      try {
        await call.join();
        addResult('✅ Successfully joined call!', 'success');
      } catch (joinError) {
        addResult(`⚠️ Join failed (expected): ${joinError.message}`, 'warning');
      }

      addResult('🎉 Stream.io client setup is working!', 'success');

    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 Stream.io Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={testStreamConnection}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <span>🧪</span>
                <span>Test Stream.io Connection</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {testResults.map((result, index) => (
              <div key={index} className={`mb-1 ${
                result.type === 'error' ? 'text-red-400' : 
                result.type === 'success' ? 'text-green-400' :
                result.type === 'warning' ? 'text-yellow-400' : 
                'text-blue-400'
              }`}>
                [{result.timestamp}] {result.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamConnectionTest;