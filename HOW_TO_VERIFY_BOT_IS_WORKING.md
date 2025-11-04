# 🤖 How to Verify the Recording Bot is Working

## ✅ Step-by-Step Verification Guide

### **BEFORE Starting a Live Class:**

#### 1. **Ensure Backend is Running**
```bash
# Run this in one terminal:
cd backend
npm start
```
**Look for:**
- ✅ `✅ MongoDB Connected!`
- ✅ `🚀 Server running on port 5000`
- ✅ `✅ Google Meet controllers loaded successfully`

---

#### 2. **Ensure MongoDB is Running**
```bash
# Check if MongoDB service is active
# Windows: Open Services (services.msc) and look for "MongoDB"
# Or just make sure your backend connects successfully
```

---

### **WHEN Starting a Live Class:**

#### 3. **Watch Your Backend Terminal**

**Immediately after clicking "Start Live Class", you should see:**

```
🔍 Frontend: About to make request to /google-meet/live/start
🔍 Starting live class - courseId: [ID], customMeetLink: https://...
✅ Found user: [Your Name]
✅ User has Google tokens
🤖 Starting automated recording bot...
✅ Bot initialized successfully
🔗 Joining meeting: https://meet.google.com/xxx-xxxx-xxx
```

**⚠️ If you DON'T see these messages:**
- The bot is NOT running
- Check backend logs for errors
- Verify MongoDB is connected

---

#### 4. **Visual Confirmation in Google Meet**

**🎯 How to spot the bot in your meeting:**

1. **A new Chrome window will appear** (this is Puppeteer)
   - It might be minimized or behind other windows
   - Look in your taskbar for a new Chrome icon

2. **In your Google Meet, you'll see:**
   - A participant joins with **YOUR NAME** (the bot uses your Google account)
   - Or it might show as "Recording Bot" or similar
   - This is the bot - it's actually recording!

3. **Bot Behavior:**
   - The bot won't turn on its camera/mic
   - It silently records the screen
   - It will leave automatically when you end the class

---

#### 5. **During the Live Class**

**Check backend terminal for:**
```
🎥 Starting recording...
✅ Recording started: backend/recordings/session-[ID].mp4
📹 Recording in progress... (updates every 30 seconds)
```

**You should see periodic updates showing the bot is recording.**

---

### **WHEN Ending the Live Class:**

#### 6. **Watch for Upload Process**

**After clicking "End Class", you should see:**

```
⏹️ Stopping automated recording bot...
✅ Recording stopped successfully
💾 Saved recording: backend/recordings/session-[ID].mp4
📤 Uploading recording to Google Drive...
🔄 Upload progress: [X]%
✅ Recording uploaded successfully!
📁 Google Drive URL: https://drive.google.com/file/d/[ID]/view
✅ Updated session with recording URL
🧹 Cleaning up local file...
🔔 Notifying learners about replay availability...
```

**⚠️ If you DON'T see these messages:**
- The recording might not have been created
- Check if Puppeteer had errors
- Verify Google Drive API is enabled

---

### **AFTER the Class Ends:**

#### 7. **Verify Recording in Google Drive**

1. Go to your [Google Drive](https://drive.google.com)
2. Look for a folder: **"SkillLift Recordings"**
3. You should see: `Session-[ID]-[Date].mp4`
4. Click to verify the recording plays

---

#### 8. **Verify Recording in Database**

Run this diagnostic script:
```bash
# Windows:
check-bot-status.bat

# Or manually check:
dir backend\recordings
type backend\recordings.json
```

---

## 🚨 **TROUBLESHOOTING:**

### **Problem: "No bot messages in backend"**

**Possible Causes:**
1. ❌ MongoDB not running → Start MongoDB service
2. ❌ Backend not running → Run `npm start` in backend folder
3. ❌ Google tokens expired → Disconnect and reconnect Google account
4. ❌ Bot code has errors → Check backend console for stack traces

---

### **Problem: "Bot joins but doesn't record"**

**Check:**
1. Puppeteer installed correctly → Run: `npm install puppeteer puppeteer-screen-recorder`
2. Chrome/Chromium is accessible → Puppeteer downloads Chromium automatically
3. Sufficient disk space → Recording files can be large

---

### **Problem: "Recording doesn't upload to Drive"**

**Check:**
1. Google Drive API is enabled in Google Cloud Console
2. OAuth scopes include `https://www.googleapis.com/auth/drive.file`
3. Google tokens are valid (check backend logs)
4. Internet connection is stable

---

## 📋 **QUICK CHECKLIST:**

Before starting a test:
- [ ] Backend server is running (`npm start`)
- [ ] MongoDB is connected (see backend logs)
- [ ] Google account is connected (green checkmark in UI)
- [ ] Google Drive API is enabled
- [ ] Puppeteer is installed (`npm list puppeteer`)

When testing:
- [ ] Backend shows "🤖 Starting automated recording bot..."
- [ ] New Chrome window appears (the bot)
- [ ] Backend shows "✅ Recording started"
- [ ] Bot appears in Google Meet as a participant

After ending:
- [ ] Backend shows "📤 Uploading recording to Google Drive..."
- [ ] Backend shows "✅ Recording uploaded successfully!"
- [ ] Recording appears in Google Drive
- [ ] Learners receive notification

---

## 🎯 **YOUR CURRENT SITUATION:**

Based on your recent test:
1. ✅ Frontend is working (UI looks perfect!)
2. ❌ Backend might not be running properly
3. ❌ MongoDB connection issue detected
4. ❓ Not sure if bot actually ran

**Next Steps:**
1. **Close all terminals**
2. **Restart MongoDB** (if using local MongoDB)
3. **Restart Backend:** Run `npm start` in `backend` folder
4. **Watch the terminal** when starting a new class
5. **Look for the Chrome window** (the bot)
6. **Check backend logs** for bot messages

---

## 📞 **Need Help?**

Share these details:
1. Last 50 lines of backend terminal output
2. Any error messages in browser console
3. Screenshot of your Live Class Management UI
4. Output from running `check-bot-status.bat`

---

**💡 TIP:** The easiest way to verify the bot is working is to watch for a **new Chrome window** appearing when you start the class. That's the bot joining your meeting!

