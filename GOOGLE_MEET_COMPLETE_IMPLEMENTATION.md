# 🚀 **GOOGLE MEET INTEGRATION - COMPLETE SETUP GUIDE**

## 📋 **IMPLEMENTATION SUMMARY**

This implementation replaces the current WebRTC-based live class system with a robust Google Meet integration that provides:

- ✅ **Automatic Meet link generation** via Google Calendar API
- ✅ **Real-time notifications** to enrolled learners
- ✅ **Automatic recording processing** via Google Drive API
- ✅ **Replay class functionality** for past sessions
- ✅ **Role-based access control** (tutors vs learners)
- ✅ **Custom Meet link support** for flexibility

## 🔧 **SETUP INSTRUCTIONS**

### **Step 1: Google Cloud Console Setup**

1. **Create/Select Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one

2. **Enable APIs**
   - Google Calendar API
   - Google Drive API
   - Google Meet API (if available)

3. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:5000/api/google-meet/auth/google/callback` (dev)
     - `https://yourdomain.com/api/google-meet/auth/google/callback` (prod)

4. **Download Credentials**
   - Download JSON file
   - Save as `backend/config/google-credentials.json`
   - Add to `.gitignore`

### **Step 2: Environment Configuration**

1. **Copy Environment Template**
   ```bash
   cp backend/env.example backend/.env
   ```

2. **Update .env File**
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id_from_google_console
   GOOGLE_CLIENT_SECRET=your_client_secret_from_google_console
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback
   
   # Other configurations
   JWT_SECRET=your_super_secret_jwt_key
   MONGODB_URI=mongodb://localhost:27017/skilllift
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

### **Step 3: Install Dependencies**

```bash
cd backend
npm install googleapis google-auth-library nodemailer
```

### **Step 4: Database Schema Updates**

The implementation includes new models:
- `LiveClassSession` - Stores session data, Meet links, recordings
- `Notification` - Real-time notifications system

### **Step 5: Backend Integration**

1. **Add Routes to Main App**
   ```javascript
   // In server.js or app.js
   const googleMeetRoutes = require('./routes/googleMeetRoutes');
   app.use('/api/google-meet', googleMeetRoutes);
   ```

2. **Update User Model**
   Add Google tokens field to User schema:
   ```javascript
   googleTokens: {
     accessToken: String,
     refreshToken: String,
     expiryDate: Number
   }
   ```

### **Step 6: Frontend Integration**

1. **Update Routes**
   ```javascript
   // Replace existing live class route
   <Route path="/live-class/:courseId" element={<GoogleMeetLiveClass />} />
   ```

2. **Add Components**
   - `TutorLiveClassDashboard.jsx` - For tutors
   - `LearnerLiveClassDashboard.jsx` - For learners
   - `GoogleMeetLiveClass.jsx` - Main container

## 🎯 **API ENDPOINTS**

### **Google OAuth**
- `GET /api/google-meet/auth/google/url` - Get OAuth URL
- `GET /api/google-meet/auth/google/callback` - Handle OAuth callback

### **Live Class Management**
- `POST /api/google-meet/live/start` - Start live class (tutor only)
- `GET /api/google-meet/live/current/:courseId` - Get current session
- `POST /api/google-meet/live/end` - End live class (tutor only)
- `GET /api/google-meet/live/replays/:courseId` - Get replay classes
- `POST /api/google-meet/live/process-recording` - Process recording

## 🔄 **WORKFLOW**

### **Tutor Flow**
1. Tutor clicks "Start Live Class"
2. System checks Google account connection
3. If not connected, redirects to Google OAuth
4. Generates Meet link via Calendar API
5. Sends notifications to enrolled learners
6. Opens Meet link in new tab

### **Learner Flow**
1. Learner receives real-time notification
2. Clicks notification to join Meet
3. Opens Meet link in new tab
4. Can access replay classes after session ends

### **Recording Flow**
1. Session ends (tutor clicks "End Class")
2. System processes recording from Google Drive
3. Stores recording URL in database
4. Makes available as "Replay Class"

## 🔐 **SECURITY FEATURES**

- ✅ **Role-based access control** - Only tutors can start classes
- ✅ **Enrollment verification** - Only enrolled learners can join
- ✅ **JWT authentication** - Secure API access
- ✅ **Google OAuth** - Secure Google account integration
- ✅ **Token refresh** - Automatic token renewal

## 🚀 **DEPLOYMENT**

### **Production Environment Variables**
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/auth/google/callback
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=your_production_mongodb_uri
```

### **Google Cloud Console**
- Update OAuth redirect URIs for production domain
- Enable APIs for production project
- Set up proper CORS policies

## 🧪 **TESTING**

### **Test Scenarios**
1. **Tutor starts class** - Verify Meet link generation
2. **Learner receives notification** - Check real-time notifications
3. **Join Meet session** - Verify link opens correctly
4. **End session** - Check recording processing
5. **Access replay** - Verify recording availability

### **Error Handling**
- Google API failures
- Network connectivity issues
- Authentication errors
- Recording processing failures

## 📊 **MONITORING**

### **Key Metrics**
- Session start/end rates
- Notification delivery success
- Recording processing success
- User engagement with replays

### **Logging**
- Google API calls and responses
- Session lifecycle events
- Error conditions and stack traces
- User actions and timestamps

## 🎉 **BENEFITS**

### **For Tutors**
- ✅ **Easy setup** - One-click Google account connection
- ✅ **Automatic Meet links** - No manual link creation
- ✅ **Recording management** - Automatic processing
- ✅ **Learner notifications** - Automatic enrollment notifications

### **For Learners**
- ✅ **Instant notifications** - Real-time class start alerts
- ✅ **Easy joining** - One-click Meet access
- ✅ **Replay access** - Past session recordings
- ✅ **Mobile friendly** - Works on all devices

### **For Platform**
- ✅ **Scalable** - Leverages Google's infrastructure
- ✅ **Reliable** - Google's 99.9% uptime
- ✅ **Feature-rich** - All Google Meet features available
- ✅ **Cost-effective** - No custom WebRTC infrastructure

**This implementation provides a robust, scalable, and user-friendly live class system that integrates seamlessly with Google Meet!** 🎥✨🚀
