# 🔍 **Frontend Authentication Check Guide**

## 🎯 **Step-by-Step Authentication Check**

### **1. Open Browser Developer Tools**
1. Go to `http://localhost:5174`
2. Press `F12` or right-click → "Inspect"
3. Go to the **Console** tab

### **2. Check Authentication State**
Copy and paste these commands one by one in the console:

```javascript
// Check if token exists
console.log('🔍 Token check:', localStorage.getItem('token'));

// Check if user data exists
console.log('🔍 User data check:', localStorage.getItem('skilllift_user'));

// Check if user is authenticated
const userData = localStorage.getItem('skilllift_user');
if (userData) {
  const user = JSON.parse(userData);
  console.log('🔍 User details:', {
    name: user.name,
    email: user.email,
    role: user.role,
    hasToken: !!user.token
  });
} else {
  console.log('❌ No user data found');
}
```

### **3. Expected Results**

#### **✅ If Authenticated (Good):**
```
🔍 Token check: eyJhbGciOiJIUzI1NiIs...
🔍 User data check: {"name":"John Doe","email":"john@example.com",...}
🔍 User details: {name: "John Doe", email: "john@example.com", role: "learner", hasToken: true}
```

#### **❌ If Not Authenticated (Problem):**
```
🔍 Token check: null
🔍 User data check: null
❌ No user data found
```

### **4. If Not Authenticated - Fix Steps**

#### **Option A: Register New Account**
1. Go to the registration page
2. Create a new account with a unique email
3. After registration, run the checks again

#### **Option B: Clear Data and Re-register**
```javascript
// Clear all authentication data
localStorage.removeItem('token');
localStorage.removeItem('skilllift_user');
console.log('✅ Authentication data cleared');
// Then register a new account
```

#### **Option C: Login with Existing Account**
1. Go to the login page
2. Login with existing credentials
3. Run the checks again

### **5. Test Payment After Authentication**

Once you're authenticated:
1. Browse courses
2. Select a course to purchase
3. Try the payment flow
4. Check the Network tab in dev tools for the request

### **6. Network Request Check**

If payment still fails:
1. Go to **Network** tab in dev tools
2. Try to make a payment
3. Look for the `/api/payments/initialize` request
4. Check if the **Authorization** header is present

---

**🎯 Run these checks and let me know what you see!**
