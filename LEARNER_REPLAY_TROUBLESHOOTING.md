# 🔍 Learner Replay Troubleshooting Guide

## ❌ ISSUE: "No videos in learner replay section"

---

## 🎯 **ROOT CAUSE:**

There are likely **NO recordings in the database yet**. The system is working, but you need to complete a full recording cycle first.

---

## ✅ **STEP-BY-STEP FIX:**

### **Step 1: Check Your Backend Terminal**

Look at your backend terminal (where you ran `npm start`). 

**When you ended your last live class, did you see:**
```
⏹️ Stopping automated recording bot...
✅ Recording stopped successfully
💾 Saving recording locally: ...
✅ Recording moved to permanent storage
✅ Replay record created: [ID]
✅ Recording saved successfully - available for learners!
📢 Replay ready notifications sent
```

**❌ If you DID NOT see these messages:**
- The recording didn't complete
- The bot might have crashed
- Continue to Step 2

**✅ If you DID see these messages:**
- Recording should be in database
- Continue to Step 3

---

### **Step 2: Complete a Full Recording Cycle**

**Do this RIGHT NOW to create a test recording:**

1. **Start your backend** (if not running):
   ```bash
   cd backend
   npm start
   ```

2. **Go to Live Class Dashboard** as tutor

3. **Start a new live class**
   - Click "Start Live Class"
   - Wait for Chrome window (the bot)
   - Confirm you see: "🤖 Starting automated recording bot..."

4. **Wait 2-3 minutes** (let the bot actually record something)

5. **End the class**
   - Click "End Class" button
   - **WATCH YOUR BACKEND TERMINAL CAREFULLY**
   - Look for the messages above

6. **Check backend terminal output**
   - Did you see all the success messages?
   - Was there any error?
   - Copy/paste any errors you see

---

### **Step 3: Verify Recording Was Saved**

**Check if the file exists:**

```bash
# Windows
dir backend\uploads\replays

# You should see:
# SkillLift-Recording-[CourseTitle]-[Date].mp4
```

**If NO files:**
- Recording didn't save
- Check backend logs for errors
- Bot might not have recording permissions

**If file EXISTS but size is 0 bytes:**
- Recording failed
- Puppeteer might have issues

**If file EXISTS and size > 0:**
- Recording saved successfully! ✅
- Problem might be database

---

### **Step 4: Check Backend Logs**

**Look in your backend terminal for ANY of these errors:**

```
❌ Failed to stop recording
❌ Failed to move file
❌ Failed to create Replay record
❌ Error stopping/uploading recording
```

**If you see errors:**
- Copy the error message
- The bot encountered a problem
- Recording might not be in database

---

### **Step 5: Refresh Learner Page**

After confirming recording saved:

1. Go to learner replay page: `http://localhost:5172/learner/replays`
2. **Hard refresh**: `Ctrl + Shift + R`
3. **Open browser console** (F12)
4. Check console for errors

**Look for these logs:**
```
🔄 Loading learner replays...
📹 Replays response: ...
✅ Replays loaded successfully: X replays
```

---

## 🔍 **COMMON ISSUES:**

### **Issue 1: Bot didn't record**
**Symptoms:**
- No Chrome window appeared
- No bot messages in backend

**Solution:**
- Restart backend
- Check Puppeteer is installed: `npm list puppeteer`
- Try starting a new class

---

### **Issue 2: Recording saved but not in database**
**Symptoms:**
- File exists in `backend/uploads/replays/`
- But learner page shows "No replays"
- Backend logs show success messages

**Solution:**
- Check if Replay record was created
- Run: `node backend/check-learner-replays.js` (when MongoDB is running)
- Look for errors in "Creating Replay record" step

---

### **Issue 3: Course enrollment issue**
**Symptoms:**
- Replays exist but learner can't see them

**Solution:**
- Verify learner is enrolled in the course
- Check enrollment in database
- The learner replay API only shows replays from enrolled courses

---

### **Issue 4: Status not "completed"**
**Symptoms:**
- LiveClassSession status is "ended" not "completed"

**Solution:**
This might be the issue! The learner replay route checks for:
```javascript
status: 'completed',
recordingUrl: { $exists: true, $ne: null }
```

But your googleMeetController sets status to "ended", not "completed"!

---

## 🐛 **DEBUGGING CHECKLIST:**

Run through this checklist:

- [ ] Backend is running without errors
- [ ] MongoDB is connected
- [ ] Started a live class
- [ ] Saw Chrome window (bot)
- [ ] Saw "🤖 Starting automated recording bot..." in backend
- [ ] Waited 2-3 minutes
- [ ] Clicked "End Class"
- [ ] Saw "💾 Saving recording locally..." in backend
- [ ] Saw "✅ Recording saved successfully..." in backend
- [ ] File exists in `backend/uploads/replays/`
- [ ] File size is > 0 bytes
- [ ] Refreshed learner page
- [ ] Checked browser console for errors
- [ ] Learner is enrolled in the course

---

## 🚨 **MOST LIKELY ISSUE:**

Looking at the code, I found a potential bug! 

**In `backend/routes/learnerReplayRoutes.js` line 74-76:**
```javascript
const googleMeetRecordings = await LiveClassSession.find({
  courseId: { $in: enrolledCourseIds },
  status: 'completed',  // ❌ Checking for 'completed'
  recordingUrl: { $exists: true, $ne: null }
})
```

**But in `backend/controllers/googleMeetController.js` line 843:**
```javascript
session.status = 'ended';  // ❌ Setting to 'ended', not 'completed'!
```

**This is the bug!** The learner route is looking for status `'completed'` but the controller is setting it to `'ended'`.

---

## ✅ **IMMEDIATE FIX:**

I'll fix this for you right now! The controller should set status to `'completed'` after recording is saved, OR the learner route should check for both `'ended'` and `'completed'`.

---

## 📞 **NEXT STEPS:**

1. **Tell me:** Did you complete a full live class recording? (Start → Wait → End)
2. **Tell me:** Are there files in `backend/uploads/replays/` folder?
3. **Show me:** Copy/paste the last 20 lines from your backend terminal after ending a class

With this info, I can pinpoint the exact issue! 🎯

