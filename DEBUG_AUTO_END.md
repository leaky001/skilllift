# 🔍 AUTO-END DEBUG GUIDE

## ⚠️ **IMPORTANT DISCOVERY**

Your auto-end feature might not be working because the **FALLBACK controller** is being used instead of the main controller!

---

## 🧪 **Quick Diagnostic Steps**

### **Step 1: Check Which Controller is Loaded**

```bash
# Visit this URL in your browser (after starting backend):
http://localhost:5000/api/google-meet/debug/controller-status
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Controller Status",
  "liveClassControllerExists": true,
  "startLiveClassExists": true,
  "getCurrentSessionExists": true,
  "endLiveClassExists": true,
  "isFallbackController": false,  // ← Should be false
  "warning": "Using MAIN controller - auto-end should work"  // ← Should see this
}
```

**If `isFallbackController: true`:**
- ❌ Auto-end will NOT work properly
- ❌ Main controller failed to load
- ❌ Need to fix Google OAuth configuration

---

### **Step 2: Run Debug Script**

```bash
cd backend
node debug-live-class.js
```

This will check:
- ✅ Database connection
- ✅ Auto-end service status
- ✅ Controller loading
- ✅ Active sessions
- ✅ Google OAuth configuration

---

### **Step 3: Check Backend Logs**

```bash
cd backend
npm start
```

**Look for:**

✅ **Good signs:**
```
✅ Google Meet controllers loaded successfully
✅ Google Meet Auto-End Service started (checking every 10 seconds)
```

❌ **Bad signs:**
```
⚠️  WARNING: Using FALLBACK Google Meet controller!
⚠️  Auto-end detection will NOT work properly!
❌ Error loading Google Meet controllers: ...
```

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: Fallback Controller Being Used**

**Symptoms:**
- Auto-end not working
- Backend logs show: "WARNING: Using FALLBACK Google Meet controller!"

**Cause:**
- Main controller failed to load
- Usually due to missing/invalid Google OAuth configuration

**Fix:**

1. Check `.env` file in `backend/` directory:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback
   ```

2. Make sure values are NOT:
   - ❌ `dummy`
   - ❌ `your_client_id_here`
   - ❌ `your_secret_here`
   - ❌ Empty or missing

3. Restart backend:
   ```bash
   cd backend
   npm start
   ```

---

### **Issue 2: Google OAuth Not Configured**

**Symptoms:**
- `debug-live-class.js` shows: "GOOGLE_CLIENT_ID not properly configured"
- Auto-end only works after 2 hours (timeout-based)

**Fix:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Copy Client ID and Client Secret
4. Add to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=382515835325-898906ofq2nn7i3slbvsauubf9561h07.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback
   ```
5. Restart backend

---

### **Issue 3: Auto-End Service Not Running**

**Symptoms:**
- Backend logs don't show: "Checking X active Google Meet session(s)..."
- No auto-end happening at all

**Fix:**

1. Check `backend/server.js` line 279:
   ```javascript
   googleMeetAutoEndService.start();
   ```

2. Make sure this line exists and is not commented out

3. Restart backend

---

## 🧪 **Manual Testing**

### **Test 1: Check Controller Status**

```bash
# In browser or Postman:
GET http://localhost:5000/api/google-meet/debug/controller-status
```

**Should return:**
- `isFallbackController: false`
- `warning: "Using MAIN controller - auto-end should work"`

---

### **Test 2: Start Live Class & Check Session**

```bash
# 1. Start a live class via frontend

# 2. Check session via API:
GET http://localhost:5000/api/google-meet/live/current/YOUR_COURSE_ID
Authorization: Bearer YOUR_TOKEN

# Should return:
{
  "status": "active",
  "session": { ... }
}
```

---

### **Test 3: Check Auto-End Detection**

```bash
# 1. Start live class
# 2. Wait 1 minute
# 3. Check backend logs

# Should see every 10 seconds:
🔍 Checking 1 active Google Meet session(s)...
🔍 Checking session: session-xxx
```

If you DON'T see this, auto-end service is not working.

---

## 📋 **Verification Checklist**

```
□ Backend starts without errors
□ Backend logs show: "✅ Google Meet controllers loaded successfully"
□ Backend logs show: "✅ Google Meet Auto-End Service started"
□ /debug/controller-status shows isFallbackController: false
□ debug-live-class.js shows all checks passed
□ GOOGLE_CLIENT_ID is properly set in .env
□ GOOGLE_CLIENT_SECRET is properly set in .env
```

---

## 🎯 **Expected Behavior**

### **With Main Controller (Good):**

1. End Google Meet
2. Within 10 seconds: Auto-end service detects it
3. Session status changed to 'ended'
4. Dashboard updates automatically
5. Shows "Live Class Completed"

### **With Fallback Controller (Limited):**

1. End Google Meet
2. Auto-end only triggers after 2 hours (timeout)
3. OR requires manual "End Class" button click
4. ❌ No immediate auto-end

---

## 🚀 **Quick Fix Commands**

```bash
# 1. Check controller status
curl http://localhost:5000/api/google-meet/debug/controller-status

# 2. Run debug script
cd backend
node debug-live-class.js

# 3. Check backend logs
cd backend
npm start
# Look for "✅ Google Meet controllers loaded successfully"

# 4. Restart backend
# Press Ctrl+C to stop
npm start
```

---

## 📊 **Understanding the Two Controllers**

### **Main Controller (backend/controllers/googleMeetController.js):**
- ✅ Full auto-end detection
- ✅ Google Calendar API integration
- ✅ 10-second detection speed
- ✅ WebSocket notifications
- ✅ Recording processing

### **Fallback Controller (backend/routes/googleMeetRoutes.js lines 38-209):**
- ⚠️ Basic functionality only
- ⚠️ 2-hour timeout-based auto-end
- ⚠️ No Google Calendar integration
- ⚠️ No immediate detection
- ✅ Works without Google OAuth

---

## 💡 **Why Two Controllers?**

The fallback controller exists so the system can still function even if:
- Google OAuth is not configured
- Google APIs are unavailable
- Environment variables are missing

**However, for auto-end to work properly, you NEED the main controller!**

---

## ✅ **Success Indicators**

You'll know auto-end is working when:

1. Backend shows: "✅ Google Meet controllers loaded successfully"
2. `/debug/controller-status` shows: `isFallbackController: false`
3. Backend logs show auto-end checks every 10 seconds
4. After ending Google Meet, dashboard updates within 10 seconds
5. Shows "Live Class Completed" without manual button click

---

## 🆘 **Still Not Working?**

Run these commands and send me the output:

```bash
# 1. Controller status
curl http://localhost:5000/api/google-meet/debug/controller-status

# 2. Debug script
cd backend
node debug-live-class.js

# 3. Check .env file (hide secrets!)
cd backend
grep "GOOGLE_" .env
```

This will help identify the exact issue!

---

**Next Steps:**
1. Run the debug script: `node backend/debug-live-class.js`
2. Check controller status: Visit `/api/google-meet/debug/controller-status`
3. Fix any issues found
4. Test auto-end again

