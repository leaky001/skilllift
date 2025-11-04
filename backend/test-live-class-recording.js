const mongoose = require('mongoose');
const LiveClassSession = require('./models/LiveClassSession');
const Course = require('./models/Course');
const User = require('./models/User');

// Test script to verify live class recording workflow
async function testLiveClassRecording() {
  try {
    console.log('🧪 Testing Live Class Recording Workflow...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://skilllift:skilllift123@cluster0.7qtal7v.mongodb.net/skilllift');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check for recent live class sessions
    console.log('1️⃣ Checking for recent live class sessions...');
    const recentSessions = await LiveClassSession.find({
      status: { $in: ['ended', 'completed'] },
      endTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .populate('courseId', 'title')
    .populate('tutorId', 'name email')
    .sort({ endTime: -1 })
    .limit(5);

    console.log(`📊 Found ${recentSessions.length} recent sessions:`);
    recentSessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.courseId?.title || 'Unknown Course'}`);
      console.log(`      Session ID: ${session.sessionId}`);
      console.log(`      Status: ${session.status}`);
      console.log(`      Start: ${session.startTime}`);
      console.log(`      End: ${session.endTime}`);
      console.log(`      Recording URL: ${session.recordingUrl ? '✅ Available' : '❌ Not available'}`);
      console.log(`      Recording ID: ${session.recordingId || 'None'}`);
      console.log('');
    });

    // 2. Check for sessions with recordings
    console.log('2️⃣ Checking for sessions with recordings...');
    const sessionsWithRecordings = await LiveClassSession.find({
      recordingUrl: { $exists: true, $ne: null }
    })
    .populate('courseId', 'title')
    .populate('tutorId', 'name')
    .sort({ endTime: -1 })
    .limit(10);

    console.log(`📹 Found ${sessionsWithRecordings.length} sessions with recordings:`);
    sessionsWithRecordings.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.courseId?.title || 'Unknown Course'}`);
      console.log(`      Recording URL: ${session.recordingUrl}`);
      console.log(`      Duration: ${session.endTime && session.startTime ? 
        Math.round((session.endTime - session.startTime) / 60000) + ' minutes' : 'Unknown'}`);
      console.log('');
    });

    // 3. Check for courses with enrolled students
    console.log('3️⃣ Checking for courses with enrolled students...');
    const coursesWithStudents = await Course.find({
      enrolledStudents: { $exists: true, $not: { $size: 0 } }
    })
    .populate('tutor', 'name email')
    .populate('enrolledStudents', 'name email')
    .limit(5);

    console.log(`👥 Found ${coursesWithStudents.length} courses with enrolled students:`);
    coursesWithStudents.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title}`);
      console.log(`      Tutor: ${course.tutor?.name || 'Unknown'}`);
      console.log(`      Enrolled Students: ${course.enrolledStudents?.length || 0}`);
      console.log('');
    });

    // 4. Test replay retrieval for a specific course
    if (coursesWithStudents.length > 0) {
      const testCourse = coursesWithStudents[0];
      console.log('4️⃣ Testing replay retrieval for course:', testCourse.title);
      
      const courseReplays = await LiveClassSession.find({
        courseId: testCourse._id,
        status: 'completed',
        recordingUrl: { $exists: true, $ne: null }
      })
      .populate('tutorId', 'name')
      .sort({ endTime: -1 });

      console.log(`📺 Found ${courseReplays.length} replays for this course:`);
      courseReplays.forEach((replay, index) => {
        console.log(`   ${index + 1}. Live Class - ${testCourse.title}`);
        console.log(`      Tutor: ${replay.tutorId?.name || 'Unknown'}`);
        console.log(`      Session ID: ${replay.sessionId}`);
        console.log(`      Recording URL: ${replay.recordingUrl}`);
        console.log(`      Duration: ${replay.endTime && replay.startTime ? 
          Math.round((replay.endTime - replay.startTime) / 60000) + ' minutes' : 'Unknown'}`);
        console.log('');
      });
    }

    // 5. Check for any issues
    console.log('5️⃣ Checking for potential issues...');
    
    // Sessions that ended but don't have recordings
    const sessionsWithoutRecordings = await LiveClassSession.find({
      status: 'completed',
      endTime: { $exists: true },
      recordingUrl: { $exists: false }
    }).countDocuments();
    
    console.log(`⚠️  Sessions without recordings: ${sessionsWithoutRecordings}`);
    
    // Sessions that are stuck in 'ended' status
    const stuckSessions = await LiveClassSession.find({
      status: 'ended',
      endTime: { $lt: new Date(Date.now() - 60 * 60 * 1000) } // More than 1 hour ago
    }).countDocuments();
    
    console.log(`⚠️  Sessions stuck in 'ended' status: ${stuckSessions}`);

    console.log('\n✅ Live Class Recording Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing live class recording:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testLiveClassRecording();