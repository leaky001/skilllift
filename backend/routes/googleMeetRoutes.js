const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

console.log('🔍 Google Meet Routes file loaded');

// Import controllers with error handling
let googleOAuthController, liveClassController;

try {
  console.log('🔍 Loading Google Meet controller...');
  const controllerModule = require('../controllers/googleMeetController');
  console.log('🔍 Controller module loaded:', !!controllerModule);
  console.log('🔍 Available exports:', Object.keys(controllerModule));
  
  googleOAuthController = controllerModule.googleOAuthController;
  liveClassController = controllerModule.liveClassController;
  
  console.log('🔍 googleOAuthController loaded:', !!googleOAuthController);
  console.log('🔍 liveClassController loaded:', !!liveClassController);
  console.log('🔍 liveClassController.startLiveClass:', !!liveClassController?.startLiveClass);
  
  console.log('✅ Google Meet controllers loaded successfully');
} catch (error) {
  console.error('❌ Error loading Google Meet controllers:', error.message);
  console.error('❌ Full error:', error);
  
  // Create fallback controllers that work without Google API
  googleOAuthController = {
    getAuthUrl: (req, res) => res.status(400).json({ 
      error: 'Google OAuth not configured. Please set up Google OAuth credentials in .env file' 
    }),
    handleCallback: (req, res) => res.status(400).json({ 
      error: 'Google OAuth not configured. Please set up Google OAuth credentials in .env file' 
    })
  };
  
  liveClassController = {
    startLiveClass: async (req, res) => {
      try {
        const { courseId, customMeetLink } = req.body;
        const tutorId = req.user._id;

        // Verify user is a tutor
        if (req.user.role !== 'tutor') {
          return res.status(403).json({ error: 'Only tutors can start live classes' });
        }

        // Get course details
        const Course = require('../models/Course');
        const course = await Course.findById(courseId).populate('enrolledStudents');
        if (!course) {
          return res.status(404).json({ error: 'Course not found' });
        }

        // Verify tutor owns the course
        if (course.tutor.toString() !== tutorId.toString()) {
          return res.status(403).json({ error: 'You can only start classes for your own courses' });
        }

        // Check if there's already an active session
        const LiveClassSession = require('../models/LiveClassSession');
        const existingSession = await LiveClassSession.findOne({
          courseId,
          status: { $in: ['scheduled', 'live'] }
        });

        if (existingSession) {
          return res.status(400).json({ 
            error: 'There is already an active session for this course' 
          });
        }

        // Use custom Meet link
        const meetLink = customMeetLink || 'https://meet.google.com/demo-link';
        
        // Create session record
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const session = new LiveClassSession({
          courseId,
          tutorId,
          sessionId,
          meetLink,
          calendarEventId: 'custom',
          status: 'live',
          startTime: new Date(),
          enrolledLearners: course.enrolledStudents.map(learner => learner._id)
        });

        await session.save();

        res.json({
          success: true,
          session: {
            sessionId,
            meetLink,
            courseTitle: course.title,
            startTime: session.startTime,
            enrolledLearners: course.enrolledStudents.length
          }
        });

      } catch (error) {
        console.error('Error starting live class:', error);
        res.status(500).json({ error: 'Failed to start live class', details: error.message });
      }
    },
    
    getCurrentSession: async (req, res) => {
      try {
        const { courseId } = req.params;
        const userId = req.user._id;

        console.log('🔍 [FALLBACK] Getting current session for course:', courseId, 'user:', userId);

        // Get course and verify enrollment
        const Course = require('../models/Course');
        const course = await Course.findById(courseId);
        if (!course) {
          console.log('❌ Course not found:', courseId);
          return res.status(404).json({ error: 'Course not found' });
        }

        // Check if user is enrolled (learner) or owns the course (tutor)
        const isEnrolled = Array.isArray(course.enrolledStudents)
          ? course.enrolledStudents.some((id) => id.toString() === userId.toString())
          : false;
        const isOwner = course.tutor.toString() === userId.toString();

        console.log('🔍 Access check:', { isEnrolled, isOwner, userId: userId.toString(), tutorId: course.tutor.toString() });

        if (!isEnrolled && !isOwner) {
          console.log('❌ User not enrolled or owner');
          return res.status(403).json({ error: 'You are not enrolled in this course' });
        }

        // Get current session
        const LiveClassSession = require('../models/LiveClassSession');
        const session = await LiveClassSession.findOne({
          courseId,
          status: 'live'
        }).populate('tutorId', 'name email');

        if (!session) {
          console.log('ℹ️ No active session found');
          
          // Check for recently completed session (within last 5 minutes)
          const recentlyCompleted = await LiveClassSession.findOne({
            courseId,
            status: 'ended',
            endTime: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
          }).sort({ endTime: -1 });

          if (recentlyCompleted) {
            console.log('🎯 Recently completed session found:', recentlyCompleted.sessionId);
            return res.json({ 
              status: 'no_session',
              message: 'No active session found',
              recentlyCompleted: true,
              lastSession: {
                sessionId: recentlyCompleted.sessionId,
                endTime: recentlyCompleted.endTime
              }
            });
          }
          
          return res.json({ 
            status: 'no_session',
            message: 'No active session found',
            recentlyCompleted: false
          });
        }

        console.log('✅ Active session found:', session.sessionId);

        // Check if session should be auto-ended (custom sessions after 2 hours)
        if (session.calendarEventId === 'custom') {
          const sessionDuration = Date.now() - new Date(session.startTime).getTime();
          const maxDuration = 2 * 60 * 60 * 1000; // 2 hours for custom sessions

          if (sessionDuration > maxDuration) {
            console.log('⏰ [FALLBACK] Custom session exceeded 2 hours, auto-ending...');
            session.status = 'ended';
            session.endTime = new Date();
            await session.save();

            // Update corresponding LiveClass status to 'completed'
            const LiveClass = require('../models/LiveClass');
            const liveClass = await LiveClass.findOne({ courseId: session.courseId });
            if (liveClass) {
              liveClass.status = 'completed';
              liveClass.endedAt = new Date();
              await liveClass.save();
              console.log('✅ [FALLBACK] Auto-end: Updated LiveClass status to completed');
            }

            return res.json({
              status: 'ended',
              message: 'Session auto-ended - exceeded maximum duration',
              session: {
                sessionId: session.sessionId,
                status: 'ended',
                endTime: session.endTime
              }
            });
          }
        }

        res.json({
          status: 'active',
          session: {
            sessionId: session.sessionId,
            meetLink: session.meetLink,
            tutorName: session.tutorId.name,
            startTime: session.startTime,
            status: session.status,
            enrolledLearners: session.enrolledLearners?.length || 0
          }
        });

      } catch (error) {
        console.error('❌ Error getting current session:', error);
        res.status(500).json({ error: 'Failed to get current session', details: error.message });
      }
    },
    
    endLiveClass: async (req, res) => {
      try {
        const { sessionId } = req.body;
        const LiveClassSession = require('../models/LiveClassSession');
        const LiveClass = require('../models/LiveClass');
        
        const session = await LiveClassSession.findOne({ sessionId });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        // End the session
        session.status = 'ended';
        session.endTime = new Date();
        await session.save();

        // Update corresponding LiveClass status to 'completed'
        const liveClass = await LiveClass.findOne({ courseId: session.courseId });
        if (liveClass) {
          liveClass.status = 'completed';
          liveClass.endedAt = new Date();
          await liveClass.save();
          console.log('✅ [FALLBACK] Updated LiveClass status to completed for course:', session.courseId);
        } else {
          console.log('⚠️ [FALLBACK] No LiveClass found for course:', session.courseId);
        }

        res.json({
          success: true,
          message: 'Live class ended successfully (fallback)',
          session: {
            sessionId: session.sessionId,
            status: session.status,
            endTime: session.endTime
          }
        });
      } catch (error) {
        console.error('❌ [FALLBACK] Error ending live class:', error);
        res.status(500).json({ error: 'Failed to end live class', details: error.message });
      }
    },
    
    getReplayClasses: (req, res) => res.status(400).json({ error: 'Google Meet service not available' }),
    processRecording: (req, res) => res.status(400).json({ error: 'Google Meet service not available' })
  };
  
  console.log('⚠️  WARNING: Using FALLBACK Google Meet controller!');
  console.log('⚠️  Auto-end detection will NOT work properly!');
  console.log('⚠️  Check your Google OAuth configuration in .env file');
}

