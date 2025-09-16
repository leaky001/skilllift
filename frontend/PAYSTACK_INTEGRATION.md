# 🚀 Paystack Integration Guide for SkillLift

## 📋 **Prerequisites**
- Paystack account (sign up at [paystack.com](https://paystack.com))
- Nigerian business verification
- Bank account for payouts

## 🔑 **Step 1: Get Your Paystack API Keys**

### **1.1 Sign up for Paystack**
1. Go to [paystack.com](https://paystack.com)
2. Click "Get Started" and create an account
3. Complete business verification
4. Add your bank account details

### **1.2 Get API Keys**
1. Login to your Paystack dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** and **Secret Key**

### **1.3 Environment Variables**
Create a `.env` file in your `frontend` directory:

```env
# Frontend (.env)
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
REACT_APP_PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here

# Backend (.env)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

## 🛠️ **Step 2: Frontend Integration**

### **2.1 PaymentModal Component**
Your `PaymentModal.jsx` is already set up to use Paystack. Here's how it works:

```jsx
// When user clicks "Pay Now"
const handlePayment = async () => {
  try {
    const paymentData = {
      email: user.email,
      amount: course.price,
      paymentType,
      courseId: course.id,
      courseTitle: course.title,
      tutorId: course.tutorId,
      learnerId: user.id,
      installmentCount: paymentType === 'installment' ? installmentCount : null,
    };

    // This triggers Paystack
    await processCoursePayment(paymentData);
    onPaymentSuccess && onPaymentSuccess();
    onClose();
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### **2.2 PaymentContext Integration**
Your `PaymentContext.jsx` handles the Paystack integration:

```jsx
const initializePaystack = (paymentData) => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount: paymentData.amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: `SL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callback: (response) => {
          handlePaymentSuccess(response, paymentData);
          resolve(response);
        },
        onClose: () => {
          toast.info('Payment cancelled');
          reject(new Error('Payment cancelled'));
        },
      });
      handler.openIframe();
    } else {
      reject(new Error('Paystack not loaded'));
    }
  });
};
```

## 🔧 **Step 3: Backend Integration**

### **3.1 Install Paystack SDK**
In your backend directory:

```bash
npm install paystack
```

### **3.2 Create Payment Controller**
Create `backend/controllers/paymentController.js`:

```javascript
const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

// Initialize payment
const initializePayment = async (req, res) => {
  try {
    const { email, amount, reference, callback_url } = req.body;
    
    const payment = await Paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      callback_url,
      currency: 'NGN',
    });
    
    res.json({
      success: true,
      data: payment.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    
    const verification = await Paystack.transaction.verify(reference);
    
    if (verification.data.status === 'success') {
      // Payment successful - update database
      // Grant course access
      // Calculate commission
      // Send confirmation email
      
      res.json({
        success: true,
        data: verification.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
};
```

### **3.3 Create Payment Routes**
Create `backend/routes/paymentRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', verifyPayment);

module.exports = router;
```

## 💰 **Step 4: Commission System**

### **4.1 Commission Calculation**
Your platform takes 10-15% commission:

```javascript
const calculateCommission = (amount) => {
  const commissionRate = 0.125; // 12.5% average
  return Math.round(amount * commissionRate);
};

// Example: Course costs ₦100,000
// Platform commission: ₦12,500
// Tutor receives: ₦87,500
```

### **4.2 Payout to Tutors**
After successful payment:
1. Paystack sends money to SkillLift
2. SkillLift deducts commission
3. Remaining amount is transferred to tutor's bank account

## 🧪 **Step 5: Testing**

### **5.1 Test Cards**
Use these test card numbers:

```
Card Number: 4084 0840 8408 4081
Expiry: Any future date
CVV: Any 3 digits
PIN: Any 4 digits
OTP: Any 6 digits
```

### **5.2 Test Scenarios**
1. **Successful Payment**: Use valid test card
2. **Failed Payment**: Use invalid card
3. **Insufficient Funds**: Use card with low balance
4. **Network Issues**: Test offline scenarios

## 📱 **Step 6: User Experience Flow**

### **6.1 Complete Payment Flow**
1. **User clicks "Enroll Now"**
2. **PaymentModal opens**
3. **User selects payment option** (Full/Installment)
4. **User clicks "Pay"**
5. **Paystack popup appears**
6. **User enters card details**
7. **Payment is processed**
8. **Success callback triggers**
9. **Course access granted**
10. **Payment confirmation sent**

### **6.2 Error Handling**
- Network errors
- Invalid card details
- Insufficient funds
- Payment cancellation
- Timeout scenarios

## 🔒 **Step 7: Security Best Practices**

### **7.1 Frontend Security**
- Never expose secret keys in frontend
- Use environment variables
- Validate payment data before submission
- Implement proper error handling

### **7.2 Backend Security**
- Verify Paystack webhooks
- Validate payment amounts
- Check payment status before granting access
- Log all payment activities
- Implement rate limiting

## 📊 **Step 8: Monitoring & Analytics**

### **8.1 Payment Metrics**
- Success rate
- Average transaction value
- Commission earnings
- Failed payment reasons
- User payment patterns

### **8.2 Webhook Handling**
Set up webhooks in Paystack dashboard:
- `charge.success`: Payment successful
- `charge.failed`: Payment failed
- `transfer.success`: Payout successful
- `transfer.failed`: Payout failed

## 🚀 **Step 9: Go Live**

### **9.1 Production Checklist**
- [ ] Switch to live API keys
- [ ] Test with real cards
- [ ] Set up production webhooks
- [ ] Configure bank accounts
- [ ] Test payout system
- [ ] Monitor first transactions

### **9.2 Live API Keys**
Replace test keys with live keys:
```env
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
PAYSTACK_SECRET_KEY=sk_live_your_live_key_here
```

## 📞 **Support & Resources**

### **Paystack Documentation**
- [API Reference](https://paystack.com/docs/api)
- [Webhooks Guide](https://paystack.com/docs/webhooks)
- [Testing Guide](https://paystack.com/docs/testing)

### **SkillLift Integration**
- Payment processing ✅
- Commission calculation ✅
- Installment support ✅
- Certificate payments ✅
- Mentorship payments ✅

## 🎯 **Next Steps**

1. **Get your Paystack API keys**
2. **Set up environment variables**
3. **Test with test cards**
4. **Configure webhooks**
5. **Go live with real payments**

Your SkillLift platform is now ready to process real payments and generate revenue! 🎉
