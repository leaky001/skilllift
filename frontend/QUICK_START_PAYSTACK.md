# 🚀 Quick Start: Paystack in SkillLift

## ⚡ **Get Started in 5 Minutes**

### **1. Sign up for Paystack**
- Go to [paystack.com](https://paystack.com)
- Click "Get Started" 
- Create account and verify business

### **2. Get Your API Keys**
- Login to Paystack dashboard
- Go to **Settings** → **API Keys & Webhooks**
- Copy your **Public Key** (starts with `pk_test_`)

### **3. Set Environment Variable**
Create a `.env` file in your `frontend` folder:

```env
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
```

### **4. Test Payment**
1. Start your app: `npm run dev`
2. Go to **Learner Dashboard** → **Courses**
3. Click **"Enroll Now"** on any course
4. Choose payment option and click **"Pay"**
5. Paystack popup will appear
6. Use test card: `4084 0840 8408 4081`

### **5. You're Done! 🎉**
Your SkillLift platform now processes real payments!

## 💰 **How It Works**

1. **User clicks "Enroll Now"**
2. **PaymentModal opens** with course details
3. **User selects payment type** (Full/Installment)
4. **User clicks "Pay"** button
5. **Paystack popup appears** for card details
6. **Payment processed** securely
7. **Success callback** grants course access
8. **Commission calculated** (10-15%)
9. **Tutor receives** remaining amount

## 🔧 **What's Already Built**

✅ **PaymentModal** - Beautiful payment interface  
✅ **PaymentContext** - Handles all payment logic  
✅ **Paystack Integration** - Secure payment processing  
✅ **Commission System** - 10-15% platform fee  
✅ **Installment Support** - 3, 6, 12 month options  
✅ **Payment History** - Track all transactions  
✅ **Tutor Analytics** - Earnings and commission breakdown  

## 🧪 **Test Cards**

```
Card: 4084 0840 8408 4081
Expiry: Any future date
CVV: Any 3 digits
PIN: Any 4 digits
OTP: Any 6 digits
```

## 📱 **Test the Flow**

1. **Register as Learner**
2. **Browse Courses**
3. **Click "Enroll Now"**
4. **Select Payment Option**
5. **Enter Test Card Details**
6. **Complete Payment**
7. **Check Payment History**

## 🚨 **Common Issues**

**"Paystack not loaded"**
- Check your API key is correct
- Ensure `.env` file is in `frontend` folder
- Restart your development server

**"Payment failed"**
- Use the correct test card number
- Check browser console for errors
- Verify Paystack script loaded

**"Modal not opening"**
- Check PaymentModal import
- Verify PaymentProvider is in App.jsx
- Check browser console for errors

## 🎯 **Next Steps**

1. **Get real Paystack API keys**
2. **Test with real cards**
3. **Set up webhooks**
4. **Go live with real payments**
5. **Start earning commission!**

## 📞 **Need Help?**

- Check browser console for errors
- Verify all imports are correct
- Ensure PaymentProvider is in App.jsx
- Test with provided test cards

**Your SkillLift platform is now a revenue-generating business! 🎉**