// Google OAuth Routes
router.get('/auth/google/url', protect, googleOAuthController.getAuthUrl);
router.get('/auth/google/callback', googleOAuthController.handleCallback); // Removed protect middleware
router.post('/auth/disconnect', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../models/User');
    
    // Remove Google tokens from user
    await User.findByIdAndUpdate(userId, { 
      $unset: { googleTokens: "" } 
    });
    
    console.log('✅ Google account disconnected for user:', userId);
    res.json({ success: true, message: 'Google account disconnected successfully' });
  } catch (error) {
    console.error('❌ Error disconnecting Google account:', error);
    res.status(500).json({ error: 'Failed to disconnect Google account' });
  }
});

// Test route to verify basic functionality
router.get('/test', (req, res) => {
  console.log('🔍 TEST ROUTE: /test called');
  res.json({ success: true, message: 'Test route working' });
});

// Debug route to check which controller is loaded
router.get('/debug/controller-status', (req, res) => {
  const controllerInfo = {
    liveClassControllerExists: !!liveClassController,
    startLiveClassExists: !!liveClassController?.startLiveClass,
    getCurrentSessionExists: !!liveClassController?.getCurrentSession,
    endLiveClassExists: !!liveClassController?.endLiveClass,
    isFallbackController: liveClassController?.endLiveClass?.toString().includes('not available')
  };
  
  res.json({
    success: true,
    message: 'Controller Status',
    ...controllerInfo,
    warning: controllerInfo.isFallbackController ? 
      'Using FALLBACK controller - auto-end will NOT work!' : 
      'Using MAIN controller - auto-end should work'
  });
});

