const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
// Load env ASAP
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const initializeSocketIO = require('./socketio');
const { handleUploadError, cleanupUploads } = require('./middleware/uploadMiddleware');
const googleMeetAutoEndService = require('./services/googleMeetAutoEndService');
const simpleAutoEndService = require('./services/simpleAutoEndService');
const {
  securityHeaders,
  requestSizeLimit,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  dashboardLimiter,
  corsOptions,
  requestLogger,
  sanitizeErrors
} = require('./middleware/securityMiddleware');

// Enable mock payments for development/testing only
if (process.env.NODE_ENV === 'development' && !process.env.USE_MOCK_PAYMENT) {
  process.env.USE_MOCK_PAYMENT = 'true';
  console.log('🔧 Mock payment verification enabled for development');
}

const app = express();

// Set server timeout for long-running requests (like file uploads)
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes for file uploads
  res.setTimeout(120000); // 2 minutes for file uploads
  next();
});

// Enhanced security middleware
app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(requestLogger);

// CORS configuration
app.use(cors(corsOptions));

// Apply rate limiting middleware (disabled in development for easier testing)
if (process.env.NODE_ENV !== 'development') {
  app.use(apiLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ extended: true, limit: '2gb' }));

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.error('MongoDB connection failed', { error: err.message });
  console.log('⚠️  MongoDB connection failed, but server will continue for testing');
});

// Auto-cleanup expired replays every hour
const cleanupExpiredReplays = async () => {
  try {
    const Replay = require('./models/Replay');
    const fs = require('fs');
    
    const expiredReplays = await Replay.find({ 
      deleteAt: { $lte: new Date() } 
    });
    
    if (expiredReplays.length > 0) {
      console.log(`🧹 Cleaning up ${expiredReplays.length} expired replays...`);
      
      for (const replay of expiredReplays) {
        // Delete the file from filesystem
        if (replay.fileUrl && fs.existsSync(replay.fileUrl)) {
          try {
            fs.unlinkSync(replay.fileUrl);
            console.log(`🗑️ Deleted file: ${replay.fileUrl}`);
          } catch (fileError) {
            console.error(`❌ Error deleting file ${replay.fileUrl}:`, fileError);
          }
        }
      }
      
      // Delete from database
      await Replay.deleteMany({ deleteAt: { $lte: new Date() } });
      console.log(`✅ Cleaned up ${expiredReplays.length} expired replays`);
    }
  } catch (error) {
    console.error('❌ Error during replay cleanup:', error);
  }
};

// Run cleanup immediately and then every hour
// Temporarily disabled until MongoDB connection is established
setTimeout(() => {
  // Only run cleanup if MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    cleanupExpiredReplays();
    setInterval(cleanupExpiredReplays, 60 * 60 * 1000); // Every hour
  } else {
    console.log('⚠️ MongoDB not connected, skipping replay cleanup');
  }
}, 5000); // Wait 5 seconds for DB connection

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API routes are working!' });
});

