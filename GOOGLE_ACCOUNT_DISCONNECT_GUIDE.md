# 🔌 GOOGLE ACCOUNT - DISCONNECT & RECONNECT GUIDE

## ✅ **WHAT I JUST ADDED:**

I've added a **"Disconnect Google"** button to your app! Now you can easily disconnect and reconnect your Google account.

---

## 📍 **WHERE TO FIND IT IN YOUR APP:**

### **Step 1: Navigate to Live Class Management**

1. **Login** as a Tutor
2. Go to **Tutor Dashboard**
3. Click on **Your Course**
4. Look for **"Live Class Management"** section

### **Step 2: You'll See One of These:**

#### **If NOT Connected:**
```
┌─────────────────────────────────────────────────────┐
│  🔗 Connect Google Account                          │
│                                                      │
│  Connect your Google account to automatically       │
│  generate Meet links                                │
│                                                      │
│  [Connect Google] ← Click this to connect           │
└─────────────────────────────────────────────────────┘
```

#### **If CONNECTED (NEW!):**
```
┌─────────────────────────────────────────────────────┐
│  ✅ Google Account Connected                        │
│                                                      │
│  Your Google account is connected and ready to      │
│  create Meet links                                  │
│                                                      │
│  [Disconnect Google] ← Click this to disconnect!    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 **HOW TO DISCONNECT & RECONNECT:**

### **To Disconnect:**

1. Go to **Tutor Dashboard** → **Your Course** → **Live Class Management**
2. Look for the **green box** that says "✅ Google Account Connected"
3. Click the **red "Disconnect Google"** button
4. You'll see: "Google account disconnected successfully!"
5. The box will change to yellow and show "Connect Google" button

### **To Reconnect:**

1. After disconnecting, you'll see the **yellow box** with "Connect Google" button
2. Click **"Connect Google"**
3. A popup window will open asking you to sign in to Google
4. **Sign in** and **grant all permissions**
5. The popup will close
6. The box will turn **green** and show "✅ Google Account Connected"
7. You can now try starting a live class again!

---

## 🎯 **WHAT THIS FIXES:**

When you disconnect and reconnect:
- ✅ **Clears old/corrupted tokens**
- ✅ **Gets fresh new tokens**
- ✅ **Resets token format to correct format**
- ✅ **Re-grants all necessary permissions**

This should fix the "Invalid video call name" error if it was caused by token issues!

---

## 📝 **VISUAL WALKTHROUGH:**

### **Scenario 1: You See Yellow Box (Not Connected)**

**What you see:**
```
Live Class Management
┌────────────────────────────────────────────────┐
│  🔗 Connect Google Account                     │
│  Connect your Google account to automatically  │
│  generate Meet links                           │
│  [Connect Google]                              │
└────────────────────────────────────────────────┘
```

**What to do:**
- Click "Connect Google"
- Sign in to Google
- Grant permissions
- Box turns green ✅

---

### **Scenario 2: You See Green Box (Connected)**

**What you see:**
```
Live Class Management  
┌────────────────────────────────────────────────┐
│  ✅ Google Account Connected                   │
│  Your Google account is connected and ready    │
│  to create Meet links                          │
│  [Disconnect Google]                           │
└────────────────────────────────────────────────┘
```

**What to do:**
- Click "Disconnect Google"
- Box turns yellow with "Connect Google" button
- Click "Connect Google" to reconnect
- Box turns green again ✅

---

## 🚀 **AFTER RECONNECTING, TRY THIS:**

1. **Refresh your browser** (Ctrl + R or F5)
2. **Navigate back** to Live Class Management
3. **Try starting a live class**
4. Check if the "Invalid video call name" error is gone!

---

## 🎯 **IF STILL NOT WORKING AFTER RECONNECTING:**

Use the **Custom Meet Link** option:

1. Go to **https://meet.google.com**
2. Click **"New meeting"** → **"Create a meeting for later"**
3. **Copy the Meet link**
4. In your app, **check "Use custom Google Meet link"**
5. **Paste the link**
6. Click **"Start Live Class"**

This will work 100% while we continue debugging!

---

## 📊 **SUMMARY:**

| Action | Where | What Happens |
|--------|-------|--------------|
| **Disconnect** | Green box → Red button | Removes Google tokens, box turns yellow |
| **Connect** | Yellow box → Yellow button | Opens popup, gets tokens, box turns green |
| **Reconnect** | Disconnect → Connect | Fresh tokens, fixes corruption |

---

## ✅ **YOU NOW HAVE:**

- ✅ **Disconnect button** - Remove corrupted tokens
- ✅ **Connect button** - Get fresh tokens  
- ✅ **Visual feedback** - Yellow (not connected) / Green (connected)
- ✅ **Easy troubleshooting** - Disconnect → Reconnect to fix issues

---

**The disconnect/reconnect buttons are now available in your app!**

Just refresh your frontend and you'll see them! 🚀

