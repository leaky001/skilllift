# 📧 REAL EMAIL SETUP GUIDE FOR SKILLLIFT

## 🎯 **Quick Setup (Choose ONE option)**

### **Option 1: Gmail Setup (Easiest)**

1. **Enable 2-Factor Authentication on Gmail**
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Click "App passwords" → Select "Mail" → Enter "SkillLift"
   - Copy the 16-character password

3. **Update your .env file**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
SENDGRID_FROM_EMAIL=noreply@skilllift.com
```

### **Option 2: SendGrid (Professional)**

1. **Sign up at**: https://sendgrid.com/
2. **Get API Key**: Settings → API Keys → Create API Key
3. **Update your .env file**:
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@skilllift.com
```

### **Option 3: Twilio SendGrid**

1. **Sign up at**: https://www.twilio.com/
2. **Go to**: Products → SendGrid → Get Started
3. **Get API Key**: Settings → API Keys → Create API Key
4. **Update your .env file**:
```env
EMAIL_SERVICE=twilio
EMAIL_USER=apikey
EMAIL_PASS=SG.your-twilio-api-key-here
SENDGRID_FROM_EMAIL=noreply@skilllift.com
```

## 🧪 **Test Your Email Setup**

Run this command to test:
```bash
cd backend
node test-email-setup.js
```

## 📧 **Email Templates Available**

Your system includes these professional email templates:
- ✅ Email Verification (6-digit code)
- ✅ Welcome Email (after verification)
- ✅ Password Reset
- ✅ Account Approval (admin)
- ✅ Account Rejection (admin)
- ✅ Course Approval (admin)
- ✅ Course Rejection (admin)

## 🚀 **Production Recommendations**

1. **Use SendGrid** for production (more reliable)
2. **Set up domain authentication** for better deliverability
3. **Monitor email metrics** (open rates, bounce rates)
4. **Use transactional email templates** for consistency

## 🔧 **Troubleshooting**

### Common Issues:
1. **"Email config missing"** → Check .env file exists and has correct values
2. **"Authentication failed"** → Check EMAIL_USER and EMAIL_PASS
3. **"Connection timeout"** → Check internet connection and firewall
4. **"Invalid credentials"** → Regenerate app password for Gmail

### Debug Steps:
1. Check console logs for detailed error messages
2. Verify .env file is in backend/ directory
3. Restart your server after changing .env
4. Test with a simple email first

## 📞 **Need Help?**

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify your email credentials are correct
3. Try the test script: `node test-email-setup.js`
4. Make sure your .env file is properly formatted (no spaces around =)
