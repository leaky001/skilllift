// Connection Test Helper - Add this to browser console during live class
window.testConnection = function() {
  console.log('🔍 CONNECTION TEST STARTED');
  
  // Check if we're in a live class
  if (typeof callId === 'undefined') {
    console.error('❌ Not in a live class - callId not found');
    return;
  }
  
  console.log('✅ CallId found:', callId);
  console.log('✅ User:', user);
  console.log('✅ IsHost:', isHost);
  
  // Check Stream call
  if (typeof streamCall !== 'undefined' && streamCall) {
    console.log('✅ Stream call found');
    console.log('✅ Call state:', streamCall.state);
    console.log('✅ Participants:', streamCall.state.participants);
    
    // Check video tracks
    if (typeof videoTracks !== 'undefined') {
      console.log('✅ Video tracks:', Array.from(videoTracks.keys()));
    }
    
    // Check participants array
    if (typeof participants !== 'undefined') {
      console.log('✅ Participants array:', participants);
    }
  } else {
    console.error('❌ Stream call not found');
  }
  
  console.log('🔍 CONNECTION TEST COMPLETED');
};

// Test media permissions
window.testMedia = async function() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log('✅ Media permissions granted');
    console.log('✅ Video tracks:', stream.getVideoTracks().length);
    console.log('✅ Audio tracks:', stream.getAudioTracks().length);
    return stream;
  } catch (error) {
    console.error('❌ Media permissions denied:', error);
    return null;
  }
};

// Test chat functionality
window.testChat = async function(message = 'Test message') {
  if (typeof streamCall === 'undefined' || !streamCall) {
    console.error('❌ Stream call not available');
    return;
  }
  
  try {
    await streamCall.sendReaction({
      type: 'chat_message',
      custom: {
        text: message,
        senderId: user._id,
        senderName: user.name
      }
    });
    console.log('✅ Chat message sent:', message);
  } catch (error) {
    console.error('❌ Chat message failed:', error);
  }
};

console.log('🧪 Connection test helpers loaded!');
console.log('Run testConnection() to check connection status');
console.log('Run testMedia() to check media permissions');
console.log('Run testChat("your message") to test chat');
