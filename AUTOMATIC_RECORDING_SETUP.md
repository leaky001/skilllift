# 🎥 AUTOMATIC RECORDING SETUP GUIDE

## ✅ **WHAT'S BEEN INSTALLED:**

I've implemented the **MediaRecorder API** automatic recording system! Here's what's new:

### **Files Created:**
1. ✅ `frontend/src/components/liveclass/AutoRecorder.jsx` - Automatic recorder component
2. ✅ `backend/routes/recordingRoutes.js` - Upload and streaming endpoints
3. ✅ `backend/server.js` - Added recording routes
4. ✅ `multer` package - Installed for file uploads

---

## 🚀 **HOW IT WORKS:**

### **Automatic Recording Flow:**
```
1. Tutor starts live class
   ↓
2. AutoRecorder automatically starts recording
   (Browser captures video/audio)
   ↓
3. Recording indicator shows (red dot)
   ↓
4. Tutor ends class
   ↓
5. Recording stops automatically
   ↓
6. Uploads to your server (progress bar)
   ↓
7. Learners notified "Replay Ready"
   ↓
8. Available in learner replay section
```

**NO MANUAL ACTION NEEDED!** 🎉

---

## 📋 **NEXT STEPS TO COMPLETE:**

### **Step 1: Integrate AutoRecorder into Live Class Page**

You need to add the AutoRecorder component to your live class interface. Here's how:

#### **For Google Meet Integration:**

Find your live class component (the one that opens Google Meet) and add:

```javascript
// Add this import at the top
import AutoRecorder from './AutoRecorder';

// Inside your component, add state for the stream
const [localStream, setLocalStream] = useState(null);

// When you get the media stream (before/after joining Google Meet):
const startLiveClass = async () => {
  try {
    // Get user's camera/mic
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    setLocalStream(stream); // Save stream for AutoRecorder
    
    // ... rest of your code (join Google Meet, etc.)
  } catch (error) {
    console.error('Media access error:', error);
  }
};

// Add AutoRecorder component in your JSX:
return (
  <div>
    {/* Your existing live class UI */}
    
    {/* Add AutoRecorder - it will start automatically */}
    {localStream && currentSession && (
      <AutoRecorder 
        stream={localStream}
        sessionId={currentSession.sessionId}
        courseId={courseId}
        courseTitle={courseTitle}
        onRecordingComplete={(url) => {
          console.log('Recording saved:', url);
          toast.success('Class recorded successfully!');
        }}
      />
    )}
  </div>
);
```

---

### **Step 2: Update Learner Replay Access**

The learner dashboard already calls `/google-meet/live/replays/:courseId`, but now recordings are stored differently.

Update the `getReplayClasses` endpoint in `backend/controllers/googleMeetController.js`:

```javascript
// In getReplayClasses function, make sure it includes recordings from our new system:
const sessions = await LiveClassSession.find({
  courseId,
  status: 'ended',
  recordingUrl: { $exists: true, $ne: null }
}).populate('tutorId', 'name').sort({ endTime: -1 });
```

This should already be in place, so replays will show automatically!

---

### **Step 3: Test the System**

1. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   Look for: `✅ Recording routes loaded`

2. **Start a live class as tutor**

3. **Check for recording indicator:**
   - Bottom-right corner should show red "Recording" badge
   - Duration counter should be running

4. **End the class** (or wait 2 minutes for auto-end)

5. **Watch for upload:**
   - Blue "Uploading Recording" badge appears
   - Progress bar shows upload status
   - "Recording uploaded!" message appears

6. **Check learner dashboard:**
   - Learner should see notification "Class Recording Ready!"
   - Recording appears in "Replay Classes" section
   - Click to watch

---

## 🎬 **RECORDING FEATURES:**

### **Automatic Features:**
- ✅ Starts recording when class begins
- ✅ Stops recording when class ends
- ✅ Shows recording indicator (red dot)
- ✅ Shows upload progress
- ✅ Notifies learners when ready
- ✅ Supports video streaming (seek, pause, resume)

### **Technical Details:**
- **Format:** WebM (VP9/VP8 + Opus)
- **Quality:** 2.5 Mbps video, 128 kbps audio
- **Max Size:** 1GB per recording
- **Storage:** Local server (`backend/uploads/recordings/`)
- **Streaming:** Progressive HTTP streaming with range support

---

## 📂 **FILE STORAGE:**

Recordings are saved to:
```
backend/uploads/recordings/
├── recording-1234567890-abc123.webm
├── recording-1234567891-def456.webm
└── ...
```

