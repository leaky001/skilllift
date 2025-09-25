import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaVideoSlash, FaPlay, FaStop, FaExclamationTriangle } from 'react-icons/fa';
import streamTokenService from '../services/streamTokenService';

const StreamSDKDebugger = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [streamClient, setStreamClient] = useState(null);
  const [streamCall, setStreamCall] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testStreamSDK = async () => {
    try {
      addLog('🚀 Starting Stream SDK test...');
      setError(null);

      // Test 1: Check environment variables
      addLog('🔍 Checking environment variables...');
      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      const apiSecret = import.meta.env.VITE_STREAM_API_SECRET;
      
      addLog(`API Key: ${apiKey ? 'Present' : 'Missing'}`);
      addLog(`API Secret: ${apiSecret ? 'Present' : 'Missing'}`);
      
      if (!apiKey || !apiSecret) {
        throw new Error('Stream API credentials not found in environment variables');
      }

      // Test 2: Generate token
      addLog('🔑 Generating Stream token...');
      const token = await streamTokenService.generateToken('test-user-123', 'Test User', null, true);
      addLog(`✅ Token generated: ${token.substring(0, 50)}...`);

      // Test 3: Create client
      addLog('🎥 Creating Stream client...');
      const client = await streamTokenService.createClient('test-user-123', 'Test User', token);
      setStreamClient(client);
      addLog('✅ Stream client created successfully');

      // Test 4: Create call
      addLog('📞 Creating Stream call...');
      const callId = `test-call-${Date.now()}`;
      const call = client.call('default', callId);
      setStreamCall(call);
      addLog(`✅ Stream call created: ${callId}`);

      // Test 5: Join call
      addLog('🚪 Joining Stream call...');
      await call.join({ create: true });
      addLog('✅ Successfully joined Stream call');
      setIsConnected(true);

      // Test 6: Set up event listeners
      addLog('👂 Setting up event listeners...');
      
      call.on('call.local_participant_updated', (event) => {
        addLog(`🎥 Local participant updated: ${JSON.stringify({
          hasVideoTrack: !!event.participant.videoTrack,
          hasAudioTrack: !!event.participant.audioTrack,
          videoTrackId: event.participant.videoTrack?.id,
          audioTrackId: event.participant.audioTrack?.id
        })}`);
        
        if (event.participant.videoTrack) {
          setLocalVideoTrack(event.participant.videoTrack);
          attachVideoTrack(event.participant.videoTrack);
        }
      });

      call.on('call.camera_updated', (event) => {
        addLog(`📹 Camera updated: enabled=${event.enabled}, hasVideoTrack=${!!event.participant?.videoTrack}`);
        
        if (event.enabled && event.participant?.videoTrack) {
          setLocalVideoTrack(event.participant.videoTrack);
          attachVideoTrack(event.participant.videoTrack);
        }
      });

      // Test 7: Enable camera
      addLog('📹 Enabling camera...');
      await call.camera.enable();
      addLog('✅ Camera enabled successfully');

      // Test 8: Check for video track after a delay
      setTimeout(() => {
        addLog('🔍 Checking for video track after camera enable...');
        const localParticipant = call.state.localParticipant;
        addLog(`Local participant state: ${JSON.stringify({
          hasVideoTrack: !!localParticipant?.videoTrack,
          hasAudioTrack: !!localParticipant?.audioTrack,
          videoTrackId: localParticipant?.videoTrack?.id,
          audioTrackId: localParticipant?.audioTrack?.id
        })}`);
        
        if (localParticipant?.videoTrack) {
          setLocalVideoTrack(localParticipant.videoTrack);
          attachVideoTrack(localParticipant.videoTrack);
        }
      }, 2000);

    } catch (error) {
      addLog(`❌ Stream SDK test failed: ${error.message}`, 'error');
      setError(error.message);
    }
  };

  const attachVideoTrack = (videoTrack) => {
    if (videoRef.current && videoTrack) {
      try {
        const stream = new MediaStream([videoTrack.mediaStreamTrack]);
        videoRef.current.srcObject = stream;
        addLog('✅ Video track attached to video element');
        
        videoRef.current.play().catch(err => {
          addLog(`⚠️ Video play error: ${err.message}`, 'warning');
        });
      } catch (error) {
        addLog(`❌ Error attaching video track: ${error.message}`, 'error');
      }
    } else {
      addLog('❌ Cannot attach video track: missing ref or track', 'error');
    }
  };

  const enableCamera = async () => {
    if (streamCall) {
      try {
        addLog('🎥 Enabling camera...');
        await streamCall.camera.enable();
        addLog('✅ Camera enabled');
      } catch (error) {
        addLog(`❌ Error enabling camera: ${error.message}`, 'error');
      }
    }
  };

  const disableCamera = async () => {
    if (streamCall) {
      try {
        addLog('🎥 Disabling camera...');
        await streamCall.camera.disable();
        addLog('✅ Camera disabled');
      } catch (error) {
        addLog(`❌ Error disabling camera: ${error.message}`, 'error');
      }
    }
  };

  const cleanup = () => {
    if (streamCall) {
      streamCall.leave();
      addLog('🚪 Left Stream call');
    }
    if (streamClient) {
      streamClient.disconnectUser();
      addLog('🔌 Disconnected from Stream');
    }
    setIsConnected(false);
    setStreamClient(null);
    setStreamCall(null);
    setLocalVideoTrack(null);
  };

  useEffect(() => {
    addLog('🚀 Stream SDK Debugger initialized');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🎥 Stream SDK Debugger</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📹 Stream SDK Video</h2>
            
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              {!localVideoTrack && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                  <div className="text-center">
                    <FaVideoSlash className="text-4xl mx-auto mb-2" />
                    <p>No video track</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={testStreamSDK}
                disabled={isConnected}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400"
              >
                <FaPlay />
                <span>Test Stream SDK</span>
              </button>
              
              {isConnected && (
                <>
                  <button
                    onClick={enableCamera}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <FaVideo />
                    <span>Enable Camera</span>
                  </button>
                  
                  <button
                    onClick={disableCamera}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white"
                  >
                    <FaVideoSlash />
                    <span>Disable Camera</span>
                  </button>
                  
                  <button
                    onClick={cleanup}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <FaStop />
                    <span>Cleanup</span>
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
                <FaExclamationTriangle />
                <span><strong>Error:</strong> {error}</span>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Stream SDK: {isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${localVideoTrack ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Video Track: {localVideoTrack ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Debug Logs</h2>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' : 
                  'text-blue-400'
                }`}>
                  [{log.timestamp}] {log.message}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setLogs([])}
              className="mt-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamSDKDebugger;
