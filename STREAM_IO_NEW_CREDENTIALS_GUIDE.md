# 🔑 Stream.io New Credentials Setup Guide

## ❌ **Current Issue:**
The API key `j86qtfj4kzaf` is **INVALID** and causing `AccessKeyError`.

## ✅ **Solution: Get New Stream.io Credentials**

### **Step 1: Create Stream.io Account**
1. Go to: https://getstream.io/
2. Click "Get Started" or "Sign Up"
3. Create account with your email
4. Verify your email address

### **Step 2: Create Video App**
1. Login to: https://dashboard.getstream.io/
2. Click "Create App" or "New App"
3. Select **"Video"** as app type
4. Give it a name like "SkillLift Video Calls"
5. Click "Create"

### **Step 3: Get Your Credentials**
After creating the app, you'll see:
- **API Key**: `your_new_api_key_here`
- **API Secret**: `your_new_api_secret_here`

### **Step 4: Update Environment Files**

#### **Update frontend/.env:**
```env
# API Configuration
VITE_API_URL=http://localhost:3002/api

# Stream SDK Configuration
VITE_STREAM_API_KEY=your_new_api_key_here
VITE_STREAM_API_SECRET=your_new_api_secret_here
```

#### **Update backend/.env:**
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/skilllift

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3002
NODE_ENV=development

# Stream.io Configuration (for Live Classes)
STREAM_API_KEY=your_new_api_key_here
STREAM_API_SECRET=your_new_api_secret_here
```

### **Step 5: Restart Servers**
After updating the files:
1. **Stop frontend server** (Ctrl+C)
2. **Restart frontend**: `cd frontend && npm run dev`
3. **Stop backend server** (Ctrl+C)  
4. **Restart backend**: `cd backend && npm start`

## 🎯 **Expected Result:**
- ✅ No more `AccessKeyError`
- ✅ Stream.io connection successful
- ✅ Video calls work properly
- ✅ Connection time under 5 seconds

## 🆘 **Need Help?**
If you need assistance getting the new credentials, let me know and I can guide you through the process step by step.