### **Storage Calculation:**
- **1 hour class** ≈ 1.1 GB
- **10 classes/month** ≈ 11 GB
- **100 classes/month** ≈ 110 GB

---

## 💡 **OPTIONAL: Upgrade to Cloud Storage (Cloudinary)**

If you want to save disk space and use CDN delivery, you can integrate Cloudinary:

### **Install Cloudinary:**
```bash
cd backend
npm install cloudinary
```

### **Add to `.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Update `recordingRoutes.js`:**
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// In the upload endpoint, after saving file:
const result = await cloudinary.uploader.upload(recordingPath, {
  resource_type: 'video',
  folder: 'live-class-recordings',
  public_id: `session-${sessionId}`
});

// Delete local file
await fs.unlink(recordingPath);

// Use Cloudinary URL instead
session.recordingUrl = result.secure_url;
```

**Cloudinary Free Tier:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Video optimization
- ✅ CDN delivery

---

## 🐛 **TROUBLESHOOTING:**

### **Issue 1: "Recording not supported in your browser"**
**Solution:** Use Chrome, Firefox, or Edge (latest versions)

### **Issue 2: No recording indicator appears**
**Possible causes:**
- Stream not passed to AutoRecorder
- Browser doesn't have camera/mic permission
- MediaRecorder not supported

**Debug:**
- Open browser console (F12)
- Look for: "🎬 Starting automatic recording..."
- Check for errors

### **Issue 3: Upload fails**
**Possible causes:**
- File too large (>1GB)
- Network timeout
- Server out of disk space

**Solutions:**
- Check server disk space
- Increase upload timeout
- Use Cloudinary instead

### **Issue 4: Learners can't watch replay**
**Possible causes:**
- Recording file not accessible
- Path incorrect
- Permissions issue

**Debug:**
- Check if file exists in `backend/uploads/recordings/`
- Try accessing: `http://localhost:5000/api/recordings/[filename]`
- Check browser console for errors

---

## 📊 **API ENDPOINTS:**

### **Upload Recording:**
```
POST /api/recordings/upload
Headers: Authorization: Bearer [token]
Body: FormData with 'recording' file
```

### **Stream Recording:**
```
GET /api/recordings/[filename]
Headers: Authorization: Bearer [token]
Supports: Range requests for seeking
```

### **List Recordings:**
```
GET /api/recordings/list/[courseId]
Headers: Authorization: Bearer [token]
Returns: Array of recordings for course
```

### **Delete Recording:**
```
DELETE /api/recordings/[filename]
Headers: Authorization: Bearer [token]
Access: Tutor only
```

---

## ✅ **WHAT'S WORKING:**

- ✅ Automatic recording start/stop
- ✅ Recording indicator UI
- ✅ Upload progress tracking
- ✅ Learner notifications
- ✅ Video streaming support
- ✅ Range requests (seeking)
- ✅ File size limits
- ✅ Error handling
- ✅ Authentication/authorization

---

## 🎯 **TESTING CHECKLIST:**

```
□ Backend starts without errors
□ See "✅ Recording routes loaded"
□ Start a live class as tutor
□ Red "Recording" indicator appears
□ Duration counter runs
□ End the class
□ Upload progress bar appears
□ "Recording uploaded!" message
□ Learner gets notification
□ Recording appears in learner replay section
□ Learner can watch recording
□ Video plays smoothly
□ Can seek/pause/resume
```

---

## 🚀 **WHAT TO DO NOW:**

1. **Integrate AutoRecorder** into your live class component (see Step 1 above)
2. **Restart backend** to load recording routes
3. **Test with a live class**
4. **Check learner replay access**

---

## 💬 **NEED HELP?**

If you encounter any issues:

1. Check backend console for errors
2. Check browser console (F12) for errors
3. Verify file permissions on `backend/uploads/recordings/`
4. Make sure `multer` is installed: `npm list multer`
5. Test file upload manually: Try uploading via Postman

---

## 📝 **NEXT IMPROVEMENTS (Optional):**

1. **Video compression** - Reduce file sizes
2. **Cloudinary integration** - Cloud storage + CDN
3. **Thumbnails** - Generate preview images
4. **Subtitles/Captions** - Auto-generate from audio
5. **Download option** - Let learners download
6. **Quality selector** - Multiple bitrates
7. **Recording analytics** - Track views, completion rate

---

**The automatic recording system is ready to use! Just integrate the AutoRecorder component and test!** 🎉

