# ⚡ Quick Recording Setup Guide

## 🎯 **5-Minute Setup Checklist**

### **Before You Start:**
⚠️ **CRITICAL:** You need **Google Workspace** (paid) or **Google One Premium** to record. Free Gmail accounts CANNOT record.

---

## ✅ **Step 1: Check Your Account Type (2 minutes)**

### **Option A: Quick Test**
1. Go to https://meet.google.com/
2. Start a new meeting
3. Click the 3 dots (⋮) at the bottom
4. Do you see **"Record meeting"**?
   - ✅ **YES** → You're ready! Continue to Step 2
   - ❌ **NO** → You need to upgrade to Google Workspace or Google One Premium

### **Option B: Check Account**
1. Go to https://myaccount.google.com/
2. Look at your account type
3. If it says "Google Workspace" or "Google One" → ✅ You're good!
4. If it's just "Gmail" → ❌ You need to upgrade

---

## ✅ **Step 2: Configure Backend (1 minute)**

1. Open `backend/.env` file
2. Add your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback
```

**Don't have credentials?** Get them here:
- Go to https://console.cloud.google.com/
- Create a project → Enable Google Calendar API & Google Drive API
- Create OAuth 2.0 credentials
- Copy Client ID and Client Secret

---

## ✅ **Step 3: Verify Setup (1 minute)**

### **Windows:**
```bash
check-recording-setup.bat
```

### **Mac/Linux:**
```bash
cd backend
node verify-google-setup.js
```

This will check:
- ✓ Environment variables
- ✓ Database connection
- ✓ Google API configuration
- ✓ Required models and services

---

## ✅ **Step 4: Test in Browser (1 minute)**

1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Open: `test-google-meet-recording.html` in your browser

3. Click **"Run All Tests"**

4. All tests should pass ✅

---

## 🎬 **Using Recording (The Simple Way)**

### **For Tutors:**

1. **Start Live Class**
   - Go to your Tutor Dashboard
   - Click "Start Live Class" for your course
   - Google Meet will open

2. **Start Recording MANUALLY**
   - In Google Meet, click the 3 dots (⋮)
   - Click **"Record meeting"**
   - Click **"Start"**
   - You'll see a red recording indicator 🔴

3. **Teach Your Class**
   - Everything is being recorded
   - Red dot shows it's recording

4. **Stop Recording**
   - Click 3 dots (⋮) again
   - Click **"Stop recording"**

5. **End Class**
   - Click "End Class" in SkillLift
   - Wait 2-3 minutes

6. **Recording is Ready!**
   - Learners can now see the replay
   - Check in Learner Dashboard → Course → Replays

---

## 🐛 **Quick Troubleshooting**

### **Problem: "Record meeting" not showing**
**Fix:** You need Google Workspace or Google One Premium (paid accounts only)

### **Problem: Recording not appearing in SkillLift**
**Fix:** 
```bash
cd backend
node check-recording-status.js
```
This shows if recording is processing or stuck.

### **Problem: Backend won't start**
**Fix:**
1. Check if MongoDB is running
2. Check if port 5000 is available
3. Check `.env` file has all required variables

### **Problem: Google account won't connect**
**Fix:**
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`
2. Check redirect URI matches: `http://localhost:5000/api/google-meet/auth/google/callback`
3. Make sure Google Calendar API and Google Drive API are enabled

---

## 📊 **How to Check Recording Status**

### **Method 1: Command Line**
```bash
cd backend
node check-recording-status.js
```

### **Method 2: Browser**
Open `check-recording-status.html` in your browser

### **Method 3: Full Test Suite**
Open `test-google-meet-recording.html` in your browser

---

## ⚡ **One-Command Status Check**

```bash
# Windows
check-recording-setup.bat

# Mac/Linux
cd backend && node check-recording-status.js
```

---

## 🎯 **What You Need to Remember**

### **The ONE Critical Thing:**
> **🎬 YOU MUST MANUALLY CLICK "RECORD MEETING" IN GOOGLE MEET**

Google Meet does NOT auto-record. This is how Google Meet works, not a bug.

### **Everything Else is Automatic:**
- ✅ SkillLift creates the Google Meet link
- ✅ SkillLift finds the recording after class ends
- ✅ SkillLift makes recording available to learners
- ❌ But YOU must click "Record meeting" during the class

---

## 📝 **Quick Reference**

| Task | Command | Time |
|------|---------|------|
| Verify setup | `check-recording-setup.bat` | 1 min |
| Check status | `node backend/check-recording-status.js` | 30 sec |
| Browser test | Open `test-google-meet-recording.html` | 1 min |
| Start backend | `cd backend && npm start` | 10 sec |
| View full guide | Read `GOOGLE_MEET_RECORDING_GUIDE.md` | 10 min |

---

## 🔗 **Important Links**

- **Google Meet:** https://meet.google.com/
- **Google Cloud Console:** https://console.cloud.google.com/
- **Google Workspace Admin:** https://admin.google.com/
- **Get Google Workspace:** https://workspace.google.com/

---

## ✨ **Success Checklist**

Before going live, make sure:

```
□ You have Google Workspace or Google One Premium
□ Backend .env file configured with Google credentials
□ Ran check-recording-setup.bat (all tests pass)
□ Started backend server (npm start)
□ Logged in as tutor in SkillLift
□ Connected Google account in SkillLift
□ Tested "Record meeting" button shows in Google Meet
□ Know to MANUALLY click "Record meeting" during class
```

---

## 🚀 **Quick Start (Complete Flow)**

```bash
# 1. Verify setup
check-recording-setup.bat

# 2. Start backend
cd backend
npm start

# 3. Open SkillLift in browser
# http://localhost:3000

# 4. Log in as tutor

# 5. Connect Google account

# 6. Start live class

# 7. MANUALLY click "Record meeting" in Google Meet

# 8. Teach class

# 9. Stop recording & end class

# 10. Wait 2-3 minutes

# 11. Check as learner - replay should be available!
```

---

## 💡 **Pro Tips**

1. **Test First:** Do a test recording before your first real class
2. **Announce Recording:** Tell students you're starting recording
3. **Check Red Dot:** Make sure you see the 🔴 recording indicator
4. **Wait Before Checking:** Give it 3 minutes after ending class
5. **Check Drive:** Recording also appears in Google Drive "Meet Recordings" folder

---

## 🆘 **Need Help?**

Run the diagnostic tools:
```bash
# Full verification
check-recording-setup.bat

# Check recording status
node backend/check-recording-status.js

# Browser tests
Open: test-google-meet-recording.html
```

For complete details, see: **GOOGLE_MEET_RECORDING_GUIDE.md**

---

**That's it! You're ready to record! 🎉**

