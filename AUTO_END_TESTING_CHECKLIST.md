# ✅ Auto-End Live Class - Testing Checklist

## 🧪 **Complete Testing Guide**

Use this checklist to verify the auto-end feature works correctly.

---

## 📋 **Pre-Test Setup**

```
□ Backend server is running (npm start)
□ Frontend is running (npm start)
□ MongoDB is connected
□ Google OAuth is configured
□ Auto-end service started (check backend logs)
```

**Check backend logs for:**
```
✅ Google Meet Auto-End Service started (checking every 10 seconds)
```

---

## 🧪 **Test 1: Basic Auto-End (Must Pass)**

### **Setup:**
- 2 browser windows (tutor + learner)
- or 2 devices

### **Steps:**

```
□ 1. Log in as tutor
□ 2. Start a live class
□ 3. Google Meet opens
□ 4. Log in as learner (different browser/device)
□ 5. Join the live class
□ 6. Both in Google Meet now
□ 7. Tutor clicks "Leave" in Google Meet
□ 8. Wait 10 seconds
□ 9. Check tutor dashboard
     ✅ Should show "Class ended automatically"
     ✅ Should show "Recording is being processed"
□ 10. Check learner dashboard
     ✅ Should show "Live class has ended"
     ✅ Should see notification toast
□ 11. Wait 3 minutes
□ 12. Check learner dashboard for replay
     ✅ Replay should be available (if recording was started)
```

**Expected Result:**
- ✅ Tutor dashboard updates within 10 seconds
- ✅ Learner dashboard updates within 10 seconds
- ✅ Both receive notifications
- ✅ No manual "End Class" click needed

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 2: Tutor Closes Browser Tab**

### **Steps:**

```
□ 1. Start a live class
□ 2. Google Meet opens in new tab
□ 3. Close the Google Meet tab completely
□ 4. Wait 10 seconds
□ 5. Check tutor dashboard
     ✅ Should auto-end
□ 6. Check learner dashboard
     ✅ Should show class ended
```

**Expected Result:**
- ✅ Class still ends automatically
- ✅ System detects via backend service

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 3: Network Disconnect**

### **Steps:**

```
□ 1. Start a live class
□ 2. Disconnect internet/WiFi
□ 3. Wait 30 seconds
□ 4. Reconnect internet
□ 5. Check dashboard
     ✅ Should show class ended or detecting end
```

**Expected Result:**
- ✅ Session eventually marked as ended
- ✅ Max duration timeout triggers

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 4: Long Session Auto-End**

### **Setup:**
For testing, modify max duration to 1 minute:

```javascript
// In backend/services/googleMeetAutoEndService.js
const maxDuration = 1 * 60 * 1000; // 1 minute for testing
```

### **Steps:**

```
□ 1. Start a live class
□ 2. Wait 1 minute (with modified timeout)
□ 3. Check dashboard
     ✅ Should auto-end after 1 minute
```

**Expected Result:**
- ✅ Auto-ends after max duration
- ✅ Works as safety mechanism

**Status:** [ ] PASS / [ ] FAIL

**Don't forget to change it back to 4 hours!**

---

## 🧪 **Test 5: Multiple Concurrent Sessions**

### **Steps:**

```
□ 1. Create Course A
□ 2. Create Course B
□ 3. Start live class for Course A
□ 4. Start live class for Course B (different tutor)
□ 5. End Google Meet for Course A only
□ 6. Wait 10 seconds
□ 7. Check Course A dashboard
     ✅ Should show ended
□ 8. Check Course B dashboard
     ✅ Should still show active
```

**Expected Result:**
- ✅ Only Course A ends
- ✅ Course B remains active
- ✅ No interference between sessions

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 6: Custom Meet Link**

### **Steps:**

```
□ 1. Start a live class with custom Meet link
     (check "Use custom Meet link")
□ 2. Enter any Google Meet URL
□ 3. Start class
□ 4. End Google Meet
□ 5. Wait 10 seconds (may take up to 2 hours for custom)
□ 6. Check dashboard
     ✅ For custom links: auto-ends after 2 hours
     ✅ For OAuth links: auto-ends within 10 seconds
```

**Expected Result:**
- ✅ OAuth links: Fast auto-end (10 sec)
- ✅ Custom links: Auto-end after 2 hours

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 7: WebSocket Notifications**

### **Setup:**
Open browser console (F12)

