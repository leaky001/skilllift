/**
 * Check for and clear any "stuck" sessions with invalid Meet links
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const LiveClassSession = require('./models/LiveClassSession');
const User = require('./models/User');
const Course = require('./models/Course');

async function checkAndClear() {
  try {
    console.log('🔍 Connecting to database...\n');
    await connectDB();
    console.log('✅ Connected!\n');

    // Find ALL sessions (active and recent)
    const allSessions = await LiveClassSession.find({})
      .sort({ startTime: -1 })
      .limit(20)
      .populate('tutorId', 'name email')
      .populate('courseId', 'title');

    console.log(`📊 Found ${allSessions.length} recent session(s)\n`);
    console.log('='.repeat(80));

    let activeBadSessions = [];
    let allBadSessions = [];

    allSessions.forEach((session, index) => {
      const isBadLink = !session.meetLink || 
                       session.meetLink.includes('whoops') || 
                       session.meetLink.includes('undefined') ||
                       session.meetLink === 'null';
      
      console.log(`\n🎥 Session ${index + 1}:`);
      console.log('   Session ID:', session.sessionId);
      console.log('   Course:', session.courseId?.title || 'N/A');
      console.log('   Status:', session.status);
      console.log('   Started:', session.startTime);
      console.log('   📎 Meet Link:', session.meetLink || 'MISSING');
      
      if (isBadLink) {
        console.log('   ❌ BAD LINK DETECTED!');
        allBadSessions.push(session);
        if (session.status === 'live') {
          console.log('   ⚠️  THIS IS AN ACTIVE SESSION - WILL BE CLEARED!');
          activeBadSessions.push(session);
        }
      } else {
        console.log('   ✅ Link is valid');
      }
      console.log('='.repeat(80));
    });

    if (activeBadSessions.length > 0) {
      console.log(`\n⚠️  Found ${activeBadSessions.length} ACTIVE session(s) with bad links!`);
      console.log('\n🔧 Clearing these sessions...\n');

      for (const session of activeBadSessions) {
        console.log(`   Ending session: ${session.sessionId}`);
        session.status = 'ended';
        session.endTime = new Date();
        await session.save();
        console.log(`   ✅ Session ended`);
      }

      console.log('\n✅ All bad active sessions cleared!');
    } else {
      console.log('\n✅ No active sessions with bad links found!');
    }

    if (allBadSessions.length > 0 && allBadSessions.length > activeBadSessions.length) {
      console.log(`\nℹ️  Note: Found ${allBadSessions.length - activeBadSessions.length} old session(s) with bad links (already ended, no action needed)`);
    }

    const mongoose = require('mongoose');
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    console.log('\n💡 You can now create a new live class with a custom link!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndClear();

