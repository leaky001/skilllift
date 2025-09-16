# 🎯 Frontend Payment Flow Test Guide

## 🚀 **Quick Start**

Once your Paystack is configured, you can test the complete frontend payment flow:

### **Step 1: Start Your Frontend**

```bash
cd ../frontend
npm start
```

### **Step 2: Test the Complete Flow**

1. **Open your browser** to `http://localhost:3000`
2. **Register/Login** as a learner
3. **Browse courses** and select one to purchase
4. **Click "Enroll Now"** or "Buy Course"
5. **Complete the payment** using test card details

## 🧪 **Test Scenarios**

### **Scenario 1: Successful Payment**
- **Card**: 4084 0840 8408 4081
- **Expiry**: 12/25
- **CVV**: 123
- **PIN**: 1234
- **Expected**: Payment successful, course access granted

### **Scenario 2: Failed Payment**
- **Card**: 4084 0840 8408 4082
- **Expiry**: 12/25
- **CVV**: 123
- **PIN**: 1234
- **Expected**: Payment failed, error message shown

### **Scenario 3: Insufficient Funds**
- **Card**: 4084 0840 8408 4083
- **Expiry**: 12/25
- **CVV**: 123
- **PIN**: 1234
- **Expected**: Insufficient funds error

## 🔍 **What to Check**

### **Backend Integration**
- ✅ Payment initialization works
- ✅ Paystack redirect URL is generated
- ✅ Payment verification works
- ✅ Course access is granted after payment

### **Frontend Flow**
- ✅ Course selection works
- ✅ Payment form loads correctly
- ✅ Paystack checkout page opens
- ✅ Success/failure handling works
- ✅ User dashboard updates

### **Database Updates**
- ✅ Payment record is created
- ✅ User course enrollment is updated
- ✅ Payment status is tracked

## 🐛 **Common Issues & Solutions**

### **Issue 1: Payment initialization fails**
- **Solution**: Check Paystack keys in `.env` file
- **Check**: Backend logs for configuration errors

### **Issue 2: Paystack checkout doesn't load**
- **Solution**: Verify Paystack public key is correct
- **Check**: Browser console for JavaScript errors

### **Issue 3: Payment verification fails**
- **Solution**: Check webhook configuration
- **Check**: Backend logs for verification errors

### **Issue 4: Course access not granted**
- **Solution**: Check enrollment logic
- **Check**: Database for payment and enrollment records

## 📊 **Testing Checklist**

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Paystack keys configured in `.env`
- [ ] User can register/login
- [ ] User can browse courses
- [ ] User can select a course
- [ ] Payment initialization works
- [ ] Paystack checkout page loads
- [ ] Test payment completes successfully
- [ ] Payment verification works
- [ ] Course access is granted
- [ ] Payment history is updated
- [ ] User dashboard shows enrolled courses

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **Payment Flow**: Smooth transition from course selection to Paystack checkout
2. **Payment Success**: Clear success message and course access granted
3. **Database Updates**: Payment and enrollment records created
4. **User Experience**: Seamless flow from browsing to learning

## 🆘 **Need Help?**

If you encounter issues:
1. **Check backend logs** for error messages
2. **Check browser console** for frontend errors
3. **Verify Paystack configuration** in dashboard
4. **Test with different cards** to isolate issues
