/**
 * Test Google Meet Connection
 * This script tests if your Google OAuth is working properly
 * 
 * Run with: node test-google-connection.js
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const { GoogleOAuthService, GoogleMeetService } = require('./backend/services/googleMeetService');
const User = require('./backend/models/User');

async function testGoogleConnection() {
  try {
    console.log('\n========================================');
    console.log('🔍 TESTING GOOGLE MEET CONNECTION');
    console.log('========================================\n');

    // Connect to database
    console.log('1️⃣ Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Database connected\n');

    // Find a tutor with Google tokens
    console.log('2️⃣ Looking for tutors with Google tokens...');
    const tutor = await User.findOne({ role: 'tutor', 'googleTokens.accessToken': { $exists: true } });
    
    if (!tutor) {
      console.log('❌ No tutor found with Google tokens');
      console.log('   Please connect your Google account in the app first!');
      process.exit(1);
    }

    console.log('✅ Found tutor:', tutor.name);
    console.log('   Email:', tutor.email);
    console.log('   Has Access Token:', !!tutor.googleTokens?.accessToken);
    console.log('   Has Refresh Token:', !!tutor.googleTokens?.refreshToken);
    console.log('   Token Expiry:', tutor.googleTokens?.expiryDate ? new Date(tutor.googleTokens.expiryDate).toISOString() : 'N/A');
    console.log();

    // Check if token is expired
    console.log('3️⃣ Checking token expiry...');
    const now = Date.now();
    const expiry = tutor.googleTokens.expiryDate;
    const isExpired = expiry < now;
    
    console.log('   Now:', new Date(now).toISOString());
    console.log('   Expiry:', new Date(expiry).toISOString());
    console.log('   Is Expired:', isExpired);
    
    if (isExpired) {
      console.log('   ⚠️  Token is expired! Will try to refresh...\n');
    } else {
      console.log('   ✅ Token is still valid\n');
    }

    // Set credentials
    console.log('4️⃣ Setting OAuth credentials...');
    GoogleOAuthService.setCredentials(tutor.googleTokens);
    console.log('✅ Credentials set\n');

    // Try to create a test Meet link
    console.log('5️⃣ Testing Meet link creation...');
    console.log('   Creating a test calendar event with Meet link...');
    
    try {
      const testStartTime = new Date();
      const testEndTime = new Date(testStartTime.getTime() + 1 * 60 * 60 * 1000); // 1 hour
      
      const meetData = await GoogleMeetService.createMeetLink(
        tutor._id,
        'Test Live Class',
        testStartTime.toISOString(),
        testEndTime.toISOString(),
        []
      );

      console.log('\n✅ SUCCESS! Meet link created!');
      console.log('   Meet Link:', meetData.meetLink);
      console.log('   Calendar Event ID:', meetData.calendarEventId);
      
      // Clean up - delete the test event
      console.log('\n6️⃣ Cleaning up test event...');
      await GoogleMeetService.endEvent(meetData.calendarEventId);
      console.log('✅ Test event deleted\n');

      console.log('========================================');
      console.log('✅ ALL TESTS PASSED!');
      console.log('   Your Google Meet integration is working correctly.');
      console.log('   The issue might be with:');
      console.log('   1. Frontend not sending correct data');
      console.log('   2. Old/cached sessions');
      console.log('   3. Browser cache');
      console.log('========================================\n');

    } catch (meetError) {
      console.log('\n❌ FAILED to create Meet link!');
      console.log('   Error:', meetError.message);
      console.log('   Error code:', meetError.code);
      console.log('\n📋 Possible issues:');
      console.log('   1. Google Calendar API not enabled');
      console.log('   2. Google Meet not available for your account');
      console.log('   3. OAuth permissions insufficient');
      console.log('   4. API quota exceeded');
      console.log('\n🔧 Solutions:');
      console.log('   1. Go to: https://console.cloud.google.com/apis/library');
      console.log('   2. Enable "Google Calendar API"');
      console.log('   3. Enable "Google Meet API" (if available)');
      console.log('   4. Reconnect your Google account');
      console.log('   5. Use custom Meet links as workaround');
      console.log('========================================\n');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED with error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the test
testGoogleConnection();

