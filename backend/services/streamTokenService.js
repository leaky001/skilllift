const { StreamChat } = require('stream-chat');

// Initialize Stream Chat client (used for token generation)
const client = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

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
    
    // Create a token for the user using Stream Chat SDK
    const token = client.createToken(userIdString);
    
    console.log('✅ Stream token generated successfully');
    return token;
  } catch (error) {
    console.error('❌ Error generating Stream token:', error);
    throw new Error('Failed to generate Stream token');
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
    
    const token = client.createToken(userIdString);
    
    const customClaims = {
      callId: callId,
      isHost: permissions.isHost || false,
      permissions: {
        canPublishVideo: permissions.canPublishVideo !== false,
        canPublishAudio: permissions.canPublishAudio !== false,
        canScreenShare: permissions.canScreenShare || false,
        canModerate: permissions.canModerate || false,
        canEndCall: permissions.canEndCall || false,
        ...permissions
      }
    };

    Object.assign(token, customClaims);
    return token;
  } catch (error) {
    console.error('Error generating Stream token with permissions:', error);
    throw new Error('Failed to generate Stream token');
  }
};

/**
 * Verify a Stream.io token
 * @param {string} token - The token to verify
 * @returns {Object} Decoded token data
 */
const verifyStreamToken = (token) => {
  try {
    return client.verifyToken(token);
  } catch (error) {
    console.error('Error verifying Stream token:', error);
    throw new Error('Invalid Stream token');
  }
};

/**
 * Create a call configuration for Stream.io video calls
 * @param {string} callId - The call ID
 * @param {Object} settings - Call settings
 * @returns {Object} Call configuration
 */
const createCallConfig = (callId, settings = {}) => {
  return {
    callId: callId,
    callType: 'default',
    settings: {
      audio: {
        enabled: true,
        defaultDevice: 'speaker'
      },
      video: {
        enabled: true,
        defaultDevice: 'camera'
      },
      screenShare: {
        enabled: settings.allowScreenShare !== false
      },
      chat: {
        enabled: settings.allowChat !== false
      },
      recording: {
        enabled: settings.autoRecord !== false
      },
      ...settings
    }
  };
};

/**
 * Get call participants
 * @param {string} callId - The call ID
 * @returns {Promise<Array>} List of participants
 */
const getCallParticipants = async (callId) => {
  try {
    const call = await client.video.getCall(callId);
    return call.participants || [];
  } catch (error) {
    console.error('Error getting call participants:', error);
    return [];
  }
};

/**
 * End a call
 * @param {string} callId - The call ID
 * @returns {Promise<boolean>} Success status
 */
const endCall = async (callId) => {
  try {
    await client.video.endCall(callId);
    return true;
  } catch (error) {
    console.error('Error ending call:', error);
    return false;
  }
};

/**
 * Get call recording
 * @param {string} callId - The call ID
 * @returns {Promise<Object>} Recording information
 */
const getCallRecording = async (callId) => {
  try {
    const recordings = await client.video.getRecordings(callId);
    return recordings.length > 0 ? recordings[0] : null;
  } catch (error) {
    console.error('Error getting call recording:', error);
    return null;
  }
};

module.exports = {
  generateStreamToken,
  generateStreamTokenWithPermissions,
  verifyStreamToken,
  createCallConfig,
  getCallParticipants,
  endCall,
  getCallRecording
};