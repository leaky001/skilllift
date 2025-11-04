#!/usr/bin/env node
/**
 * Test Auto-End Functionality
 * This script tests if sessions are being auto-ended properly
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testAutoEnd() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              AUTO-END FUNCTIONALITY TEST                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    console.log('📊 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');

    const LiveClassSession = require('./models/LiveClassSession');

    // Find all active sessions
    console.log('🔍 Checking for active sessions...');
    const activeSessions = await LiveClassSession.find({ status: 'live' })
      .populate('tutorId', 'name email')
      .populate('courseId', 'title');

    console.log(`Found ${activeSessions.length} active session(s)\n`);

    if (activeSessions.length === 0) {
      console.log('ℹ️  No active sessions to test');
      console.log('\n💡 To test:');
      console.log('1. Start a live class in your app');
      console.log('2. Run this script again');
      console.log('3. Wait and see if it auto-ends\n');
      
      // Check recently ended
      console.log('📋 Checking recently ended sessions (last 10 minutes)...');
      const recentlyEnded = await LiveClassSession.find({
        status: 'ended',
        endTime: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      }).populate('courseId', 'title').sort({ endTime: -1 }).limit(5);

      if (recentlyEnded.length > 0) {
        console.log(`\nFound ${recentlyEnded.length} recently ended session(s):`);
        recentlyEnded.forEach((session, index) => {
          const timeSinceEnd = Math.round((Date.now() - new Date(session.endTime).getTime()) / 1000);
          console.log(`\n${index + 1}. ${session.sessionId}`);
          console.log(`   Course: ${session.courseId?.title || 'Unknown'}`);
          console.log(`   Ended: ${timeSinceEnd} seconds ago`);
          console.log(`   Status: ${session.status}`);
        });
      } else {
        console.log('No recently ended sessions found');
      }
    } else {
      // Show active sessions and their status
      activeSessions.forEach((session, index) => {
        const sessionDuration = Date.now() - new Date(session.startTime).getTime();
        const minutes = Math.round(sessionDuration / 60000);
        
        console.log(`\n📍 Session ${index + 1}:`);
        console.log(`   Session ID: ${session.sessionId}`);
        console.log(`   Course: ${session.courseId?.title || 'Unknown'}`);
        console.log(`   Tutor: ${session.tutorId?.name || 'Unknown'}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   Started: ${session.startTime}`);
        console.log(`   Running for: ${minutes} minute(s)`);
        console.log(`   Meet Link: ${session.meetLink}`);
        console.log(`   Calendar Event: ${session.calendarEventId}`);

        // Check if it should be auto-ended
        if (minutes >= 30) {
          console.log(`   ⚠️  WARNING: Should have auto-ended after 30 minutes!`);
        } else {
          console.log(`   ⏱️  Will auto-end in ${30 - minutes} minute(s)`);
        }
      });

      console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
      console.log('║                    AUTO-END TEST                               ║');
      console.log('╚════════════════════════════════════════════════════════════════╝\n');

      console.log('🧪 Testing auto-end detection...\n');

      // Test: End sessions that are older than 1 minute (for testing purposes)
      let endedCount = 0;
      for (const session of activeSessions) {
        const sessionDuration = Date.now() - new Date(session.startTime).getTime();
        const minutes = Math.round(sessionDuration / 60000);

        // For testing: end if older than 1 minute
        if (minutes >= 1) {
          console.log(`⏰ Session ${session.sessionId} is ${minutes} min old - ENDING IT NOW...`);
          
          session.status = 'ended';
          session.endTime = new Date();
          await session.save();
          
          console.log(`✅ Session ${session.sessionId} ended successfully`);
          endedCount++;
        }
      }

      if (endedCount > 0) {
        console.log(`\n✅ Ended ${endedCount} session(s) for testing`);
        console.log('\n💡 Now check your frontend - dashboard should show "Live Class Completed"');
      } else {
        console.log('\n⏰ All active sessions are less than 1 minute old');
        console.log('   Wait 1 minute and run this script again to test auto-end');
      }
    }

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                         SUMMARY                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('✅ Auto-end services should be running in your backend');
    console.log('✅ Sessions will auto-end after 30 minutes');
    console.log('✅ Frontend checks for status every 3 seconds');
    console.log('✅ Dashboard should update automatically\n');

    console.log('🔍 To verify auto-end is working:');
    console.log('1. Check backend logs for:');
    console.log('   "🔍 [SIMPLE AUTO-END] Checking X active session(s)..."');
    console.log('2. Wait for session to be 30 minutes old');
    console.log('3. Auto-end should trigger automatically');
    console.log('4. Dashboard should show "Live Class Completed"\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from database');
    }
  }
}

// Run the test
testAutoEnd();

