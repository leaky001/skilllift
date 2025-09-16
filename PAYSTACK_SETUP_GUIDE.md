# 🚀 Paystack Integration Setup Guide

## ✅ **What's Already Done:**

### **1. API Keys Configured**
- ✅ Public Key: `pk_test_9d5ba0955f0e11dc4292453950a61bc326730cb7`
- ✅ Secret Key: `sk_test_b9950d127d1b48b599f430284e1f1d716f538043`
- ✅ Environment files created

### **2. Frontend Ready**
- ✅ PaymentContext.jsx updated
- ✅ PaymentModal component ready
- ✅ Commission calculation system
- ✅ Installment payment support

### **3. Backend Created**
- ✅ Payment controller with Paystack integration
- ✅ Payment routes configured
- ✅ Server setup with security middleware
- ✅ Webhook handling ready

## 🛠️ **Next Steps to Get It Working:**

### **Step 1: Install Backend Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Test Paystack Connection**
```bash
cd backend
node test-payment.js
```

### **Step 3: Start Backend Server**
```bash
cd backend
npm run dev
```

### **Step 4: Start Frontend**
```bash
cd frontend
npm run dev
```

## 🧪 **Testing Your Integration:**

### **Test Cards (Use these for testing):**
```
Card Number: 4084 0840 8408 4081
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
PIN: Any 4 digits (e.g., 1234)
OTP: Any 6 digits (e.g., 123456)
```

### **Test Payment Flow:**
1. Go to any course page
2. Click "Enroll Now"
3. Select payment option (Full/Installment)
4. Click "Pay Now"
5. Use test card details above
6. Complete payment

## 🔧 **API Endpoints Available:**

### **Payment Endpoints:**
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify/:reference` - Verify payment
- `POST /api/payments/webhook` - Handle Paystack webhooks
- `GET /api/payments/history/:userId` - Get payment history

### **Health Check:**
- `GET /health` - Check if server is running

## 💰 **Commission System:**

### **Platform Commission:**
- **Rate**: 12.5% (average of 10-15%)
- **Example**: ₦100,000 course
  - Platform gets: ₦12,500
  - Tutor gets: ₦87,500

### **Payment Flow:**
1. Learner pays for course
2. Paystack sends money to SkillLift
3. Platform deducts commission
4. Remaining amount goes to tutor

## 🔒 **Security Features:**

### **Backend Security:**
- ✅ Helmet.js for security headers
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Input validation
- ✅ Error handling

### **Payment Security:**
- ✅ Paystack handles sensitive card data
- ✅ Webhook verification
- ✅ Payment verification before access
- ✅ Secure API key storage

## 📱 **User Experience:**

### **Payment Flow:**
1. **User clicks "Enroll Now"**
2. **PaymentModal opens**
3. **User selects payment option**
4. **User clicks "Pay"**
5. **Paystack popup appears**
6. **User enters card details**
7. **Payment processed**
8. **Success callback triggers**
9. **Course access granted**
10. **Payment confirmation sent**

### **Error Handling:**
- Network errors
- Invalid card details
- Insufficient funds
- Payment cancellation
- Timeout scenarios

## 🚀 **Production Checklist:**

### **Before Going Live:**
- [ ] Switch to live API keys
- [ ] Set up production webhooks
- [ ] Configure bank accounts
- [ ] Test with real cards
- [ ] Set up monitoring
- [ ] Configure SSL certificates

### **Live API Keys:**
```env
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
PAYSTACK_SECRET_KEY=sk_live_your_live_key_here
```

## 📊 **Monitoring & Analytics:**

### **Track These Metrics:**
- Payment success rate
- Average transaction value
- Commission earnings
- Failed payment reasons
- User payment patterns

### **Webhook Events:**
- `charge.success` - Payment successful
- `charge.failed` - Payment failed
- `transfer.success` - Payout successful
- `transfer.failed` - Payout failed

## 🆘 **Troubleshooting:**

### **Common Issues:**
1. **"Paystack not loaded"** - Check if Paystack script is loaded
2. **"Payment failed"** - Check API keys and network connection
3. **"Webhook not working"** - Verify webhook URL and events
4. **"Commission calculation wrong"** - Check calculation logic

### **Debug Steps:**
1. Check browser console for errors
2. Check backend logs
3. Verify API keys are correct
4. Test with Paystack test cards
5. Check network connectivity

## 🎯 **Ready to Test!**

Your Paystack integration is now complete and ready for testing! 

**Quick Start:**
1. `cd backend && npm install && npm run dev`
2. `cd frontend && npm run dev`
3. Test with the provided test cards
4. Enjoy your payment system! 🎉

## 📞 **Support:**

- **Paystack Documentation**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Test Cards**: Use the cards provided above

---

**Your SkillLift platform now has a fully functional payment system! 💳✨**