### **Steps:**

```
□ 1. Start a live class
□ 2. Open console on learner browser
□ 3. Filter logs for "notification"
□ 4. Tutor ends Google Meet
□ 5. Check learner console
     ✅ Should see: "🔔 Received notification"
     ✅ Should see: "type: 'live_class_ended'"
□ 6. Check tutor console too
     ✅ Should see same notification
```

**Expected Result:**
- ✅ WebSocket notifications received
- ✅ Both tutor and learner get notified

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 8: Backend Service Logs**

### **Steps:**

```
□ 1. Start a live class
□ 2. Watch backend console output
□ 3. End Google Meet
□ 4. Watch logs for next 15 seconds
```

**Expected Logs:**

```
✅ Should see:
🔍 Checking for ended Google Meet sessions...
📊 Found 1 active sessions to check
🔍 Checking session: session-xxx
📅 Session session-xxx event details: { hasEnded: true }
🔚 Auto-ending session: session-xxx
🔄 Ending session: session-xxx
✅ Updated LiveClass status to completed
📢 Sending notifications to X learners
✅ Session session-xxx ended successfully
```

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 9: Frontend Polling**

### **Setup:**
Open browser console (F12)

### **Steps:**

```
□ 1. Start a live class as tutor
□ 2. Open console
□ 3. Watch for polling logs every 3 seconds:
     "🔍 Checking for active session for course: xxx"
□ 4. End Google Meet
□ 5. Watch for status change within 3 polls
     ✅ Should see: "status: 'ended'"
```

**Expected Result:**
- ✅ Polls every 3 seconds
- ✅ Detects 'ended' status quickly

**Status:** [ ] PASS / [ ] FAIL

---

## 🧪 **Test 10: Recording Processing**

### **Steps:**

```
□ 1. Start a live class
□ 2. MANUALLY click "Record meeting" in Google Meet
□ 3. Record for 2 minutes
□ 4. MANUALLY stop recording in Google Meet
□ 5. End Google Meet
□ 6. Wait 30 seconds
□ 7. Check backend logs
     ✅ Should see: "🔄 Auto-processing recording"
□ 8. Wait 2-3 minutes
□ 9. Check learner dashboard
     ✅ Replay should be available
```

**Expected Result:**
- ✅ Recording automatically processed
- ✅ Replay appears after 2-3 minutes

**Status:** [ ] PASS / [ ] FAIL

---

## 📊 **Testing Summary**

```
Total Tests: 10

Passed: ___ / 10
Failed: ___ / 10

Critical Tests (Must Pass):
[ ] Test 1: Basic Auto-End
[ ] Test 5: Multiple Sessions
[ ] Test 7: WebSocket Notifications
[ ] Test 8: Backend Service Logs
```

---

## 🎯 **Minimum Passing Criteria**

For the feature to be considered working:

```
□ Test 1 (Basic Auto-End) - MUST PASS
□ Test 7 (WebSocket) - MUST PASS
□ Test 8 (Backend Logs) - MUST PASS
□ At least 7 out of 10 tests passing
```

---

## 🐛 **If Tests Fail**

### **Test 1 Fails:**
```bash
# Check backend logs
cd backend
npm start

# Look for:
"✅ Google Meet Auto-End Service started"
```

### **Test 7 Fails (WebSocket):**
```javascript
// Check frontend console for:
"✅ WebSocket connected"

// If not connected, check:
- Is backend running?
- Is NotificationService initialized?
- Check browser network tab for WebSocket connection
```

### **Test 8 Fails (Backend Logs):**
```bash
# Check:
- Is MongoDB connected?
- Is Google OAuth configured?
- Are Google tokens valid?

# Check .env file:
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📝 **Notes**

### **Timing:**
- Background service: 10 seconds
- Frontend polling: 3 seconds
- WebSocket: Instant (when notification sent)
- **Expected detection:** 3-10 seconds

### **Manual Steps Still Required:**
- Starting recording in Google Meet
  (System doesn't auto-start recording)

### **Automatic Steps:**
- Ending class in platform
- Updating status
- Sending notifications
- Processing recording
- Making replay available

---

## ✅ **Sign-Off**

```
Tested by: _______________
Date: _______________
Environment: [ ] Development / [ ] Production
All critical tests passed: [ ] YES / [ ] NO

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**After all tests pass, the auto-end feature is ready for production use!** 🎉

