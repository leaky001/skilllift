# 🔍 **Frontend 400 Error Quick Fix**

## 🎯 **Immediate Steps to Fix the 400 Error**

### **Step 1: Check Your Authentication**
Open your browser console (F12) and run this:

```javascript
// Check authentication state
console.log('🔍 Token:', localStorage.getItem('token'));
console.log('🔍 User:', localStorage.getItem('skilllift_user'));

// If both are null, you're not authenticated
if (!localStorage.getItem('token')) {
  console.log('❌ NOT AUTHENTICATED - This is causing the 400 error!');
} else {
  console.log('✅ AUTHENTICATED');
}
```

### **Step 2: If Not Authenticated - Fix It**

**Option A: Clear Data and Register**
```javascript
// Clear all data
localStorage.removeItem('token');
localStorage.removeItem('skilllift_user');
console.log('✅ Data cleared - now register a new account');
```

**Option B: Register New Account**
1. Go to registration page
2. Use a unique email (like `test123@example.com`)
3. Register as a learner
4. Try payment again

### **Step 3: Test Payment Flow**

1. **Browse courses** - make sure you can see courses
2. **Select a course** - click "Enroll Now" or "Buy Now"
3. **Fill payment form** - enter your email
4. **Click "Pay Now"** - should redirect to Paystack

### **Step 4: If Still Getting 400 Error**

Check the Network tab in dev tools:
1. Go to **Network** tab
2. Try to make a payment
3. Look for the failed request
4. Check if **Authorization** header is present

---

## 🚨 **Most Likely Cause**

The 400 error is almost certainly because:
- You're not logged in, OR
- Your token is expired/invalid, OR
- The authentication data is corrupted

**The fix is simple: Register a new account with a fresh email!**

---

**🎯 Try the authentication check above and let me know what you see!**
