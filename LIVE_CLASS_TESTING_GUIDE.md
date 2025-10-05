# 🧪 **LIVE CLASS CONNECTION TESTING GUIDE**

## 🎯 **STEP-BY-STEP TESTING PROCESS**

### **PREPARATION**
1. **Open two browser windows/tabs** (or use different browsers)
2. **Clear browser cache** to avoid any cached issues
3. **Ensure stable internet connection**
4. **Have two different user accounts ready** (one tutor, one learner)

---

## **PHASE 1: TUTOR SETUP** 🎓

### **Step 1: Tutor Login & Navigation**
1. **Open first browser window**
2. **Login as tutor** (role: 'tutor')
3. **Navigate to**: `/tutor/live-classes` or `/tutor/dashboard`
4. **Verify**: You can see "Live Classes" section

### **Step 2: Create Live Class**
1. **Click "Create Live Class"** button
2. **Fill in details**:
   - Title: "Test Live Class"
   - Description: "Testing tutor-learner connection"
   - Course: Select any course
   - Scheduled Date: Today's date
   - Duration: 60 minutes
3. **Click "Create Live Class"**
4. **Verify**: Live class appears in list with status "Scheduled"

### **Step 3: Start Live Class**
1. **Find the created live class** in the list
2. **Click "Start Live Class"** button
3. **Wait for**: Success message "Live class started! Learners will be notified."
4. **Verify**: Status changes to "Live"
5. **Note**: You should be redirected to the live class room

### **Step 4: Verify Tutor Connection**
1. **In the live class room**, check:
   - ✅ Your video is showing
   - ✅ You can see yourself in the video
   - ✅ Controls work (mute/unmute, video on/off)
   - ✅ Participant count shows "1"
2. **Open browser console** (F12) and run:
   ```javascript
   console.log('🎯 Tutor CallId:', callId);
   console.log('🎯 Tutor IsHost:', isHost);
   console.log('🎯 Tutor User:', user);
   ```
3. **Note down the CallId** for verification

---

## **PHASE 2: LEARNER SETUP** 👨‍🎓

### **Step 5: Learner Login & Navigation**
1. **Open second browser window**
2. **Login as learner** (role: 'learner')
3. **Navigate to**: `/learner/live-classes` or course detail page
4. **Verify**: You can see the live class created by tutor

### **Step 6: Join Live Class**
1. **Find the live class** with status "Live"
2. **Click "Join Class"** button
3. **Wait for**: Success message "Successfully joined the live class!"
4. **Verify**: You're redirected to the live class room

### **Step 7: Verify Learner Connection**
1. **In the live class room**, check:
   - ✅ Your video is showing
   - ✅ You can see the tutor's video
   - ✅ Controls work (mute/unmute, video on/off)
   - ✅ Participant count shows "2"
2. **Open browser console** (F12) and run:
   ```javascript
   console.log('🎯 Learner CallId:', callId);
   console.log('🎯 Learner IsHost:', isHost);
   console.log('🎯 Learner User:', user);
   ```
3. **Verify**: CallId matches the tutor's CallId

---

## **PHASE 3: INTERACTION TESTING** 🔄

### **Step 8: Video Interaction Test**
1. **Tutor side**: Turn video off → Learner should see tutor's avatar
2. **Tutor side**: Turn video on → Learner should see tutor's video
3. **Learner side**: Turn video off → Tutor should see learner's avatar
4. **Learner side**: Turn video on → Tutor should see learner's video

### **Step 9: Audio Interaction Test**
1. **Tutor side**: Mute microphone → Learner should see tutor is muted
2. **Tutor side**: Unmute microphone → Learner should see tutor is unmuted
3. **Learner side**: Mute microphone → Tutor should see learner is muted
4. **Learner side**: Unmute microphone → Tutor should see learner is unmuted

### **Step 10: Chat Interaction Test**
1. **Tutor side**: Send message "Hello from tutor!"
2. **Learner side**: Verify message appears in chat
3. **Learner side**: Send message "Hello from learner!"
4. **Tutor side**: Verify message appears in chat

