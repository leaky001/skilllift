const mongoose = require('mongoose');

// Simple script to check live class recording status
async function checkRecordingStatus() {
  try {
    console.log('🔍 Checking Live Class Recording Status...\n');

    // Try to connect to your database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    console.log('🔌 Connecting to database...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Import the LiveClassSession model
    const LiveClassSession = require('./models/LiveClassSession');

    // Check for recent sessions (last 2 hours)
    console.log('📊 Checking recent live class sessions (last 2 hours)...');
    const recentSessions = await LiveClassSession.find({
      endTime: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Last 2 hours
    })
    .populate('courseId', 'title')
    .populate('tutorId', 'name email')
    .sort({ endTime: -1 });

    console.log(`Found ${recentSessions.length} recent sessions:\n`);

    if (recentSessions.length === 0) {
      console.log('❌ No recent live class sessions found in the last 2 hours.');
      console.log('💡 Make sure you have ended a live class recently.\n');
    } else {
      recentSessions.forEach((session, index) => {
        console.log(`📹 Session ${index + 1}:`);
        console.log(`   Course: ${session.courseId?.title || 'Unknown Course'}`);
        console.log(`   Tutor: ${session.tutorId?.name || 'Unknown'}`);
        console.log(`   Session ID: ${session.sessionId}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   Start Time: ${session.startTime}`);
        console.log(`   End Time: ${session.endTime}`);
        
        if (session.recordingUrl) {
          console.log(`   Recording: ✅ AVAILABLE`);
          console.log(`   Recording URL: ${session.recordingUrl}`);
        } else {
          console.log(`   Recording: ⏳ PROCESSING...`);
          console.log(`   Recording ID: ${session.recordingId || 'Not found yet'}`);
        }
        
        // Calculate time since end
        if (session.endTime) {
          const timeSinceEnd = Math.round((Date.now() - session.endTime.getTime()) / 1000);
          console.log(`   Time since end: ${timeSinceEnd} seconds`);
          
          if (timeSinceEnd < 30) {
            console.log(`   Status: ⏳ Waiting for Google processing (${30 - timeSinceEnd}s remaining)`);
          } else if (timeSinceEnd < 120) {
            console.log(`   Status: 🔍 Searching for recording...`);
          } else {
            console.log(`   Status: ⚠️  Processing taking longer than expected`);
          }
        }
        
        console.log('');
      });
    }

    // Check for any stuck sessions
    console.log('🔍 Checking for stuck sessions...');
    const stuckSessions = await LiveClassSession.find({
      status: 'ended',
      endTime: { $lt: new Date(Date.now() - 5 * 60 * 1000) }, // More than 5 minutes ago
      recordingUrl: { $exists: false }
    });

    if (stuckSessions.length > 0) {
      console.log(`⚠️  Found ${stuckSessions.length} sessions that may be stuck:`);
      stuckSessions.forEach((session, index) => {
        console.log(`   ${index + 1}. Session ${session.sessionId} - Ended ${Math.round((Date.now() - session.endTime.getTime()) / 60000)} minutes ago`);
      });
    } else {
      console.log('✅ No stuck sessions found');
    }

    console.log('\n🎯 SUMMARY:');
    console.log('• If you see "⏳ PROCESSING..." - Your recording is being processed');
    console.log('• If you see "✅ AVAILABLE" - Your recording is ready!');
    console.log('• Processing typically takes 30 seconds to 2 minutes');
    console.log('• Check your learner dashboard for the replay');

  } catch (error) {
    console.error('❌ Error checking recording status:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Database connection issue. Please check your MongoDB credentials.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Database server not running. Please start your MongoDB server.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database');
    }
  }
}

// Run the check
checkRecordingStatus();
