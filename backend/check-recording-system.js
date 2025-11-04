#!/usr/bin/env node
/**
 * CHECK RECORDING SYSTEM STATUS
 * Verifies if recordings are being processed and stored
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkRecordingSystem() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           CHECK RECORDING SYSTEM STATUS                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    console.log('📊 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');

    const LiveClassSession = require('./models/LiveClassSession');
    const Replay = require('./models/Replay');
    const Course = require('./models/Course');

    // Check all ended sessions
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ENDED SESSIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const endedSessions = await LiveClassSession.find({ status: 'ended' })
      .sort({ endTime: -1 })
      .limit(10);
    
    if (endedSessions.length === 0) {
      console.log('ℹ️  No ended sessions found.\n');
    } else {
      console.log(`Found ${endedSessions.length} ended session(s):\n`);
      
      for (const session of endedSessions) {
        const course = await Course.findById(session.courseId);
        console.log(`Session ID: ${session.sessionId}`);
        console.log(`  Course: ${course?.title || 'Unknown'}`);
        console.log(`  Status: ${session.status}`);
        console.log(`  Ended: ${session.endTime || 'Not ended'}`);
        console.log(`  Recording URL: ${session.recordingUrl || '❌ NO RECORDING'}`);
        console.log(`  Recording ID: ${session.recordingId || '❌ NO RECORDING ID'}`);
        
        if (session.recordingUrl) {
          console.log(`  ✅ Recording processed successfully`);
        } else {
          console.log(`  ⚠️  Recording NOT processed yet`);
        }
        console.log('');
      }
    }

    // Check Replay documents
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 REPLAY DOCUMENTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const replays = await Replay.find({}).populate('course', 'title').sort({ createdAt: -1 }).limit(10);
    
    if (replays.length === 0) {
      console.log('⚠️  NO REPLAY DOCUMENTS FOUND!');
      console.log('   This might be an issue. Replays should be created when recordings are processed.\n');
    } else {
      console.log(`Found ${replays.length} replay document(s):\n`);
      
      replays.forEach((replay, index) => {
        console.log(`${index + 1}. Replay ID: ${replay._id}`);
        console.log(`   Course: ${replay.course?.title || 'Unknown'}`);
        console.log(`   Title: ${replay.title}`);
        console.log(`   Status: ${replay.status}`);
        console.log(`   File URL: ${replay.fileUrl ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Created: ${replay.createdAt}`);
        console.log(`   View Count: ${replay.viewCount}`);
        console.log('');
      });
    }

    // Cross-reference: Sessions with recordings vs Replay documents
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 CROSS-REFERENCE CHECK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const sessionsWithRecordings = endedSessions.filter(s => s.recordingUrl);
    console.log(`Sessions with recordings: ${sessionsWithRecordings.length}`);
    console.log(`Replay documents: ${replays.length}`);
    
    if (sessionsWithRecordings.length > 0 && replays.length === 0) {
      console.log('\n⚠️  WARNING: Sessions have recordings but no Replay documents!');
      console.log('   The processRecording function might not be creating Replay documents.');
    } else if (sessionsWithRecordings.length === replays.length) {
      console.log('\n✅ Good! Sessions with recordings match Replay documents count.');
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Total ended sessions: ${endedSessions.length}`);
    console.log(`Sessions with recordings: ${sessionsWithRecordings.length}`);
    console.log(`Sessions without recordings: ${endedSessions.length - sessionsWithRecordings.length}`);
    console.log(`Total Replay documents: ${replays.length}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 DIAGNOSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (endedSessions.length === 0) {
      console.log('ℹ️  No ended sessions yet. End a live class to test recording.');
    } else if (sessionsWithRecordings.length === 0) {
      console.log('⚠️  ISSUE: No sessions have recordings processed.');
      console.log('\nPossible causes:');
      console.log('  1. Google Meet recording not enabled');
      console.log('  2. processRecording not being triggered after ending');
      console.log('  3. Google OAuth not configured');
      console.log('  4. Recording files not found in Google Drive');
      console.log('\nSolution: Check backend logs for "Auto-processing recording" messages.');
    } else {
      console.log('✅ Recording system is working!');
      console.log(`   ${sessionsWithRecordings.length} session(s) have recordings processed.`);
      
      if (replays.length === 0) {
        console.log('\n⚠️  However, no Replay documents exist.');
        console.log('   Recordings are stored in LiveClassSession but not in Replay collection.');
        console.log('   Learners access replays via LiveClassSession.recordingUrl');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 NEXT STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('1. End a live class (manually or wait 2 minutes for auto-end)');
    console.log('2. Wait 30 seconds (recording processing delay)');
    console.log('3. Check backend logs for:');
    console.log('   "🔄 Auto-processing recording for session: session-xxx"');
    console.log('4. Run this script again to verify recording was processed');
    console.log('5. Check learner replay access in frontend\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database\n');
    }
  }
}

// Run immediately
checkRecordingSystem();

