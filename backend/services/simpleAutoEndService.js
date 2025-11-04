/**
 * Simple Auto-End Service
 * This service automatically ends live class sessions after a certain duration
 * Works for ALL sessions regardless of Google OAuth configuration
 */

const mongoose = require('mongoose');
const path = require('path');
const LiveClassSession = require(path.join(__dirname, '../models/LiveClassSession'));

class SimpleAutoEndService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Simple Auto-End Service is already running');
      return;
    }

    console.log('🚀 Starting Simple Auto-End Service...');
    this.isRunning = true;
    
    // Check every 5 seconds for sessions that need to end
    this.checkInterval = setInterval(() => {
      this.checkAndEndSessions();
    }, 5000); // 5 seconds

    // Run initial check immediately
    this.checkAndEndSessions();

    console.log('✅ Simple Auto-End Service started (checking every 5 seconds)');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping Simple Auto-End Service...');
    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('✅ Simple Auto-End Service stopped');
  }

  async checkAndEndSessions() {
    try {
      // Find all active sessions
      const activeSessions = await LiveClassSession.find({
        status: 'live'
      }).populate('courseId', 'title');

      if (activeSessions.length === 0) {
        // Silently return if no active sessions
        return;
      }

      console.log(`🔍 [SIMPLE AUTO-END] Checking ${activeSessions.length} active session(s)...`);

      const now = Date.now();

      for (const session of activeSessions) {
        const sessionDuration = now - new Date(session.startTime).getTime();
        const sessionMinutes = Math.round(sessionDuration / 60000);
        const sessionSeconds = Math.round(sessionDuration / 1000);

        // Auto-end after 2 minutes for TESTING (change to 30 for production)
        const autoEndMinutes = 2; // ⚠️ SET TO 2 MINUTES FOR TESTING
        
        console.log(`   Session ${session.sessionId}:`);
        console.log(`   - Course: ${session.courseId?.title || 'Unknown'}`);
        console.log(`   - Running for: ${sessionMinutes} minutes (${sessionSeconds} seconds)`);
        console.log(`   - Will auto-end at: ${autoEndMinutes} minutes`);
        console.log(`   - Should end now? ${sessionMinutes >= autoEndMinutes ? 'YES ✅' : 'NO ⏳'}`);
        
        if (sessionMinutes >= autoEndMinutes) {
          console.log(`⏰ [SIMPLE AUTO-END] Session ${session.sessionId} has been running for ${sessionMinutes} minutes`);
          console.log(`⏰ [SIMPLE AUTO-END] Auto-ending session NOW: ${session.sessionId}`);
          
          await this.endSession(session);
        }
      }

    } catch (error) {
      console.error('❌ [SIMPLE AUTO-END] Error checking sessions:', error.message);
      console.error('❌ [SIMPLE AUTO-END] Full error:', error);
    }
  }

  async endSession(session) {
    try {
      console.log(`🔄 [SIMPLE AUTO-END] Ending session: ${session.sessionId}`);
      console.log(`   Course: ${session.courseId?.title || 'Unknown'}`);
      console.log(`   Started: ${session.startTime}`);

      // Update session status
      session.status = 'ended';
      session.endTime = new Date();
      await session.save();

      console.log(`✅ [SIMPLE AUTO-END] Session ${session.sessionId} ended successfully`);
      console.log(`   Status: ${session.status}`);
      console.log(`   End Time: ${session.endTime}`);

      // Update corresponding LiveClass status to 'completed'
      try {
        const LiveClass = require('../models/LiveClass');
        const liveClass = await LiveClass.findOne({ courseId: session.courseId });
        if (liveClass) {
          liveClass.status = 'completed';
          await liveClass.save();
          console.log(`✅ [SIMPLE AUTO-END] Updated LiveClass status to 'completed' for course: ${session.courseId}`);
        }
      } catch (liveClassError) {
        console.error(`❌ [SIMPLE AUTO-END] Error updating LiveClass status:`, liveClassError);
      }

      // Send notifications (if service is available)
      try {
        const NotificationService = require('./notificationService');
        
        if (session.courseId && session.courseId.enrolledStudents) {
          const Course = require('../models/Course');
          const course = await Course.findById(session.courseId).populate('enrolledStudents');
          
          if (course) {
            console.log(`📢 [SIMPLE AUTO-END] Sending notifications for course: ${course.title}`);
            
            // Notify all enrolled students
            for (const learner of course.enrolledStudents) {
              try {
                await NotificationService.emitNotification(learner._id, {
                  type: 'live_class_ended',
                  title: 'Live Class Ended',
                  message: `The live class for "${course.title}" has ended.`,
                  data: {
                    courseId: session.courseId,
                    sessionId: session.sessionId,
                    courseTitle: course.title,
                    endTime: session.endTime
                  }
                });
              } catch (notifError) {
                // Ignore individual notification errors
              }
            }
            
            // Notify tutor
            try {
              await NotificationService.emitNotification(session.tutorId, {
                type: 'live_class_ended',
                title: 'Live Class Ended',
                message: `Your live class for "${course.title}" has ended automatically.`,
                data: {
                  courseId: session.courseId,
                  sessionId: session.sessionId,
                  courseTitle: course.title,
                  endTime: session.endTime
                }
              });
            } catch (notifError) {
              // Ignore notification error
            }
            
            console.log(`✅ [SIMPLE AUTO-END] Notifications sent`);
          }
        }
      } catch (notifError) {
        console.log(`⚠️ [SIMPLE AUTO-END] Could not send notifications:`, notifError.message);
      }

      // Auto-process recording after 30 seconds (give Google time to process)
      setTimeout(async () => {
        try {
          console.log(`🔄 [SIMPLE AUTO-END] Auto-processing recording for session: ${session.sessionId}`);
          
          // Import the controller dynamically
          const { liveClassController } = require('../controllers/googleMeetController');
          
          // Call processRecording
          await liveClassController.processRecording(
            { body: { sessionId: session.sessionId } },
            { 
              json: (data) => console.log('✅ [SIMPLE AUTO-END] Recording processing response:', data),
              status: (code) => ({ json: (data) => console.log(`📊 [SIMPLE AUTO-END] Status ${code}:`, data) })
            }
          );
          
          console.log(`✅ [SIMPLE AUTO-END] Recording processing initiated for session: ${session.sessionId}`);
        } catch (error) {
          console.error(`❌ [SIMPLE AUTO-END] Error auto-processing recording for session ${session.sessionId}:`, error.message);
        }
      }, 30000); // Wait 30 seconds for Google to process the recording

    } catch (error) {
      console.error(`❌ [SIMPLE AUTO-END] Error ending session ${session.sessionId}:`, error.message);
    }
  }
}

// Create singleton instance
const simpleAutoEndService = new SimpleAutoEndService();

module.exports = simpleAutoEndService;

// If this file is run directly, start the service
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('✅ Connected to database');
      simpleAutoEndService.start();
      
      // Keep the process running
      process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down...');
        simpleAutoEndService.stop();
        mongoose.disconnect().then(() => {
          console.log('✅ Database disconnected');
          process.exit(0);
        });
      });
    })
    .catch(error => {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    });
}

