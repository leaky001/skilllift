# 🤖 Automated Google Meet Recording Bot

## Overview
This system automatically joins your Google Meet sessions, records them, and uploads the recordings to Google Drive - all without any manual intervention!

---

## ✨ Features

✅ **Automatic Meeting Join** - Bot automatically joins your Google Meet  
✅ **Full Session Recording** - Records both audio and video in HD (1920x1080)  
✅ **Google Drive Upload** - Automatically uploads to your Google Drive  
✅ **Replay Integration** - Recordings are automatically linked to your courses  
✅ **Auto-cleanup** - Option to delete local files after upload to save space  
✅ **Meeting End Detection** - Automatically stops when the meeting ends  

---

## 📦 Installation

### Step 1: Install Required Packages

**Windows:**
```bash
.\install-recording-bot.bat
```

**Mac/Linux:**
```bash
chmod +x install-recording-bot.sh
npm install --prefix backend puppeteer puppeteer-screen-recorder
```

---

## ⚙️ Configuration

### 1. Google Cloud Console Setup

#### A. Enable Required APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Enable APIs and Services**
4. Enable the following:
   - ✅ Google Meet API
   - ✅ Google Calendar API
   - ✅ Google Drive API
   - ✅ Google Meet Recording API (if available)

#### B. Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Add these scopes:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/drive.file
   https://www.googleapis.com/auth/meetings.space.created
   ```

#### C. Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add Authorized redirect URIs:
   ```
   http://localhost:5000/api/google-meet/auth/google/callback
   http://localhost:3000/tutor/live-class
   ```

### 2. Environment Variables

Add to your `backend/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-meet/auth/google/callback

# Google Scopes (IMPORTANT: Include drive.file scope)
GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/drive.file

# Recording Settings (optional)
RECORDING_QUALITY=1080p
RECORDING_FPS=30
RECORDING_BITRATE=2500
AUTO_DELETE_LOCAL=true
```

---

## 🚀 Usage

### For Tutors

#### 1. Connect Google Account
1. Go to your **Live Class Dashboard**
2. Click **"Connect Google Account"**
3. Authorize the requested permissions
4. You should see: **"✅ Google Account Connected"**

#### 2. Start a Live Class
1. Select your course
2. Click **"Start Live Class"**
3. The system will automatically:
   - ✅ Create a Google Meet link
   - ✅ Launch the recording bot
   - ✅ Join the meeting
   - ✅ Start recording
   - ✅ Notify enrolled learners

#### 3. During the Class
- The bot runs in the background
- You can see your recording status in the dashboard
- Recording timer shows the duration

#### 4. End the Class
1. Click **"End Class"** button
2. The bot will automatically:
   - ✅ Stop recording
   - ✅ Leave the meeting
   - ✅ Upload to Google Drive
   - ✅ Update the replay section
   - ✅ Clean up local files (if enabled)

---

## 📋 API Endpoints

### Start Recording
```http
POST /api/replay/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-123",
  "meetLink": "https://meet.google.com/abc-defg-hij"
}
```

### Stop Recording and Upload
```http
POST /api/replay/stop
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-123",
  "courseId": "course-id-here"
}
```

### Upload Existing Recording
```http
POST /api/replay/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-123",
  "filePath": "/path/to/recording.mp4"
}
```

### List All Replays
```http
GET /api/replay/list?courseId=course-id-here
Authorization: Bearer <token>
```

### Get Specific Replay
```http
GET /api/replay/:sessionId
Authorization: Bearer <token>
```

### Delete Replay
```http
DELETE /api/replay/:sessionId
Authorization: Bearer <token>
```

---

## 🎯 How It Works

### Recording Workflow

```
1. Tutor Starts Class
   ↓
2. Backend Creates Meet Link
   ↓
3. Recording Bot Initializes
   ↓
4. Bot Opens Chrome Browser
   ↓
5. Bot Joins Google Meet
   ↓
6. Screen Recording Starts
   ↓
7. Bot Monitors Meeting End
   ↓
8. Meeting Ends / Tutor Clicks "End Class"
   ↓
9. Recording Stops
   ↓
10. Upload to Google Drive
   ↓
11. Update Database with Replay URL
   ↓
12. Notify Learners
   ↓
