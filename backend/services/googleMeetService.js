const { google } = require('googleapis');
const { OAuth2 } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const LiveClassSession = require('../models/LiveClassSession');

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'dummy',
  process.env.GOOGLE_CLIENT_SECRET || 'dummy',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google-meet/auth/google/callback'
);

// Google API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/meetings.space.created'
];

// Google OAuth Service
class GoogleOAuthService {
  static getAuthUrl(state = null) {
    const authOptions = {
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    };
    
    if (state) {
      authOptions.state = state;
    }
    
    return oauth2Client.generateAuthUrl(authOptions);
  }

  static async getTokens(code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to get Google tokens');
    }
  }

  static setCredentials(tokens) {
    // Convert token format to match Google OAuth2Client expectations
    const formattedTokens = {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate,
      token_type: 'Bearer',
      scope: SCOPES.join(' ')
    };
    
    oauth2Client.setCredentials(formattedTokens);
  }

  static async refreshToken(refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh Google token');
    }
  }
}

// Google Meet Service
class GoogleMeetService {
  static async createMeetLink(tutorId, courseTitle, startTime, endTime, attendeeEmails = []) {
    try {
      console.log('🎯 Creating Google Meet link...');
      console.log('🎯 Course title:', courseTitle);
      console.log('🎯 Start time:', startTime);
      console.log('🎯 End time:', endTime);
      console.log('🎯 Attendees count:', attendeeEmails.length);
      
      // Check if OAuth client has credentials
      const credentials = oauth2Client.credentials;
      console.log('🎯 OAuth credentials present:', !!credentials);
      console.log('🎯 Has access token:', !!credentials?.access_token);
      console.log('🎯 Has refresh token:', !!credentials?.refresh_token);
      
      if (!credentials || !credentials.access_token) {
        throw new Error('No OAuth credentials found. Please reconnect your Google account.');
      }
      
      // Set up calendar API
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Format attendees array
      const attendees = attendeeEmails.map(email => ({ email }));
      
      // Create calendar event with Meet link
      const event = {
        summary: `Live Class: ${courseTitle}`,
        description: 'SkillLift Live Class Session - Anyone with the link can join',
        start: {
          dateTime: startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `skilllift-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        attendees: attendees, // Add enrolled learners
        // IMPORTANT: Set visibility to public so anyone with link can join
        visibility: 'public',
        guestsCanInviteOthers: true,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: true,
        // Set access to allow anyone with the link
        anyoneCanAddSelf: true,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 10 } // 10 minutes before
          ]
        }
      };

      console.log('🎯 Calling Google Calendar API to create event...');
      
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'none' // We'll handle notifications ourselves via our platform
      });

      console.log('✅ Calendar event created successfully');
      console.log('🎯 Response data:', JSON.stringify(response.data, null, 2));
      console.log('🎯 Conference data present:', !!response.data.conferenceData);
      console.log('🎯 Hangout link:', response.data.hangoutLink);

      // Extract Meet link from conference data
      let meetLink = response.data.hangoutLink; // Fallback to old format
      if (response.data.conferenceData && response.data.conferenceData.entryPoints) {
        console.log('🎯 Conference entry points:', response.data.conferenceData.entryPoints);
        const meetEntryPoint = response.data.conferenceData.entryPoints.find(
          entry => entry.entryPointType === 'video'
        );
        if (meetEntryPoint) {
          meetLink = meetEntryPoint.uri;
          console.log('✅ Meet link from entry point:', meetLink);
        }
      }

      // Validate Meet link
      if (!meetLink) {
        console.error('❌ No Meet link found in response');
        console.error('❌ Response data:', JSON.stringify(response.data, null, 2));
        throw new Error('Google Calendar did not generate a Meet link. Please ensure Google Meet API is enabled.');
      }

      console.log('✅ Final Meet link:', meetLink);

      return {
        meetLink: meetLink,
        calendarEventId: response.data.id,
        event: response.data
      };
    } catch (error) {
      console.error('❌ Error creating Meet link:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error response:', error.response?.data);
      
      // Provide more specific error messages
      if (error.code === 403) {
        throw new Error('Google Calendar API access denied. Please ensure the API is enabled and you have the required permissions.');
      } else if (error.code === 401) {
        throw new Error('Google authentication failed. Please reconnect your Google account.');
      } else if (error.message.includes('Calendar API has not been used')) {
        throw new Error('Google Calendar API is not enabled. Please enable it in Google Cloud Console.');
      } else {
        throw new Error(`Failed to create Google Meet link: ${error.message}`);
      }
    }
  }

  static async updateEventWithAttendees(eventId, attendeeEmails) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const event = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const attendees = attendeeEmails.map(email => ({ email }));
      
      const updatedEvent = {
        ...event.data,
        attendees: attendees
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: 'none'
      });

      return true;
    } catch (error) {
      console.error('Error updating event with attendees:', error);
      throw new Error('Failed to update event with attendees');
    }
  }

  static async endEvent(eventId) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      return true;
    } catch (error) {
      console.error('Error ending event:', error);
      // Don't throw error - event might already be deleted
      return false;
    }
  }
}

// Google Drive Service for Recordings
class GoogleDriveService {
  static async getRecordingFiles(tutorId, sessionId) {
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      // Search for files related to this session
      const query = `name contains '${sessionId}' and mimeType contains 'video'`;
      
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink, webContentLink, createdTime, size)',
        orderBy: 'createdTime desc'
      });

      return response.data.files;
    } catch (error) {
      console.error('Error getting recording files:', error);
      throw new Error('Failed to get recording files');
    }
  }

  static async getFileDownloadUrl(fileId) {
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      const file = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink, name, size'
      });

      return file.data;
    } catch (error) {
      console.error('Error getting file download URL:', error);
      throw new Error('Failed to get file download URL');
    }
  }

  // Find a likely recording by creation time window (more robust than filename contains)
  static async findRecordingByTimeWindow(startTime, endTime, bufferMinutes = 15) {
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      // Add buffer to account for Google processing delays
      const start = new Date(new Date(startTime).getTime() - bufferMinutes * 60 * 1000).toISOString();
      const end = new Date(new Date(endTime || Date.now()).getTime() + bufferMinutes * 60 * 1000).toISOString();

      // Query: videos created between start and end
      const q = `mimeType contains 'video' and createdTime >= '${start}' and createdTime <= '${end}'`;

      const response = await drive.files.list({
        q,
        fields: 'files(id, name, webViewLink, webContentLink, createdTime, size)',
        orderBy: 'createdTime desc'
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error finding recording by time window:', error);
      throw new Error('Failed to search recordings by time window');
    }
  }

  // Ensure the file can be viewed by learners without permission prompts
  static async setAnyoneWithLinkReader(fileId) {
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      // Create/ensure an anyone-with-link reader permission
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      // Return updated links
      return await this.getFileDownloadUrl(fileId);
    } catch (error) {
      // If permission already exists or not allowed, log and continue with existing link
      console.warn('Warning setting public permission on Drive file:', error?.message || error);
      return await this.getFileDownloadUrl(fileId);
    }
  }
}

module.exports = {
  GoogleOAuthService,
  GoogleMeetService,
  GoogleDriveService,
  oauth2Client
};

