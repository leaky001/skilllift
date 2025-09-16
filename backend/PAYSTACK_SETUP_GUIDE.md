# 🚀 Paystack Test Mode Setup Guide

## 📋 **Current Status**
- ✅ Backend server is running
- ✅ User authentication is working
- ✅ Courses are available (4 courses found)
- ❌ **Paystack configuration is missing**

## 🔧 **How to Set Up Paystack Test Mode**

### **Step 1: Get Your Paystack Test Keys**

1. **Go to [Paystack Dashboard](https://dashboard.paystack.com/)**
2. **Login to your account**
3. **Navigate to Settings → API Keys**
4. **Look for the "Test" section**
5. **Copy both keys:**
   - **Test Secret Key** (starts with `sk_test_`)
   - **Test Public Key** (starts with `pk_test_`)

### **Step 2: Create the .env File**

Create a file named `.env` in your `backend` directory with this content:

```env
# Database Configuration
MONGO_URI=mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift

# JWT Configuration
JWT_SECRET=skilllift-super-secure-jwt-secret-key-2024-make-it-very-long-and-random

# Server Configuration
PORT=5000
NODE_ENV=development

# Paystack Configuration (TEST MODE)
PAYSTACK_SECRET_KEY=sk_test_your_actual_test_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_test_public_key_here

# Email Configuration (Optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration (Optional for now)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Step 3: Replace the Placeholder Keys**

Replace these placeholders with your actual Paystack test keys:
- `sk_test_your_actual_test_secret_key_here` → Your actual test secret key
- `pk_test_your_actual_test_public_key_here` → Your actual test public key

### **Step 4: Restart Your Backend**

After creating the `.env` file, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
```

### **Step 5: Test the Payment Flow**

Run the test script again:

```bash
node quick-payment-test.js
```

## 🧪 **Test Card Details**

Once Paystack is configured, you can use these test cards:

| Card Number | Expiry | CVV | PIN | Description |
|-------------|--------|-----|-----|-------------|
| 4084 0840 8408 4081 | 12/25 | 123 | 1234 | Successful payment |
| 4084 0840 8408 4082 | 12/25 | 123 | 1234 | Failed payment |
| 4084 0840 8408 4083 | 12/25 | 123 | 1234 | Insufficient funds |

## 🎯 **Expected Results**

After setup, the test should show:
```
✅ Payment initialized successfully!
🔗 Authorization URL: https://checkout.paystack.com/...
📝 Reference: TST123456789
💳 Payment ID: 123456789
```

## 🆘 **Need Help?**

If you need help getting your Paystack keys:
1. **Check your Paystack dashboard** - Keys are in Settings → API Keys
2. **Make sure you're in test mode** - Look for "Test" section
3. **Contact Paystack support** if you can't find your keys

## 📞 **Quick Test**

Once configured, you can also test manually:
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"courseId":"COURSE_ID","amount":15000,"email":"test@example.com"}'
```
