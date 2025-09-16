# 🚀 Frontend-Backend API Integration Guide

## Overview
This guide explains how the SkillLift frontend is now connected to the backend API, enabling full functionality across all features.

## 📁 Service Structure

### Core API Configuration
- **`src/services/api.js`** - Main axios instance with interceptors
- **`src/config/config.js`** - Application configuration and endpoints
- **`src/services/authService.js`** - Authentication and user management
- **`src/services/userService.js`** - User operations (admin)
- **`src/services/kycService.js`** - KYC verification management
- **`src/services/assignmentService.js`** - Assignment management
- **`src/services/paymentService.js`** - Payment processing

## 🔧 Backend API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `PUT /auth/change-password` - Change password
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Email verification
- `POST /auth/refresh-token` - Refresh token

### Users (`/api/users`)
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (admin)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin)
- `PATCH /users/:id/role` - Update user role (admin)
- `PATCH /users/:id/status` - Toggle user status (admin)
- `GET /users/stats` - User statistics (admin)
- `GET /users/search` - Search users (admin)
- `POST /users/bulk-update` - Bulk operations (admin)
- `GET /users/export` - Export users (admin)

### KYC (`/api/kyc`)
- `POST /kyc/submit` - Submit KYC application
- `GET /kyc/status` - Get KYC status
- `GET /kyc/details` - Get KYC details
- `PUT /kyc/update` - Update KYC information
- `POST /kyc/upload-documents` - Upload documents
- `GET /kyc/applications` - Get all applications (admin)
- `POST /kyc/applications/:id/approve` - Approve KYC (admin)
- `POST /kyc/applications/:id/reject` - Reject KYC (admin)
- `GET /kyc/stats` - KYC statistics (admin)

### Assignments (`/api/assignments`)
- `GET /assignments` - Get all assignments
- `GET /assignments/:id` - Get assignment by ID
- `POST /assignments` - Create assignment (tutor)
- `PUT /assignments/:id` - Update assignment (tutor)
- `DELETE /assignments/:id` - Delete assignment (tutor)
- `POST /assignments/:id/publish` - Publish assignment (tutor)
- `POST /assignments/:id/unpublish` - Unpublish assignment (tutor)
- `GET /assignments/:id/submissions` - Get submissions (tutor)
- `POST /assignments/submissions/:id/grade` - Grade submission (tutor)

### Payments (`/api/payments`)
- `POST /payments/initialize` - Initialize payment
- `POST /payments/verify` - Verify payment
- `GET /payments/history` - Payment history
- `GET /payments/stats` - Payment statistics
- `POST /payments/:id/refund` - Request refund
- `GET /payments/all` - All payments (admin)
- `GET /payments/analytics` - Payment analytics (admin)

### Courses (`/api/courses`)
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses/:id/enroll` - Enroll in course
- `POST /courses/:id/unenroll` - Unenroll from course
- `GET /courses/:id/progress` - Get course progress
- `GET /courses/:id/content` - Get course content

### Enrollments (`/api/enrollments`)
- `GET /enrollments` - Get all enrollments
- `GET /enrollments/user` - Get user enrollments
- `GET /enrollments/:id` - Get enrollment by ID
- `PUT /enrollments/:id/progress` - Update progress

### Certificates (`/api/certificates`)
- `GET /certificates` - Get all certificates
- `GET /certificates/user` - Get user certificates
- `GET /certificates/:id` - Get certificate by ID
- `POST /certificates/generate` - Generate certificate
- `GET /certificates/:id/download` - Download certificate

### Notifications (`/api/notifications`)
- `GET /notifications` - Get all notifications
- `GET /notifications/user` - Get user notifications
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `GET /notifications/preferences` - Get preferences
- `PUT /notifications/preferences` - Update preferences

### Ratings (`/api/ratings`)
- `GET /ratings` - Get all ratings
- `GET /ratings/course/:id` - Get course ratings
- `GET /ratings/user` - Get user ratings
- `POST /ratings` - Add rating
- `PUT /ratings/:id` - Update rating
- `DELETE /ratings/:id` - Delete rating

### Mentorship (`/api/mentorship`)
- `GET /mentorship` - Get all mentorship
- `GET /mentorship/user` - Get user mentorship
- `GET /mentorship/requests` - Get mentorship requests
- `POST /mentorship/apply` - Apply for mentorship
- `POST /mentorship/:id/accept` - Accept request
- `POST /mentorship/:id/reject` - Reject request

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=SkillLift
VITE_DEBUG_MODE=true
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📱 Usage Examples

### Authentication
```javascript
import { authService } from '../services/authService';

