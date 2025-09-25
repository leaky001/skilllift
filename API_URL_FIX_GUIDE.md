# 🔧 API URL CONFIGURATION FIX

## ❌ **PROBLEM IDENTIFIED:**
Your `VITE_API_URL` environment variable is malformed, causing 404 errors.

**Current Error:**
```
skilllift.onrender.com/api%7C%7C%20http://localhost:3001/api/auth/register
```

**This suggests your environment variable contains:**
```
VITE_API_URL=https://skilllift.onrender.com/api||http://localhost:3001/api
```

## ✅ **SOLUTION:**

### **1. Fix Your Environment Variable**

**In your production environment (Render, Vercel, Netlify, etc.):**

**❌ WRONG:**
```
VITE_API_URL=https://skilllift.onrender.com/api||http://localhost:3001/api
```

**✅ CORRECT:**
```
VITE_API_URL=https://skilllift.onrender.com/api
```

### **2. Environment Variable Examples:**

**For Production (Render):**
```
VITE_API_URL=https://skilllift.onrender.com/api
```

**For Development:**
```
VITE_API_URL=http://localhost:3002/api
```

**For Staging:**
```
VITE_API_URL=https://skilllift-staging.onrender.com/api
```

### **3. How to Fix on Different Platforms:**

#### **Render.com:**
1. Go to your frontend service dashboard
2. Click "Environment" tab
3. Find `VITE_API_URL` variable
4. Change from: `https://skilllift.onrender.com/api||http://localhost:3001/api`
5. Change to: `https://skilllift.onrender.com/api`
6. Save and redeploy

#### **Vercel:**
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Find `VITE_API_URL`
4. Update the value to: `https://skilllift.onrender.com/api`
5. Redeploy

#### **Netlify:**
1. Go to Site settings → Environment variables
2. Find `VITE_API_URL`
3. Update to: `https://skilllift.onrender.com/api`
4. Redeploy

### **4. Verify Your Backend URL:**

Make sure your backend is actually running at:
```
https://skilllift.onrender.com/api
```

**Test your backend directly:**
```bash
curl https://skilllift.onrender.com/api/auth/register
```

### **5. Debug Information:**

After fixing, check the mobile debugger panel for:
- **API URL:** Should show `https://skilllift.onrender.com/api`
- **Original Env URL:** Should show the clean URL without `||`

## 🧪 **TESTING:**

1. **Fix the environment variable**
2. **Redeploy your frontend**
3. **Open registration page on mobile**
4. **Check debug panel** - API URL should be clean
5. **Try registration** - should work now

## 📱 **Expected Results:**

- ✅ **API URL:** `https://skilllift.onrender.com/api`
- ✅ **Registration:** Should work on mobile
- ✅ **No 404 errors** in console
- ✅ **Clean API calls** without malformed URLs

**The main issue is the malformed environment variable containing `||` syntax. Fix this and registration will work!** 🚀
