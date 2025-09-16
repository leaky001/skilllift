# 🔐 Admin Access Credentials

## **IMPORTANT: Keep These Credentials Secure**

The admin area is protected with secure authentication. Only use these credentials on trusted devices.

### **Admin Login Details:**
- **Email:** `admin@skilllift.com`
- **Password:** `admin123456`

### **Access Routes:**
- **Admin Login:** `/admin/login`
- **Admin Dashboard:** `/admin/dashboard`

### **Security Features:**
- ✅ Only specific email + password combination works
- ✅ Admin users are redirected to admin dashboard after login
- ✅ Regular users cannot access admin area
- ✅ Role-based access control enforced
- ✅ Secure session management

### **What Happens After Admin Login:**
1. User is authenticated with admin credentials
2. Admin role is assigned
3. User is redirected to `/admin/dashboard`
4. Access to all admin functions is granted

### **Admin Functions Available:**
- User Management (Approve/Block users)
- KYC Verification
- Payment Monitoring
- Complaint Handling
- Platform Analytics
- System Settings

---

**⚠️ Security Note:** 
- Change these credentials in production
- Use environment variables for sensitive data
- Implement rate limiting for login attempts
- Add 2FA for additional security

