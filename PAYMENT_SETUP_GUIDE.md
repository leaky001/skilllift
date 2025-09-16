# 🔧 Paystack Payment Integration Setup Guide

## **Critical Issues Found & Fixes Required**

### **Issue 1: Missing Paystack Configuration (CRITICAL)**

Your backend `.env` file is missing the required Paystack API keys. This will cause all payment initialization to fail.

#### **Current .env file (INCOMPLETE):**
```env
MONGO_URI=mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
PORT=5000
```

#### **Required .env file (COMPLETE):**
```env
MONGO_URI=mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
PORT=5000
NODE_ENV=development

# Paystack Configuration (REQUIRED for payments to work)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@skilllift.com

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=uploads

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### **Issue 2: Backend Server Not Running**

The backend server must be running for payment integration to work.

#### **Start Backend Server:**
```bash
cd backend
node server.js
```

### **Issue 3: Payment Flow Logic**

The current flow has been improved to:
1. Check if course is free → enroll directly
2. Check if course is paid → show payment modal
3. After payment → redirect to Paystack
4. After payment verification → enroll automatically

## **🛠️ Steps to Fix Payment Integration**

### **Step 1: Get Paystack API Keys**

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up/Login to your account
3. Go to Settings → API Keys & Webhooks
4. Copy your **Test Secret Key** and **Test Public Key**

### **Step 2: Update Backend .env File**

Add these lines to your `backend/.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### **Step 3: Start Backend Server**

```bash
cd backend
node server.js
```

### **Step 4: Test Payment Flow**

1. Start frontend: `cd frontend && npm run dev`
2. Login as a learner
3. Go to courses page
4. Try to enroll in a paid course
5. Check browser console for payment logs

## **🔍 Debugging Payment Issues**

### **Check Backend Logs:**
- Look for Paystack API errors
- Check if environment variables are loaded
- Verify payment initialization

### **Check Frontend Console:**
- Look for payment initialization logs
- Check for API call errors
- Verify redirect to Paystack

### **Common Error Messages:**

1. **"Server error. Please check if Paystack keys are configured."**
   - Solution: Add Paystack keys to .env file

2. **"Authentication failed. Please login again."**
   - Solution: Check if user is logged in and token is valid

3. **"Failed to initialize payment"**
   - Solution: Check Paystack API keys and backend server

## **✅ Payment Flow Verification**

### **Successful Payment Flow:**
1. User clicks "Enroll Now" on paid course
2. Payment modal opens with course details
3. User enters email and clicks "Pay Now"
4. Frontend calls `/api/payments/initialize`
5. Backend creates payment record and calls Paystack API
6. User is redirected to Paystack payment page
7. After payment, user is redirected to `/payment/verify`
8. Payment is verified and enrollment is created
9. User sees success message and is enrolled

### **Free Course Flow:**
1. User clicks "Enroll Now" on free course
2. Frontend directly calls `/api/enrollments/enroll`
3. Enrollment is created immediately
4. User sees success message

## **🚨 Critical Notes**

1. **Never commit .env files** to version control
2. **Use test keys** for development, live keys for production
3. **Backend server must be running** for payments to work
4. **Check browser console** for detailed error messages
5. **Verify Paystack webhook** configuration for production

## **📞 Support**

If you're still having issues:
1. Check browser console for error messages
2. Check backend server logs
3. Verify Paystack API keys are correct
4. Ensure backend server is running on port 5000
5. Check if CORS_ORIGIN matches your frontend URL
