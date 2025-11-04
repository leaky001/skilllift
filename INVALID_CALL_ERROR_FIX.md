# 🔧 INVALID CALL ERROR - GOOGLE MEET FIX

## ❌ **The Problem:**
When starting a Google Meet live class, you're getting an "invalid call" error. This indicates the Google Meet link is not being created properly or is inaccessible.

## 🔍 **Root Causes:**

### **1. Google OAuth Credentials Not Configured**
- Missing or invalid `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`
- Incorrect `GOOGLE_REDIRECT_URI`

### **2. Calendar API Conference Data Issues**
- Google Calendar API isn't generating the Meet link
- Conference data is `undefined` or `null`
- Wrong conference solution key

### **3. Expired or Invalid Tokens**
- Google access token has expired
- Refresh token is not working
- OAuth tokens not properly saved

### **4. Missing API Permissions**
- Google Calendar API not enabled
- Google Meet API not enabled
- Insufficient OAuth scopes

## ✅ **STEP-BY-STEP FIX:**

### **Step 1: Verify Environment Variables**

Check your `.env` file in the backend folder:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback

# For production
# GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/auth/google/callback
```

### **Step 2: Enable Required Google APIs**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** > **Library**
4. Enable these APIs:
   - ✅ **Google Calendar API**
   - ✅ **Google Meet API**
   - ✅ **Google Drive API** (for recordings)

### **Step 3: Verify OAuth 2.0 Credentials**

1. Go to **APIs & Services** > **Credentials**
2. Check your OAuth 2.0 Client ID:
   - **Application type:** Web application
   - **Authorized redirect URIs:** Must include:
     - `http://localhost:5000/api/google-meet/auth/google/callback`
     - `https://yourdomain.com/api/google-meet/auth/google/callback` (for production)

### **Step 4: Check OAuth Consent Screen**

