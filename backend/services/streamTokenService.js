const jwt = require('jsonwebtoken');

/**
 * Generate a Stream.io video call token for a user
 * @param {string} userId - The user ID
 * @param {string} callId - The call ID (unique identifier for the call)
 * @param {boolean} isHost - Whether the user is the host/tutor
 * @returns {string} Stream token
 */
const generateStreamToken = (userId, callId, isHost = false) => {
  try {
    // Ensure userId is a string (convert from ObjectId if needed)
    const userIdString = userId.toString();
    
    console.log('🔑 Generating Stream token for:', {
      userId: userIdString,
      callId: callId,
      isHost: isHost
    });
    
    // Get Stream API key and secret from environment variables
    const streamApiKey = process.env.STREAM_API_KEY;
    const streamApiSecret = process.env.STREAM_API_SECRET;
    
    if (!streamApiKey || !streamApiSecret) {
      throw new Error('Stream API key or secret not configured');
    }
    
    // Create JWT payload for Stream Video with enhanced permissions
    const payload = {
      user_id: userIdString,
      iss: streamApiKey,
      sub: userIdString,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours expiry
      // Enable all users to join any call
      call_join: true,
      call_create: true,
      call_update: true,
      // Enable video and audio permissions for all users
      video: true,
      audio: true,
      // Enable screen sharing
      screen_share: true,
    };
    
    // Add admin permissions if user is host
    if (isHost) {
      payload.role = 'admin';
      payload.call_cids = [`default:${callId}`];
      payload.call_delete = true;
      payload.call_update = true;
      // Enhanced video permissions for hosts
      payload.video = true;
      payload.audio = true;
      payload.screen_share = true;
      payload.can_publish_video = true;
      payload.can_publish_audio = true;
      payload.can_publish_screen = true;
    }
    
    // Add participant permissions for non-hosts
    if (!isHost) {
      payload.role = 'user';
      payload.call_cids = [`default:${callId}`];
      // Ensure participants can publish video and audio
      payload.can_publish_video = true;
      payload.can_publish_audio = true;
      payload.can_publish_screen = false; // Only hosts can screen share by default
    }
    
    // Generate JWT token using the Stream API secret
    const token = jwt.sign(payload, streamApiSecret, { algorithm: 'HS256' });
    
    console.log('✅ Stream token generated successfully for user:', userIdString);
    return token;
  } catch (error) {
    console.error('❌ Error generating Stream token:', error);
    throw new Error('Failed to generate Stream token: ' + error.message);
  }
};

/**
 * Generate a Stream.io video call token for a user with custom permissions
 * @param {string} userId - The user ID
 * @param {string} callId - The call ID
 * @param {Object} permissions - Custom permissions object
 * @returns {string} Stream token
 */
const generateStreamTokenWithPermissions = (userId, callId, permissions = {}) => {
  try {
    // Ensure userId is a string (convert from ObjectId if needed)
    const userIdString = userId.toString();
    
    const streamApiKey = process.env.STREAM_API_KEY;
    const streamApiSecret = process.env.STREAM_API_SECRET;
    
    if (!streamApiKey || !streamApiSecret) {
      throw new Error('Stream API key or secret not configured');
    }
    
    const payload = {
      user_id: userIdString,
      iss: streamApiKey,
      sub: userIdString,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours expiry
      role: permissions.isHost ? 'admin' : 'user',
      call_cids: [`default:${callId}`]
    };

    const token = jwt.sign(payload, streamApiSecret, { algorithm: 'HS256' });
    return token;
  } catch (error) {
    console.error('Error generating Stream token with permissions:', error);
    throw new Error('Failed to generate Stream token');
  }
};

module.exports = {
  generateStreamToken,
  generateStreamTokenWithPermissions
};