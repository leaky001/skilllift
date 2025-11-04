# 🧪 TESTING AUTOMATED RECORDING BOT

## ✅ Backend Status: WORKING!

Routes are registered and responding correctly.

---

## 🎯 TEST PLAN

### **Test 1: Verify Backend Routes** ✅ PASSED
- ✅ Replay routes accessible
- ✅ Authentication middleware working

---

## 📋 MANUAL TEST CHECKLIST

### **STEP 1: Open Your Frontend**

1. Open a new terminal/PowerShell
2. Navigate to frontend:
   ```bash
   cd C:\Users\User\OneDrive\Desktop\Skill-lift\frontend
   ```
3. Start frontend (if not running):
   ```bash
   npm start
   ```
4. Open browser: `http://localhost:3000`

---

### **STEP 2: Login as Tutor**

1. Login with your tutor account
2. Navigate to your Live Class Dashboard
3. Select a course you teach

---

### **STEP 3: Reconnect Google Account** ⚠️ IMPORTANT!

Before testing, you MUST reconnect Google for Drive permissions:

1. Look for "Google Account Connected" section
2. Click **"Disconnect Google"** button
3. Wait for confirmation
4. Click **"Connect Google"** button
5. Authorize ALL permissions (Calendar + Drive)
6. Verify you see: **"✅ Google Account Connected"**

**Why?** The bot needs Google Drive permission to upload recordings.

---

### **STEP 4: Start a Test Class**

1. Make sure your backend terminal is visible (to see bot logs)
2. In frontend, click **"Start Live Class"**
3. Use your **custom Meet link** (easier for testing)
4. Click Start

**Expected Frontend:**
- ✅ Google Meet opens in new tab
- ✅ No errors in console
- ✅ Live class shows as "Active"

**Expected Backend Logs:**
```
🤖 Starting automated recording bot...
✅ Bot initialized successfully
🔗 Joining meeting: https://meet.google.com/...
✅ Successfully joined meeting
🎥 Starting recording...
✅ Recording started: C:\Users\User\OneDrive\Desktop\Skill-lift\backend\recordings\session-xxx.mp4
```

**Expected System:**
- ✅ Chrome window appears (this is the bot!)
- ✅ Bot shows as a participant in your Meet

---

### **STEP 5: Let It Record** ⏱️

