const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Enable mock payments for development/testing
if (!process.env.USE_MOCK_PAYMENT) {
  process.env.USE_MOCK_PAYMENT = 'true';
  console.log('🔧 Mock payment verification enabled for testing');
}

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.error('MongoDB connection failed', { error: err.message });
  console.log('⚠️  MongoDB connection failed, but server will continue for testing');
});

// Only essential routes for testing
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/live-sessions', require('./routes/liveSessionRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillLift Backend API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      payments: '/api/payments',
      liveSessions: '/api/live-sessions'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SkillLift Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`💳 Payments API: http://localhost:${PORT}/api/payments`);
  console.log(`🎥 Live Sessions API: http://localhost:${PORT}/api/live-sessions`);
});

module.exports = app;
