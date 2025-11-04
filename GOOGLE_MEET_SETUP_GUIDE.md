# Google Meet Integration Setup Guide

## 🔧 **Google API Credentials Setup**

### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google Drive API
   - Google Meet API (if available)

### **Step 2: Create OAuth 2.0 Credentials**
1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### **Step 3: Download Credentials**
1. Download the JSON file
2. Save as `backend/config/google-credentials.json`
3. Add to `.gitignore`

### **Step 4: Environment Variables**
Add to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Google API Scopes
GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file,https://www.googleapis.com/auth/meetings.space.created

# JWT Secret for tokens
JWT_SECRET=your_jwt_secret_here
```

### **Step 5: Required Scopes**
- `https://www.googleapis.com/auth/calendar` - Create calendar events with Meet links
- `https://www.googleapis.com/auth/drive.file` - Access Drive files
- `https://www.googleapis.com/auth/meetings.space.created` - Create Meet spaces

## 📦 **Install Required Packages**

```bash
cd backend
npm install googleapis google-auth-library
```

## 🔐 **OAuth Flow**
1. Tutor clicks "Start Live Class"
2. Redirect to Google OAuth (if not authenticated)
3. Get access token and refresh token
4. Store tokens securely in database
5. Use tokens for API calls

## 🎯 **Implementation Overview**
- **Backend**: Google API integration, WebSocket notifications
- **Frontend**: Updated dashboards, real-time notifications
- **Database**: Store Meet links, recordings, session data
- **Security**: Proper authentication, role-based access