// Login
try {
  const result = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Login successful:', result);
} catch (error) {
  console.error('Login failed:', error);
}

// Check authentication
if (authService.isAuthenticated()) {
  const user = authService.getStoredUser();
  console.log('Current user:', user);
}
```

### KYC Management
```javascript
import { kycService } from '../services/kycService';

// Submit KYC
try {
  const result = await kycService.submitKYC({
    fullName: 'John Doe',
    dateOfBirth: '1990-01-01',
    nationality: 'Nigerian',
    idType: 'passport',
    idNumber: 'A12345678'
  });
  console.log('KYC submitted:', result);
} catch (error) {
  console.error('KYC submission failed:', error);
}

// Get KYC status
const status = await kycService.getKYCStatus();
console.log('KYC Status:', status);
```

### Assignment Management
```javascript
import { assignmentService } from '../services/assignmentService';

// Create assignment
try {
  const assignment = await assignmentService.createAssignment({
    title: 'JavaScript Fundamentals',
    description: 'Learn basic JavaScript concepts',
    course: 'course_id_here',
    dueDate: '2024-02-01',
    maxScore: 100,
    requirements: ['Basic HTML knowledge', 'Text editor']
  });
  console.log('Assignment created:', assignment);
} catch (error) {
  console.error('Assignment creation failed:', error);
}

// Get assignments for a course
const assignments = await assignmentService.getCourseAssignments('course_id_here');
console.log('Course assignments:', assignments);
```

### Payment Processing
```javascript
import { paymentService } from '../services/paymentService';

// Initialize payment
try {
  const payment = await paymentService.initializePayment({
    amount: 50000, // Amount in kobo (₦500)
    email: 'user@example.com',
    reference: 'unique_reference',
    callback_url: 'https://yourdomain.com/payment/callback',
    metadata: {
      courseId: 'course_id_here',
      userId: 'user_id_here'
    }
  });
  console.log('Payment initialized:', payment);
} catch (error) {
  console.error('Payment initialization failed:', error);
}

// Verify payment
const verification = await paymentService.verifyPayment('payment_reference');
console.log('Payment verification:', verification);
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage in localStorage
- Automatic logout on token expiration

### Error Handling
- Centralized error handling
- User-friendly error messages
- Automatic retry for network errors
- Graceful degradation

### Request/Response Interceptors
- Automatic token injection
- Error response handling
- Request/response logging (development)
- CORS handling

## 📊 Data Flow

1. **User Action** → Component calls service method
2. **Service Method** → Makes API call using apiService
3. **API Service** → Adds auth headers and makes HTTP request
4. **Backend** → Processes request and returns response
5. **Response** → Handled by interceptors for errors
6. **Success** → Data returned to component for UI update

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:5000/health
```

### API Endpoint Test
```bash
# Test authentication endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend origin
   - Check `CORS_ORIGIN` environment variable

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure proper Authorization header format

3. **Network Errors**
   - Verify backend is running on correct port
   - Check firewall settings
   - Ensure proper network configuration

4. **API Endpoint Not Found**
   - Verify route is properly registered in backend
   - Check route file exists and is exported
   - Ensure proper middleware order

### Debug Mode
Enable debug mode in frontend:
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📈 Performance Optimization

### Caching
- Implement response caching for static data
- Use localStorage for user preferences
- Cache frequently accessed data

### Lazy Loading
- Load services only when needed
- Implement code splitting for large components
- Use React.lazy for route components

### Error Boundaries
- Implement React error boundaries
- Graceful error handling
- User-friendly error messages

## 🔮 Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live notifications
   - Real-time chat in live sessions
   - Live progress updates

2. **Offline Support**
   - Service Worker implementation
   - Offline data caching
   - Sync when online

3. **Advanced Analytics**
   - User behavior tracking
   - Performance metrics
   - A/B testing support

4. **Mobile App**
   - React Native conversion
   - Push notifications
   - Native device features

## 📚 Additional Resources

- [Axios Documentation](https://axios-http.com/)
- [React Query for Server State](https://tanstack.com/query)
- [JWT Authentication](https://jwt.io/)
- [Paystack API Documentation](https://paystack.com/docs/)

---

**Note**: This integration provides a solid foundation for a production-ready application. Ensure to implement proper testing, monitoring, and security measures before deployment.
