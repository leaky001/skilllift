/**
 * Google Meet Setup Diagnostic Script
 * 
 * This script tests your Google Meet integration to identify configuration issues
 * Run with: node test-google-meet-setup.js
 */

require('dotenv').config();
const { google } = require('googleapis');
const { OAuth2 } = require('google-auth-library');

console.log('\n=================================');
console.log('🔍 GOOGLE MEET SETUP DIAGNOSTIC');
console.log('=================================\n');

// Test 1: Check Environment Variables
console.log('TEST 1: Environment Variables');
console.log('------------------------------');

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

let envVarsOK = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'dummy' || value === 'your-value-here') {
    console.log(`❌ ${varName}: NOT SET or INVALID`);
    envVarsOK = false;
  } else {
    // Show partial value for security
    const displayValue = value.length > 20 
      ? value.substring(0, 15) + '...' + value.substring(value.length - 5)
      : value.substring(0, 10) + '...';
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

if (!envVarsOK) {
  console.log('\n⚠️  ISSUE: Some environment variables are missing or invalid');
  console.log('   Solution: Update your .env file with correct Google OAuth credentials');
  console.log('   Get credentials from: https://console.cloud.google.com/apis/credentials');
}

console.log('\n');

// Test 2: OAuth Client Configuration
console.log('TEST 2: OAuth Client Configuration');
console.log('------------------------------------');

try {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  console.log('✅ OAuth2 client created successfully');
  
  // Generate test auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/meetings.space.created'
    ],
    prompt: 'consent'
  });
  
  console.log('✅ Auth URL generated successfully');
  console.log('   URL:', authUrl.substring(0, 80) + '...');
  
} catch (error) {
  console.log('❌ Failed to create OAuth2 client');
  console.log('   Error:', error.message);
}

console.log('\n');

// Test 3: Check Google APIs
console.log('TEST 3: Required Google APIs');
console.log('----------------------------');

console.log('📋 Required APIs (must be enabled in Google Cloud Console):');
console.log('   1. Google Calendar API');
console.log('   2. Google Meet API (optional, but recommended)');
console.log('   3. Google Drive API (for recordings)');
console.log('');
console.log('   Enable at: https://console.cloud.google.com/apis/library');

console.log('\n');

// Test 4: OAuth Scopes
console.log('TEST 4: OAuth Scopes Configuration');
console.log('-----------------------------------');

const requiredScopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/meetings.space.created'
];

console.log('📋 Required OAuth Scopes:');
requiredScopes.forEach((scope, index) => {
  console.log(`   ${index + 1}. ${scope}`);
});
console.log('');
console.log('   Configure at: https://console.cloud.google.com/apis/credentials/consent');

console.log('\n');

// Test 5: Redirect URI Configuration
console.log('TEST 5: Redirect URI Configuration');
console.log('-----------------------------------');

const redirectURI = process.env.GOOGLE_REDIRECT_URI;
console.log('Current Redirect URI:', redirectURI);
console.log('');
console.log('📋 This URI must be added to "Authorized redirect URIs" in Google Cloud Console:');
console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('   2. Click on your OAuth 2.0 Client ID');
console.log('   3. Add to "Authorized redirect URIs":');
console.log(`      ${redirectURI}`);
console.log('   4. Save changes');

console.log('\n');

// Summary
console.log('=================================');
console.log('📊 DIAGNOSTIC SUMMARY');
console.log('=================================\n');

if (envVarsOK) {
  console.log('✅ Environment variables are configured');
} else {
  console.log('❌ Environment variables need configuration');
}

console.log('\n');
console.log('🔧 NEXT STEPS:');
console.log('---------------');
console.log('1. Ensure all environment variables are set in your .env file');
console.log('2. Enable Google Calendar API in Google Cloud Console');
console.log('3. Configure OAuth consent screen with required scopes');
console.log('4. Add redirect URI to your OAuth 2.0 Client ID');
console.log('5. Restart your backend server after making changes');
console.log('6. Test by connecting your Google account in the app');
console.log('');
console.log('📚 For detailed setup instructions, see: INVALID_CALL_ERROR_FIX.md');
console.log('\n');

// Exit
process.exit(0);

