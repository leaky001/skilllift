const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('Testing imports...');

try {
  console.log('1. Testing basic imports...');
  const connectDB = require('./config/db');
  console.log('✓ Database config imported');
  
  console.log('2. Testing middleware imports...');
  const { securityHeaders, requestSizeLimit, authLimiter, apiLimiter, uploadLimiter, corsOptions, requestLogger, sanitizeErrors } = require('./middleware/securityMiddleware');
  console.log('✓ Security middleware imported');
  
  console.log('3. Testing route imports...');
  const authRoutes = require('./routes/authRoutes');
  console.log('✓ Auth routes imported');
  
  const userRoutes = require('./routes/userRoutes');
  console.log('✓ User routes imported');
  
  const courseRoutes = require('./routes/courseRoutes');
  console.log('✓ Course routes imported');
  
  const notificationRoutes = require('./routes/notificationRoutes');
  console.log('✓ Notification routes imported');
  
  const liveSessionRoutes = require('./routes/liveSessionRoutes');
  console.log('✓ Live session routes imported');
  
  const tutorRoutes = require('./routes/tutorRoutes');
  console.log('✓ Tutor routes imported');
  
  console.log('4. All imports successful!');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack:', error.stack);
}
