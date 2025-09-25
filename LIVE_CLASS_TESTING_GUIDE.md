# 🎥 Live Class System Testing Guide

## 📋 Prerequisites
- ✅ Backend server running on port 3002
- ✅ Frontend server running on port 5173
- ✅ Stream.io API credentials configured (if testing video calls)

## 🧪 Testing Checklist

### 1. **Backend API Testing** ✅
- [x] API endpoints are responding
- [x] Authentication is working (returns "Not authorized" without token)

### 2. **Frontend Navigation Testing**
Open http://localhost:5173 and test:

#### **Tutor Side:**
- [ ] Login as tutor
- [ ] Navigate to "Live Classes" in sidebar
- [ ] Verify Live Classes page loads
- [ ] Check if courses are displayed
- [ ] Click "Manage Live Classes" for a course
- [ ] Verify TutorLiveClassManagement page loads

#### **Learner Side:**
- [ ] Login as learner
- [ ] Check if LiveClassNotification component is present
- [ ] Verify no "Live Classes" in sidebar (learners shouldn't see this)

### 3. **Live Class Creation Testing**
As a tutor:
- [ ] Go to course live class management page
- [ ] Click "Start Live Class"
- [ ] Verify live class is created in database
- [ ] Check if callId is generated
- [ ] Verify Stream.io token is generated

### 4. **Notification System Testing**
- [ ] Start a live class as tutor
- [ ] Check if enrolled learners receive notifications
- [ ] Verify notification popup appears
- [ ] Test "Join Live Class" button functionality

### 5. **Video Call Integration Testing**
- [ ] Tutor starts live class
- [ ] Learner joins via notification
- [ ] Verify both are in same video call
- [ ] Test camera/microphone permissions
- [ ] Test screen sharing (tutor)
- [ ] Test chat functionality

### 6. **Recording & Replay Testing**
- [ ] Start and end a live class
- [ ] Verify recording is saved
- [ ] Check if replay is available to learners
- [ ] Test replay playback

## 🔧 Manual Testing Steps

### Step 1: Test Basic Navigation
1. Open http://localhost:5173
2. Login as tutor
3. Click "Live Classes" in sidebar
4. Verify page loads without errors

### Step 2: Test Course Selection
1. On Live Classes page, select a course
2. Click "Manage Live Classes"
3. Verify TutorLiveClassManagement page loads

### Step 3: Test Live Class Creation
1. Click "Start Live Class" button
2. Check browser console for any errors
3. Verify success message appears

### Step 4: Test Learner Notification
1. Open another browser/incognito window
2. Login as learner enrolled in the same course
3. Check if notification appears
4. Click "Join Live Class"

### Step 5: Test Video Call
1. Both tutor and learner should be in video call
2. Test camera/microphone
3. Test screen sharing
4. Test chat

## 🐛 Common Issues & Solutions

### Issue: "Stream.io token error"
**Solution:** Check if Stream.io credentials are configured in .env files

### Issue: "Cannot join live class"
**Solution:** Verify learner is enrolled in the course

### Issue: "Notification not appearing"
**Solution:** Check Socket.IO connection and notification service

### Issue: "Video not showing"
**Solution:** Check camera permissions and Stream.io SDK setup

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Backend API: ✅/❌
Frontend Navigation: ✅/❌
Live Class Creation: ✅/❌
Notifications: ✅/❌
Video Call: ✅/❌
Recording: ✅/❌
Replay: ✅/❌

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: ✅ Working / ❌ Issues Found
```

## 🚀 Next Steps After Testing

1. **If all tests pass:** System is ready for production
2. **If issues found:** Report specific errors for fixing
3. **For Stream.io testing:** Configure API credentials first

## 📞 Support

If you encounter any issues during testing, provide:
- Browser console errors
- Network tab errors
- Specific steps that failed
- Screenshots of issues
