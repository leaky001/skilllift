# 🚀 Twilio Email Setup Guide for SkillLift

## 📋 **Overview**
This guide will help you set up professional email sending using Twilio's email services for your SkillLift application.

## 🎯 **Option 1: Twilio SendGrid (Recommended)**

### **Step 1: Create Twilio Account**
1. **Go to**: https://www.twilio.com/
2. **Click**: "Sign up for free"
3. **Fill in** your details
4. **Verify your email**

### **Step 2: Access SendGrid**
1. **Login to Twilio Console**
2. **Go to**: Products → SendGrid
3. **Click**: "Get Started with SendGrid"
4. **Choose**: "Free Plan" (100 emails/day)

### **Step 3: Get API Key**
1. **In SendGrid Dashboard**:
   - Go to **Settings → API Keys**
   - Click **"Create API Key"**
   - Name it: "SkillLift"
   - Choose: **"Restricted Access"** → **"Mail Send"**
   - Copy the API key (starts with `SG.`)

### **Step 4: Update Your .env File**
```env
EMAIL_SERVICE=twilio
EMAIL_USER=apikey
EMAIL_PASS=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=noreply@skilllift.com
```

## 🎯 **Option 2: Twilio Verify (For SMS/Email Verification)**

### **Step 1: Set Up Twilio Verify**
1. **In Twilio Console**:
   - Go to **Products → Verify**
   - Click **"Get Started"**
   - Choose **"Email"** as verification channel

### **Step 2: Get Credentials**
1. **Go to**: Console → Account Info
2. **Copy**:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (your API key)

### **Step 3: Update Your .env File**
```env
TWILIO_ACCOUNT_SID=AC.your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_VERIFY_SERVICE_SID=VA.your-verify-service-sid
```

## 🎯 **Option 3: Gmail (Quick Setup)**

### **Step 1: Get Gmail App Password**
1. **Go to**: https://myaccount.google.com/security
2. **Enable 2-Step Verification**
3. **Go to App Passwords**
4. **Generate password** for "Mail"

### **Step 2: Update Your .env File**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=lakybass19@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## 🔧 **Installation Steps**

### **Step 1: Install Required Packages**
```bash
cd backend
npm install nodemailer
```

### **Step 2: Create .env File**
```bash
# In backend directory
touch .env
```

### **Step 3: Add Environment Variables**
```env
# Database
MONGO_URI=your-mongodb-connection-string

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d

# Email Configuration (Choose one option)
# Option 1: Twilio SendGrid
EMAIL_SERVICE=twilio
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@skilllift.com

# Option 2: Gmail
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Other Settings
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🧪 **Testing Your Setup**

### **Step 1: Start Backend Server**
```bash
cd backend
npm run dev
```

### **Step 2: Test Email Sending**
1. **Register a new user** in your frontend
2. **Check console** for email logs
3. **Check your email** for verification code

### **Step 3: Verify Email Configuration**
Look for these messages in your console:
- ✅ **Success**: "Email sent successfully: [message-id]"
- ⚠️ **Fallback**: "EMAIL WOULD BE SENT (Email config missing)"

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. "Email configuration missing"**
- **Solution**: Check your `.env` file has `EMAIL_USER` and `EMAIL_PASS`

#### **2. "Authentication failed"**
- **Solution**: Verify your API key/password is correct

#### **3. "Connection timeout"**
- **Solution**: Check your internet connection and firewall settings

#### **4. "Rate limit exceeded"**
- **Solution**: Upgrade to a paid plan or wait for rate limit reset

### **Debug Steps:**
1. **Check .env file** exists in backend directory
2. **Verify environment variables** are loaded
3. **Test API key** in service provider dashboard
4. **Check console logs** for detailed error messages

## 📞 **Support**

### **Twilio Support:**
- **Documentation**: https://www.twilio.com/docs
- **Support**: https://www.twilio.com/help
- **Community**: https://www.twilio.com/community

### **SendGrid Support:**
- **Documentation**: https://sendgrid.com/docs/
- **Support**: https://support.sendgrid.com/

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
- ✅ Backend server starts without errors
- ✅ User registration sends verification email
- ✅ Email appears in recipient's inbox
- ✅ Verification code works in frontend

---

**Need help?** Check the console logs for detailed error messages and refer to the troubleshooting section above.
