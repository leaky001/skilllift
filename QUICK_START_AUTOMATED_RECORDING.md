# 🚀 QUICK START - Automated Recording Bot

## ✅ Installation Complete!

Your automated Google Meet recording bot is installed and integrated!

---

## 🏃 GET STARTED IN 3 STEPS

### Step 1: Restart Backend

```bash
cd backend
npm start
```

**Look for:**
```
✅ Google Meet routes loaded
✅ Recording routes loaded
```

---

### Step 2: Reconnect Google Account

**Why?** To get Google Drive permissions for uploads

**How:**
1. Open your app
2. Go to **Live Class Dashboard**
3. Click **"Disconnect Google"**
4. Click **"Connect Google"**
5. Authorize all permissions (Calendar + Drive)

---

### Step 3: Start a Test Class

1. **Start Live Class** (use custom Meet link or auto-generate)
2. **Watch** the Chrome window appear (that's the bot!)
3. **Wait** 2-3 minutes (let it record something)
4. **End Class**
5. **Check** replay section after 1-2 minutes

---

## 🎬 WHAT HAPPENS AUTOMATICALLY

```
You Click "Start Class"
    ↓
🤖 Bot launches Chrome
    ↓
🌐 Bot joins Google Meet  
    ↓
🎥 Recording starts (HD 1080p)
    ↓
⏱️ Bot monitors meeting
    ↓
You Click "End Class"
    ↓
⏹️ Recording stops
    ↓
📤 Uploads to Google Drive
    ↓
📢 Learners get notification
    ↓
🎬 Replay available!
```

---

## ✅ SUCCESS CHECKLIST

After starting a test class, you should see:

- ✅ Chrome window appears (bot's browser)
- ✅ Bot joins your Google Meet
- ✅ Backend logs: `🤖 Starting automated recording bot...`
- ✅ Backend logs: `✅ Recording started`
- ✅ When you end: `📤 Uploading recording to Google Drive...`
- ✅ Backend logs: `✅ Recording uploaded successfully`
- ✅ Replay appears in course replay section

---

## ⚠️ FIRST TIME SETUP

### Google Login Required

**First time the bot runs**, you may need to:

1. Let the Chrome window stay open
2. Enter your Google password manually
3. The session will be saved for future recordings
4. This only happens once!

---

## 🔍 TROUBLESHOOTING

### Bot Doesn't Start

**Check:**
```bash
npm list puppeteer
# Should show: puppeteer@24.26.1
```

**Fix if missing:**
```bash
npx puppeteer browsers install chrome
```

---

### Recording Doesn't Upload

**Check:**
1. Google Drive API enabled in Cloud Console
2. `.env` has Drive scope:
   ```
   GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/drive.file
   ```
3. Google account reconnected with new permissions

---

### "No Space Left" Error

**Check:**
```bash
# Windows
dir backend\recordings

# Mac/Linux
du -sh backend/recordings
```

**Fix:** Free up disk space (need ~1GB per hour of recording)

---

## 📋 BACKEND LOGS TO WATCH

### Starting a Class:
```
🤖 Starting automated recording bot...
✅ Bot initialized successfully
🔗 Joining meeting: https://meet.google.com/xxx-yyyy-zzz
✅ Successfully joined meeting
🎥 Starting recording...
✅ Recording started: backend\recordings\session-xxx.mp4
```

### Ending a Class:
```
⏹️ Stopping automated recording bot...
✅ Recording stopped
📤 Uploading recording to Google Drive...
✅ Recording uploaded successfully: https://drive.google.com/file/d/...
✅ Local recording file deleted
📢 Replay ready notifications sent
```

---

## 🎯 WHAT YOU NEED TO DO

### Before First Use:
- ✅ Restart backend
- ✅ Reconnect Google account (for Drive permissions)

### During Each Class:
- ✅ **NOTHING!** It's all automatic! 🎉

### After Class:
- ✅ **NOTHING!** Recording uploads automatically! 🎉

---

## 📊 FILE SIZES

- **30 min class:** ~550 MB
- **1 hour class:** ~1.1 GB  
- **2 hour class:** ~2.2 GB

**Recording Quality:**
- 1920x1080 (Full HD)
- 30 FPS
- 2.5 Mbps bitrate
- Stereo audio

---

## 🎨 FEATURES

✅ **Automatic Join** - Bot joins your Google Meet  
✅ **HD Recording** - 1080p video quality  
✅ **Google Drive Upload** - Automatic cloud storage  
✅ **Replay Integration** - Appears in course replays  
✅ **Auto-cleanup** - Local files deleted after upload  
✅ **Learner Notifications** - "Replay Ready!" alerts  
✅ **Zero Manual Work** - Everything is automated!  

---

## 💡 PRO TIPS

1. **Test First:** Run a 5-min test class before your first real one
2. **Keep Backend Visible:** Watch logs during first few classes
3. **Good Internet:** For smooth uploads (3-5 min per hour)
4. **Free Space:** Keep 5GB free on your drive
5. **Backup Important:** Download critical classes from Drive

---

## 🎓 YOU'RE READY!

Just **restart your backend** and **reconnect Google account**, then:

1. Start a live class
2. Watch the bot join automatically
3. Teach your class normally
4. End the class
5. Replay available in minutes!

**That's it!** No manual recording, no uploads to worry about! 🚀

---

## 📚 More Info

- **Full Guide:** See `AUTOMATED_RECORDING_SETUP_COMPLETE.md`
- **Bot Guide:** See `AUTOMATED_RECORDING_BOT_GUIDE.md`
- **API Docs:** See `AUTOMATED_RECORDING_BOT_GUIDE.md` (API section)

---

## 🎉 ENJOY AUTOMATED RECORDINGS!

Your recordings will now happen automatically for every live class.  
Focus on teaching, let the bot handle the rest! 🎬✨

