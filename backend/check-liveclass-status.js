#!/usr/bin/env node
/**
 * CHECK LIVECLASS STATUS IN DATABASE
 * This will show us exactly what's in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkLiveClassStatus() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           CHECK LIVECLASS STATUS IN DATABASE                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    console.log('📊 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');

    const LiveClass = require('./models/LiveClass');
    const LiveClassSession = require('./models/LiveClassSession');
    const Course = require('./models/Course');

    // Get all LiveClass documents
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ALL LIVECLASS DOCUMENTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allLiveClasses = await LiveClass.find({}).populate('courseId', 'title');
    
    if (allLiveClasses.length === 0) {
      console.log('⚠️  NO LIVECLASS DOCUMENTS FOUND IN DATABASE!');
      console.log('   This is the problem! LiveClass documents don\'t exist.\n');
    } else {
      console.log(`Found ${allLiveClasses.length} LiveClass document(s):\n`);
      
      allLiveClasses.forEach((liveClass, index) => {
        console.log(`${index + 1}. LiveClass ID: ${liveClass._id}`);
        console.log(`   Course ID: ${liveClass.courseId?._id || liveClass.courseId || 'NOT SET'}`);
        console.log(`   Course Title: ${liveClass.courseId?.title || 'Unknown'}`);
        console.log(`   Title: ${liveClass.title || 'No title'}`);
        console.log(`   Status: ${liveClass.status || 'No status'}`);
        console.log(`   Scheduled: ${liveClass.scheduledDate || 'Not set'}`);
        console.log(`   Created: ${liveClass.createdAt || 'Unknown'}`);
        console.log('');
      });
    }

    // Get all LiveClassSession documents
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ALL LIVECLASSSESSION DOCUMENTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allSessions = await LiveClassSession.find({});
    
    if (allSessions.length === 0) {
      console.log('ℹ️  No LiveClassSession documents found.\n');
    } else {
      console.log(`Found ${allSessions.length} LiveClassSession document(s):\n`);
      
      allSessions.forEach((session, index) => {
        console.log(`${index + 1}. Session ID: ${session.sessionId}`);
        console.log(`   Course ID: ${session.courseId}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   Start Time: ${session.startTime}`);
        console.log(`   End Time: ${session.endTime || 'Not ended'}`);
        console.log(`   Calendar Event ID: ${session.calendarEventId || 'None'}`);
        console.log('');
      });
    }

    // Check Course documents and their liveClasses array
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 COURSES AND THEIR LIVECLASSES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allCourses = await Course.find({}).populate('liveClasses');
    
    if (allCourses.length === 0) {
      console.log('ℹ️  No courses found.\n');
    } else {
      console.log(`Found ${allCourses.length} course(s):\n`);
      
      allCourses.forEach((course, index) => {
        console.log(`${index + 1}. Course: ${course.title}`);
        console.log(`   Course ID: ${course._id}`);
        console.log(`   LiveClasses array length: ${course.liveClasses?.length || 0}`);
        
        if (course.liveClasses && course.liveClasses.length > 0) {
          course.liveClasses.forEach((lc, idx) => {
            console.log(`   
   LiveClass ${idx + 1}:`);
            console.log(`      - ID: ${lc._id}`);
            console.log(`      - Title: ${lc.title}`);
            console.log(`      - Status: ${lc.status}`);
          });
        } else {
          console.log(`   ⚠️  No liveClasses in this course's array!`);
        }
        console.log('');
      });
    }

    // Cross-reference check
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 CROSS-REFERENCE CHECK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    for (const session of allSessions) {
      console.log(`Session ${session.sessionId}:`);
      console.log(`  Course ID: ${session.courseId}`);
      
      // Find matching LiveClass
      const matchingLiveClass = await LiveClass.findOne({ courseId: session.courseId });
      
      if (matchingLiveClass) {
        console.log(`  ✅ Found matching LiveClass: ${matchingLiveClass._id}`);
        console.log(`     LiveClass Status: ${matchingLiveClass.status}`);
        console.log(`     LiveClass Title: ${matchingLiveClass.title}`);
      } else {
        console.log(`  ❌ NO matching LiveClass found for courseId: ${session.courseId}`);
        console.log(`     This is a problem! The session exists but LiveClass doesn't.`);
      }
      console.log('');
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`Total LiveClass documents: ${allLiveClasses.length}`);
    console.log(`Total LiveClassSession documents: ${allSessions.length}`);
    console.log(`Total Courses: ${allCourses.length}`);
    
    const completedLiveClasses = allLiveClasses.filter(lc => lc.status === 'completed');
    const scheduledLiveClasses = allLiveClasses.filter(lc => lc.status === 'scheduled');
    const liveLiveClasses = allLiveClasses.filter(lc => lc.status === 'live');
    
    console.log(`\nLiveClass Status Breakdown:`);
    console.log(`  - Completed: ${completedLiveClasses.length}`);
    console.log(`  - Scheduled: ${scheduledLiveClasses.length}`);
    console.log(`  - Live: ${liveLiveClasses.length}`);
    
    const endedSessions = allSessions.filter(s => s.status === 'ended');
    const liveSessions = allSessions.filter(s => s.status === 'live');
    
    console.log(`\nLiveClassSession Status Breakdown:`);
    console.log(`  - Ended: ${endedSessions.length}`);
    console.log(`  - Live: ${liveSessions.length}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 DIAGNOSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (allLiveClasses.length === 0) {
      console.log('❌ PROBLEM: No LiveClass documents exist!');
      console.log('   SOLUTION: LiveClass documents need to be created when you create a live class.');
      console.log('   The frontend is probably reading from Course.liveClasses array,');
      console.log('   but there are no separate LiveClass documents in the database.\n');
    } else if (endedSessions.length > 0 && completedLiveClasses.length === 0) {
      console.log('❌ PROBLEM: Sessions are ended but LiveClasses are not marked as completed!');
      console.log('   SOLUTION: The endLiveClass function is not updating LiveClass status correctly.\n');
    } else if (completedLiveClasses.length > 0 && scheduledLiveClasses.length > 0) {
      console.log('⚠️  WARNING: You have both completed and scheduled LiveClasses.');
      console.log('   Check if the frontend is showing the correct ones.\n');
    } else if (allLiveClasses.length > 0 && completedLiveClasses.length > 0) {
      console.log('✅ LiveClass status updates are working!');
      console.log('   The problem might be in the frontend not refreshing the data.\n');
    }

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
checkLiveClassStatus();

