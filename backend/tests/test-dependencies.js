console.log('🔍 Testing module dependencies...');

try {
  console.log('1️⃣ Testing express...');
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  console.log('2️⃣ Testing cors...');
  const cors = require('cors');
  console.log('✅ CORS loaded successfully');
  
  console.log('3️⃣ Testing dotenv...');
  require('dotenv').config();
  console.log('✅ Dotenv loaded successfully');
  
  console.log('4️⃣ Testing database config...');
  const connectDB = require('./config/db');
  console.log('✅ Database config loaded successfully');
  
  console.log('5️⃣ Testing auth routes...');
  const authRoutes = require('./routes/authRoutes');
  console.log('✅ Auth routes loaded successfully');
  
  console.log('6️⃣ Testing live session routes...');
  const liveSessionRoutes = require('./routes/liveSessionRoutes');
  console.log('✅ Live session routes loaded successfully');
  
  console.log('🎉 All dependencies loaded successfully!');
  
} catch (error) {
  console.error('❌ Error loading dependency:', error.message);
  console.error('Stack trace:', error.stack);
}