13. Cleanup Local Files
```

### Technical Details

**Browser Automation:**
- Uses Puppeteer to control Chrome browser
- Headless mode for production (visible for debugging)
- Auto-handles camera/microphone permissions

**Recording:**
- `puppeteer-screen-recorder` for high-quality recording
- 1920x1080 resolution @ 30fps
- H.264 codec with 2.5 Mbps bitrate
- Stereo audio (2 channels)

**Storage:**
- Local recordings saved to: `backend/recordings/`
- Google Drive upload with public read permissions
- Metadata stored in: `backend/recordings.json`

---

## 🛠️ Troubleshooting

### Bot Not Joining Meeting

**Problem:** Bot fails to join Google Meet

**Solutions:**
1. Check if Google account is connected
2. Verify OAuth scopes include Calendar and Drive
3. Check if Meet link is valid
4. Ensure Chrome/Chromium is installed:
   ```bash
   npx puppeteer browsers install chrome
   ```

### Recording Not Starting

**Problem:** Bot joins but doesn't record

**Solutions:**
1. Check available disk space
2. Verify `recordings/` directory exists and is writable
3. Check console logs for errors
4. Ensure `puppeteer-screen-recorder` is installed:
   ```bash
   npm install puppeteer-screen-recorder --save
   ```

### Upload Fails

**Problem:** Recording doesn't upload to Google Drive

**Solutions:**
1. Verify Google Drive API is enabled
2. Check if OAuth scope includes `drive.file`
3. Ensure tokens are not expired (disconnect/reconnect Google)
4. Check network connectivity

### Login Required

**Problem:** Bot prompts for Google password

**Solutions:**
1. First time: Manually enter password in the browser window
2. The session will be saved for future recordings
3. Or: Use cookies from your authenticated browser session

---

## 🔒 Security Best Practices

1. **OAuth Tokens:**
   - Never commit `.env` file
   - Rotate credentials regularly
   - Use environment-specific credentials

2. **Recording Files:**
   - Enable auto-delete after upload
   - Set appropriate file permissions
   - Use HTTPS for production

3. **Google Drive:**
   - Set appropriate sharing permissions
   - Use service accounts for production
   - Monitor Drive storage usage

---

## 📊 Monitoring

### Check Active Recordings

```javascript
// In your terminal/console
const activeBots = require('./backend/controllers/replayController').activeBots;
console.log('Active recordings:', activeBots.size);
```

### View Recordings Metadata

```bash
cat backend/recordings.json
```

### Check Disk Usage

```bash
# Windows
dir backend\recordings

# Mac/Linux
du -sh backend/recordings
```

---

## 🔄 Maintenance

### Clean Up Old Recordings

```bash
# Delete recordings older than 7 days
find backend/recordings -name "*.mp4" -mtime +7 -delete
```

### Backup Metadata

```bash
# Copy recordings.json to backup
cp backend/recordings.json backend/recordings.backup.json
```

### Update Bot

```bash
# Update packages
cd backend
npm update puppeteer puppeteer-screen-recorder
```

---

## 🎨 Customization

### Change Recording Quality

Edit `backend/services/meetRecordingBot.js`:

```javascript
this.recorder = new PuppeteerScreenRecorder(this.page, {
  fps: 60,  // Increase FPS
  videoFrame: {
    width: 3840,  // 4K resolution
    height: 2160
  },
  videoCrf: 15,  // Better quality (lower = better)
  videoBitrate: 5000  // 5 Mbps
});
```

### Change Storage Location

Edit the `recordingsDir` path:

```javascript
const recordingsDir = path.join(__dirname, '../../external-drive/recordings');
```

---

## 💡 Tips & Best Practices

1. **Test First:** Run a test meeting before important classes
2. **Check Storage:** Ensure sufficient disk space (1GB per hour of recording)
3. **Monitor Logs:** Watch backend logs during first few recordings
4. **Backup Important Recordings:** Download critical recordings from Drive
5. **Inform Participants:** Let learners know the class is being recorded

---

## 🆘 Support

### View Logs

**Backend logs:**
```bash
# Windows
cd backend
npm start

# Watch for messages:
# 🤖 Initializing Meet Recording Bot...
# 🔗 Joining meeting: https://meet.google.com/...
# 🎥 Starting recording...
# ✅ Recording started: /path/to/file.mp4
# ⏹️ Stopping recording...
# 📤 Uploading to Google Drive...
# ✅ Upload complete
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Google account not connected` | OAuth not set up | Connect Google account in dashboard |
| `No active recording found` | Session ID mismatch | Check session ID in request |
| `Recording file not found` | File was deleted/moved | Check recordings directory |
| `Failed to create Meet link` | OAuth tokens expired | Disconnect and reconnect Google |
| `Upload failed` | Drive API not enabled | Enable Drive API in Google Console |

---

## 📝 Next Steps

1. ✅ Install the bot packages
2. ✅ Configure Google Cloud Console
3. ✅ Update environment variables
4. ✅ Connect Google account in the app
5. ✅ Test with a practice meeting
6. ✅ Monitor first few recordings
7. ✅ Enable auto-cleanup if needed

---

## 🎉 Success!

Your automated recording system is now ready! Start a live class and watch the magic happen.

**The bot will automatically:**
- ✅ Join your meetings
- ✅ Record everything
- ✅ Upload to Drive
- ✅ Make replays available to learners

**No manual intervention required!** 🚀

