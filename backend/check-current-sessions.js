/**
 * Check current live class sessions and their Meet links
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const LiveClassSession = require('./models/LiveClassSession');
const User = require('./models/User');
const Course = require('./models/Course');

async function checkSessions() {
  try {
    console.log('🔍 Connecting to database...\n');
    await connectDB();
    console.log('✅ Connected!\n');

    // Find all active sessions
    const activeSessions = await LiveClassSession.find({ 
      status: 'live' 
    }).populate('tutorId', 'name email').populate('courseId', 'title');

    console.log(`📊 Found ${activeSessions.length} active session(s)\n`);
    console.log('='.repeat(80));

    activeSessions.forEach((session, index) => {
      console.log(`\n🎥 Session ${index + 1}:`);
      console.log('   Session ID:', session.sessionId);
      console.log('   Course:', session.courseId?.title || 'N/A');
      console.log('   Tutor:', session.tutorId?.name || 'N/A');
      console.log('   Status:', session.status);
      console.log('   Started:', session.startTime);
      console.log('\n   📎 Meet Link:', session.meetLink);
      console.log('   📅 Calendar Event ID:', session.calendarEventId || 'N/A');
      console.log('\n   ❓ Is this a valid Meet link?', session.meetLink?.includes('meet.google.com/') && !session.meetLink?.includes('whoops'));
      console.log('='.repeat(80));
    });

    if (activeSessions.length === 0) {
      console.log('\nℹ️  No active sessions found. Create a live class to see it here.');
    }

    // Also check recently ended sessions
    console.log('\n\n📋 Recently ended sessions (last 10):\n');
    const recentSessions = await LiveClassSession.find({ 
      status: { $in: ['ended', 'completed'] }
    })
    .sort({ endTime: -1 })
    .limit(10)
    .populate('tutorId', 'name email')
    .populate('courseId', 'title');

    recentSessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.courseId?.title || 'N/A'} - ${session.status}`);
      console.log(`   Meet Link: ${session.meetLink}`);
      console.log(`   Valid? ${session.meetLink?.includes('meet.google.com/') && !session.meetLink?.includes('whoops') ? '✅' : '❌'}`);
      console.log('');
    });

    const mongoose = require('mongoose');
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSessions();

