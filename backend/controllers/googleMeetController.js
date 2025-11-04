const { 
  GoogleOAuthService, 
  GoogleMeetService, 
  GoogleDriveService 
} = require('../services/googleMeetService');
const LiveClassSession = require('../models/LiveClassSession');
const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const MeetRecordingBot = require('../services/meetRecordingBot');

// Store active recording bots by sessionId
const activeRecordingBots = new Map();

// Google OAuth Controller
const googleOAuthController = {
  // Get Google OAuth URL
  getAuthUrl: async (req, res) => {
    try {
      const userId = req.user._id;
      console.log('🔍 Getting auth URL for user:', userId);
      
      // Include user ID in state parameter
      const state = Buffer.from(JSON.stringify({ userId: userId.toString() })).toString('base64');
      
      const authUrl = GoogleOAuthService.getAuthUrl(state);
      console.log('✅ Generated auth URL:', authUrl);
      
      res.json({ authUrl });
    } catch (error) {
      console.error('❌ Error getting auth URL:', error);
      res.status(500).json({ error: 'Failed to get Google auth URL' });
    }
  },

  // Handle OAuth callback
  handleCallback: async (req, res) => {
    try {
      const { code, state } = req.query;
      
      console.log('🔍 OAuth callback received:', { code: !!code, state });

      if (!code) {
        console.error('❌ No authorization code received');
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      // Get tokens from Google
      console.log('🔄 Exchanging code for tokens...');
      const tokens = await GoogleOAuthService.getTokens(code);
      console.log('✅ Tokens received:', { 
        hasAccessToken: !!tokens.access_token, 
        hasRefreshToken: !!tokens.refresh_token 
      });
      
      // Decode the state to get user ID
      let userId;
      if (state) {
        try {
          const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
          userId = decodedState.userId;
          console.log('🔍 Decoded user ID from state:', userId);
        } catch (error) {
          console.error('❌ Error decoding state:', error);
          return res.status(400).json({ error: 'Invalid state parameter' });
        }
      } else {
        console.error('❌ No state parameter - cannot identify user');
        return res.status(400).json({ error: 'State parameter is required to identify user' });
      }

      // Validate tokens before saving
      if (!tokens.access_token) {
        console.error('❌ No access token received from Google');
        return res.status(500).json({ error: 'Failed to get access token from Google' });
      }

      // Save tokens to user document
      console.log('💾 Saving tokens to user:', userId);
      
      const googleTokensData = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date || new Date(Date.now() + 3600 * 1000) // Default 1 hour
      };
      
      const result = await User.findByIdAndUpdate(userId, {
        googleTokens: googleTokensData
      }, { new: true });
      
      console.log('✅ Google tokens saved successfully');
      console.log('🔍 Verification - Saved tokens:', {
        hasAccessToken: !!result.googleTokens?.accessToken,
        hasRefreshToken: !!result.googleTokens?.refreshToken
      });

      // Return success response
      res.json({ 
        success: true, 
        message: 'Google account connected successfully'
      });
    } catch (error) {
      console.error('❌ Error handling OAuth callback:', error);
      res.status(500).json({ error: 'Failed to connect Google account', details: error.message });
    }
  }
};

