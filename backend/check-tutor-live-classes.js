const mongoose = require('mongoose');

// Script to check tutor's live classes
async function checkTutorLiveClasses() {
  try {
    console.log('🔍 Checking Tutor Live Classes...\n');

    // Try to connect to your database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
    console.log('🔌 Connecting to database...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Import the models
    const LiveClass = require('./models/LiveClass');
    const LiveClassSession = require('./models/LiveClassSession');
    const Course = require('./models/Course');
    const User = require('./models/User');

    // Get all tutors
    console.log('👨‍🏫 Getting all tutors...');
    const tutors = await User.find({ role: 'tutor' }).select('name email');
    console.log(`Found ${tutors.length} tutors:\n`);

    for (const tutor of tutors) {
      console.log(`📚 Tutor: ${tutor.name} (${tutor.email})`);
      
      // Get tutor's courses
      const courses = await Course.find({ tutor: tutor._id }).select('title');
      console.log(`   Courses: ${courses.length}`);
      
      // Get tutor's live classes
      const liveClasses = await LiveClass.find({ tutorId: tutor._id })
        .populate('courseId', 'title')
        .sort({ createdAt: -1 });
      
      console.log(`   Live Classes: ${liveClasses.length}`);
      
      if (liveClasses.length > 0) {
        liveClasses.forEach((liveClass, index) => {
          console.log(`     ${index + 1}. ${liveClass.title}`);
          console.log(`        Course: ${liveClass.courseId?.title || 'Unknown'}`);
          console.log(`        Status: ${liveClass.status}`);
          console.log(`        Scheduled: ${liveClass.scheduledDate}`);
          console.log(`        Duration: ${liveClass.duration} minutes`);
          console.log(`        Created: ${liveClass.createdAt}`);
          console.log('');
        });
      }
      
      // Get tutor's live class sessions
      const sessions = await LiveClassSession.find({ tutorId: tutor._id })
        .populate('courseId', 'title')
        .sort({ createdAt: -1 });
      
      console.log(`   Live Sessions: ${sessions.length}`);
      
      if (sessions.length > 0) {
        sessions.forEach((session, index) => {
          console.log(`     ${index + 1}. Session ${session.sessionId}`);
          console.log(`        Course: ${session.courseId?.title || 'Unknown'}`);
          console.log(`        Status: ${session.status}`);
          console.log(`        Start: ${session.startTime}`);
          console.log(`        End: ${session.endTime || 'Not ended'}`);
          console.log(`        Recording: ${session.recordingUrl ? '✅ Available' : '❌ Not available'}`);
          console.log('');
        });
      }
      
      console.log('─'.repeat(50));
    }

    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    
    const totalLiveClasses = await LiveClass.countDocuments();
    const activeLiveClasses = await LiveClass.countDocuments({ status: 'live' });
    const scheduledLiveClasses = await LiveClass.countDocuments({ status: 'scheduled' });
    const completedLiveClasses = await LiveClass.countDocuments({ status: 'completed' });
    
    const totalSessions = await LiveClassSession.countDocuments();
    const activeSessions = await LiveClassSession.countDocuments({ status: 'live' });
    const endedSessions = await LiveClassSession.countDocuments({ status: 'ended' });
    const completedSessions = await LiveClassSession.countDocuments({ status: 'completed' });
    
    console.log(`📚 Total Live Classes: ${totalLiveClasses}`);
    console.log(`   - Active: ${activeLiveClasses}`);
    console.log(`   - Scheduled: ${scheduledLiveClasses}`);
    console.log(`   - Completed: ${completedLiveClasses}`);
    
    console.log(`🎥 Total Live Sessions: ${totalSessions}`);
    console.log(`   - Active: ${activeSessions}`);
    console.log(`   - Ended: ${endedSessions}`);
    console.log(`   - Completed: ${completedSessions}`);

    // Check for any issues
    console.log('\n🔍 CHECKING FOR ISSUES:');
    
    // Sessions without recordings
    const sessionsWithoutRecordings = await LiveClassSession.countDocuments({
      status: 'completed',
      recordingUrl: { $exists: false }
    });
    
    if (sessionsWithoutRecordings > 0) {
      console.log(`⚠️  ${sessionsWithoutRecordings} completed sessions without recordings`);
    }
    
    // Stuck sessions
    const stuckSessions = await LiveClassSession.countDocuments({
      status: 'live',
      startTime: { $lt: new Date(Date.now() - 4 * 60 * 60 * 1000) } // More than 4 hours ago
    });
    
    if (stuckSessions > 0) {
      console.log(`⚠️  ${stuckSessions} sessions stuck in 'live' status for more than 4 hours`);
    }
    
    if (sessionsWithoutRecordings === 0 && stuckSessions === 0) {
      console.log('✅ No issues found');
    }

    console.log('\n✅ Tutor Live Classes Check Complete!');

  } catch (error) {
    console.error('❌ Error checking tutor live classes:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Database connection issue. Please check your MongoDB credentials.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Database server not running. Please start your MongoDB server.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from database');
    }
  }
}

// Run the check
checkTutorLiveClasses();
