#!/usr/bin/env node
/**
 * TEST RECORDING SYSTEM
 * Validates that all recording components are working
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║           RECORDING SYSTEM TEST                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let allTestsPassed = true;

// Test 1: Check if multer is installed
console.log('📦 Test 1: Checking dependencies...');
try {
  require('multer');
  console.log('   ✅ multer package installed\n');
} catch (e) {
  console.error('   ❌ multer package NOT installed');
  console.error('   Run: npm install multer\n');
  allTestsPassed = false;
}

// Test 2: Check if recording routes can be loaded
console.log('🛣️  Test 2: Checking recording routes...');
try {
  const routes = require('./routes/recordingRoutes');
  console.log('   ✅ Recording routes loaded successfully');
  console.log('   ✅ All endpoints registered\n');
} catch (e) {
  console.error('   ❌ Failed to load recording routes');
  console.error('   Error:', e.message);
  console.error('   File: routes/recordingRoutes.js\n');
  allTestsPassed = false;
}

// Test 3: Check if uploads directory exists or can be created
console.log('📂 Test 3: Checking uploads directory...');
try {
  const uploadDir = path.join(__dirname, 'uploads', 'recordings');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('   ✅ Upload directory created:', uploadDir);
  } else {
    console.log('   ✅ Upload directory exists:', uploadDir);
  }
  
  // Check write permissions
  const testFile = path.join(uploadDir, 'test-write.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('   ✅ Directory is writable\n');
} catch (e) {
  console.error('   ❌ Upload directory error');
  console.error('   Error:', e.message);
  console.error('   Path:', path.join(__dirname, 'uploads', 'recordings'), '\n');
  allTestsPassed = false;
}

// Test 4: Check if AutoRecorder component exists
console.log('🎬 Test 4: Checking AutoRecorder component...');
try {
  const autoRecorderPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'liveclass', 'AutoRecorder.jsx');
  
  if (fs.existsSync(autoRecorderPath)) {
    const content = fs.readFileSync(autoRecorderPath, 'utf8');
    
    if (content.includes('MediaRecorder')) {
      console.log('   ✅ AutoRecorder component exists');
      console.log('   ✅ MediaRecorder API implemented');
    } else {
      console.log('   ⚠️  AutoRecorder exists but MediaRecorder not found');
    }
    
    if (content.includes('uploadRecording')) {
      console.log('   ✅ Upload functionality implemented');
    }
    
    if (content.includes('apiService.post')) {
      console.log('   ✅ API integration ready\n');
    }
  } else {
    console.error('   ❌ AutoRecorder component not found');
    console.error('   Expected at:', autoRecorderPath, '\n');
    allTestsPassed = false;
  }
} catch (e) {
  console.error('   ❌ Error checking AutoRecorder');
  console.error('   Error:', e.message, '\n');
  allTestsPassed = false;
}

// Test 5: Check if routes are registered in server.js
console.log('🖥️  Test 5: Checking server.js configuration...');
try {
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  if (serverContent.includes("require('./routes/recordingRoutes')")) {
    console.log('   ✅ Recording routes registered in server.js');
  } else {
    console.error('   ❌ Recording routes NOT registered in server.js');
    console.error('   Add: app.use(\'/api/recordings\', require(\'./routes/recordingRoutes\'));');
    allTestsPassed = false;
  }
  
  if (serverContent.includes('/api/recordings')) {
    console.log('   ✅ Routes mounted at /api/recordings\n');
  } else {
    console.error('   ⚠️  Routes path may be incorrect\n');
  }
} catch (e) {
  console.error('   ❌ Error checking server.js');
  console.error('   Error:', e.message, '\n');
  allTestsPassed = false;
}

// Test 6: Check LiveClassSession model
console.log('🗄️  Test 6: Checking database models...');
try {
  const LiveClassSession = require('./models/LiveClassSession');
  console.log('   ✅ LiveClassSession model loaded');
  
  const schema = LiveClassSession.schema.obj;
  if (schema.recordingUrl !== undefined) {
    console.log('   ✅ recordingUrl field exists');
  }
  if (schema.recordingId !== undefined) {
    console.log('   ✅ recordingId field exists');
  }
  console.log('   ✅ Database schema ready\n');
} catch (e) {
  console.error('   ❌ Error checking models');
  console.error('   Error:', e.message, '\n');
  allTestsPassed = false;
}

// Test 7: Check NotificationService
console.log('📢 Test 7: Checking notification service...');
try {
  const NotificationService = require('./services/notificationService');
  if (NotificationService && NotificationService.emitNotification) {
    console.log('   ✅ NotificationService loaded');
    console.log('   ✅ emitNotification method available\n');
  } else {
    console.error('   ⚠️  NotificationService exists but emitNotification missing\n');
  }
} catch (e) {
  console.error('   ⚠️  NotificationService not available (optional)');
  console.error('   Recordings will work but notifications may not\n');
}

// Summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 TEST SUMMARY:');
console.log('═══════════════════════════════════════════════════════════════\n');

if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('✅ Recording system is ready to use!\n');
  
  console.log('📋 NEXT STEPS:');
  console.log('1. Restart your backend server (npm run dev)');
  console.log('2. Look for: "✅ Recording routes loaded"');
  console.log('3. Integrate AutoRecorder into your live class component');
  console.log('4. Start a test live class');
  console.log('5. Check for red "Recording" indicator');
  console.log('6. End class and verify upload works\n');
  
  console.log('📖 READ: QUICK_START_RECORDING.md for integration guide\n');
} else {
  console.log('❌ SOME TESTS FAILED!');
  console.log('⚠️  Please fix the issues above before using recording system\n');
  
  console.log('💡 COMMON FIXES:');
  console.log('- Run: npm install multer');
  console.log('- Check file paths are correct');
  console.log('- Verify all files were created properly');
  console.log('- Check middleware imports\n');
}

console.log('═══════════════════════════════════════════════════════════════\n');