// Debug route to manually trigger auto-end check
router.post('/debug/trigger-auto-end', protect, async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Manual auto-end check triggered');
    
    const LiveClassSession = require('../models/LiveClassSession');
    const activeSessions = await LiveClassSession.find({ status: 'live' })
      .populate('courseId', 'title');

    console.log(`🔍 [DEBUG] Found ${activeSessions.length} active sessions`);

    const results = [];

    for (const session of activeSessions) {
      const sessionDuration = Date.now() - new Date(session.startTime).getTime();
      const sessionMinutes = Math.round(sessionDuration / 60000);
      
      const info = {
        sessionId: session.sessionId,
        courseTitle: session.courseId?.title || 'Unknown',
        status: session.status,
        startTime: session.startTime,
        durationMinutes: sessionMinutes,
        shouldEnd: sessionMinutes >= 1 // 1 minute for testing
      };

      // Auto-end if running for more than 1 minute (for testing)
      if (sessionMinutes >= 1) {
        console.log(`⏰ [DEBUG] Ending session ${session.sessionId} (${sessionMinutes} min)`);
        session.status = 'ended';
        session.endTime = new Date();
        await session.save();
        info.action = 'ENDED';
      } else {
        info.action = 'ACTIVE';
      }

      results.push(info);
    }

    res.json({
      success: true,
      message: 'Auto-end check completed',
      activeSessions: activeSessions.length,
      results
    });

  } catch (error) {
    console.error('❌ [DEBUG] Error in manual auto-end:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test route for live/start
router.post('/live/start-test', protect, (req, res) => {
  console.log('🔍 TEST ROUTE: /live/start-test called');
  res.json({ success: true, message: 'Test route working', body: req.body });
});

// Live Class Routes
console.log('🔍 About to define /live/start route');
router.post('/live/start', protect, (req, res) => {
  console.log('🔍 ROUTE: /live/start called');
  console.log('🔍 ROUTE: User:', req.user ? req.user._id : 'No user');
  console.log('🔍 ROUTE: Body:', req.body);
  console.log('🔍 ROUTE: Controller exists:', !!liveClassController);
  console.log('🔍 ROUTE: startLiveClass function exists:', !!liveClassController?.startLiveClass);
  
  // Test if the controller function can be called
  try {
    console.log('🔍 ROUTE: About to call startLiveClass...');
    if (liveClassController && liveClassController.startLiveClass) {
      liveClassController.startLiveClass(req, res);
    } else {
      console.error('❌ ROUTE: Controller or startLiveClass function not found');
      res.status(500).json({ error: 'Controller not available' });
    }
  } catch (error) {
    console.error('❌ ROUTE: Error calling startLiveClass:', error.message);
    console.error('❌ ROUTE: Error stack:', error.stack);
    res.status(500).json({ error: 'Controller error', details: error.message });
  }
});
router.get('/live/current/:courseId', protect, liveClassController.getCurrentSession);
router.post('/live/end', protect, liveClassController.endLiveClass);
router.get('/live/replays/:courseId', protect, liveClassController.getReplayClasses);
router.post('/live/process-recording', liveClassController.processRecording);

// List all active live sessions for the current learner across enrolled courses
router.get('/live/learner/active', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('🔍 DEBUG: Getting active sessions for learner:', userId);
    
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    const LiveClassSession = require('../models/LiveClassSession');

    // Prefer Enrollment records to determine enrolled courses (active or completed)
    const enrollments = await Enrollment.find({ 
      learner: userId, 
      status: { $in: ['active', 'completed'] }
    }).select('course').populate('course', 'title');
    
    console.log('🔍 DEBUG: Found enrollments:', enrollments.length);
    console.log('🔍 DEBUG: Enrollment details:', enrollments.map(e => ({
      courseId: e.course._id,
      courseTitle: e.course.title,
      status: e.status
    })));
    
    let courseIds = enrollments.map(e => e.course._id);

    // Fallback: if no Enrollment records found, try Course.enrolledStudents for backward compatibility
    if (courseIds.length === 0) {
      console.log('🔍 DEBUG: No enrollments found, trying Course.enrolledStudents fallback...');
      const enrolled = await Course.find({ enrolledStudents: userId }).select('_id title');
      courseIds = enrolled.map(c => c._id);
      console.log('🔍 DEBUG: Fallback found courses:', enrolled.map(c => ({ id: c._id, title: c.title })));
    }

    if (courseIds.length === 0) {
      console.log('🔍 DEBUG: No enrolled courses found for learner');
      return res.json({ success: true, data: [] });
    }

    console.log('🔍 DEBUG: Searching for sessions in courses:', courseIds);

    // Find active sessions for those courses
    const sessions = await LiveClassSession.find({
      courseId: { $in: courseIds },
      status: { $in: ['scheduled', 'live'] }
    }).populate('tutorId', 'name').populate('courseId', 'title').sort({ startTime: -1 });

    console.log('🔍 DEBUG: Found sessions:', sessions.length);
    console.log('🔍 DEBUG: Session details:', sessions.map(s => ({
      sessionId: s.sessionId,
      courseId: s.courseId._id,
      courseTitle: s.courseId.title,
      status: s.status,
      tutorName: s.tutorId?.name,
      startTime: s.startTime
    })));

    const result = sessions.map(s => ({
      sessionId: s.sessionId,
      courseId: s.courseId._id, // ObjectId is fine for API; frontend treats as ID
      courseTitle: s.courseId.title,
      tutorName: s.tutorId?.name,
      startTime: s.startTime,
      status: s.status,
      meetLink: s.meetLink
    }));

    console.log('🔍 DEBUG: Returning result:', result);
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('❌ DEBUG: Error in learner active sessions:', error);
    res.status(500).json({ error: 'Failed to get learner active sessions', details: error.message });
  }
});

module.exports = router;
