# 🔍 CHECK AUTO-END STATUS - DEBUGGING GUIDE

## ⚡ **IMMEDIATE ACTIONS**

### **Step 1: Force End All Sessions (Test if ending works)**

```bash
cd backend
node force-end-all-sessions.js
```

This will:
- ✅ End ALL active sessions immediately
- ✅ Show you if the ending mechanism works
- ✅ Let you test the dashboard update

**If this works and dashboard shows "Completed":**
- ✅ Ending mechanism works
- ❌ Auto-detection is the problem

**If this doesn't work:**
- ❌ Ending mechanism broken
- Need to check database connection

---

### **Step 2: Check What Backend is Doing**

After starting backend with `npm run dev`, look for:

**✅ GOOD - You should see:**
```
✅ Google Meet Auto-End Service started (checking every 10 seconds)
✅ Simple Auto-End Service started (30-minute timeout)
```

**When you have active sessions, you should see EVERY 5 SECONDS:**
```
🔍 [SIMPLE AUTO-END] Checking 1 active session(s)...
   Session session-xxx:
   - Course: Introduction to Python
   - Running for: 5 minutes (300 seconds)
   - Will auto-end at: 2 minutes
   - Should end now? YES ✅
⏰ [SIMPLE AUTO-END] Session session-xxx has been running for 5 minutes
⏰ [SIMPLE AUTO-END] Auto-ending session NOW: session-xxx
```

**❌ BAD - If you see nothing:**
- Service is not running
- No active sessions
- Service crashed

---

### **Step 3: Verify Services are Running**

```bash
# While backend is running, in another terminal:
cd backend
node -e "console.log('Backend running?', require('http').get('http://localhost:5000/health', r => console.log('Status:', r.statusCode)))"
```

---

## 🧪 **TESTING SCENARIOS**

### **Test 1: Manual Force End**

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start a live class in your app

# 3. In another terminal, force end:
node force-end-all-sessions.js

# 4. Check your dashboard - should show "Completed"
```

**Expected:** Dashboard updates immediately

---

### **Test 2: Check Auto-End Detection**

```bash
# 1. Start backend
npm run dev

# 2. Start a live class

# 3. Watch backend logs for:
"🔍 [SIMPLE AUTO-END] Checking 1 active session(s)..."

# 4. Wait 2 minutes (set to 2 min for testing)

