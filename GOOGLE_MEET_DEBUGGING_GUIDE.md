# 🔧 **GOOGLE MEET LIVE CLASS DEBUGGING GUIDE**

## 🚨 **ISSUES IDENTIFIED & FIXES APPLIED**

### **✅ FIXES IMPLEMENTED:**

#### **1. Enhanced Frontend Error Handling**
- Added specific error messages for different HTTP status codes
- Better debugging information in console logs
- User-friendly error messages for common issues

#### **2. Improved Google OAuth Token Validation**
- Added token expiry checking
- Better error messages for incomplete tokens
- Added action hints for users

#### **3. Database Connection Check**
- Added database connection validation before processing
- Graceful handling when database is unavailable
- Clear error messages for database issues

#### **4. Enhanced Debugging Information**
- More detailed console logs in frontend
- Better error tracking in backend
- User context information in logs

---

## 🔍 **DEBUGGING STEPS**

### **Step 1: Check MongoDB Connection**
```bash
# In backend directory
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB Connected')).catch(err => console.error('❌ MongoDB Error:', err.message));"
```

### **Step 2: Test Google Meet Endpoints**
```bash
# Test basic endpoint
curl http://localhost:5000/api/google-meet/test

# Test OAuth URL generation (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/google-meet/auth/google/url
```

### **Step 3: Check Environment Variables**
```bash
# In backend directory
node -e "require('dotenv').config(); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'); console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');"
```

### **Step 4: Test Live Class Creation**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to start a live class
4. Check console logs for detailed error information

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "Database connection unavailable"**
**Cause**: MongoDB Atlas connection failed
**Solution**: 
- Check your IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env` file
- Check internet connection

### **Issue 2: "Google account not connected"**
**Cause**: User hasn't completed OAuth flow
**Solution**:
- Click "Connect Google" button
- Complete OAuth authorization
- Ensure all required scopes are granted

### **Issue 3: "Google account connection is incomplete"**
**Cause**: OAuth tokens are missing or malformed
**Solution**:
- Disconnect and reconnect Google account
- Clear browser cache and cookies
- Check Google Cloud Console configuration

### **Issue 4: "Failed to create Google Meet link"**
**Cause**: Google Calendar API issues
**Solution**:
- Verify Google Calendar API is enabled
- Check API quotas and limits
- Ensure proper scopes are configured

---

## 📊 **DEBUGGING CHECKLIST**

### **Backend Checks:**
- [ ] Server is running on port 5000
- [ ] MongoDB connection is established
- [ ] Google OAuth credentials are set in `.env`
- [ ] Google Meet routes are loaded
- [ ] No errors in server console

### **Frontend Checks:**
- [ ] User is authenticated
- [ ] User has tutor role
- [ ] Course exists and user owns it
- [ ] Google account is connected (or custom link provided)
- [ ] No JavaScript errors in console

### **Google API Checks:**
- [ ] Google Cloud Project is active
- [ ] Calendar API is enabled
- [ ] OAuth consent screen is configured
- [ ] Redirect URI matches exactly
- [ ] Required scopes are included

---

## 🚀 **TESTING WORKFLOW**

### **1. Test with Custom Meet Link (No Google OAuth)**
```javascript
// In browser console
// This should work without Google OAuth
fetch('/api/google-meet/live/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    courseId: 'YOUR_COURSE_ID',
    customMeetLink: 'https://meet.google.com/test-link'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### **2. Test Google OAuth Flow**
1. Click "Connect Google" button
2. Complete OAuth authorization
3. Check if tokens are saved in user profile
4. Try starting live class with Google Meet

### **3. Test Error Scenarios**
- Try starting live class without Google connection
- Try with invalid course ID
- Try with expired tokens
- Try when database is disconnected

---

## 📝 **LOG ANALYSIS**

### **Frontend Logs to Check:**
```javascript
// Look for these in browser console:
🔍 Frontend: About to make request to /google-meet/live/start
🔍 Frontend: Request data: {...}
🔍 Frontend: User info: {...}
🔍 Frontend: Response received: {...}
```

### **Backend Logs to Check:**
```bash
# Look for these in server console:
🚀 START LIVE CLASS: Function entry point reached!
🔍 START LIVE CLASS: Function called
🔍 START LIVE CLASS DEBUG: {...}
✅ Google tokens found
🔄 Creating Google Meet link...
✅ Google Meet link created successfully
```

### **Error Patterns:**
- `❌ START LIVE CLASS FAILED:` - Indicates specific failure point
- `❌ Database not connected` - MongoDB issue
- `❌ Google account not connected` - OAuth issue
- `❌ Failed to create Meet link` - Google API issue

---

## 🔧 **QUICK FIXES**

### **If MongoDB Connection Fails:**
1. Check your IP is whitelisted in MongoDB Atlas
2. Verify connection string format
3. Try connecting from MongoDB Compass

### **If Google OAuth Fails:**
1. Verify OAuth credentials in Google Cloud Console
2. Check redirect URI matches exactly
3. Ensure required APIs are enabled

### **If Live Class Still Fails:**
1. Check browser console for detailed errors
2. Check server console for backend errors
3. Try with custom Meet link first
4. Verify user permissions and course ownership

---

## 📞 **NEXT STEPS**

1. **Test the fixes** by trying to start a live class
2. **Check console logs** for detailed error information
3. **Try both methods**: Google OAuth and custom Meet link
4. **Report specific errors** if issues persist

The enhanced error handling should now provide much clearer information about what's going wrong!
