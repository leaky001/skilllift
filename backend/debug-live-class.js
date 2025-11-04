#!/usr/bin/env node
/**
 * Live Class Auto-End Debug Tool
 * Run this to check if auto-end is working properly
 */

const mongoose = require('mongoose');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.white) {
  console.log(color + message + colors.reset);
}

async function checkAutoEndSetup() {
  log('\n╔════════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║          LIVE CLASS AUTO-END DEBUG TOOL                       ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════════╝\n', colors.cyan);

  try {
    // 1. Check Database Connection
    log('📊 Step 1: Checking Database Connection...', colors.cyan);
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    await mongoose.connect(mongoUri);
    log('✅ Database connected successfully', colors.green);

    // 2. Check if Auto-End Service is loaded
    log('\n🔧 Step 2: Checking Auto-End Service...', colors.cyan);
    try {
      const autoEndService = require('./services/googleMeetAutoEndService');
      log('✅ Auto-End Service module loaded', colors.green);
    } catch (error) {
      log('❌ Auto-End Service failed to load: ' + error.message, colors.red);
    }

    // 3. Check Google Meet Controller
    log('\n🎮 Step 3: Checking Google Meet Controller...', colors.cyan);
    try {
      const controller = require('./controllers/googleMeetController');
      if (controller.liveClassController) {
        log('✅ Main controller loaded', colors.green);
        log('   - startLiveClass: ' + (!!controller.liveClassController.startLiveClass ? '✅' : '❌'));
        log('   - getCurrentSession: ' + (!!controller.liveClassController.getCurrentSession ? '✅' : '❌'));
        log('   - endLiveClass: ' + (!!controller.liveClassController.endLiveClass ? '✅' : '❌'));
      } else {
        log('⚠️  Controller loaded but liveClassController not found', colors.yellow);
      }
    } catch (error) {
      log('❌ Controller failed to load: ' + error.message, colors.red);
      log('   This means FALLBACK controller is being used!', colors.red);
    }

    // 4. Check Active Sessions
    log('\n📝 Step 4: Checking Active Live Class Sessions...', colors.cyan);
    const LiveClassSession = require('./models/LiveClassSession');
    const activeSessions = await LiveClassSession.find({ status: 'live' })
      .populate('tutorId', 'name email googleTokens')
      .populate('courseId', 'title');

    log(`Found ${activeSessions.length} active session(s)`, colors.cyan);

    if (activeSessions.length > 0) {
      activeSessions.forEach((session, index) => {
        log(`\n   Session ${index + 1}:`, colors.white);
        log(`   - Session ID: ${session.sessionId}`, colors.white);
        log(`   - Course: ${session.courseId?.title || 'Unknown'}`, colors.white);
        log(`   - Tutor: ${session.tutorId?.name || 'Unknown'}`, colors.white);
        log(`   - Started: ${session.startTime}`, colors.white);
        log(`   - Meet Link: ${session.meetLink}`, colors.white);
        log(`   - Calendar Event ID: ${session.calendarEventId}`, colors.white);
        log(`   - Has Google Tokens: ${!!session.tutorId?.googleTokens ? '✅' : '❌'}`, 
            session.tutorId?.googleTokens ? colors.green : colors.red);
        
        const duration = Date.now() - new Date(session.startTime).getTime();
        const durationMinutes = Math.round(duration / 60000);
        log(`   - Running for: ${durationMinutes} minutes`, colors.white);
        
        if (durationMinutes > 240) {
          log(`   ⚠️  WARNING: Session running for ${durationMinutes} min (should auto-end at 240 min)`, colors.yellow);
        }
      });
    } else {
      log('   No active sessions found', colors.white);
    }

    // 5. Check Recently Ended Sessions
    log('\n📋 Step 5: Checking Recently Ended Sessions (last 10 minutes)...', colors.cyan);
    const recentlyEnded = await LiveClassSession.find({
      status: 'ended',
      endTime: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    }).populate('courseId', 'title').sort({ endTime: -1 });

    log(`Found ${recentlyEnded.length} recently ended session(s)`, colors.cyan);

    if (recentlyEnded.length > 0) {
      recentlyEnded.forEach((session, index) => {
        const timeSinceEnd = Math.round((Date.now() - new Date(session.endTime).getTime()) / 1000);
        log(`   ${index + 1}. ${session.sessionId}`, colors.white);
        log(`      Course: ${session.courseId?.title || 'Unknown'}`, colors.white);
        log(`      Ended ${timeSinceEnd} seconds ago`, colors.white);
        log(`      Recording: ${session.recordingUrl ? '✅ Available' : '⏳ Processing'}`, 
            session.recordingUrl ? colors.green : colors.yellow);
      });
    }

    // 6. Test Google Calendar API (if available)
    log('\n🌐 Step 6: Testing Google API Configuration...', colors.cyan);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || clientId === 'dummy' || clientId.includes('your_')) {
      log('❌ GOOGLE_CLIENT_ID not properly configured', colors.red);
    } else {
      log('✅ GOOGLE_CLIENT_ID configured', colors.green);
    }

    if (!clientSecret || clientSecret === 'dummy' || clientSecret.includes('your_')) {
      log('❌ GOOGLE_CLIENT_SECRET not properly configured', colors.red);
    } else {
      log('✅ GOOGLE_CLIENT_SECRET configured', colors.green);
    }

    // 7. Summary
    log('\n╔════════════════════════════════════════════════════════════════╗', colors.cyan);
    log('║                          SUMMARY                               ║', colors.cyan);
    log('╚════════════════════════════════════════════════════════════════╝\n', colors.cyan);

    const issues = [];
    
    if (!clientId || clientId === 'dummy') {
      issues.push('❌ Google OAuth not configured - auto-end may not work for Google Meet links');
    }
    
    if (activeSessions.length > 0) {
      const sessionsWithoutTokens = activeSessions.filter(s => !s.tutorId?.googleTokens);
      if (sessionsWithoutTokens.length > 0) {
        issues.push(`❌ ${sessionsWithoutTokens.length} session(s) without Google tokens - auto-end won't work`);
      }
    }

    if (issues.length === 0) {
      log('✅ All checks passed! Auto-end should be working.', colors.green);
      log('\nTo test:', colors.cyan);
      log('1. Start a live class', colors.white);
      log('2. End Google Meet', colors.white);
      log('3. Watch backend logs for: "🔍 Checking X active Google Meet session(s)..."', colors.white);
      log('4. Within 10 seconds, session should auto-end', colors.white);
    } else {
      log('⚠️  Issues found:', colors.yellow);
      issues.forEach(issue => log('   ' + issue, colors.yellow));
    }

    log('\n💡 Recommendations:', colors.cyan);
    log('1. Make sure backend is running: npm start', colors.white);
    log('2. Check backend logs for: "✅ Google Meet Auto-End Service started"', colors.white);
    log('3. If using custom Meet links, auto-end works after 2 hours', colors.white);
    log('4. If using Google OAuth, auto-end detects when Meet closes (10 sec)', colors.white);

  } catch (error) {
    log('\n❌ Error during debug:', colors.red);
    log(error.message, colors.red);
    console.error(error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Run the check
checkAutoEndSetup();