# 5. Should auto-end after 2 minutes
```

**Expected:** Logs show session details and auto-end after 2 min

---

### **Test 3: Check Database Connection**

```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift')
  .then(() => {
    console.log('✅ Database connected');
    const LiveClassSession = require('./models/LiveClassSession');
    return LiveClassSession.find({ status: 'live' });
  })
  .then(sessions => {
    console.log('Active sessions:', sessions.length);
    sessions.forEach(s => console.log('-', s.sessionId, s.courseId));
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"
```

**Expected:** Shows active sessions

---

## 🐛 **COMMON ISSUES**

### **Issue 1: Services Not Starting**

**Symptoms:**
- No logs about "Auto-End Service started"
- Backend crashes on startup

**Fix:**
```bash
# Check for errors
cd backend
npm run dev

# Look for error messages
# Fix any syntax errors or missing dependencies
```

---

### **Issue 2: No Logs About Checking Sessions**

**Symptoms:**
- Services start
- But no "🔍 [SIMPLE AUTO-END] Checking..." logs
- Even when sessions are active

**Possible Causes:**
1. Database not connected
2. Service crashed silently
3. No active sessions

**Debug:**
```bash
# Check if MongoDB is running
# Windows:
tasklist | findstr mongod

# Check database connection in backend logs:
# Should see: "✅ MongoDB connected successfully"
```

---

### **Issue 3: Logs Show Checking But Not Ending**

**Symptoms:**
- Logs show: "🔍 [SIMPLE AUTO-END] Checking 1 active session(s)..."
- Shows session details
- Shows "Should end now? YES ✅"
- But doesn't end

**Possible Causes:**
1. Error in `endSession` function
2. Database save failing
3. Notification service error

**Debug:**
Look for error logs:
```
❌ [SIMPLE AUTO-END] Error ending session...
```

---

### **Issue 4: Sessions End But Dashboard Doesn't Update**

**Symptoms:**
- Logs show session ended successfully
- Database shows status = 'ended'
- Dashboard still shows "Active"

**Possible Causes:**
1. Frontend not polling
2. `getCurrentSession` not detecting ended state
3. Browser cache

**Fix:**
```bash
# 1. Hard refresh browser (Ctrl+Shift+R)

# 2. Check browser console for:
"🔍 getCurrentSession response: ..."

# 3. Should show: { status: 'no_session', recentlyCompleted: true }
```

---

## 📊 **DETAILED LOGS TO CHECK**

### **When Backend Starts:**

```
✅ MongoDB connected successfully
✅ Google Meet Auto-End Service started (checking every 10 seconds)
✅ Simple Auto-End Service started (30-minute timeout)
🚀 Server running on port 5000
```

**All 4 lines must appear!**

---

### **Every 5 Seconds (if active sessions exist):**

```
🔍 [SIMPLE AUTO-END] Checking 1 active session(s)...
   Session session-1234:
   - Course: Introduction to Python
   - Running for: 1 minutes (65 seconds)
   - Will auto-end at: 2 minutes
   - Should end now? NO ⏳
```

**This should appear repeatedly!**

---

### **When Auto-Ending:**

```
🔍 [SIMPLE AUTO-END] Checking 1 active session(s)...
   Session session-1234:
   - Course: Introduction to Python
   - Running for: 2 minutes (125 seconds)
   - Will auto-end at: 2 minutes
   - Should end now? YES ✅
⏰ [SIMPLE AUTO-END] Session session-1234 has been running for 2 minutes
⏰ [SIMPLE AUTO-END] Auto-ending session NOW: session-1234
🔄 [SIMPLE AUTO-END] Ending session: session-1234
   Course: Introduction to Python
   Started: 2025-10-21T14:00:00.000Z
✅ [SIMPLE AUTO-END] Session session-1234 ended successfully
   Status: ended
   End Time: 2025-10-21T14:02:05.000Z
📢 [SIMPLE AUTO-END] Sending notifications for course: Introduction to Python
✅ [SIMPLE AUTO-END] Notifications sent
```

**This should appear when session reaches 2 minutes!**

---

## ✅ **VERIFICATION CHECKLIST**

```
□ Backend starts without errors
□ See: "✅ Simple Auto-End Service started"
□ MongoDB connected: "✅ MongoDB connected successfully"
□ Start a live class
□ See: "🔍 [SIMPLE AUTO-END] Checking 1 active session(s)..."
□ Logs show session details
□ Wait 2 minutes
□ Logs show: "Should end now? YES ✅"
□ Logs show: "Auto-ending session NOW"
□ Logs show: "Session ended successfully"
□ Dashboard refreshes to show "Completed"
```

---

## 🚀 **QUICK FIX COMMANDS**

```bash
# 1. Force end all sessions (test ending mechanism)
cd backend
node force-end-all-sessions.js

# 2. Check active sessions
node test-auto-end.js

# 3. Restart backend with logging
npm run dev

# 4. Watch logs carefully for the patterns above
```

---

## 💡 **IF NOTHING WORKS**

Run these commands and send me the output:

```bash
# 1. Check services
cd backend
npm run dev
# Copy the first 50 lines of output

# 2. Check database
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilllift')
  .then(() => {
    console.log('✅ Database connected');
    const LiveClassSession = require('./models/LiveClassSession');
    return LiveClassSession.find({});
  })
  .then(sessions => {
    console.log('Total sessions:', sessions.length);
    const live = sessions.filter(s => s.status === 'live');
    console.log('Live sessions:', live.length);
    live.forEach(s => {
      const duration = Math.round((Date.now() - new Date(s.startTime).getTime()) / 60000);
      console.log('-', s.sessionId, 'running for', duration, 'minutes');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"

# 3. Force end and check
node force-end-all-sessions.js
```

Send me all the output so I can help debug!

---

**The auto-end SHOULD be working. Let's find out what's blocking it!**

