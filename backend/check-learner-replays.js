require('dotenv').config();
const mongoose = require('mongoose');
const LiveClassSession = require('./models/LiveClassSession');
const Replay = require('./models/Replay');
const Course = require('./models/Course');

async function checkReplays() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilllift');
    console.log('✅ Connected!\n');

    console.log('=' .repeat(70));
    console.log('📊 CHECKING REPLAY DATA IN DATABASE');
    console.log('=' .repeat(70));
    console.log('');

    // Check LiveClassSession recordings (Google Meet bot recordings)
    console.log('1️⃣ CHECKING LIVE CLASS SESSION RECORDINGS:');
    console.log('-'.repeat(70));
    
    const sessions = await LiveClassSession.find()
      .populate('courseId', 'title')
      .populate('tutorId', 'name')
      .sort({ endTime: -1 })
      .limit(10);

    console.log(`Found ${sessions.length} live class sessions\n`);

    sessions.forEach((session, index) => {
      console.log(`Session #${index + 1}:`);
      console.log(`  ID: ${session._id}`);
      console.log(`  Session ID: ${session.sessionId}`);
      console.log(`  Course: ${session.courseId?.title || 'Unknown'}`);
      console.log(`  Tutor: ${session.tutorId?.name || 'Unknown'}`);
      console.log(`  Status: ${session.status}`);
      console.log(`  Start Time: ${session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}`);
      console.log(`  End Time: ${session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'}`);
      console.log(`  Recording URL: ${session.recordingUrl || '❌ NO RECORDING URL'}`);
      console.log(`  Recording ID: ${session.recordingId || 'N/A'}`);
      
      if (session.botMetadata) {
        console.log(`  🤖 Bot Metadata:`);
        console.log(`     Status: ${session.botMetadata.status || 'N/A'}`);
        console.log(`     Started: ${session.botMetadata.startedAt ? new Date(session.botMetadata.startedAt).toLocaleString() : 'N/A'}`);
        console.log(`     Stopped: ${session.botMetadata.stoppedAt ? new Date(session.botMetadata.stoppedAt).toLocaleString() : 'N/A'}`);
        console.log(`     Recording Path: ${session.botMetadata.recordingPath || 'N/A'}`);
        console.log(`     Error: ${session.botMetadata.error || 'None'}`);
      } else {
        console.log(`  ⚠️ No bot metadata`);
      }
      console.log('');
    });

    // Check Replay collection (manual uploads)
    console.log('');
    console.log('2️⃣ CHECKING REPLAY COLLECTION (Manual Uploads):');
    console.log('-'.repeat(70));
    
    const replays = await Replay.find()
      .populate('course', 'title')
      .populate('tutor', 'name')
      .sort({ uploadDate: -1 })
      .limit(10);

    console.log(`Found ${replays.length} manual replay uploads\n`);

    replays.forEach((replay, index) => {
      console.log(`Replay #${index + 1}:`);
      console.log(`  ID: ${replay._id}`);
      console.log(`  Title: ${replay.title}`);
      console.log(`  Course: ${replay.course?.title || 'Unknown'}`);
      console.log(`  Tutor: ${replay.tutor?.name || 'Unknown'}`);
      console.log(`  File URL: ${replay.fileUrl}`);
      console.log(`  File Name: ${replay.fileName}`);
      console.log(`  File Size: ${(replay.fileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Status: ${replay.status}`);
      console.log(`  Upload Date: ${new Date(replay.uploadDate).toLocaleString()}`);
      console.log(`  Views: ${replay.viewCount || 0}`);
      console.log('');
    });

    // Check total counts
    console.log('');
    console.log('3️⃣ SUMMARY:');
    console.log('-'.repeat(70));
    
    const totalSessions = await LiveClassSession.countDocuments();
    const completedSessions = await LiveClassSession.countDocuments({ status: 'completed' });
    const sessionsWithRecording = await LiveClassSession.countDocuments({ 
      recordingUrl: { $exists: true, $ne: null }
    });
    const totalReplays = await Replay.countDocuments();
    const readyReplays = await Replay.countDocuments({ status: 'ready' });

    console.log(`Total Live Class Sessions: ${totalSessions}`);
    console.log(`Completed Sessions: ${completedSessions}`);
    console.log(`Sessions with Recording URL: ${sessionsWithRecording} ${sessionsWithRecording > 0 ? '✅' : '❌'}`);
    console.log(`Total Manual Replays: ${totalReplays}`);
    console.log(`Ready Manual Replays: ${readyReplays}`);
    console.log('');

    console.log('=' .repeat(70));
    console.log('🎯 WHAT LEARNERS WILL SEE:');
    console.log('=' .repeat(70));
    console.log(`Bot Recordings (from Live Classes): ${sessionsWithRecording}`);
    console.log(`Manual Replays: ${readyReplays}`);
    console.log(`TOTAL REPLAYS AVAILABLE: ${sessionsWithRecording + readyReplays}`);
    console.log('');

    if (sessionsWithRecording + readyReplays === 0) {
      console.log('❌ NO REPLAYS FOUND!');
      console.log('');
      console.log('POSSIBLE REASONS:');
      console.log('1. Bot recording didn\'t complete successfully');
      console.log('2. Recording URL wasn\'t saved to LiveClassSession');
      console.log('3. No live classes have been ended yet');
      console.log('4. Check backend logs when ending a class');
      console.log('');
      console.log('TO FIX:');
      console.log('1. Start a new live class');
      console.log('2. Wait 1-2 minutes');
      console.log('3. End the class');
      console.log('4. Watch backend terminal for recording messages');
      console.log('5. Run this script again to verify');
    } else {
      console.log('✅ REPLAYS FOUND! Learners should be able to see them.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkReplays();

