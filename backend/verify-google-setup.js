#!/usr/bin/env node
/**
 * Google Meet Recording Setup Verification Script
 * 
 * This script checks if your Google Meet recording system is properly configured.
 * Run this before attempting to use recording features.
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = colors.white) {
  console.log(color + message + colors.reset);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(title, colors.cyan);
  console.log('='.repeat(70) + '\n');
}

async function checkEnvironmentVariables() {
  section('📋 STEP 1: Checking Environment Variables');
  
  require('dotenv').config();
  
  const requiredVars = {
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
    'GOOGLE_REDIRECT_URI': process.env.GOOGLE_REDIRECT_URI,
    'MONGODB_URI': process.env.MONGODB_URI,
    'JWT_SECRET': process.env.JWT_SECRET
  };
  
  let allPresent = true;
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value === 'dummy' || value.includes('your_') || value.includes('_here')) {
      log(`❌ ${key}: NOT SET OR INVALID`, colors.red);
      allPresent = false;
    } else {
      const masked = value.substring(0, 10) + '...';
      log(`✅ ${key}: ${masked}`, colors.green);
    }
  }
  
  console.log();
  
  if (!allPresent) {
    log('⚠️  Some environment variables are missing or invalid.', colors.yellow);
    log('Please check your backend/.env file.', colors.yellow);
    return false;
  } else {
    log('✅ All required environment variables are set!', colors.green);
    return true;
  }
}

async function checkDatabase() {
  section('🗄️  STEP 2: Checking Database Connection');
  
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
  
  try {
    log('Connecting to: ' + mongoUri, colors.cyan);
    await mongoose.connect(mongoUri);
    log('✅ Database connection successful!', colors.green);
    
    // Check for required collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    log('\nFound collections:', colors.cyan);
    collectionNames.forEach(name => {
      log(`  • ${name}`, colors.white);
    });
    
    const requiredCollections = ['users', 'liveclasssessions'];
    const missingCollections = requiredCollections.filter(c => !collectionNames.includes(c));
    
    if (missingCollections.length > 0) {
      log('\n⚠️  Some collections are missing: ' + missingCollections.join(', '), colors.yellow);
      log('They will be created automatically when needed.', colors.yellow);
    } else {
      log('\n✅ All required collections exist!', colors.green);
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    log('❌ Database connection failed: ' + error.message, colors.red);
    
    if (error.message.includes('ECONNREFUSED')) {
      log('\n💡 Solution: Start your MongoDB server:', colors.yellow);
      log('   Windows: net start MongoDB', colors.white);
      log('   Mac/Linux: sudo systemctl start mongod', colors.white);
    }
    
    return false;
  }
}

async function checkGoogleAPIs() {
  section('🔧 STEP 3: Checking Google API Configuration');
  
  try {
    const { google } = require('googleapis');
    log('✅ googleapis package installed', colors.green);
    
    // Try to create OAuth client
    const { OAuth2 } = require('google-auth-library');
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    log('✅ OAuth2 client created successfully', colors.green);
    
    // Generate an auth URL to test configuration
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/meetings.space.created'
      ]
    });
    
    log('✅ Google Auth URL generated successfully', colors.green);
    log('\nAuth URL (first 80 chars):', colors.cyan);
    log(authUrl.substring(0, 80) + '...', colors.white);
    
    return true;
  } catch (error) {
    log('❌ Google API configuration failed: ' + error.message, colors.red);
    
    if (error.message.includes('Cannot find module')) {
      log('\n💡 Solution: Install required packages:', colors.yellow);
      log('   npm install googleapis google-auth-library', colors.white);
    }
    
    return false;
  }
}

async function checkModels() {
  section('📦 STEP 4: Checking Database Models');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const requiredModels = [
      'LiveClassSession',
      'User',
      'Course'
    ];
    
    const modelsDir = path.join(__dirname, 'models');
    
    if (!fs.existsSync(modelsDir)) {
      log('❌ Models directory not found!', colors.red);
      return false;
    }
    
    const modelFiles = fs.readdirSync(modelsDir);
    log('Found model files:', colors.cyan);
    modelFiles.forEach(file => {
      log(`  • ${file}`, colors.white);
    });
    
    let allPresent = true;
    console.log();
    requiredModels.forEach(model => {
      const modelFile = `${model}.js`;
      if (modelFiles.includes(modelFile)) {
        log(`✅ ${model} model exists`, colors.green);
      } else {
        log(`❌ ${model} model missing`, colors.red);
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    log('❌ Error checking models: ' + error.message, colors.red);
    return false;
  }
}

async function checkServices() {
  section('🔌 STEP 5: Checking Services');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const servicesDir = path.join(__dirname, 'services');
    
    if (!fs.existsSync(servicesDir)) {
      log('⚠️  Services directory not found', colors.yellow);
      return false;
    }
    
    const requiredServices = [
      'googleMeetService.js',
      'notificationService.js'
    ];
    
    const serviceFiles = fs.readdirSync(servicesDir);
    
    let allPresent = true;
    requiredServices.forEach(service => {
      if (serviceFiles.includes(service)) {
        log(`✅ ${service} exists`, colors.green);
        
        // Try to require it
        try {
          require(path.join(servicesDir, service));
          log(`   ✓ ${service} loads without errors`, colors.green);
        } catch (error) {
          log(`   ⚠️  ${service} has syntax errors: ${error.message}`, colors.yellow);
        }
      } else {
        log(`❌ ${service} missing`, colors.red);
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    log('❌ Error checking services: ' + error.message, colors.red);
    return false;
  }
}

async function checkRoutes() {
  section('🛣️  STEP 6: Checking Routes');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const routesDir = path.join(__dirname, 'routes');
    
    if (!fs.existsSync(routesDir)) {
      log('❌ Routes directory not found', colors.red);
      return false;
    }
    
    const routeFiles = fs.readdirSync(routesDir);
    log('Found route files:', colors.cyan);
    routeFiles.forEach(file => {
      log(`  • ${file}`, colors.white);
    });
    
    console.log();
    
    if (routeFiles.includes('googleMeetRoutes.js')) {
      log('✅ googleMeetRoutes.js exists', colors.green);
      return true;
    } else {
      log('❌ googleMeetRoutes.js missing', colors.red);
      return false;
    }
  } catch (error) {
    log('❌ Error checking routes: ' + error.message, colors.red);
    return false;
  }
}

async function checkRecordingSessions() {
  section('📊 STEP 7: Checking Existing Recording Sessions');
  
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift';
  
  try {
    await mongoose.connect(mongoUri);
    
    const LiveClassSession = require('./models/LiveClassSession');
    
    // Get all sessions
    const allSessions = await LiveClassSession.countDocuments();
    log(`Total sessions in database: ${allSessions}`, colors.cyan);
    
    // Get sessions with recordings
    const sessionsWithRecordings = await LiveClassSession.countDocuments({
      recordingUrl: { $exists: true, $ne: null }
    });
    log(`Sessions with recordings: ${sessionsWithRecordings}`, colors.cyan);
    
    // Get recent sessions
    const recentSessions = await LiveClassSession.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(5);
    
    if (recentSessions.length > 0) {
      log('\nRecent sessions (last 7 days):', colors.cyan);
      recentSessions.forEach((session, index) => {
        const hasRecording = session.recordingUrl ? '✅' : '❌';
        log(`  ${index + 1}. ${hasRecording} ${session.sessionId} - ${session.status}`, colors.white);
      });
    } else {
      log('\nℹ️  No recent sessions found', colors.yellow);
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    log('❌ Error checking sessions: ' + error.message, colors.red);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    return false;
  }
}

async function provideSummary(results) {
  section('📋 SUMMARY & RECOMMENDATIONS');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  log(`Tests Passed: ${passed}/${total} (${percentage}%)`, colors.cyan);
  
  if (percentage === 100) {
    log('\n🎉 EXCELLENT! Your Google Meet recording system is fully configured!', colors.green);
    log('\nNext Steps:', colors.cyan);
    log('1. ✅ Start your backend server: npm start', colors.white);
    log('2. ✅ Log in as a tutor', colors.white);
    log('3. ✅ Connect your Google account', colors.white);
    log('4. ✅ Start a live class', colors.white);
    log('5. ✅ MANUALLY start recording in Google Meet (click ⋮ → Record meeting)', colors.white);
    log('6. ✅ End the class and wait 2-3 minutes', colors.white);
    log('7. ✅ Check for replay in learner dashboard', colors.white);
  } else if (percentage >= 70) {
    log('\n⚠️  GOOD! Most components are configured, but some issues need attention.', colors.yellow);
    log('Review the failed tests above and fix the issues.', colors.yellow);
  } else {
    log('\n❌ ATTENTION REQUIRED! Multiple configuration issues detected.', colors.red);
    log('Please fix the failed tests above before attempting to use recording.', colors.red);
  }
  
  log('\n📚 Important Reminders:', colors.cyan);
  log('• Recording requires Google Workspace or Google One Premium', colors.white);
  log('• Tutors must MANUALLY start recording in Google Meet', colors.white);
  log('• Recording is NOT automatic - it\'s a Google Meet limitation', colors.white);
  log('• Processing takes 30 seconds to 3 minutes', colors.white);
  
  log('\n🔗 Quick Links:', colors.cyan);
  log('• Test Recording: Open test-google-meet-recording.html in browser', colors.white);
  log('• Check Status: node check-recording-status.js', colors.white);
  log('• Full Guide: Read GOOGLE_MEET_RECORDING_GUIDE.md', colors.white);
}

async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                                                                    ║', colors.cyan);
  log('║        🎥 GOOGLE MEET RECORDING SETUP VERIFICATION 🎥            ║', colors.cyan);
  log('║                                                                    ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════════════════╝', colors.cyan);
  log('\nThis script will verify your Google Meet recording configuration.', colors.white);
  log('Please wait while we check all components...\n', colors.white);
  
  const results = [];
  
  results.push(await checkEnvironmentVariables());
  results.push(await checkDatabase());
  results.push(await checkGoogleAPIs());
  results.push(await checkModels());
  results.push(await checkServices());
  results.push(await checkRoutes());
  results.push(await checkRecordingSessions());
  
  await provideSummary(results);
  
  console.log('\n');
}

// Run the verification
main().catch(error => {
  log('\n❌ Verification script failed:', colors.red);
  log(error.message, colors.red);
  console.error(error);
  process.exit(1);
});

