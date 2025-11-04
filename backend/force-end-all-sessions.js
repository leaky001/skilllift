#!/usr/bin/env node
/**
 * FORCE END ALL ACTIVE SESSIONS
 * Use this to immediately end all active sessions for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function forceEndAllSessions() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           FORCE END ALL ACTIVE SESSIONS                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    console.log('📊 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');

    const LiveClassSession = require('./models/LiveClassSession');

    // Find ALL active sessions
    console.log('🔍 Finding all active sessions...');
    const activeSessions = await LiveClassSession.find({ status: 'live' })
      .populate('tutorId', 'name')
      .populate('courseId', 'title');

    if (activeSessions.length === 0) {
      console.log('ℹ️  No active sessions found. Everything is already ended.\n');
      return;
    }

    console.log(`\n✅ Found ${activeSessions.length} active session(s):\n`);

    // Show all sessions
    activeSessions.forEach((session, index) => {
      const duration = Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000);
      console.log(`${index + 1}. ${session.sessionId}`);
      console.log(`   Course: ${session.courseId?.title || 'Unknown'}`);
      console.log(`   Tutor: ${session.tutorId?.name || 'Unknown'}`);
      console.log(`   Running for: ${duration} minute(s)`);
      console.log(`   Started: ${session.startTime}`);
      console.log('');
    });

    console.log('⚡ ENDING ALL SESSIONS NOW...\n');

    // End all sessions
    let endedCount = 0;
    for (const session of activeSessions) {
      console.log(`⏰ Ending: ${session.sessionId}...`);
      
      session.status = 'ended';
      session.endTime = new Date();
      await session.save();
      
      console.log(`✅ Ended: ${session.sessionId}`);
      endedCount++;
    }

    console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║                    SUCCESS!                                    ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Successfully ended ${endedCount} session(s)!\n`);

    console.log('📋 NEXT STEPS:');
    console.log('1. Go to your tutor/learner dashboard');
    console.log('2. Refresh the page (F5 or Ctrl+R)');
    console.log('3. You should see "Live Class Completed"');
    console.log('4. Button should say "Start New Class"\n');

    console.log('💡 To verify, run: node backend/test-auto-end.js\n');

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
forceEndAllSessions();

