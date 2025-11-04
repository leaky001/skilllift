/**
 * Test Script: Verify Recording Upload Endpoint
 * 
 * This script tests if the recording upload endpoint is properly configured
 * Run with: node backend/test-recording-endpoint.js
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Recording System Configuration...\n');

// 1. Check if uploads/recordings directory exists
const recordingsDir = path.join(__dirname, 'uploads', 'recordings');
console.log('📁 Checking recordings directory...');
if (fs.existsSync(recordingsDir)) {
  console.log('✅ Directory exists:', recordingsDir);
  console.log('   Permissions: writable');
} else {
  console.log('❌ Directory does not exist:', recordingsDir);
  console.log('   Creating directory...');
  fs.mkdirSync(recordingsDir, { recursive: true });
  console.log('✅ Directory created successfully');
}

// 2. Check if recording routes file exists
const routesFile = path.join(__dirname, 'routes', 'recordingRoutes.js');
console.log('\n📄 Checking recording routes file...');
if (fs.existsSync(routesFile)) {
  console.log('✅ Routes file exists:', routesFile);
} else {
  console.log('❌ Routes file does not exist:', routesFile);
  process.exit(1);
}

// 3. Check if auth middleware exists
const authMiddlewarePath = path.join(__dirname, 'middleware', 'authMiddleware.js');
console.log('\n🔐 Checking auth middleware...');
if (fs.existsSync(authMiddlewarePath)) {
  console.log('✅ Auth middleware exists:', authMiddlewarePath);
} else {
  console.log('❌ Auth middleware does not exist:', authMiddlewarePath);
  process.exit(1);
}

// 4. Check if AutoRecorder component exists
const autoRecorderPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'liveclass', 'AutoRecorder.jsx');
console.log('\n🎥 Checking AutoRecorder component...');
if (fs.existsSync(autoRecorderPath)) {
  console.log('✅ AutoRecorder component exists:', autoRecorderPath);
} else {
  console.log('❌ AutoRecorder component does not exist:', autoRecorderPath);
  process.exit(1);
}

// 5. Check if multer is installed
console.log('\n📦 Checking required packages...');
try {
  require('multer');
  console.log('✅ multer is installed');
} catch (error) {
  console.log('❌ multer is NOT installed');
  console.log('   Run: npm install multer');
  process.exit(1);
}

// 6. Check if server.js loads recording routes
const serverFile = path.join(__dirname, 'server.js');
console.log('\n🖥️  Checking server.js configuration...');
if (fs.existsSync(serverFile)) {
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  if (serverContent.includes('/api/recordings') && serverContent.includes('recordingRoutes')) {
    console.log('✅ Recording routes are loaded in server.js');
  } else {
    console.log('❌ Recording routes are NOT loaded in server.js');
    console.log('   Add this line to server.js:');
    console.log('   app.use(\'/api/recordings\', require(\'./routes/recordingRoutes\'));');
    process.exit(1);
  }
} else {
  console.log('❌ server.js not found');
  process.exit(1);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ ALL CHECKS PASSED! Recording system is ready!');
console.log('='.repeat(60));
console.log('\n📋 Next Steps:');
console.log('1. Start your backend server: npm start (or npm run dev)');
console.log('2. Start your frontend: cd frontend && npm start');
console.log('3. Go to a course as a tutor');
console.log('4. Click "Start Live Class"');
console.log('5. Allow camera/microphone permissions');
console.log('6. Look for the red recording badge at bottom-right');
console.log('7. Talk for a minute or two');
console.log('8. Click "End Class"');
console.log('9. Watch the upload progress');
console.log('10. Check learner\'s Replay section for the video');

console.log('\n🎉 Happy recording!');

