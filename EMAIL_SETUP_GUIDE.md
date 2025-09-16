# 📧 Email Setup Guide for SkillLift

## 🎯 Overview
This guide will help you set up email functionality for SkillLift, including email verification, welcome emails, and password reset emails.

## 📋 Prerequisites
- Gmail account (or other email provider)
- App password for your email account

## 🔧 Setup Instructions

### 1. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Click on "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "SkillLift" as the name
6. Copy the generated 16-character password

#### Step 3: Update Environment Variables
Add these to your `backend/.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
```

### 2. Alternative Email Providers

#### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

#### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## 🧪 Testing Email Functionality

### 1. Test Registration Flow
1. Start your backend server: `npm run dev`
2. Start your frontend: `npm run dev`
3. Go to registration page
4. Fill out the form and submit
5. Check your email for verification code
6. Enter the code on the verification page

### 2. Test Email Templates
The system includes these email templates:
- **Email Verification**: 6-digit code for account verification
- **Welcome Email**: Sent after successful verification
- **Password Reset**: For password recovery

## 📧 Email Templates

### Email Verification Template
- **Subject**: "Verify Your Email - SkillLift"
- **Content**: 6-digit verification code with expiry
- **Expiry**: 10 minutes

### Welcome Email Template
- **Subject**: "Welcome to SkillLift! 🎓"
- **Content**: Welcome message with account details
- **Sent**: After email verification

### Password Reset Template
- **Subject**: "Password Reset Request - SkillLift"
- **Content**: Reset link with expiry
- **Expiry**: 10 minutes

## 🔒 Security Features

### Email Verification
- 6-digit numeric codes
- 10-minute expiry
- Rate limiting on resend
- Secure code generation

### Password Reset
- Secure token generation
- 10-minute expiry
- One-time use tokens
- Email validation

## 🚨 Troubleshooting

### Common Issues

#### 1. "Email sending failed" Error
**Solution**: Check your email credentials and app password

#### 2. Emails going to Spam
**Solution**: 
- Add your email to contacts
- Check spam folder
- Use a business email domain

#### 3. Gmail "Less secure app" Error
**Solution**: Use App Passwords instead of regular passwords

#### 4. SMTP Connection Issues
**Solution**: 
- Check firewall settings
- Verify SMTP port (587 for TLS, 465 for SSL)
- Ensure correct credentials

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
NODE_ENV=development
DEBUG=email:*
```

## 📱 Frontend Integration

### Email Verification Flow
1. User registers
2. Backend sends verification email
3. User receives 6-digit code
4. User enters code on verification page
5. Backend verifies code
6. User is redirected to dashboard

### Resend Functionality
- 60-second cooldown between resends
- Automatic countdown timer
- User-friendly error messages

## 🔄 API Endpoints

### Email Verification
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

### Resend Verification
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 📊 Monitoring

### Email Delivery Tracking
- Check server logs for email sending status
- Monitor bounce rates
- Track verification success rates

### Performance Metrics
- Email delivery time
- Verification completion rate
- Resend request frequency

## 🛡️ Security Best Practices

1. **Use App Passwords**: Never use regular passwords for SMTP
2. **Rate Limiting**: Implement rate limiting on email endpoints
3. **Code Expiry**: Set reasonable expiry times (10 minutes)
4. **Secure Generation**: Use crypto.randomBytes for code generation
5. **HTTPS Only**: Always use HTTPS in production

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your email provider settings
3. Test with a different email provider
4. Check server logs for detailed error messages

---

**Note**: This email system is designed for development and small-scale production. For large-scale applications, consider using email service providers like SendGrid, Mailgun, or AWS SES.