// Routes with enhanced security
console.log('🔧 Loading auth routes...');
try {
  app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error);
}
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/assignment-submissions', require('./routes/assignmentSubmissionRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/simple-lessons', require('./routes/simpleLessonRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/google-meet', require('./routes/googleMeetRoutes'));
console.log('✅ Google Meet routes loaded');
app.use('/api/recordings', require('./routes/recordingRoutes'));
app.use('/api/replay', require('./routes/replayRoutes'));
console.log('✅ Recording routes loaded');
// Apply rate limiting conditionally based on environment
if (process.env.NODE_ENV === 'development') {
  // No rate limiting in development
  app.use('/api/lessons', handleUploadError, cleanupUploads, require('./routes/lessonRoutes'));
  app.use('/api/tutor', handleUploadError, cleanupUploads, require('./routes/tutorRoutes'));
} else {
  // Full rate limiting in production
  app.use('/api/lessons', uploadLimiter, handleUploadError, cleanupUploads, require('./routes/lessonRoutes'));
  app.use('/api/tutor', dashboardLimiter, uploadLimiter, handleUploadError, cleanupUploads, require('./routes/tutorRoutes'));
}
// Stream SDK routes removed - using Google Meet instead
app.use('/api/live-classes', require('./routes/liveClassRoutes'));
app.use('/', require('./routes/testRoutes'));
app.use('/api/learner/replays', require('./routes/learnerReplayRoutes'));
app.use('/api/tutor/replays', handleUploadError, cleanupUploads, require('./routes/tutorReplayRoutes'));
app.use('/api/learner/dashboard', require('./routes/learnerDashboardRoutes'));
app.use('/api/streaks', require('./routes/streakRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));
app.use('/api/project-submissions', require('./routes/projectRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));

// Stub endpoint for project notifications (until properly implemented)
app.get('/api/project-notifications/learner', (req, res) => {
  res.json({
    success: true,
    notifications: []
  });
});

app.get('/', (req, res) => {
    res.json('SkillLift Backend  API is running');
});

// Download endpoint for files
app.get('/download/uploads/*', (req, res) => {
  console.log('🔍 Download endpoint hit:', req.url);
  const filePath = req.params[0];
  const fullPath = path.join(__dirname, 'uploads', filePath);
  
  console.log('📁 File path:', filePath);
  console.log('📁 Full path:', fullPath);
  console.log('📁 File exists:', fs.existsSync(fullPath));
  
  if (fs.existsSync(fullPath)) {
    const fileName = path.basename(fullPath);
    console.log('📥 Setting download headers for:', fileName);
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.sendFile(fullPath);
  } else {
    console.log('❌ File not found:', fullPath);
    res.status(404).json({ success: false, message: 'File not found' });
  }
});

// Serve uploaded files (after download route but before catch-all)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillLift Backend API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      assignments: '/api/assignments',
      courses: '/api/courses',
      lessons: '/api/lessons',
      simpleLessons: '/api/simple-lessons',
      enrollments: '/api/enrollments',
      mentorship: '/api/mentorship',
      notifications: '/api/notifications',
      messages: '/api/messages',
      ratings: '/api/ratings',
      transactions: '/api/transactions',
      classes: '/api/classes',
      admin: '/api/admin',
      payments: '/api/payments',
      complaints: '/api/complaints',
      settings: '/api/settings',
      tutor: '/api/tutor'
    }
  });
});

// Enhanced error handling middleware
app.use(sanitizeErrors);

// Final error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const BASE_PORT = Number(process.env.PORT || 5000);

function startServerWithPort(port, attempt = 0) {
  const server = app.listen(port, () => {
    console.log(`🚀 SkillLift Backend API running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔐 Auth API: http://localhost:${port}/api/auth`);
    console.log(`👥 Users API: http://localhost:${port}/api/users`);
    console.log(`📝 Assignments API: http://localhost:${port}/api/assignments`);
    console.log(`📚 Courses API: http://localhost:${port}/api/courses`);
    console.log(`🎓 Enrollments API: http://localhost:${port}/api/enrollments`);
    console.log(`🤝 Mentorship API: http://localhost:${port}/api/mentorship`);
    console.log(`🔔 Notifications API: http://localhost:${port}/api/notifications`);
    console.log(`💬 Messages API: http://localhost:${port}/api/messages`);
    console.log(`⭐ Ratings API: http://localhost:${port}/api/ratings`);
    console.log(`💰 Transactions API: http://localhost:${port}/api/transactions`);
    console.log(`🏫 Classes API: http://localhost:${port}/api/classes`);
    console.log(`👨‍💼 Admin API: http://localhost:${port}/api/admin`);
    console.log(`💳 Payments API: http://localhost:${port}/api/payments`);
    console.log(`📚 Simple Lessons API: http://localhost:${port}/api/simple-lessons`);

    // Initialize WebSocket server
    const io = initializeSocketIO(server);
    console.log(`🔌 WebSocket server initialized`);

    // Pass Socket.IO instance to services
    const { setSocketIO: setChatSocketIO } = require('./controllers/chatController');
    setChatSocketIO(io);

    // Pass Socket.IO instance to NotificationService
    const NotificationService = require('./services/notificationService');
    NotificationService.setSocketIO(io);
    console.log(`🔔 NotificationService initialized with Socket.IO`);

    // Start background services only after Mongo is connected
    const startServices = () => {
      if (mongoose.connection.readyState === 1) {
        if (!global.__AUTO_END_STARTED__) {
          googleMeetAutoEndService.start();
          simpleAutoEndService.start();
          global.__AUTO_END_STARTED__ = true;
          console.log(`🎥 Auto-End Services started`);
        }
      } else {
        console.log('⏳ Waiting for MongoDB connection before starting services...');
        setTimeout(startServices, 2000);
      }
    };
    startServices();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < 5) {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on ${nextPort}...`);
      startServerWithPort(nextPort, attempt + 1);
    } else {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  });

  return server;
}

const server = startServerWithPort(BASE_PORT);

// (SocketIO + services initialization moved into startServerWithPort)

module.exports = app;
