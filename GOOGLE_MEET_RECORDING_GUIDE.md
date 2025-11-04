# 🎥 Google Meet Recording - Complete Setup & Verification Guide

## 📋 **IMPORTANT: How Google Meet Recording Works**

### **Key Facts:**
1. ⚠️ **Google Meet does NOT automatically record meetings** - You must manually start recording
2. 🎓 **Google Workspace Requirement** - Recording requires Google Workspace (paid) or Google One Premium
3. 👤 **Only the meeting host** (tutor) can start/stop recording
4. 💾 **Recordings are saved to Google Drive** in the "Meet Recordings" folder
5. ⏱️ **Processing takes 1-3 minutes** after meeting ends

---

## 🔍 **STEP 1: Check if Recording is Available**

### **Option A: Check Your Google Account Type**

```
1. Go to https://myaccount.google.com/
2. Look for your account type:
   ✅ Google Workspace (Business, Education, Enterprise)
   ✅ Google One Premium
   ❌ Personal Gmail (free) - NO RECORDING
```

### **Option B: Test in Google Meet**

1. Go to https://meet.google.com/
2. Start a new meeting
3. Click the 3 dots menu (⋮) at the bottom
4. Look for **"Record meeting"** option
   - ✅ If you see it → Recording is enabled
   - ❌ If you don't see it → You need to upgrade

---

## ✅ **STEP 2: Enable Recording Permissions**

### **For Google Workspace Admins:**

