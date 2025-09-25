const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Stream SDK token generation endpoint
router.post('/stream/token', async (req, res) => {
  try {
    const { userId, userName, isHost } = req.body;
    
    console.log('🔑 Generating Stream token:', { userId, userName, isHost });
    
    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required'
      });
    }
    
    // Stream SDK requires a JWT token with specific claims
    const streamToken = jwt.sign(
      {
        user_id: userId,
        name: userName,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
        iat: Math.floor(Date.now() / 1000),
        iss: process.env.STREAM_API_KEY || 'j86qtfj4kzaf',
        sub: userId,
        // Add role-based permissions
        ...(isHost && {
          call_cid: `default:${userId}`,
          call_join: true,
          call_create: true,
          call_update: true,
          call_delete: true
        })
      },
      process.env.STREAM_API_SECRET || 'qknvfbg6wb9dcw3akapwc8tsj74h77axb2xsdhyd7tvgqbqyv9xyeejm5bjd4a7k',
      {
        algorithm: 'HS256',
        noTimestamp: false
      }
    );
    
    console.log('✅ Stream token generated successfully');
    
    res.json({
      success: true,
      data: {
        token: streamToken,
        userId,
        userName,
        isHost
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating Stream token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Stream token',
      error: error.message
    });
  }
});

module.exports = router;