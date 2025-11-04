/**
 * Google Meet Recording Bot
 * Automatically joins Google Meet, records the session, and uploads to Drive
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const { OAuth2 } = require('google-auth-library');
const PuppeteerScreenRecorder = require('puppeteer-screen-recorder');

class MeetRecordingBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.recorder = null;
    this.isRecording = false;
    
    // Google OAuth setup
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Initialize the bot and authenticate with Google
   */
  async initialize(googleTokens) {
    try {
      console.log('🤖 Initializing Meet Recording Bot...');
      
      // Set OAuth credentials
      this.oauth2Client.setCredentials({
        access_token: googleTokens.accessToken,
        refresh_token: googleTokens.refreshToken,
        expiry_date: googleTokens.expiryDate
      });

      // Launch browser
      this.browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser (helpful for debugging)
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--use-fake-ui-for-media-stream', // Auto-allow camera/mic permissions
          '--use-fake-device-for-media-stream',
          '--disable-web-security',
          '--allow-running-insecure-content',
          '--window-size=1920,1080'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      });

      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Grant camera and microphone permissions
      const context = this.browser.defaultBrowserContext();
      await context.overridePermissions('https://meet.google.com', [
        'camera',
        'microphone',
        'notifications'
      ]);

      console.log('✅ Bot initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize bot:', error);
      throw error;
    }
  }

  /**
   * Join a Google Meet session
   */
  async joinMeeting(meetLink, tutorEmail) {
    try {
      console.log(`🔗 Joining meeting: ${meetLink}`);
      
      // Navigate to Google login first
      await this.page.goto('https://accounts.google.com/signin', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Login with Google account
      await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await this.page.type('input[type="email"]', tutorEmail);
      await this.page.click('#identifierNext');
      
      await this.page.waitForTimeout(2000);
      
      // Note: Password needs to be entered manually or use session cookies
      console.log('⚠️ Please enter password manually if prompted...');
      await this.page.waitForTimeout(5000);

      // Navigate to Meet link
      await this.page.goto(meetLink, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for join button
      await this.page.waitForTimeout(3000);

      // Turn off camera and mic initially (optional)
      try {
        // Click camera button if exists
        const cameraButton = await this.page.$('[aria-label*="camera" i], [data-is-muted="false"]');
        if (cameraButton) {
          await cameraButton.click();
          await this.page.waitForTimeout(500);
        }
      } catch (e) {
        console.log('Camera button not found or already off');
      }

      // Click "Join now" or "Ask to join" button
      const joinSelectors = [
        'button[jsname="Qx7uuf"]',
        'button:has-text("Join now")',
        'button:has-text("Ask to join")',
        '[aria-label*="Join" i]',
        '[data-tooltip*="Join" i]'
      ];

      for (const selector of joinSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            console.log('✅ Clicked join button');
            break;
          }
        } catch (e) {
          continue;
        }
      }

      await this.page.waitForTimeout(5000);
      
      console.log('✅ Successfully joined meeting');
      return true;
    } catch (error) {
      console.error('❌ Failed to join meeting:', error);
      throw error;
    }
  }

  /**
   * Start recording the meeting
   */
  async startRecording(sessionId) {
    try {
      console.log('🎥 Starting recording...');
      
      const recordingsDir = path.join(__dirname, '../recordings');
      await fs.mkdir(recordingsDir, { recursive: true });
      
      const outputPath = path.join(recordingsDir, `${sessionId}.mp4`);
      
      // Initialize recorder
      this.recorder = new PuppeteerScreenRecorder(this.page, {
        followNewTab: false,
        fps: 30,
        videoFrame: {
          width: 1920,
          height: 1080
        },
        videoCrf: 18, // Quality (lower = better quality, 18-28 recommended)
        videoCodec: 'libx264',
        videoPreset: 'medium',
        videoBitrate: 2500, // 2.5 Mbps
        aspectRatio: '16:9',
        audioChannels: 2
      });

      await this.recorder.start(outputPath);
      this.isRecording = true;
      
      console.log(`✅ Recording started: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    try {
      console.log('⏹️ Stopping recording...');
      
      if (this.recorder && this.isRecording) {
        await this.recorder.stop();
        this.isRecording = false;
        console.log('✅ Recording stopped');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Leave the meeting
   */
  async leaveMeeting() {
    try {
      console.log('👋 Leaving meeting...');
      
      // Look for leave/hangup button
      const leaveSelectors = [
        '[aria-label*="Leave" i]',
        '[aria-label*="Hang up" i]',
        'button[jsname="CQylAd"]',
        '[data-tooltip*="Leave" i]'
      ];

      for (const selector of leaveSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            console.log('✅ Left meeting');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('❌ Failed to leave meeting:', error);
      throw error;
    }
  }

  /**
   * Upload recording to Google Drive
   */
  async uploadToDrive(filePath, fileName, sessionId) {
    try {
      console.log(`📤 Uploading to Google Drive: ${fileName}`);
      
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      
      // Create metadata
      const fileMetadata = {
        name: fileName,
        description: `SkillLift Live Class Recording - Session: ${sessionId}`,
        mimeType: 'video/mp4'
      };

      // Create media
      const media = {
        mimeType: 'video/mp4',
        body: require('fs').createReadStream(filePath)
      };

      // Upload file
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink'
      });

      const fileId = response.data.id;
      
      // Make file publicly accessible
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Get shareable link
      const file = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink'
      });

      console.log('✅ Upload complete:', file.data.webViewLink);
      
      return {
        fileId: fileId,
        fileName: fileName,
        webViewLink: file.data.webViewLink,
        webContentLink: file.data.webContentLink,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to upload to Drive:', error);
      throw error;
    }
  }

  /**
   * Monitor if host has left (meeting ended)
   */
  async monitorMeetingEnd(callback) {
    try {
      // Check every 10 seconds if meeting has ended
      const checkInterval = setInterval(async () => {
        try {
          // Look for "meeting has ended" or "you left the meeting" messages
          const endedSelectors = [
            'text/You left the meeting/i',
            'text/Meeting has ended/i',
            '[data-tooltip*="ended" i]',
            'text/Return to home screen/i'
          ];

          for (const selector of endedSelectors) {
            const element = await this.page.$(selector);
            if (element) {
              console.log('🔚 Meeting ended detected');
              clearInterval(checkInterval);
              if (callback) callback();
              return;
            }
          }
        } catch (e) {
          // Ignore errors during monitoring
        }
      }, 10000); // Check every 10 seconds

      return checkInterval;
    } catch (error) {
      console.error('❌ Error monitoring meeting end:', error);
    }
  }

  /**
   * Clean up and close browser
   */
  async cleanup() {
    try {
      console.log('🧹 Cleaning up bot...');
      
      if (this.recorder && this.isRecording) {
        await this.stopRecording();
      }
      
      if (this.browser) {
        await this.browser.close();
      }
      
      console.log('✅ Cleanup complete');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * Complete recording workflow
   */
  async recordMeeting(meetLink, sessionId, googleTokens, tutorEmail) {
    let recordingPath = null;
    
    try {
      // Initialize bot
      await this.initialize(googleTokens);
      
      // Join meeting
      await this.joinMeeting(meetLink, tutorEmail);
      
      // Start recording
      recordingPath = await this.startRecording(sessionId);
      
      // Monitor for meeting end
      const monitor = await this.monitorMeetingEnd(async () => {
        console.log('🔚 Meeting ended, stopping recording...');
        await this.stopRecording();
        await this.cleanup();
      });
      
      return {
        success: true,
        recordingPath,
        message: 'Recording started successfully'
      };
    } catch (error) {
      console.error('❌ Error in recording workflow:', error);
      
      // Cleanup on error
      await this.cleanup();
      
      throw error;
    }
  }
}

module.exports = MeetRecordingBot;

