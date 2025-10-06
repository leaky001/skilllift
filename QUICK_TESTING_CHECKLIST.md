# 🧪 **LIVE CLASS TESTING CHECKLIST**

## 🎯 **QUICK TESTING STEPS**

### **Step 1: Deploy & Setup**
- [ ] Deploy the updated `StreamVideoCall.jsx` component
- [ ] Clear browser cache in both browsers
- [ ] Use different browsers/devices (Chrome + Safari, or different devices)
- [ ] Enable camera/microphone permissions

### **Step 2: Tutor Setup**
- [ ] Login as tutor in Browser A
- [ ] Create a new live class
- [ ] Start the live class
- [ ] Check console for setup logs:
  ```
  🎯 Setting up Stream event listeners...
  ✅ Joined call successfully
  ✅ Local camera started successfully
  ```

### **Step 3: Learner Setup**
- [ ] Login as learner in Browser B (different browser/device)
- [ ] Join the live class
- [ ] Check console for join events:
  ```
  👥 Participant joined: [event data]
  ✅ Adding new participant: [tutor data]
  🎥 Track published: [event data]
  ✅ Video track published for: [tutor ID]
  ```

### **Step 4: Verify Connection**
- [ ] **Tutor sees**: Own video + learner video (2 boxes)
- [ ] **Learner sees**: Own video + tutor video (2 boxes)
- [ ] **Participant count**: Shows 2 for both
- [ ] **Video grid**: Displays 2 video boxes
- [ ] **Console logs**: Show participant events

---

## 🔍 **DEBUGGING COMMANDS**

### **Run in Browser Console:**

#### **Check Participant State:**
```javascript
console.log('=== PARTICIPANT DEBUG ===');
console.log('Participants:', participants);
console.log('Video Tracks:', Array.from(videoTracks.keys()));
console.log('All Participants:', allParticipants);
console.log('Participant Count:', participants.length + 1);
```

#### **Check Stream Events:**
```javascript
console.log('=== STREAM DEBUG ===');
console.log('Call ID:', callId);
console.log('Call State:', call?.state);
console.log('Local Stream:', localStream);
```

#### **Test Media Access:**
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Media access successful');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('❌ Media access failed:', error);
  });
```

---

## 🚨 **TROUBLESHOOTING**

### **Issue: Participant count stuck at 1**
**Solution:**
1. Check console for "👥 Participant joined" events
2. Verify both users are in different browsers
3. Check if both users have different user IDs
4. Look for participant join/leave events

### **Issue: Video not showing for other participants**
**Solution:**
1. Check console for "🎥 Track published" events
2. Verify video permissions are granted
3. Check if video tracks are stored in Map
4. Look for "✅ Video track published for" messages

### **Issue: Console shows errors**
**Solution:**
1. Check for 403/404 errors
2. Verify Stream.io token is valid
3. Check network requests
4. Look for media permission errors

---

## 🎯 **SUCCESS CRITERIA**

### **✅ Test Passes If:**
1. **Tutor can create and start live class**
2. **Learner can join live class**
3. **Both see each other's videos**
4. **Participant count updates correctly**
5. **Video grid displays all participants**
6. **Console shows proper event logs**

### **❌ Test Fails If:**
1. **Participant count stuck at 1**
2. **Only see own video**
3. **No participant join events in console**
4. **Video tracks not published**

---

## 🚀 **READY TO TEST!**

**Follow these steps to verify the participant connection is working correctly.**

**Start with Step 1 and work through each step systematically.**

**Let me know what you find during testing!** 🧪
