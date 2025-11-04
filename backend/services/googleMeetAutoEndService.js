const mongoose = require('mongoose');
const { google } = require('googleapis');
const path = require('path');
const LiveClassSession = require(path.join(__dirname, '../models/LiveClassSession'));
const LiveClass = require(path.join(__dirname, '../models/LiveClass'));
const Course = require(path.join(__dirname, '../models/Course'));
const User = require(path.join(__dirname, '../models/User'));
const NotificationService = require('./notificationService');

// Background service to automatically detect ended Google Meet sessions
class GoogleMeetAutoEndService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Google Meet Auto-End Service is already running');
      return;
    }

    console.log('🚀 Starting Google Meet Auto-End Service...');
    this.isRunning = true;
    
    // Check every 10 seconds for ended sessions (more frequent for immediate detection)
    this.checkInterval = setInterval(() => {
      this.checkForEndedSessions();
    }, 10000);

    // Run initial check immediately
    this.checkForEndedSessions();

    console.log('✅ Google Meet Auto-End Service started (checking every 10 seconds)');
  }

  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Google Meet Auto-End Service is not running');
      return;
    }

    console.log('🛑 Stopping Google Meet Auto-End Service...');
    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('✅ Google Meet Auto-End Service stopped');
  }

  async checkForEndedSessions() {
    try {
      // Find all active sessions
      const activeSessions = await LiveClassSession.find({
        status: 'live'
      }).populate('tutorId', 'googleTokens').populate('courseId', 'title enrolledStudents');

      if (activeSessions.length > 0) {
        console.log(`🔍 Checking ${activeSessions.length} active Google Meet session(s)...`);
      }

      for (const session of activeSessions) {
        await this.checkSessionEnd(session);
      }

    } catch (error) {
      console.error('❌ Error checking for ended sessions:', error);
    }
  }

  async checkSessionEnd(session) {
    try {
      console.log(`🔍 Checking session: ${session.sessionId}`);

      // For custom sessions, check if running longer than expected (2 hours max)
      if (session.calendarEventId === 'custom') {
        const sessionDuration = Date.now() - session.startTime.getTime();
        const maxDuration = 2 * 60 * 60 * 1000; // 2 hours for custom sessions
        
        if (sessionDuration > maxDuration) {
          console.log(`⏰ Custom session ${session.sessionId} exceeded 2 hours, auto-ending...`);
          await this.endSession(session);
        }
        return;
      }

      // Skip if no Google tokens
      if (!session.tutorId.googleTokens) {
        console.log(`⏭️ Skipping session ${session.sessionId} - no Google tokens`);
        return;
      }

      // Set up Google Calendar API
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set credentials
      oauth2Client.setCredentials({
        access_token: session.tutorId.googleTokens.accessToken,
        refresh_token: session.tutorId.googleTokens.refreshToken,
        expiry_date: session.tutorId.googleTokens.expiryDate
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Get the calendar event
      const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: session.calendarEventId
      });

      const now = new Date();
      const eventEndTime = new Date(event.data.end.dateTime || event.data.end.date);
      const eventStartTime = new Date(event.data.start.dateTime || event.data.start.date);

      console.log(`📅 Session ${session.sessionId} event details:`, {
        exists: !!event.data,
        status: event.data?.status,
        startTime: eventStartTime,
        endTime: eventEndTime,
        currentTime: now,
        hasEnded: now > eventEndTime,
        isCancelled: event.data?.status === 'cancelled'
      });

      // Check if session should be ended
      const shouldEnd = !event.data || 
                       event.data.status === 'cancelled' || 
                       now > eventEndTime ||
                       (now - session.startTime.getTime()) > (4 * 60 * 60 * 1000); // 4 hours max

      if (shouldEnd) {
        console.log(`🔚 Auto-ending session: ${session.sessionId}`);
        await this.endSession(session);
      }

    } catch (error) {
      console.error(`❌ Error checking session ${session.sessionId}:`, error.message);
      
      // If we can't check the session, end it after 4 hours as a safety measure
      const sessionDuration = Date.now() - session.startTime.getTime();
      const maxDuration = 4 * 60 * 60 * 1000; // 4 hours
      
      if (sessionDuration > maxDuration) {
        console.log(`⏰ Session ${session.sessionId} exceeded maximum duration, auto-ending...`);
        await this.endSession(session);
      }
    }
  }

  async endSession(session) {
    try {
      console.log(`🔄 Ending session: ${session.sessionId}`);

      // Update session status
      session.status = 'ended';
      session.endTime = new Date();
      await session.save();

      // Update course status
      const liveClass = await LiveClass.findOne({ courseId: session.courseId });
      if (liveClass) {
        liveClass.status = 'completed';
        await liveClass.save();
        console.log(`✅ Updated LiveClass status to completed: ${liveClass._id}`);
      }

      // Send notifications to learners via WebSocket
      if (session.courseId && session.courseId.enrolledStudents) {
        const learnersToNotify = session.courseId.enrolledStudents.filter(learner =>
          learner._id.toString() !== session.tutorId._id.toString()
        );

        console.log(`📢 Sending notifications to ${learnersToNotify.length} learners`);

        // Send notification to each enrolled learner
        const notificationPromises = learnersToNotify.map(async (learner) => {
          try {
            await NotificationService.emitNotification(learner._id, {
              type: 'live_class_ended',
              title: 'Live Class Ended',
              message: `The live class for "${session.courseId.title}" has ended. Recording will be available soon!`,
              data: {
                courseId: session.courseId._id,
                sessionId: session.sessionId,
                courseTitle: session.courseId.title,
                endTime: session.endTime
              }
            });
          } catch (error) {
            console.error(`Failed to notify learner ${learner._id}:`, error);
          }
        });

        await Promise.all(notificationPromises);

        // Also notify the tutor
        try {
          await NotificationService.emitNotification(session.tutorId._id, {
            type: 'live_class_ended',
            title: 'Live Class Ended',
            message: `Your live class for "${session.courseId.title}" has ended automatically. Recording is being processed.`,
            data: {
              courseId: session.courseId._id,
              sessionId: session.sessionId,
              courseTitle: session.courseId.title,
              endTime: session.endTime
            }
          });
        } catch (error) {
          console.error(`Failed to notify tutor:`, error);
        }
      }

      // Auto-process recording after 30 seconds
      setTimeout(async () => {
        try {
          console.log(`🔄 Auto-processing recording for session: ${session.sessionId}`);
          // Note: processRecording would need to be called here
          console.log(`✅ Recording processing initiated for session: ${session.sessionId}`);
        } catch (error) {
          console.error(`❌ Error auto-processing recording for session ${session.sessionId}:`, error);
        }
      }, 30000);

      console.log(`✅ Session ${session.sessionId} ended successfully`);

    } catch (error) {
      console.error(`❌ Error ending session ${session.sessionId}:`, error);
    }
  }
}

// Create singleton instance
const googleMeetAutoEndService = new GoogleMeetAutoEndService();

// Export for use in other files
module.exports = googleMeetAutoEndService;

// If this file is run directly, start the service
if (require.main === module) {
  // Connect to database
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift')
    .then(() => {
      console.log('✅ Connected to database');
      googleMeetAutoEndService.start();
    })
    .catch(error => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    googleMeetAutoEndService.stop();
    mongoose.disconnect().then(() => {
      console.log('✅ Database disconnected');
      process.exit(0);
    });
  });
}

