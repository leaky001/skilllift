const express = require('express');
const router = express.Router();

// Simple test endpoint that doesn't require database or authentication
router.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for live class functionality without database dependency
// BYPASSES AUTHENTICATION FOR TESTING ONLY
router.post('/test-live-bypass', (req, res) => {
  const { userId = '68c74fd58c47657e364d6877', userRole = 'participant' } = req.body;
  
  try {
    console.log('🧪 TEST ENDPOINT: Live class bypass called with:', { userId, userRole });
    
    // Mock a live class response for testing
    const mockLiveClass = {
      _id: '68ddbaab81b727ce6411ac75',
      title: 'smart contract',
      status: 'live',
      callId: 'live-class-68ddbaab81b727ce6411ac75-1759361707893',
      sessionId: 'session-68ddbaab81b727ce6411ac75-1759361707893',
      tutorId: '68c84b9067287d08e49e1264',
      courseId: {
        _id: '68c8520c0fec18aa4b8e1015',
        title: 'Smart Contract Development'
      }
    };

    // Generate Stream token using existing service
    const { generateStreamToken } = require('../services/streamTokenService');
    const isHost = mockLiveClass.tutorId.toString() === userId.toString();
    
    console.log('🧪 TEST ENDPOINT: Generating token for:', { userId, isHost, callId: mockLiveClass.callId });
    const streamToken = generateStreamToken(userId, mockLiveClass.callId, isHost);
    
    console.log('🧪 TEST ENDPOINT: Token generated successfully');

    res.json({
      success: true,
      message: 'Test live class joined successfully - BYPASSED DB CHECKS',
      data: {
        liveClass: mockLiveClass,
        streamToken: streamToken,
        callId: mockLiveClass.callId,
        sessionId: mockLiveClass.sessionId,
        isHost: isHost
      }
    });

  } catch (error) {
    console.error('🧪 TEST ENDPOINT: Error in bypass endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message
    });
  }
});

module.exports = router;
