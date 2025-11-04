# 🚀 GOOGLE MEET "INVALID CALL" - QUICK FIX

## ⚡ **QUICK START (5 Minutes)**

### **1. Run Diagnostic** (1 min)
```bash
# Windows
diagnose-google-meet.bat

# Mac/Linux
chmod +x diagnose-google-meet.sh
./diagnose-google-meet.sh
```

### **2. Check Results**
Look for any ❌ marks in the output. These need to be fixed.

### **3. Most Common Issues**

#### **❌ Environment Variables Not Set**
**Fix:** Edit `backend/.env` file:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback
```

Get these from: https://console.cloud.google.com/apis/credentials

#### **❌ Calendar API Not Enabled**
**Fix:**
1. Go to: https://console.cloud.google.com/apis/library
2. Search "Google Calendar API"
3. Click "Enable"
4. Wait 2 minutes

#### **❌ OAuth Consent Screen Not Configured**
**Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/meetings.space.created`

#### **❌ Redirect URI Not Added**
**Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   - `http://localhost:5000/api/google-meet/auth/google/callback`
   - (For production): `https://yourdomain.com/api/google-meet/auth/google/callback`
4. Save

### **4. Restart Everything**
```bash
# Stop all servers
# Then restart backend
cd backend
npm start

# In another terminal, restart frontend
cd frontend
npm start
```

### **5. Test**
1. Open app → Tutor Dashboard
2. Click "Connect Google Account"
3. Grant all permissions
4. Try starting a live class
5. Check backend terminal for:
   ```
   ✅ Google Meet link created successfully
   ```

---

## 🎯 **WORKAROUND (If Still Not Working)**

### **Use Custom Meet Links:**

1. Go to: https://meet.google.com
2. Click "New meeting" → "Create a meeting for later"
3. Copy the Meet link
4. In your app:
   - ✅ Check "Use custom Google Meet link"
   - Paste the link
   - Start class

**This works 100% and bypasses Google Calendar API!**

---

## 📊 **What Each Error Means**

| Error Message | What It Means | Quick Fix |
|--------------|---------------|-----------|
| "invalid call" | Meet link not created or expired | Use custom link or reconnect Google |
| "No OAuth credentials" | Google account not connected | Reconnect Google account |
| "Calendar API not used" | API not enabled | Enable in Cloud Console |
| "Access denied" (403) | Missing permissions | Check OAuth scopes |
| "Token expired" (401) | Google tokens invalid | Reconnect Google account |
| "No Meet link" | Calendar didn't create link | Check Meet access or use custom link |

---

## ✅ **Expected Results**

### **Backend Terminal:**
```
🎯 Creating Google Meet link...
🎯 Course title: Your Course Name
🎯 OAuth credentials present: true
🎯 Has access token: true
✅ Calendar event created successfully
✅ Final Meet link: https://meet.google.com/abc-defg-hij
✅ Live class started successfully
```

### **Frontend:**
```
✅ Live class started successfully!
```

### **Browser:**
- New tab opens with Google Meet
- Meet link loads without errors
- You can join the call

---

## 🆘 **Still Need Help?**

1. **Check full logs** in backend terminal when starting live class
2. **Copy the error message**
3. **Check:** INVALID_CALL_ERROR_FIX.md for detailed solutions
4. **Or use custom Meet links** (works immediately!)

---

## 📚 **Files Added/Modified**

### **New Files:**
- ✅ `INVALID_CALL_ERROR_FIX.md` - Comprehensive fix guide
- ✅ `test-google-meet-setup.js` - Diagnostic script
- ✅ `diagnose-google-meet.bat` - Windows helper
- ✅ `diagnose-google-meet.sh` - Mac/Linux helper
- ✅ `GOOGLE_MEET_INVALID_CALL_QUICK_FIX.md` - This file

### **Enhanced Files:**
- ✅ `backend/services/googleMeetService.js` - Added detailed logging
- ✅ Better error messages throughout

---

## 🎓 **Understanding the Issue**

The "invalid call" error happens when:
1. **Google Meet link wasn't created** → Calendar API issue
2. **Meet link expired** → Calendar event was deleted
3. **Permissions wrong** → Meet link not public
4. **Tokens invalid** → Google account needs reconnection

**The fix ensures:**
- ✅ Proper Google OAuth setup
- ✅ Calendar API generates Meet links correctly
- ✅ Detailed error logging for debugging
- ✅ Fallback to custom Meet links

---

**🚀 Start with the diagnostic script and you'll know exactly what to fix!**

