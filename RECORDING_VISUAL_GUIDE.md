# 🎥 Visual Guide: How to Check & Use Recording in Google Meet

## 📸 **What You'll See - Step by Step**

---

## 🔍 **STEP 1: Check if Recording is Available**

### **What to Look For in Google Meet:**

When you start or join a Google Meet:

#### **✅ Recording is ENABLED (You'll see this):**
```
Bottom menu bar:
[🎤 Mic] [📹 Camera] [🤚 Hand] [⋮ More options]

Click the 3 dots (⋮):
┌─────────────────────────────┐
│ Change layout               │
│ Apply visual effects        │
│ Settings                    │
│ ──────────────────────────  │
│ Record meeting         ⬅️ HERE!
│ ──────────────────────────  │
│ Full screen                 │
│ Troubleshooting & help      │
└─────────────────────────────┘
```

#### **❌ Recording is DISABLED (You'll see this):**
```
Bottom menu bar:
[🎤 Mic] [📹 Camera] [🤚 Hand] [⋮ More options]

Click the 3 dots (⋮):
┌─────────────────────────────┐
│ Change layout               │
│ Apply visual effects        │
│ Settings                    │
│ ──────────────────────────  │
│ Full screen                 │  ⬅️ NO "Record meeting" option!
│ Troubleshooting & help      │
└─────────────────────────────┘
```

**If you DON'T see "Record meeting":**
- ❌ You don't have Google Workspace or Google One Premium
- ❌ Your admin has disabled recording
- ❌ You're not the meeting host

---

## 🎬 **STEP 2: Starting a Recording**

### **When You Click "Record meeting":**

#### **1. First-Time Setup (Only once):**
```
┌─────────────────────────────────────────────────┐
│  Before you start recording                     │
│                                                  │
│  • Recording will be saved to Google Drive      │
│  • All participants will be notified            │
│  • Host can stop recording anytime              │
│                                                  │
│  [ ] Don't show this again                      │
│                                                  │
│        [Cancel]  [Accept]                       │
└─────────────────────────────────────────────────┘
```
Click **"Accept"**

#### **2. Start Recording Confirmation:**
```
┌─────────────────────────────────────────────────┐
│  Start recording?                               │
│                                                  │
│  This meeting will be recorded. Everyone        │
│  will be notified that you're recording.        │
│                                                  │
│        [Cancel]  [Start]                        │
└─────────────────────────────────────────────────┘
```
Click **"Start"**

#### **3. What Everyone Sees:**
```
Top of screen:
┌─────────────────────────────────────────────────┐
│  🔴 Recording • Started by [Your Name]          │
└─────────────────────────────────────────────────┘
```

**Everyone in the meeting will see:**
- 🔴 Red "Recording" indicator at the top
- Notification: "Recording started"

---

## 🛑 **STEP 3: Stopping a Recording**

### **To Stop Recording:**

1. Click the 3 dots (⋮) again
2. Click **"Stop recording"**

```
┌─────────────────────────────────────────────────┐
│  Stop recording?                                │
│                                                  │
│  The recording will be saved to Google Drive    │
│  and you'll get an email when it's ready.       │
│                                                  │
│        [Cancel]  [Stop recording]               │
└─────────────────────────────────────────────────┘
```

3. Click **"Stop recording"**

**What Happens:**
- Recording stops immediately
- Everyone sees: "Recording stopped"
- Red indicator disappears
- Google processes the video (1-3 minutes)
- You get email when ready: "Recording is ready"

---

## 📧 **STEP 4: After Recording Ends**

### **Email Notification (Host/Tutor receives):**

```
From: Google Meet <no-reply@google.com>
Subject: Recording from [Course Name] is ready

Hello,

Your recording from the meeting "[Course Name]" 
is ready to view.

View Recording: [Link to Google Drive]

The recording is in your "Meet Recordings" folder 
in Google Drive.

Best regards,
Google Meet Team
```

### **Where Recording is Saved:**

```
Google Drive:
└── Meet Recordings/
    └── [Course Name] - [Date & Time].mp4
```

---

## 🎓 **STEP 5: Checking in SkillLift**

### **For Tutors:**
After ending the class, your dashboard shows:

```
Recent Live Classes:
┌─────────────────────────────────────────────────┐
│  📚 Introduction to Python                      │
│  Status: Completed                              │
│  Date: Oct 21, 2025 2:00 PM                    │
│  Duration: 45 minutes                           │
│  Recording: ⏳ Processing...    ⬅️ Wait 2-3 min │
└─────────────────────────────────────────────────┘

After 2-3 minutes:
┌─────────────────────────────────────────────────┐
│  📚 Introduction to Python                      │
│  Status: Completed                              │
│  Date: Oct 21, 2025 2:00 PM                    │
│  Duration: 45 minutes                           │
│  Recording: ✅ Available [View]  ⬅️ Ready!      │
└─────────────────────────────────────────────────┘
```

### **For Learners:**
Course page shows:

```
Course Content:
┌─────────────────────────────────────────────────┐
│  📺 Recent Class Replays                        │
│                                                  │
│  🎥 Introduction to Python                      │
│     Oct 21, 2025 • 45 minutes                   │
│     [▶️ Watch Replay]           ⬅️ Click here!  │
│                                                  │
│  🎥 Variables and Data Types                    │
│     Oct 18, 2025 • 52 minutes                   │
│     [▶️ Watch Replay]                           │
└─────────────────────────────────────────────────┘
```

---