### **Step 11: Participant List Test**
1. **Both sides**: Click "Participants" button
2. **Verify**: Both users appear in participant list
3. **Verify**: No duplicate names
4. **Verify**: Correct roles (Host/Student)

---

## **PHASE 4: ADVANCED TESTING** 🚀

### **Step 12: Multiple Learners Test**
1. **Open third browser window**
2. **Login as another learner**
3. **Join the same live class**
4. **Verify**: All three participants can see each other
5. **Verify**: Grid layout shows all participants
6. **Verify**: Chat works for all participants

### **Step 13: Connection Stability Test**
1. **Keep live class running** for 5-10 minutes
2. **Test various interactions** periodically
3. **Verify**: Connection remains stable
4. **Verify**: No disconnections or errors

---

## **🔍 DEBUGGING COMMANDS**

### **Connection Test Helper**
Add this to browser console for detailed testing:

```javascript
// Load the connection test helper
const script = document.createElement('script');
script.src = '/src/utils/connectionTest.js';
document.head.appendChild(script);

// Then run these commands:
testConnection(); // Check connection status
testMedia(); // Check media permissions
testChat("Test message"); // Test chat functionality
```

### **Manual Debugging**
```javascript
// Check Stream call status
console.log('🎯 Stream call:', streamCall);
console.log('🎯 Call state:', streamCall?.state);
console.log('🎯 Participants:', streamCall?.state?.participants);

// Check video tracks
console.log('🎯 Video tracks:', videoTracks);
console.log('🎯 Local stream:', localStream);

// Check participants array
console.log('🎯 Participants array:', participants);
```

---

## **✅ SUCCESS CRITERIA**

### **Basic Connection** ✅
- [ ] Tutor can create and start live class
- [ ] Learner can join tutor's live class
- [ ] Both users see each other's videos
- [ ] Both users have same CallId

### **Interaction Features** ✅
- [ ] Video on/off works for both users
- [ ] Mute/unmute works for both users
- [ ] Chat messages appear for both users
- [ ] Participant list shows both users correctly

### **Advanced Features** ✅
- [ ] Multiple learners can join
- [ ] Grid layout shows all participants
- [ ] No duplicate names in participant list
- [ ] Connection remains stable over time

---

## **🚨 TROUBLESHOOTING**

### **Issue: Videos Not Showing**
**Check:**
1. Browser permissions for camera/microphone
2. Same CallId in both browser consoles
3. Network connectivity
4. Browser compatibility

**Solution:**
```javascript
// Check media permissions
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => console.log('✅ Media OK'))
  .catch(error => console.error('❌ Media Error:', error));
```

### **Issue: Can't See Each Other**
**Check:**
1. Both users have same CallId
2. Both users are in same live class room
3. Stream.io connection status
4. Participant count shows correct number

**Solution:**
```javascript
// Verify connection
console.log('CallId match:', callId === 'expected-call-id');
console.log('Participants:', participants.length);
console.log('Stream state:', streamCall?.state?.participants);
```

### **Issue: Chat Not Working**
**Check:**
1. Stream call is properly initialized
2. Chat event listeners are set up
3. Message sending permissions

**Solution:**
```javascript
// Test chat
streamCall.sendReaction({
  type: 'chat_message',
  custom: { text: 'Test', senderId: user._id }
});
```

---

## **📋 TESTING CHECKLIST**

### **Before Testing:**
- [ ] Two different user accounts ready
- [ ] Two browser windows/tabs open
- [ ] Stable internet connection
- [ ] Browser permissions granted

### **During Testing:**
- [ ] Tutor creates live class successfully
- [ ] Tutor starts live class successfully
- [ ] Learner joins live class successfully
- [ ] Both users see each other's videos
- [ ] All controls work (video/audio)
- [ ] Chat messages work both ways
- [ ] Participant list shows both users

### **After Testing:**
- [ ] Connection remains stable
- [ ] No errors in browser console
- [ ] All features working as expected
- [ ] Ready for production use

---

## **🎯 NEXT STEPS**

1. **Follow the testing steps** above
2. **Report any issues** you encounter
3. **Share the results** of each test phase
4. **Let me know** if you need help with any specific step

**Ready to start testing? Let me know which step you'd like to begin with!**