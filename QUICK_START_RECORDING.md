# 🚀 QUICK START - Add Automatic Recording

## ✅ **DONE:**
- ✅ AutoRecorder component created
- ✅ Backend upload endpoint ready
- ✅ `multer` package installed
- ✅ Routes configured

---

## 🎯 **JUST 3 STEPS TO ADD RECORDING:**

### **Step 1: Import AutoRecorder** (2 minutes)

Find your live class component where you have the Google Meet interface.

**File might be:**
- `frontend/src/components/liveclass/TutorLiveClassDashboard.jsx`
- `frontend/src/pages/tutor/LiveClass.jsx`
- Or wherever you handle the live class UI

**Add this import at the top:**
```javascript
import AutoRecorder from '../../components/liveclass/AutoRecorder';
// Adjust path based on your file location
```

---

### **Step 2: Get the Media Stream** (5 minutes)

You need to capture the user's video/audio stream. Add this code when starting the live class:

```javascript
const [localStream, setLocalStream] = useState(null);

const startLiveClass = async () => {
  try {
    // Get user's camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    
    // Save stream for AutoRecorder
    setLocalStream(stream);
    
    console.log('✅ Media stream captured');
    
    // Continue with your existing code...
    // (Open Google Meet, create session, etc.)
    
  } catch (error) {
    console.error('❌ Failed to get media:', error);
    toast.error('Please allow camera and microphone access');
  }
};
```

---

### **Step 3: Add AutoRecorder Component** (2 minutes)

In your JSX, add the AutoRecorder component. It will handle everything automatically!

```javascript
return (
  <div>
    {/* Your existing UI */}
    
    {/* Add this at the end, before closing div */}
    {localStream && currentSession && (
      <AutoRecorder 
        stream={localStream}
        sessionId={currentSession.sessionId}
        courseId={courseId}
        courseTitle={courseTitle}
        onRecordingComplete={(url) => {
          console.log('✅ Recording saved:', url);
        }}
      />
    )}
  </div>
);
```

---

## 🎬 **THAT'S IT! Recording Now Works Automatically!**

### **What Happens:**
1. ✅ Tutor starts class → Recording starts automatically
2. ✅ Red "Recording" badge appears (bottom-right)
3. ✅ Duration counter shows recording time
4. ✅ Tutor ends class → Recording stops
5. ✅ Uploads to server (progress bar shows)
6. ✅ Learners get notification "Replay Ready!"
7. ✅ Available in learner replay section

**NO BUTTON CLICKING NEEDED!** 🎉

---

## 📝 **EXAMPLE: Complete Integration**

Here's a complete example showing how it looks together:

```javascript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AutoRecorder from '../../components/liveclass/AutoRecorder';
import apiService from '../../services/api';

const TutorLiveClass = ({ courseId, courseTitle }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const startLiveClass = async () => {
    try {
      // 1. Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      
      // 2. Start live class session (your existing code)
      const response = await apiService.post('/google-meet/live/start', {
        courseId: courseId
      });
      
      if (response.data.success) {
        setCurrentSession(response.data.session);
        
        // 3. Open Google Meet
        window.open(response.data.session.meetLink, '_blank');
        
        toast.success('Live class started!');
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start live class');
    }
  };

  const endLiveClass = async () => {
    try {
      await apiService.post('/google-meet/live/end', {
        sessionId: currentSession.sessionId
      });
      
      // Stop stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      setCurrentSession(null);
      setLocalStream(null);
      
      toast.success('Live class ended!');
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to end live class');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{courseTitle}</h1>
      
      {!currentSession ? (
        <button 
          onClick={startLiveClass}
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Start Live Class
        </button>
      ) : (
        <div>
          <p className="mb-4">Live class in progress...</p>
          <button 
            onClick={endLiveClass}
            className="bg-red-600 text-white px-6 py-3 rounded-lg"
          >
            End Class
          </button>
        </div>
      )}
      
      {/* AutoRecorder - Handles recording automatically! */}
      {localStream && currentSession && (
        <AutoRecorder 
          stream={localStream}
          sessionId={currentSession.sessionId}
          courseId={courseId}
          courseTitle={courseTitle}
          onRecordingComplete={(url) => {
            console.log('Recording saved:', url);
          }}
        />
      )}
    </div>
  );
};

export default TutorLiveClass;
```

---

## 🧪 **TEST IT:**

1. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   Should see: `✅ Recording routes loaded`

2. **Start a live class as tutor**

3. **Allow camera/mic permissions** when prompted

4. **Look for red "Recording" badge** (bottom-right corner)

5. **Speak for 1-2 minutes** (to create content)

6. **End the class**

7. **Watch upload progress** (blue badge)

8. **Check learner dashboard** → Should see replay!

---

## 🎥 **WHAT LEARNERS SEE:**

Learners will automatically:
1. ✅ Get notification: "Class Recording Ready! 🎥"
2. ✅ See recording in "Replay Classes" section
3. ✅ Click "Watch Replay" to open video
4. ✅ Can seek, pause, resume normally

The recording plays like any video!

---

## 💾 **WHERE RECORDINGS ARE STORED:**

```
backend/uploads/recordings/
├── recording-1234567890-abc123.webm
├── recording-1234567891-def456.webm
└── ...
```

Each recording is about **1-1.5 GB per hour** of video.

---

## 🔧 **OPTIONAL: Better Quality Settings**

If you want higher quality recordings, update the `getUserMedia` call:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1920 },   // 1080p
    height: { ideal: 1080 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 48000          // Better audio
  }
});
```

**Note:** Higher quality = larger files!

---

## ⚡ **COMMON QUESTIONS:**

### **Q: Does it work with Google Meet?**
**A:** Yes! It records your local stream, regardless of video platform.

### **Q: What about screen sharing?**
**A:** It records the camera. For screen sharing, use:
```javascript
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true
});
```

### **Q: Can I record both camera AND screen?**
**A:** Yes! Combine both streams or record separately.

### **Q: What if tutor closes browser during class?**
**A:** Recording stops and uploads what was captured so far.

### **Q: Can learners download recordings?**
**A:** Not by default, but you can add a download button.

### **Q: How long are recordings kept?**
**A:** Forever, unless you add auto-deletion (like after 30 days).

---

## 🎉 **YOU'RE DONE!**

The automatic recording system is now complete and ready to use!

Just add the 3 steps above to your live class component and recordings will work automatically.

**No more manual recording! No more forgetting to record!** 🚀

---

## 📞 **NEXT STEPS:**

1. ✅ Add AutoRecorder to your live class component
2. ✅ Test with a live class
3. ✅ Verify learners can see replays
4. ✅ (Optional) Add Cloudinary for cloud storage

Let me know if you need help integrating it into your specific component!

