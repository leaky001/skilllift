require('dotenv').config();
const mongoose = require('mongoose');
const Replay = require('./models/Replay');
const LiveClassSession = require('./models/LiveClassSession');
const fs = require('fs');
const path = require('path');

async function checkRecordings() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilllift');
    console.log('✅ Connected!\n');

    // Get all files in uploads/replays
    const replaysDir = path.join(__dirname, 'uploads', 'replays');
    const files = fs.readdirSync(replaysDir);
    
    console.log('=' .repeat(70));
    console.log('📁 FILES ON DISK vs DATABASE RECORDS');
    console.log('=' .repeat(70));
    console.log('');

    console.log(`Found ${files.length} files in uploads/replays/\n`);

    // Check each file
    for (const file of files) {
      const filePath = path.join(replaysDir, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`📹 ${file}`);
      console.log(`   Size: ${sizeInMB} MB`);
      console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
      
      // Check if in Replay collection
      const replay = await Replay.findOne({ fileName: file });
      if (replay) {
        console.log(`   ✅ Found in Replay collection`);
        console.log(`      ID: ${replay._id}`);
        console.log(`      Title: ${replay.title}`);
        console.log(`      Status: ${replay.status}`);
      } else {
        console.log(`   ❌ NOT in Replay collection`);
      }
      
      // Check if in LiveClassSession
      const session = await LiveClassSession.findOne({ 
        recordingUrl: { $regex: file }
      });
      if (session) {
        console.log(`   ✅ Found in LiveClassSession`);
        console.log(`      Session ID: ${session.sessionId}`);
        console.log(`      Status: ${session.status}`);
      } else {
        console.log(`   ❌ NOT in LiveClassSession`);
      }
      
      console.log('');
    }

    // Check database for recordings that might be missing files
    console.log('=' .repeat(70));
    console.log('📊 DATABASE RECORDS WITHOUT FILES');
    console.log('=' .repeat(70));
    console.log('');

    const allReplays = await Replay.find();
    console.log(`Total Replay records: ${allReplays.length}`);
    
    for (const replay of allReplays) {
      const fileExists = files.includes(replay.fileName);
      if (!fileExists) {
        console.log(`❌ Replay record exists but file missing:`);
        console.log(`   ID: ${replay._id}`);
        console.log(`   Title: ${replay.title}`);
        console.log(`   File: ${replay.fileName}`);
        console.log('');
      }
    }

    const allSessions = await LiveClassSession.find({ 
      recordingUrl: { $exists: true, $ne: null }
    });
    console.log(`\nTotal LiveClassSession with recordings: ${allSessions.length}`);
    
    console.log('');
    console.log('=' .repeat(70));
    console.log('🎯 SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Files on disk: ${files.length}`);
    console.log(`Replay records: ${allReplays.length}`);
    console.log(`Sessions with recordings: ${allSessions.length}`);
    console.log('');

    if (files.length > 0 && (allReplays.length === 0 && allSessions.length === 0)) {
      console.log('⚠️  WARNING: Files exist but NOT in database!');
      console.log('   This means learners CANNOT see these recordings.');
      console.log('');
      console.log('   SOLUTION:');
      console.log('   1. These might be from old manual upload system');
      console.log('   2. Or recordings that failed to register in database');
      console.log('   3. Try completing a NEW live class recording');
    } else if (files.length > 0 && (allReplays.length > 0 || allSessions.length > 0)) {
      console.log('✅ Files exist AND are in database!');
      console.log('   Learners should be able to see these recordings.');
    } else {
      console.log('ℹ️  No recordings found yet.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRecordings();