1. Go to [Google Admin Console](https://admin.google.com/)
2. Navigate to: **Apps → Google Workspace → Google Meet**
3. Click **"Meet video settings"**
4. Under **"Recording"**, enable:
   - ✅ **"Let people record their meetings"**
   - ✅ **"Host management"** (allows hosts to start/stop)
5. Click **"Save"**

### **Important Settings:**
```
✅ Recording: ON
✅ Host can record: ON
✅ Participants can record: OFF (for security)
✅ External participants: Configure based on needs
```

---

## 🎬 **STEP 3: How to Record During Live Classes**

### **For Tutors (Meeting Hosts):**

#### **Starting a Recording:**
1. Start your live class in Google Meet
2. Wait for learners to join (recordings include everything after you start)
3. Click the **3 dots menu (⋮)** at the bottom
4. Click **"Record meeting"**
5. Click **"Start"** in the confirmation dialog
6. You'll see a **red recording indicator** in the top-left corner

#### **Stopping a Recording:**
1. Click the **3 dots menu (⋮)** again
2. Click **"Stop recording"**
3. Confirm by clicking **"Stop recording"** again
4. Wait 1-3 minutes for Google to process

#### **Important Tips:**
- 📢 Google announces to all participants when recording starts/stops
- 🔴 The red recording indicator shows it's active
- 💾 Recording saves to "Meet Recordings" folder in your Google Drive
- ⏸️ If you leave the meeting, recording stops automatically

---

## 🔧 **STEP 4: Configure Your SkillLift Backend**

### **Check Your Environment Variables:**

Open your `backend/.env` file and verify:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback

# Required Scopes (must include Drive access)
GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/drive.file,https://www.googleapis.com/auth/meetings.space.created

# Database
MONGODB_URI=mongodb://localhost:27017/skilllift
```

### **Verify Google Cloud Project Settings:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services" → "Enabled APIs"**
4. Make sure these are enabled:
   - ✅ **Google Calendar API**
   - ✅ **Google Drive API**
   - ✅ **Google Meet API** (if available)

---

## 🧪 **STEP 5: Test Recording Functionality**

### **Test 1: Backend Recording Status Checker**

```bash
cd backend
node check-recording-status.js
```

This will show:
- Recent live class sessions
- Recording status for each
- Processing time
- Any stuck sessions

### **Test 2: Frontend Recording Status Checker**

1. Open: `check-recording-status.html` in your browser
2. Make sure you're logged in
3. Click **"Check Recording Status"**
4. Click **"Check Available Replays"**

### **Test 3: Full End-to-End Test**

#### **As Tutor:**
1. Log in to your tutor account
2. Go to Live Classes
3. Click **"Connect Google Account"** (if not connected)
4. Authorize the app
5. Select a course
6. Click **"Start Live Class"**
7. **MANUALLY START RECORDING** in Google Meet (click ⋮ → Record meeting)
8. Wait a few minutes
9. **MANUALLY STOP RECORDING** in Google Meet
10. Click **"End Class"** in SkillLift

#### **As Learner (after 2-3 minutes):**
1. Log in to your learner account
2. Go to the course page
3. Check for **"Replay"** button or section
4. Click to view the recording

---

## 🔄 **STEP 6: How the System Processes Recordings**

### **Automatic Processing Flow:**

```
1. Tutor ends live class
   ↓
2. SkillLift waits 30 seconds
   ↓
3. System searches Google Drive for recording:
   - First: Search by session ID
   - Then: Search by time window (class start/end time)
   ↓
4. If found:
   - Updates database with recording URL
   - Makes recording accessible to enrolled learners
   - Sends notifications
   ↓
5. Learners can view replay
```

### **Processing Timeline:**
- ⏱️ **0-30 seconds**: Google processes recording
- ⏱️ **30 seconds**: SkillLift starts searching
- ⏱️ **30s-2 minutes**: System finds and links recording
- ⏱️ **2+ minutes**: Recording available to learners

---

## 🛠️ **STEP 7: Troubleshooting**

### **Problem: "Record meeting" option not visible**

**Solution:**
- ✅ Verify you have Google Workspace or Google One Premium
- ✅ Check admin settings (see Step 2)
- ✅ Make sure you're the meeting host (not a participant)
- ✅ Try in a new incognito window to rule out browser issues

### **Problem: Recording not appearing in SkillLift**

**Solution:**
```bash
# Check recording status
cd backend
node check-recording-status.js

# Manually process recording if stuck
node -e "
const { processRecording } = require('./controllers/googleMeetController');
processRecording({ body: { sessionId: 'YOUR_SESSION_ID' } }, { json: console.log });
"
```

### **Problem: Permission denied when accessing recording**

**Solution:**
1. Recording might not have public permissions
2. Check Google Drive "Meet Recordings" folder
3. Right-click recording → Share → Change to "Anyone with link can view"
4. Or update backend to automatically set permissions (already implemented)

### **Problem: No recordings found after class**

**Checklist:**
- ⚠️ Did you manually start recording in Google Meet?
- ⚠️ Did the recording run for at least 30 seconds?
- ⚠️ Check the tutor's Google Drive "Meet Recordings" folder
- ⚠️ Check if Google account is still connected
- ⚠️ Wait at least 3 minutes after ending class

---

## 📊 **STEP 8: Monitor Recording System**

### **Check Database Records:**

```javascript
// Check recent sessions
db.liveclasssessions.find({
  endTime: { $gte: ISODate("2025-10-21T00:00:00Z") }
}).sort({ endTime: -1 })

// Check sessions with recordings
db.liveclasssessions.find({
  recordingUrl: { $exists: true, $ne: null }
})

// Check stuck sessions
db.liveclasssessions.find({
  status: 'ended',
  recordingUrl: { $exists: false },
  endTime: { $lt: ISODate() }
})
```

### **API Endpoints:**

```bash
# Get current session for a course
GET http://localhost:5000/api/google-meet/live/current/:courseId
Authorization: Bearer YOUR_TOKEN

# Get replays for a course
GET http://localhost:5000/api/google-meet/live/replays/:courseId
Authorization: Bearer YOUR_TOKEN

# Manually trigger recording processing
POST http://localhost:5000/api/google-meet/live/process-recording
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
{
  "sessionId": "session-xxxxx"
}
```

---

## ✨ **Best Practices for Perfect Recording**

### **For Tutors:**
1. ✅ **Always manually start recording** at the beginning of class
2. ✅ Announce to students that you're recording
3. ✅ Keep recording running for entire class
4. ✅ Stop recording before ending Google Meet
5. ✅ Wait 2-3 minutes before checking if replay is available
6. ✅ Test recording in a practice session first

### **For System Administrators:**
1. ✅ Monitor `check-recording-status.js` output regularly
2. ✅ Set up cron job to check for stuck sessions
3. ✅ Verify Google OAuth tokens are not expired
4. ✅ Keep Google Drive storage within limits
5. ✅ Set up error alerts for failed recording processing

### **For Learners:**
1. ✅ Check back 3-5 minutes after class ends
2. ✅ Refresh course page if replay doesn't appear immediately
3. ✅ Report to tutor if replay is missing after 10 minutes

---

## 🎯 **CRITICAL REQUIREMENTS SUMMARY**

### **To Make Recording Work Perfectly:**

#### **1. Google Account Requirements:**
- ✅ Google Workspace account (Business, Education, or Enterprise)
- ✅ OR Google One Premium subscription
- ❌ Free Gmail accounts CANNOT record

#### **2. Google Cloud Project Requirements:**
- ✅ Google Calendar API enabled
- ✅ Google Drive API enabled
- ✅ OAuth 2.0 credentials configured
- ✅ Correct redirect URIs set

#### **3. Google Workspace Admin Requirements:**
- ✅ Recording enabled in Google Meet settings
- ✅ Host management enabled
- ✅ Sufficient Google Drive storage

#### **4. SkillLift Requirements:**
- ✅ Backend environment variables configured
- ✅ Tutor connected Google account via OAuth
- ✅ MongoDB running and accessible
- ✅ Recording processing service active

#### **5. Manual Steps Required:**
- ⚠️ **TUTOR MUST MANUALLY START RECORDING** in Google Meet
- ⚠️ **TUTOR MUST MANUALLY STOP RECORDING** before ending
- ⚠️ Recording is NOT automatic - this is a Google Meet limitation

---

## 📞 **Quick Reference Commands**

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Test Google OAuth connection
curl http://localhost:5000/api/google-meet/auth/google/url

# Check recording status (from backend directory)
node check-recording-status.js

# Start backend
cd backend && npm start

# View backend logs
cd backend && tail -f logs/app.log
```

---

## 🔗 **Useful Links**

- [Google Workspace Admin Console](https://admin.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Meet Recording Guide](https://support.google.com/meet/answer/9308681)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)

---

## ✅ **Verification Checklist**

Use this checklist to ensure everything is configured correctly:

```
□ Google Workspace or Google One Premium account
□ Recording permission enabled in Google Workspace Admin
□ Google Calendar API enabled in Cloud Console
□ Google Drive API enabled in Cloud Console
□ OAuth credentials configured with correct redirect URI
□ Environment variables set in backend/.env
□ Tutor has connected Google account in SkillLift
□ Backend server is running
□ MongoDB is running
□ Tested creating a Google Meet link
□ Tested starting recording manually in Google Meet
□ Tested ending class and checking for replay
□ Verified recording appears in Google Drive
□ Verified recording appears in SkillLift learner dashboard
```

---

## 🎓 **Summary**

**The #1 thing to remember:** 

> 🎬 **Google Meet does NOT auto-record. The tutor must manually click "Record meeting" in Google Meet during the live class.**

Everything else is automatic:
- ✅ SkillLift creates the Google Meet link
- ✅ SkillLift searches for the recording after class ends
- ✅ SkillLift makes recording available to learners
- ❌ But the actual recording must be started manually by the tutor

This is a Google Meet platform limitation, not a SkillLift limitation.

---

**Need Help?** Run `check-recording-status.html` or `node backend/check-recording-status.js` to diagnose issues.