1. Go to **APIs & Services** > **OAuth consent screen**
2. Ensure these scopes are added:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/meetings.space.created`
3. If testing, make sure you add your test user emails

### **Step 5: Reconnect Google Account**

1. In your app, disconnect your Google account
2. Reconnect it to refresh the tokens
3. Grant all requested permissions

## 🐛 **DEBUGGING:**

### **Check Backend Logs**

When you start a live class, check the terminal for these messages:

```
🔍 START LIVE CLASS: Function called
🔄 Creating Google Meet link...
```

Look for error messages that show:
- `Error creating Meet link`
- `Failed to create Google Meet link`
- Any Google API errors

### **Common Error Messages:**

#### **"Invalid grant" or "Token expired"**
**Solution:** Reconnect your Google account. The refresh token might be invalid.

#### **"Insufficient permissions"**
**Solution:** Ensure all required APIs are enabled and OAuth consent screen has the right scopes.

#### **"Calendar API has not been used"**
**Solution:** Enable Google Calendar API in Google Cloud Console.

#### **"No meetLink in response"**
**Solution:** The conference data isn't being created. Check the API response.

## 🔧 **ENHANCED ERROR HANDLING:**

I've added comprehensive error handling and logging to help diagnose the issue. The backend will now show:

- OAuth credential status
- Calendar API response details
- Specific error messages for common issues
- Token validation checks

## 🧪 **TESTING:**

### **Step 1: Run Diagnostic Script**

```bash
cd backend
node ../test-google-meet-setup.js
```

This will check:
- ✅ Environment variables are configured
- ✅ OAuth client can be created
- ✅ Auth URL can be generated
- ✅ Required APIs list
- ✅ Required scopes list

### **Step 2: Test Backend Connection**

Start your backend server and check the logs:

```bash
cd backend
npm start
```

Look for any errors related to Google OAuth.

### **Step 3: Test Frontend Connection**

1. Open your app in the browser
2. Navigate to the Tutor Live Class Dashboard
3. Try to connect your Google account
4. Check the browser console for any errors

### **Step 4: Test Live Class Creation**

1. After connecting Google account, try to start a live class
2. Check the backend terminal for detailed logs:
   ```
   🎯 Creating Google Meet link...
   🎯 Course title: [Your Course]
   🎯 OAuth credentials present: true
   🎯 Has access token: true
   🎯 Calling Google Calendar API to create event...
   ✅ Calendar event created successfully
   ✅ Final Meet link: https://meet.google.com/xxx-xxxx-xxx
   ```

3. If you see errors, note the error message and check the solutions below

## 🔍 **COMMON ISSUES & SOLUTIONS:**

### **Issue 1: "No OAuth credentials found"**
**Error:** `No OAuth credentials found. Please reconnect your Google account.`

**Solution:**
1. Disconnect your Google account in the app
2. Reconnect it and grant all permissions
3. Try starting the live class again

### **Issue 2: "Calendar API has not been used"**
**Error:** `Google Calendar API has not been used in project...`

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** > **Library**
4. Search for "Google Calendar API"
5. Click **Enable**
6. Wait 1-2 minutes for the change to propagate
7. Try again

### **Issue 3: "Access denied" or 403 error**
**Error:** `Google Calendar API access denied`

**Solution:**
1. Check that Calendar API is enabled
2. Verify OAuth consent screen has the required scopes
3. Reconnect your Google account
4. Make sure you're using the same Google account that's connected

### **Issue 4: "Invalid grant" or "Token expired"**
**Error:** `Google account connection expired`

**Solution:**
1. This means your refresh token is invalid or expired
2. Disconnect and reconnect your Google account
3. Make sure to grant "offline access" permission

### **Issue 5: "No Meet link found in response"**
**Error:** `Google Calendar did not generate a Meet link`

**Solution:**
1. Ensure Google Meet is enabled for your Google Workspace/Account
2. Check if your Google account has access to Google Meet
3. Try using a different Google account
4. For free Google accounts, Meet might have limitations

### **Issue 6: Meet link is created but shows "invalid call" when joining**
**Solution:**
This usually happens because:
1. **Meet link expired** - The calendar event might have been deleted
2. **Permissions issue** - The Meet link might not be public
3. **Domain restrictions** - Your Google Workspace might have restrictions

**Fix:**
- Use the "Use custom Meet link" option in the dashboard
- Create a Meet link manually at [meet.google.com](https://meet.google.com)
- Paste the custom link and start the class

## 🎯 **WORKAROUND: Use Custom Meet Links**

If Google API integration continues to have issues, you can use custom Meet links:

1. Go to [meet.google.com](https://meet.google.com)
2. Click "New meeting" > "Create a meeting for later"
3. Copy the Meet link
4. In your app, check "Use custom Google Meet link"
5. Paste the link and start the class

This bypasses the Google Calendar API entirely and uses a direct Meet link.

## 📝 **COMPLETE CHECKLIST:**

Before starting a live class, ensure:

- [ ] Backend `.env` file has correct Google credentials
- [ ] Google Calendar API is enabled in Cloud Console
- [ ] OAuth consent screen has required scopes
- [ ] Redirect URI is added to OAuth credentials
- [ ] Google account is connected in the app
- [ ] You've tested creating a Meet link
- [ ] Backend server is running without errors
- [ ] Frontend can communicate with backend

## ✅ **VERIFICATION:**

Once you've applied all fixes, you should see:

**In Backend Logs:**
```
✅ Google Meet link created successfully: https://meet.google.com/xxx-xxxx-xxx
✅ Live class started successfully
```

**In Frontend:**
```
✅ Live class started successfully!
```

**In Browser:**
- New tab opens with Google Meet
- Meet link is accessible
- Learners can join without errors

## 🆘 **STILL NOT WORKING?**

If you're still experiencing issues:

1. **Check backend logs** for the exact error message
2. **Use custom Meet links** as a workaround
3. **Verify Google account permissions** - Some accounts might have restrictions
4. **Try a different Google account** - Workspace accounts might have different permissions
5. **Check Google Meet availability** - Ensure your account has access to Google Meet

---

**Need more help?** Share the error message from the backend logs and I can provide more specific assistance!


