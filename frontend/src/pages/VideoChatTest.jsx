import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StreamVideoCall from '../components/liveclass/StreamVideoCall';
import { liveClassService } from '../services/liveClassService';
import { toast } from 'react-toastify';

const VideoChatTest = () => {
  const { user } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [streamToken, setStreamToken] = useState(null);
  const [callId, setCallId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startTestCall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate a test call ID
      const testCallId = `test-call-${Date.now()}`;
      
      // For testing, we'll create a mock token
      // In a real scenario, you'd get this from your backend
      const mockToken = 'mock-token-for-testing';
      
      setStreamToken(mockToken);
      setCallId(testCallId);
      setIsInCall(true);
      
      toast.success('Test video call started!');
    } catch (error) {
      console.error('Error starting test call:', error);
      setError('Failed to start test call. Please check your connection and permissions.');
      toast.error('Failed to start test call');
    } finally {
      setIsLoading(false);
    }
  };

  const endTestCall = () => {
    setIsInCall(false);
    setStreamToken(null);
    setCallId(null);
    toast.success('Test call ended');
  };

  if (isInCall && callId && streamToken) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-semibold">Video Chat Test</h1>
            <p className="text-gray-300 text-sm">Call ID: {callId}</p>
          </div>
          <button
            onClick={endTestCall}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            End Test Call
          </button>
        </div>
        
        <div className="h-[calc(100vh-80px)]">
          <StreamVideoCall
            callId={callId}
            streamToken={streamToken}
            isHost={true}
            onCallEnd={endTestCall}
            settings={{}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎥</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Video Chat Test</h1>
          <p className="text-gray-600 mb-6">
            Test your video chat functionality with camera and microphone access.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p><strong>User:</strong> {user?.name}</p>
              <p><strong>Role:</strong> {user?.role}</p>
            </div>
            
            <button
              onClick={startTestCall}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Starting Test Call...</span>
                </>
              ) : (
                <>
                  <span>🎥</span>
                  <span>Start Test Video Call</span>
                </>
              )}
            </button>
            
            <div className="text-xs text-gray-500">
              <p>This will test:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Camera access and display</li>
                <li>Microphone functionality</li>
                <li>Stream.io integration</li>
                <li>Video call controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatTest;