1. Stay in the meeting for **2-3 minutes**
2. Talk or play a video (so there's content)
3. Watch the backend logs for any errors
4. The Chrome bot window should stay open

**What You'll See:**
- Chrome window with Meet (the bot)
- Your normal Meet interface
- Bot appears as a participant

---

### **STEP 6: End the Class**

1. In your frontend, click **"End Class"**
2. Watch the backend logs closely

**Expected Frontend:**
- ✅ Notification: "Live class ended successfully! Recording is being uploaded..."
- ✅ Meet link closes

**Expected Backend Logs:**
```
⏹️ Stopping automated recording bot...
✅ Recording stopped
👋 Left meeting
📤 Uploading recording to Google Drive...
✅ Recording uploaded successfully: https://drive.google.com/file/d/...
✅ Local recording file deleted
📢 Replay ready notifications sent
```

**Expected System:**
- ✅ Chrome bot window closes
- ✅ Recording file created temporarily then deleted

---

### **STEP 7: Verify Replay is Available**

1. Go to your course **Replay Section**
2. Look for the recording you just made
3. Click play button
4. Verify video plays from Google Drive

**Expected:**
- ✅ Recording appears in replay list
- ✅ Video shows correct duration (2-3 minutes)
- ✅ Video plays smoothly
- ✅ Audio is clear

---

## 🔍 WHAT TO WATCH FOR

### **In Backend Logs:**

**GOOD Signs:**
```
🤖 Starting automated recording bot...
✅ Bot initialized successfully
✅ Successfully joined meeting
✅ Recording started
⏹️ Stopping automated recording bot...
✅ Recording uploaded successfully
```

**BAD Signs:**
```
❌ Failed to start automated recording
❌ Error joining meeting
❌ Upload failed
❌ Recording file not found
```

### **In Chrome Bot Window:**

**GOOD:**
- Window opens
- Joins Google Meet
- Shows meeting content
- Stays open during recording
- Closes when class ends

**BAD:**
- Doesn't open
- Gets stuck on login page
- Crashes or closes early
- Shows errors

---

## ⚠️ COMMON ISSUES & FIXES

### **Issue 1: Bot Doesn't Start**

**Symptoms:**
- No Chrome window appears
- No bot logs in backend

**Check:**
```bash
# In backend directory
npm list puppeteer
# Should show: puppeteer@24.26.1
```

**Fix:**
```bash
npx puppeteer browsers install chrome
```

---

### **Issue 2: Bot Can't Login**

**Symptoms:**
- Chrome opens but shows Google login page
- Doesn't join meeting

**Fix:**
1. **First time:** Manually enter your password in bot's Chrome window
2. The session will be saved for future recordings
3. This only happens once!

---

### **Issue 3: Recording Doesn't Upload**

**Symptoms:**
- Recording stops but no upload
- "Upload failed" in logs

**Check:**
1. Did you reconnect Google account?
2. Is Google Drive API enabled?
3. Does `.env` have Drive scope?

**Fix:**
1. Disconnect and reconnect Google account
2. Verify `.env` contains:
   ```
   GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/drive.file
   ```

---

### **Issue 4: "No Space Left" Error**

**Check:**
```powershell
# Check available space
Get-PSDrive C
```

**Fix:**
- Free up at least 5GB disk space
- Recordings are auto-deleted after upload

---

## 📊 SUCCESS INDICATORS

### ✅ **You'll Know It Works When:**

1. Chrome bot window appears
2. Bot joins your Google Meet
3. Backend logs show recording progress
4. When you end class, upload begins
5. Recording appears in replay section
6. Video plays smoothly

---

## 🎬 DETAILED TEST SCENARIO

### **Scenario: 3-Minute Test Class**

**Time 0:00** - Start Class
- Frontend: Click "Start Live Class"
- Backend: `🤖 Starting automated recording bot...`
- System: Chrome window appears

**Time 0:30** - Bot Joins
- Backend: `✅ Successfully joined meeting`
- Meet: Bot appears as participant

**Time 1:00** - Recording Active
- Backend: `✅ Recording started: ...session-xxx.mp4`
- Talk/play video to generate content

**Time 3:00** - End Class
- Frontend: Click "End Class"
- Backend: `⏹️ Stopping automated recording bot...`
- System: Chrome closes

**Time 3:30** - Upload Begins
- Backend: `📤 Uploading recording to Google Drive...`
- Wait for upload (30 seconds - 2 minutes)

**Time 5:00** - Upload Complete
- Backend: `✅ Recording uploaded successfully`
- Frontend: Notification appears
- Learners: Get "Replay Ready!" notification

**Time 5:30** - Verify Replay
- Go to Replay Section
- See recording listed
- Play video
- Verify quality

---

## 📝 CHECKLIST FOR REPORTING RESULTS

After testing, please report:

### ✅ **What Worked:**
- [ ] Backend started without errors
- [ ] Routes accessible
- [ ] Google account reconnected
- [ ] Chrome bot window appeared
- [ ] Bot joined meeting
- [ ] Recording started
- [ ] Recording stopped
- [ ] Upload succeeded
- [ ] Replay available
- [ ] Video plays correctly

### ❌ **What Failed:**
- [ ] Error messages seen
- [ ] Which step failed
- [ ] Backend log errors
- [ ] Frontend console errors

---

## 🚀 READY TO TEST?

1. **Open frontend** in browser
2. **Login as tutor**
3. **Reconnect Google account** (IMPORTANT!)
4. **Start a test class** (use custom Meet link)
5. **Wait 2-3 minutes**
6. **End the class**
7. **Check replay section**

---

## 💡 PRO TIPS

1. **Keep Backend Visible:** Watch logs in real-time
2. **Use Custom Link:** Easier than OAuth for first test
3. **Short Test:** 2-3 minutes is enough
4. **Talk During Test:** So video has content
5. **Don't Close Bot:** Let Chrome window stay open

---

## 📞 NEED HELP?

If something doesn't work:

1. Share the error message
2. Share backend logs
3. Share which step failed
4. I'll help you debug!

---

## 🎉 LET'S TEST IT!

**Ready?** Follow the steps above and let me know how it goes! 🚀

