require('dotenv').config();
const mongoose = require('mongoose');
const LiveSession = require('./models/LiveSession');
const User = require('./models/User');

async function checkLastRecording() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilllift');
    console.log('✅ Connected!\n');

    // Get the most recent live session
    console.log('📋 Looking for the most recent live session...\n');
    const recentSessions = await LiveSession.find()
      .sort({ endTime: -1 })
      .limit(3)
      .populate('courseId', 'title')
      .lean();

    if (recentSessions.length === 0) {
      console.log('❌ No live sessions found in database');
      process.exit(0);
    }

    console.log('=' .repeat(60));
    console.log('📊 LAST 3 LIVE SESSIONS:');
    console.log('=' .repeat(60));

    recentSessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.sessionId}`);
      console.log(`   Course: ${session.courseId?.title || 'Unknown'}`);
      console.log(`   Meet Link: ${session.meetLink}`);
      console.log(`   Started: ${new Date(session.startTime).toLocaleString()}`);
      console.log(`   Ended: ${session.endTime ? new Date(session.endTime).toLocaleString() : 'Still active'}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Recording URL: ${session.recordingUrl || '❌ No recording yet'}`);
      
      if (session.botMetadata) {
        console.log(`   🤖 Bot Metadata:`);
        console.log(`      Started: ${session.botMetadata.startedAt ? new Date(session.botMetadata.startedAt).toLocaleString() : 'N/A'}`);
        console.log(`      Stopped: ${session.botMetadata.stoppedAt ? new Date(session.botMetadata.stoppedAt).toLocaleString() : 'N/A'}`);
        console.log(`      Status: ${session.botMetadata.status || 'unknown'}`);
        console.log(`      Recording Path: ${session.botMetadata.recordingPath || 'N/A'}`);
        console.log(`      Drive File ID: ${session.botMetadata.driveFileId || 'N/A'}`);
      } else {
        console.log(`   ❌ No bot metadata (old recording method or bot didn't run)`);
      }
    });

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 INTERPRETATION:');
    console.log('=' .repeat(60));

    const lastSession = recentSessions[0];
    
    if (lastSession.recordingUrl) {
      console.log('✅ SUCCESS! Recording was uploaded to Google Drive!');
      console.log(`   📁 View it here: ${lastSession.recordingUrl}`);
    } else if (lastSession.botMetadata?.status === 'recording') {
      console.log('⏳ Bot is still recording... (wait for class to end)');
    } else if (lastSession.botMetadata?.status === 'uploading') {
      console.log('⏳ Bot is uploading to Google Drive... (please wait)');
    } else if (lastSession.endTime && !lastSession.recordingUrl) {
      console.log('⚠️  Class ended but no recording URL found!');
      console.log('   Possible issues:');
      console.log('   - Bot crashed during recording');
      console.log('   - Upload failed');
      console.log('   - Google Drive API error');
      console.log('   Check backend logs for errors');
    } else if (!lastSession.endTime) {
      console.log('⏳ Class is still active - bot should be recording now');
    } else if (!lastSession.botMetadata) {
      console.log('⚠️  No bot metadata - this might be using old recording method');
      console.log('   The new automated bot should create botMetadata');
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLastRecording();

