const express = require('express');
const cors = require('cors');

console.log('🔧 Starting backend server...');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SkillLift Backend API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      liveSessions: '/api/live-sessions'
    }
  });
});

// Simple live sessions endpoint for testing
app.get('/api/live-sessions/public', (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      current: 1,
      pages: 0,
      total: 0
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

const PORT = 3001; // Using port 3001

const server = app.listen(PORT, () => {
  console.log(`🚀 SkillLift Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎥 Live Sessions API: http://localhost:${PORT}/api/live-sessions/public`);
  console.log('✅ Server started successfully!');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try a different port or kill the process using this port');
  } else {
    console.error('❌ Server error:', error);
  }
});

module.exports = app;