## 🔧 **Testing: What You'll See**

### **Test Tool 1: Browser Test Page**

Open `test-google-meet-recording.html`:

```
╔════════════════════════════════════════════════╗
║  🎥 Google Meet Recording Tester               ║
╚════════════════════════════════════════════════╝

Progress: ████████████████████ 100%

✅ Test 1: Authentication Status
   User: john@example.com (Tutor)
   Token: Valid

✅ Test 2: Backend Connection  
   Status: Connected
   URL: http://localhost:5000

✅ Test 3: Google OAuth Configuration
   Status: Configured correctly

✅ Test 4: Your Google Account Status
   Status: Connected
   Access Token: Valid

⚠️ Test 5: Recording Permissions
   Manual check required - see instructions

✅ Test 6: Recent Live Class Sessions
   Found 2 sessions
   • Session 1: ✅ Recording available
   • Session 2: ⏳ Processing...

✅ Test 7: Available Replays
   Found 1 replay:
   • Introduction to Python - Watch Now

📋 Test Summary
   ✅ All Tests Passed!
   Your system is ready for recording!
```

### **Test Tool 2: Command Line Status**

Run `node backend/check-recording-status.js`:

```
🔍 Checking Live Class Recording Status...

🔌 Connecting to database...
✅ Connected to database

📊 Checking recent live class sessions (last 2 hours)...
Found 1 recent sessions:

📹 Session 1:
   Course: Introduction to Python
   Tutor: John Doe
   Session ID: session-1729525200-abc123
   Status: ended
   Start Time: 2025-10-21T14:00:00.000Z
   End Time: 2025-10-21T14:45:00.000Z
   Recording: ✅ AVAILABLE
   Recording URL: https://drive.google.com/file/d/...
   Time since end: 180 seconds

🎯 SUMMARY:
• If you see "⏳ PROCESSING..." - Your recording is being processed
• If you see "✅ AVAILABLE" - Your recording is ready!
• Processing typically takes 30 seconds to 2 minutes
• Check your learner dashboard for the replay
```

---

## ❗ **Common Visual Indicators**

### **Recording is Active:**
```
🔴 Red dot in top-left corner of Google Meet
🔴 "Recording" text at top
🔴 Recording indicator in participant list
```

### **Recording is Processing:**
```
⏳ "Processing..." in SkillLift
⏱️ No recording URL yet in database
🔄 Email not received yet from Google
```

### **Recording is Ready:**
```
✅ "Available" or "Watch Replay" in SkillLift
📧 Email from Google Meet received
📁 File visible in Google Drive "Meet Recordings"
🔗 Recording URL in database
```

---

## 🎯 **Quick Visual Checklist**

Before starting a live class with recording:

```
□ Open Google Meet and look for 3 dots (⋮)
□ Click 3 dots
□ See "Record meeting" option? 
  ✅ YES → You can record!
  ❌ NO → Check account type (need Workspace/One Premium)
□ Start your live class
□ Click 3 dots (⋮)
□ Click "Record meeting"
□ See red 🔴 indicator? → Recording started!
□ Teach your class
□ When done, click 3 dots (⋮) → "Stop recording"
□ End the Google Meet
□ Click "End Class" in SkillLift
□ Wait 2-3 minutes
□ Check learner view → Should see "Watch Replay" ✅
```

---

## 📱 **Mobile vs Desktop**

### **Desktop (Recommended for Recording):**
- ✅ Full control panel
- ✅ Easy to find "Record meeting"
- ✅ Better performance
- ✅ Clear recording indicator

### **Mobile (Limited):**
- ⚠️ "Record meeting" might be in different location
- ⚠️ May require tapping screen multiple times
- ⚠️ Smaller recording indicator
- ✅ Still works, just less convenient

**Recommendation:** Use desktop/laptop for hosting recorded classes.

---

## 🎨 **Color Coding Guide**

When checking status in various tools:

| Color | Meaning | Action |
|-------|---------|--------|
| 🔴 Red Dot | Recording active | Keep teaching |
| 🟢 Green "Available" | Recording ready | Watch anytime |
| 🟡 Yellow "Processing" | Being processed | Wait 2-3 min |
| 🔵 Blue "Scheduled" | Class not started | Start when ready |
| ⚪ Gray "Ended" | Class done, no recording | Check manually |

---

## 📸 **Screenshots Reference**

### **What "Record meeting" looks like:**
- Located in 3 dots menu (⋮)
- Usually 4th or 5th option from top
- Text says exactly "Record meeting" (not "Start recording")
- May have a small red dot icon next to it

### **What recording indicator looks like:**
- Top-left corner of Meet window
- Red circle with dot in center
- Text "Recording" next to it
- Your name as host shown

### **What the menu looks like WITHOUT recording:**
- Same 3 dots menu (⋮)
- All other options present
- "Record meeting" option completely missing
- Jumps from one option to next

---

## ✅ **You're Ready When You See:**

1. ✅ "Record meeting" option in 3 dots menu
2. ✅ Backend test page shows all green
3. ✅ Command line tool shows "Available"
4. ✅ Google account connected in SkillLift
5. ✅ Can click "Start" on "Record meeting"

If you see all of these, you're 100% ready to record! 🎉

---

**For complete setup instructions, see:**
- `GOOGLE_MEET_RECORDING_GUIDE.md` (Full technical guide)
- `QUICK_RECORDING_SETUP.md` (5-minute setup)
- `test-google-meet-recording.html` (Interactive tester)