// Live Class Controller
const liveClassController = {
  // Start live class (Tutor only)
  startLiveClass: async (req, res) => {
    console.log('🚀 START LIVE CLASS: Function entry point reached!');
    try {
      console.log('🔍 START LIVE CLASS: Function called');
      
      // Check database connection
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.log('❌ START LIVE CLASS FAILED: Database not connected');
        return res.status(503).json({ 
          error: 'Database connection unavailable',
          details: 'The database is currently unavailable. Please try again in a few moments.',
          action: 'retry_later'
        });
      }
      
      const { courseId, customMeetLink } = req.body;
      const tutorId = req.user._id;

      console.log('🔍 START LIVE CLASS DEBUG:', {
        courseId,
        tutorId: tutorId.toString(),
        userRole: req.user.role,
        userName: req.user.name,
        userEmail: req.user.email,
        hasCustomLink: !!customMeetLink,
        bodyKeys: Object.keys(req.body)
      });

      // Verify user is a tutor
      if (req.user.role !== 'tutor') {
        console.log('❌ START LIVE CLASS FAILED: User is not a tutor', {
          userRole: req.user.role,
          userId: tutorId
        });
        return res.status(403).json({ error: 'Only tutors can start live classes' });
      }
      console.log('✅ User role verification passed');

      // Get course details
      console.log('🔍 Fetching course details for:', courseId);
      const course = await Course.findById(courseId).populate('enrolledStudents').populate('tutor');
      if (!course) {
        console.log('❌ Course not found:', courseId);
        return res.status(404).json({ error: 'Course not found' });
      }
      console.log('✅ Course found:', course.title, 'Enrolled students:', course.enrolledStudents.length);

      // Verify tutor owns the course
      console.log('🔍 COURSE OWNERSHIP CHECK:', {
        courseTutor: course.tutor._id.toString(),
        requestTutorId: tutorId.toString(),
        match: course.tutor._id.toString() === tutorId.toString()
      });

      if (course.tutor._id.toString() !== tutorId.toString()) {
        console.log('❌ START LIVE CLASS FAILED: Tutor does not own course', {
          courseId,
          courseTutor: course.tutor.toString(),
          requestTutorId: tutorId.toString(),
          courseTitle: course.title
        });
        return res.status(403).json({ error: 'You can only start classes for your own courses' });
      }
      console.log('✅ Course ownership verification passed');

      // Check if there's already an active session; if so, return it instead of failing
      console.log('🔍 DEBUG: Checking for existing session in course:', courseId);
      const existingSession = await LiveClassSession.findOne({
        courseId,
        status: 'live'
      });
      console.log('🔍 Existing session check result:', existingSession ? 'Found' : 'Not found');

      if (existingSession) {
        console.log('🔍 DEBUG: Found existing session:', existingSession.sessionId);
        
        // Also check if there's a corresponding LiveClass record
        const existingLiveClass = await LiveClass.findOne({
          sessionId: existingSession.sessionId
        });
        
        if (!existingLiveClass) {
          // Create LiveClass record for existing session
          try {
            const liveClass = new LiveClass({
              title: `Live Class - ${course.title}`,
              description: `Live class session for ${course.title}`,
              courseId: courseId,
              tutorId: tutorId,
              scheduledDate: existingSession.startTime,
              duration: 60,
              status: 'live',
              startedAt: existingSession.startTime,
              callId: existingSession.sessionId,
              sessionId: existingSession.sessionId,
              meetLink: existingSession.meetLink,
              settings: {
                allowScreenShare: true,
                allowChat: true,
                allowLearnerScreenShare: false,
                maxParticipants: 50,
                autoRecord: true
              }
            });
            await liveClass.save();
            console.log('🔍 DEBUG: Created LiveClass for existing session:', liveClass._id);
          } catch (liveClassError) {
            console.error('⚠️ Failed to create LiveClass for existing session (non-critical):', liveClassError.message);
          }
        }
        
        return res.status(200).json({
          success: true,
          message: 'Live class is already active',
          session: {
            sessionId: existingSession.sessionId,
            meetLink: existingSession.meetLink,
            courseTitle: course.title,
            startTime: existingSession.startTime,
            enrolledLearners: course.enrolledStudents.length
          }
        });
      }

      let meetLink, calendarEventId;

      // If a custom meeting link is provided, allow starting without Google OAuth
      if (customMeetLink && typeof customMeetLink === 'string' && customMeetLink.startsWith('http')) {
        console.log('🔍 Using custom meet link:', customMeetLink);
        meetLink = customMeetLink;
        calendarEventId = 'custom';

        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🔍 DEBUG: Creating new session with ID:', sessionId);
        console.log('🔍 DEBUG: Course enrolled students:', course.enrolledStudents.length);
        
        console.log('🔍 Creating LiveClassSession with data:', {
          courseId,
          tutorId,
          sessionId,
          meetLink,
          calendarEventId,
          status: 'live',
          startTime: new Date(),
          enrolledLearnersCount: course.enrolledStudents.length
        });
        
        const session = new LiveClassSession({
          courseId,
          tutorId,
          sessionId,
          meetLink,
          calendarEventId,
          status: 'live',
          startTime: new Date(),
          enrolledLearners: course.enrolledStudents.map(learner => learner._id)
        });

        console.log('🔍 About to save session...');
        await session.save();
        console.log('🔍 DEBUG: Session saved successfully:', session._id);

        // Also create a LiveClass record for compatibility with the original system
        try {
          const liveClass = new LiveClass({
            title: `Live Class - ${course.title}`,
            description: `Live class session for ${course.title}`,
            courseId: courseId,
            tutorId: tutorId,
            scheduledDate: new Date(),
            duration: 60, // Default duration
            status: 'live',
            startedAt: new Date(),
            callId: sessionId,
            sessionId: sessionId,
            meetLink: meetLink,
            settings: {
              allowScreenShare: true,
              allowChat: true,
              allowLearnerScreenShare: false,
              maxParticipants: 50,
              autoRecord: true
            }
          });

          await liveClass.save();
          console.log('🔍 DEBUG: LiveClass record also created:', liveClass._id);
        } catch (liveClassError) {
          console.error('⚠️ Failed to create LiveClass record (non-critical):', liveClassError.message);
          // Don't fail the entire request if LiveClass creation fails
        }

        // Notify enrolled learners (excluding tutor)
        console.log('🔍 Preparing to notify learners...');
        const learnersToNotify = course.enrolledStudents.filter(learner => 
          learner._id.toString() !== tutorId.toString()
        );
        console.log('🔍 Learners to notify:', learnersToNotify.length);
        
        try {
          await Promise.all(learnersToNotify.map(async (learner) => {
            console.log('🔍 Notifying learner:', learner._id);
            await NotificationService.emitNotification(learner._id, {
              type: 'live_class_started',
              title: 'Live Class Started!',
              message: `Your tutor has started a live class for "${course.title}". Click to join!`,
              data: { courseId, sessionId, meetLink, courseTitle: course.title }
            });
          }));
          console.log('✅ All notifications sent successfully');
        } catch (notificationError) {
          console.error('⚠️ Notification error (non-critical):', notificationError.message);
        }

        console.log('🔍 Updating session notificationsSent flag...');
        session.notificationsSent = true;
        await session.save();
        console.log('✅ Session updated with notificationsSent flag');

        // Start automated recording bot
        console.log('🤖 Starting automated recording bot...');
        const recordingBot = new MeetRecordingBot();
        activeRecordingBots.set(sessionId, recordingBot);
        
        // Start recording in background (don't block response)
        recordingBot.recordMeeting(meetLink, sessionId, tutor.googleTokens, tutor.email)
          .then(result => {
            console.log('✅ Automated recording started:', result);
          })
          .catch(error => {
            console.error('❌ Failed to start automated recording:', error);
            activeRecordingBots.delete(sessionId);
          });

        console.log('🔍 Preparing success response...');
        return res.json({
          success: true,
          session: {
            sessionId,
            meetLink,
            courseTitle: course.title,
            startTime: session.startTime,
            enrolledLearners: course.enrolledStudents.length
          }
        });
      }

      // Otherwise, require Google OAuth to generate a Meet link
      console.log('🔍 Custom link not provided, checking Google OAuth...');
      const tutor = await User.findById(tutorId);
      console.log('🔍 Tutor found:', tutor ? 'Yes' : 'No');
      
      if (!tutor.googleTokens) {
        console.log('❌ START LIVE CLASS FAILED: Google account not connected', {
          tutorId: tutorId.toString(),
          tutorName: tutor.name,
          tutorEmail: tutor.email
        });
        return res.status(400).json({ 
          error: 'Google account not connected. Please connect your Google account first.',
          details: 'You need to connect your Google account to start live classes, or provide a custom meeting link.'
        });
      }
      console.log('✅ Google tokens found');

      // Check if Google tokens are complete
      if (!tutor.googleTokens.accessToken || !tutor.googleTokens.refreshToken || !tutor.googleTokens.expiryDate) {
        console.log('❌ START LIVE CLASS FAILED: Incomplete Google tokens', {
          tutorId: tutorId.toString(),
          tutorName: tutor.name,
          hasAccessToken: !!tutor.googleTokens.accessToken,
          hasRefreshToken: !!tutor.googleTokens.refreshToken,
          hasExpiryDate: !!tutor.googleTokens.expiryDate
        });
        return res.status(400).json({ 
          error: 'Google account connection is incomplete. Please reconnect your Google account.',
          details: 'Your Google account connection is missing required tokens. Please disconnect and reconnect your Google account.',
          action: 'reconnect_google'
        });
      }

      // Check if tokens are expired
      const now = Date.now();
      const tokenExpiry = new Date(tutor.googleTokens.expiryDate).getTime();
      const isExpired = tokenExpiry < now;
      
      console.log('🔍 Token expiry check:', {
        now: new Date(now).toISOString(),
        expiry: new Date(tokenExpiry).toISOString(),
        isExpired,
        timeUntilExpiry: tokenExpiry - now
      });

      // Set up OAuth client with tutor's tokens
      GoogleOAuthService.setCredentials(tutor.googleTokens);
      
      // Refresh token if needed
      if (tutor.googleTokens.expiryDate < Date.now()) {
        console.log('🔄 Token expired, refreshing...');
        const newTokens = await GoogleOAuthService.refreshToken(tutor.googleTokens.refreshToken);
        
        // Convert Google's token format to our database format
        const formattedTokens = {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || tutor.googleTokens.refreshToken, // Keep old refresh token if new one not provided
          expiryDate: newTokens.expiry_date
        };
        
        console.log('✅ Token refreshed successfully');
        await User.findByIdAndUpdate(tutorId, { googleTokens: formattedTokens });
        GoogleOAuthService.setCredentials(formattedTokens);
        
        // Update the local tutor object so subsequent code uses the new tokens
        tutor.googleTokens = formattedTokens;
      }

      // Create Meet link
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      // Get learner emails for attendee list
      const learnerEmails = course.enrolledStudents.map(student => student.email).filter(email => email);
      console.log('👥 Adding learners to Meet attendees:', learnerEmails.length);

      console.log('🔄 Creating Google Meet link...');
      const meetData = await GoogleMeetService.createMeetLink(
        tutorId,
        course.title,
        startTime.toISOString(),
        endTime.toISOString(),
        learnerEmails
      );

      if (!meetData || !meetData.meetLink) {
        console.log('❌ START LIVE CLASS FAILED: Failed to create Meet link', {
          meetData: meetData
        });
        return res.status(500).json({ 
          error: 'Failed to create Google Meet link. Please try again.',
          details: 'There was an error creating the meeting link. Please check your Google account connection.',
          debug: meetData
        });
      }

      meetLink = meetData.meetLink;
      calendarEventId = meetData.calendarEventId;
      
      console.log('✅ Google Meet link created successfully:', meetLink);

      // Add enrolled learners as attendees (learnerEmails already declared above)
      if (learnerEmails.length > 0) {
        await GoogleMeetService.updateEventWithAttendees(calendarEventId, learnerEmails);
      }

      // Create session record
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const session = new LiveClassSession({
        courseId,
        tutorId,
        sessionId,
        meetLink,
        calendarEventId,
        status: 'live',
        startTime: new Date(),
        enrolledLearners: course.enrolledStudents.map(learner => learner._id)
      });

      await session.save();

      // Send notifications to enrolled learners (excluding the tutor)
      const learnersToNotify = course.enrolledStudents.filter(learner => 
        learner._id.toString() !== tutorId.toString()
      );
      
      const notificationPromises = learnersToNotify.map(async (learner) => {
        await NotificationService.emitNotification(learner._id, {
          type: 'live_class_started',
          title: 'Live Class Started!',
          message: `Your tutor has started a live class for "${course.title}". Click to join!`,
          data: {
            courseId,
            sessionId,
            meetLink,
            courseTitle: course.title
          }
        });
      });

      await Promise.all(notificationPromises);

      // Update session with notifications sent
      session.notificationsSent = true;
      await session.save();

      // Start automated recording bot
      console.log('🤖 Starting automated recording bot...');
      console.log('🔍 Google tokens check:', {
        hasTokens: !!tutor.googleTokens,
        hasAccessToken: !!tutor.googleTokens?.accessToken,
        hasRefreshToken: !!tutor.googleTokens?.refreshToken
      });
      
      // Only start bot if tokens are valid
      if (tutor.googleTokens && tutor.googleTokens.accessToken) {
        const recordingBot = new MeetRecordingBot();
        activeRecordingBots.set(sessionId, recordingBot);
        
        // Start recording in background (don't block response)
        recordingBot.recordMeeting(meetLink, sessionId, tutor.googleTokens, tutor.email)
          .then(result => {
            console.log('✅ Automated recording started:', result);
          })
          .catch(error => {
            console.error('❌ Failed to start automated recording:', error);
            console.error('❌ Error stack:', error.stack);
            activeRecordingBots.delete(sessionId);
          });
      } else {
        console.warn('⚠️ Cannot start recording bot: Google tokens not available');
        console.warn('⚠️ Recording will not be captured for this session');
        console.warn('💡 Solution: Connect your Google account in tutor settings');
      }

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

      console.log('✅ START LIVE CLASS: Function completed successfully');

    } catch (error) {
      console.error('❌ Error starting live class:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        code: error.code
      });
      
      // Provide more specific error messages
      if (error.message && error.message.includes('invalid_grant')) {
        return res.status(400).json({ 
          error: 'Google account connection expired. Please reconnect your Google account.',
          details: 'Your Google account connection has expired. Please disconnect and reconnect your Google account.'
        });
      }
      
      if (error.message && error.message.includes('insufficient_scope')) {
        return res.status(400).json({ 
          error: 'Google account permissions insufficient. Please reconnect your Google account.',
          details: 'Your Google account needs additional permissions. Please disconnect and reconnect your Google account.'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to start live class',
        details: error.message || 'An unexpected error occurred. Please try again.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Get current live session for a course
  getCurrentSession: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user._id;

      console.log('🔍 GET CURRENT SESSION DEBUG:', {
        courseId,
        userId: userId.toString(),
        userRole: req.user.role,
        userName: req.user.name,
        userEmail: req.user.email
      });

      // Get course and verify enrollment
      const course = await Course.findById(courseId).populate('tutor');
      if (!course) {
        console.log('❌ Course not found:', courseId);
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if user is enrolled (learner) or owns the course (tutor)
      const isEnrolled = Array.isArray(course.enrolledStudents)
        ? course.enrolledStudents.some((id) => id.toString() === userId.toString())
        : false;
      const isOwner = course.tutor._id.toString() === userId.toString();

      console.log('🔍 ACCESS CHECK:', { 
        isEnrolled, 
        isOwner, 
        userId: userId.toString(), 
        tutorId: course.tutor.toString(),
        enrolledStudents: course.enrolledStudents.length,
        courseTitle: course.title
      });

      if (!isEnrolled && !isOwner) {
        console.log('❌ GET CURRENT SESSION FAILED: User not enrolled or owner', {
          courseId,
          userId: userId.toString(),
          courseTutor: course.tutor.toString(),
          isEnrolled,
          isOwner,
          enrolledStudents: course.enrolledStudents.map(id => id.toString())
        });
        return res.status(403).json({ error: 'You are not enrolled in this course' });
      }

      // Get current session (only live sessions, not ended/completed ones)
      const session = await LiveClassSession.findOne({
        courseId,
        status: 'live'
      }).populate('tutorId', 'name email');

      if (!session) {
        console.log('ℹ️ No active session found');
        
        // Check if there's a recently completed session (within last 5 minutes)
        const recentlyCompletedSession = await LiveClassSession.findOne({
          courseId,
          status: 'ended',
          endTime: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        }).sort({ endTime: -1 });

        if (recentlyCompletedSession) {
          console.log('🎯 Recently completed session found:', recentlyCompletedSession.sessionId);
          return res.json({ 
            status: 'no_session',
            message: 'No active session found',
            recentlyCompleted: true,
            lastSession: {
              sessionId: recentlyCompletedSession.sessionId,
              endTime: recentlyCompletedSession.endTime
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

      // Check if Google Meet session has ended by checking calendar event
      const tutor = await User.findById(session.tutorId);
      if (tutor && tutor.googleTokens && session.calendarEventId && session.calendarEventId !== 'custom') {
        try {
          // Refresh token if expired before checking event
          if (tutor.googleTokens.expiryDate < Date.now()) {
            console.log('🔄 Token expired, refreshing before checking event...');
            const newTokens = await GoogleOAuthService.refreshToken(tutor.googleTokens.refreshToken);
            
            // Convert Google's token format to our database format
            const formattedTokens = {
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || tutor.googleTokens.refreshToken,
              expiryDate: newTokens.expiry_date
            };
            
            await User.findByIdAndUpdate(tutor._id, { googleTokens: formattedTokens });
            tutor.googleTokens = formattedTokens;
            console.log('✅ Token refreshed successfully');
          }
          
          GoogleOAuthService.setCredentials(tutor.googleTokens);
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
          
          const event = await calendar.events.get({
            calendarId: 'primary',
            eventId: session.calendarEventId
          });

          // Check if event has ended based on end time
          const now = new Date();
          const eventEndTime = new Date(event.data.end.dateTime || event.data.end.date);
          const eventStartTime = new Date(event.data.start.dateTime || event.data.start.date);
          
          // If event doesn't exist, is cancelled, or has passed its end time, auto-end the session
          if (!event.data || event.data.status === 'cancelled' || now > eventEndTime) {
            console.log('🔍 Google Meet session ended, auto-ending platform session...');
            console.log('🔍 Event details:', {
              exists: !!event.data,
              status: event.data?.status,
              endTime: eventEndTime,
              currentTime: now,
              hasEnded: now > eventEndTime
            });
            
            // Auto-end the session
            session.status = 'ended';
            session.endTime = new Date();
            await session.save();

            // Update course status
            const liveClass = await LiveClass.findOne({ courseId });
            if (liveClass) {
              liveClass.status = 'completed';
              await liveClass.save();
              console.log('🔍 DEBUG: Updated LiveClass status to completed:', liveClass._id);
            }

            // Send notifications to learners
            if (course && course.enrolledStudents) {
              const learnersToNotify = course.enrolledStudents.filter(learner =>
                learner._id.toString() !== session.tutorId._id.toString()
              );

              const notificationPromises = learnersToNotify.map(async (learner) => {
                await NotificationService.emitNotification(learner._id, {
                  type: 'live_class_ended',
                  title: 'Live Class Ended',
                  message: `The live class for "${course.title}" has ended. Recording will be available soon!`,
                  data: {
                    courseId: session.courseId,
                    sessionId: session.sessionId,
                    courseTitle: course.title,
                    endTime: session.endTime
                  }
                });
              });

              await Promise.all(notificationPromises);
              console.log('📢 Auto-end notifications sent to', learnersToNotify.length, 'learners');

              // Also notify the tutor
              try {
                await NotificationService.emitNotification(session.tutorId._id, {
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
                console.log('📢 Auto-end notification sent to tutor');
              } catch (error) {
                console.error('Failed to notify tutor:', error);
              }
            }

            // Auto-process recording
            setTimeout(async () => {
              try {
                console.log('🔄 Auto-processing recording for session:', session.sessionId);
                await liveClassController.processRecording({ body: { sessionId: session.sessionId } }, { json: () => {} });
                console.log('✅ Recording processed successfully');
              } catch (error) {
                console.error('❌ Error auto-processing recording:', error);
              }
            }, 30000); // Wait 30 seconds for Google to process the recording

            return res.json({
              status: 'ended',
              message: 'Session auto-ended - Google Meet session has ended',
              session: {
                sessionId: session.sessionId,
                status: session.status,
                endTime: session.endTime
              }
            });
          }
        } catch (error) {
          console.warn('⚠️ Could not check Google Meet status:', error.message);
          // Continue with normal flow if we can't check Google Meet status
        }
      }

      // Check if session has been active for too long (auto-end after 4 hours)
      const sessionDuration = Date.now() - session.startTime.getTime();
      const maxDuration = 4 * 60 * 60 * 1000; // 4 hours

      if (sessionDuration > maxDuration) {
        console.log('⏰ Session exceeded maximum duration, auto-ending...');
        
        // Auto-end the session
        session.status = 'ended';
        session.endTime = new Date();
        await session.save();

        // Update course status
        const liveClass = await LiveClass.findOne({ courseId });
        if (liveClass) {
          liveClass.status = 'completed';
          await liveClass.save();
          console.log('🔍 DEBUG: Updated LiveClass status to completed:', liveClass._id);
        }

        return res.json({
          status: 'ended',
          message: 'Session auto-ended due to maximum duration',
          session: {
            sessionId: session.sessionId,
            status: session.status,
            endTime: session.endTime
          }
        });
      }

      res.json({
        status: 'active',
        session: {
          sessionId: session.sessionId,
          meetLink: session.meetLink,
          tutorName: session.tutorId.name,
          startTime: session.startTime,
          status: session.status
        }
      });

    } catch (error) {
      console.error('❌ Error getting current session:', error);
      res.status(500).json({ error: 'Failed to get current session', details: error.message });
    }
  },

  // End live class (Tutor only)
  endLiveClass: async (req, res) => {
    try {
      const { sessionId } = req.body;
      const tutorId = req.user._id;

      // Verify user is a tutor
      if (req.user.role !== 'tutor') {
        return res.status(403).json({ error: 'Only tutors can end live classes' });
      }

      // Get session
      const session = await LiveClassSession.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Verify tutor owns the session
      if (session.tutorId.toString() !== tutorId.toString()) {
        return res.status(403).json({ error: 'You can only end your own sessions' });
      }

      // Get course details for notifications
      const course = await Course.findById(session.courseId).populate('enrolledStudents');
      
      // Update session status to ended
      session.status = 'ended';
      session.endTime = new Date();
      await session.save();

      // Also update the corresponding LiveClass record to 'completed'
      const liveClass = await LiveClass.findOne({ courseId: session.courseId });
      if (liveClass) {
        liveClass.status = 'completed';
        liveClass.endedAt = new Date();
        await liveClass.save();
        console.log('✅ Updated LiveClass status to completed for course:', session.courseId);
      } else {
        console.log('⚠️ No LiveClass found for course:', session.courseId);
      }

      console.log('✅ Live class ended successfully:', session.sessionId);

      // Send notifications to all enrolled learners
      if (course && course.enrolledStudents) {
        const learnersToNotify = course.enrolledStudents.filter(learner =>
          learner._id.toString() !== tutorId.toString()
        );

        const notificationPromises = learnersToNotify.map(async (learner) => {
          await NotificationService.emitNotification(learner._id, {
            type: 'live_class_ended',
            title: 'Live Class Ended',
            message: `The live class for "${course.title}" has ended. Recording will be available soon!`,
            data: {
              courseId: session.courseId,
              sessionId: session.sessionId,
              courseTitle: course.title,
              endTime: session.endTime
            }
          });
        });

        await Promise.all(notificationPromises);
        console.log('📢 Notifications sent to', learnersToNotify.length, 'learners');
      }

      // Stop automated recording bot and upload to Drive
      const recordingBot = activeRecordingBots.get(sessionId);
      if (recordingBot) {
        console.log('⏹️ Stopping automated recording bot...');
        
        // Stop recording and upload in background
        (async () => {
          try {
            const tutor = await User.findById(tutorId);
            
            // Stop recording
            await recordingBot.stopRecording();
            await recordingBot.leaveMeeting();
            
            // Keep recording locally and create Replay record
            const path = require('path');
            const fs = require('fs').promises;
            const Replay = require('../models/Replay');
            
            const recordingPath = path.join(__dirname, '../recordings', `${sessionId}.mp4`);
            const fileName = `SkillLift-Recording-${course.title}-${new Date().toISOString()}.mp4`;
            
            console.log('💾 Saving recording locally:', recordingPath);
            
            // Move recording to permanent uploads folder
            const permanentPath = path.join(__dirname, '../uploads/replays', fileName);
            const uploadsDir = path.join(__dirname, '../uploads/replays');
            
            // Ensure uploads/replays directory exists
            try {
              await fs.mkdir(uploadsDir, { recursive: true });
            } catch (e) {
              console.log('⚠️ Uploads directory already exists or error:', e.message);
            }
            
            // Move file
            try {
              await fs.rename(recordingPath, permanentPath);
              console.log('✅ Recording moved to permanent storage');
            } catch (e) {
              console.log('⚠️ Could not move file, trying copy:', e.message);
              await fs.copyFile(recordingPath, permanentPath);
              await fs.unlink(recordingPath);
            }
            
            // Get file size
            const stats = await fs.stat(permanentPath);
            const fileSize = stats.size;
            
            // Create Replay record in database
            const replay = await Replay.create({
              course: session.courseId,
              tutor: tutorId,
              title: `Live Class Recording - ${course.title}`,
              description: `Recorded on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
              fileUrl: `/api/replays/stream/${fileName}`, // URL to stream the video
              fileName: fileName,
              fileSize: fileSize,
              uploadDate: new Date(),
              status: 'ready',
              isPublic: true,
              deleteAt: null // Don't auto-delete (or set to 30 days later if you want)
            });
            
            console.log('✅ Replay record created:', replay._id);
            
            // Update session with recording URL
            await LiveClassSession.findOneAndUpdate(
              { sessionId },
              { 
                recordingUrl: `/api/replays/stream/${fileName}`,
                recordingId: replay._id.toString(),
                botMetadata: {
                  status: 'completed',
                  recordingPath: permanentPath,
                  stoppedAt: new Date()
                }
              }
            );
            
            console.log('✅ Recording saved successfully - available for learners!');
            
            // Cleanup bot
            await recordingBot.cleanup();
            activeRecordingBots.delete(sessionId);
            
            // Notify learners that replay is ready
            const notifyPromises = course.enrolledStudents.map(async (learner) => {
              await NotificationService.emitNotification(learner._id, {
                type: 'replay_ready',
                title: 'Class Replay Available!',
                message: `The recording for "${course.title}" is now available to watch in the Replay section.`,
                data: {
                  courseId: session.courseId,
                  sessionId: session.sessionId,
                  recordingUrl: `/api/replays/stream/${fileName}`,
                  replayId: replay._id.toString()
                }
              });
            });
            await Promise.all(notifyPromises);
            console.log('📢 Replay ready notifications sent');
            
          } catch (error) {
            console.error('❌ Error stopping/uploading recording:', error);
            activeRecordingBots.delete(sessionId);
          }
        })();
      }

      // End Google Calendar event if it exists
      if (session.calendarEventId && session.calendarEventId !== 'custom') {
        const tutor = await User.findById(tutorId);
        if (tutor.googleTokens) {
          // Refresh token if expired before ending event
          if (tutor.googleTokens.expiryDate < Date.now()) {
            console.log('🔄 Token expired, refreshing before ending event...');
            const newTokens = await GoogleOAuthService.refreshToken(tutor.googleTokens.refreshToken);
            
            // Convert Google's token format to our database format
            const formattedTokens = {
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || tutor.googleTokens.refreshToken,
              expiryDate: newTokens.expiry_date
            };
            
            await User.findByIdAndUpdate(tutorId, { googleTokens: formattedTokens });
            tutor.googleTokens = formattedTokens;
            console.log('✅ Token refreshed successfully');
          }
          
          GoogleOAuthService.setCredentials(tutor.googleTokens);
          await GoogleMeetService.endEvent(session.calendarEventId);
        }
      }

      res.json({
        success: true,
        message: 'Live class ended successfully',
        session: {
          sessionId: session.sessionId,
          status: session.status,
          endTime: session.endTime
        }
      });

    } catch (error) {
      console.error('Error ending live class:', error);
      res.status(500).json({ error: 'Failed to end live class' });
    }
  },

  // Get replay classes for a course
  getReplayClasses: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user._id;

      // Get course and verify enrollment
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if user is enrolled (learner) or owns the course (tutor)
      const isEnrolled = Array.isArray(course.enrolledStudents)
        ? course.enrolledStudents.some((id) => id.toString() === userId.toString())
        : false;
      const isOwner = course.tutor._id.toString() === userId.toString();

      if (!isEnrolled && !isOwner) {
        return res.status(403).json({ error: 'You are not enrolled in this course' });
      }

      // Get completed sessions with recordings
      const sessions = await LiveClassSession.find({
        courseId,
        status: 'completed',
        recordingUrl: { $exists: true, $ne: null }
      }).populate('tutorId', 'name').sort({ endTime: -1 });

      res.json({
        success: true,
        replays: sessions.map(session => ({
          sessionId: session.sessionId,
          tutorName: session.tutorId.name,
          startTime: session.startTime,
          endTime: session.endTime,
          recordingUrl: session.recordingUrl,
          duration: session.endTime - session.startTime
        }))
      });

    } catch (error) {
      console.error('Error getting replay classes:', error);
      res.status(500).json({ error: 'Failed to get replay classes' });
    }
  },

  // Process recording after session ends (called by webhook or scheduled job)
  processRecording: async (req, res) => {
    try {
      const { sessionId } = req.body;

      const session = await LiveClassSession.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get tutor's Google tokens
      const tutor = await User.findById(session.tutorId);
      if (!tutor.googleTokens) {
        return res.status(400).json({ error: 'Tutor Google tokens not found' });
      }

      // Refresh token if expired before processing recording
      if (tutor.googleTokens.expiryDate < Date.now()) {
        console.log('🔄 Token expired, refreshing before processing recording...');
        const newTokens = await GoogleOAuthService.refreshToken(tutor.googleTokens.refreshToken);
        
        // Convert Google's token format to our database format
        const formattedTokens = {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || tutor.googleTokens.refreshToken,
          expiryDate: newTokens.expiry_date
        };
        
        await User.findByIdAndUpdate(session.tutorId, { googleTokens: formattedTokens });
        tutor.googleTokens = formattedTokens;
        console.log('✅ Token refreshed successfully');
      }

      GoogleOAuthService.setCredentials(tutor.googleTokens);

      // Helper sleep for retry backoff
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // Attempt strategy: try name-based first, then time-window; retry with backoff
      const backoffScheduleMs = [0, 15000, 30000, 60000];
      let foundFile = null;
      let fileDetails = null;

      for (let i = 0; i < backoffScheduleMs.length; i++) {
        if (backoffScheduleMs[i] > 0) {
          await sleep(backoffScheduleMs[i]);
        }

        // Name-based search by sessionId
        try {
          const byName = await GoogleDriveService.getRecordingFiles(session.tutorId, sessionId);
          if (byName && byName.length > 0) {
            foundFile = byName[0];
          }
        } catch (e) {
          console.warn('Name-based recording search failed, will try time-window:', e?.message || e);
        }

        // If not found by name, try time-window search
        if (!foundFile) {
          try {
            const byWindow = await GoogleDriveService.findRecordingByTimeWindow(session.startTime, session.endTime);
            if (byWindow && byWindow.length > 0) {
              foundFile = byWindow[0];
            }
          } catch (e) {
            console.warn('Time-window recording search failed:', e?.message || e);
          }
        }

        if (foundFile) {
          break;
        }
      }

      if (!foundFile) {
        return res.json({
          success: false,
          message: 'No recording found yet. It may still be processing.'
        });
      }

      // Ensure public access via link and fetch final links
      fileDetails = await GoogleDriveService.setAnyoneWithLinkReader(foundFile.id);

      // Update session with recording URL
      session.recordingUrl = fileDetails.webViewLink;
      session.recordingId = foundFile.id;
      await session.save();

      // Notify enrolled learners that replay is ready
      try {
        const course = await Course.findById(session.courseId).populate('enrolledStudents');
        if (course && course.enrolledStudents) {
          const notifyPromises = course.enrolledStudents.map(async (learner) => {
            await NotificationService.emitNotification(learner._id, {
              type: 'replay_ready',
              title: 'Replay Ready',
              message: `The replay for "${course.title}" is now available.`,
              data: {
                courseId: session.courseId,
                sessionId: session.sessionId,
                recordingUrl: session.recordingUrl,
                endTime: session.endTime
              }
            });
          });
          await Promise.all(notifyPromises);
        }
      } catch (notifyErr) {
        console.warn('Failed to emit replay_ready notifications:', notifyErr?.message || notifyErr);
      }

      return res.json({
        success: true,
        recordingUrl: session.recordingUrl,
        message: 'Recording processed and shared successfully'
      });

    } catch (error) {
      console.error('Error processing recording:', error);
      res.status(500).json({ error: 'Failed to process recording' });
    }
  }
};

module.exports = {
  googleOAuthController,
  liveClassController
};