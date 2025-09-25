const streamTokenService = require('../services/streamTokenService');

/**
 * Generate Stream SDK token for video calls
 */
const generateStreamToken = async (req, res) => {
  try {
    const { userId, userName, isHost = false } = req.body;
    
    console.log('🔑 Generating Stream token request:', { userId, userName, isHost });
    console.log('🔐 Request user:', req.user ? { id: req.user._id, name: req.user.name } : 'No user');
    console.log('🔐 Request headers:', { 
      hasAuth: !!req.headers.authorization,
      authStart: req.headers.authorization?.substring(0, 20) + '...'
    });
    
    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required'
      });
    }
    
    // Generate Stream JWT token
    const token = streamTokenService.generateToken(userId, userName, isHost);
    
    console.log('✅ Stream token generated successfully');
    
    res.json({
      success: true,
      data: {
        token: token,
        userId: userId,
        userName: userName,
        isHost: isHost
      },
      message: 'Stream token generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error generating Stream token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Stream token: ' + error.message
    });
  }
};

module.exports = {
  generateStreamToken
};
