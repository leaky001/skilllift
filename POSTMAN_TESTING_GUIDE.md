# SkillLift Backend - Postman Testing Guide

## 🚀 Getting Started

### 1. Environment Setup
Create a new Postman environment with these variables:
```
BASE_URL: http://localhost:5000
ADMIN_TOKEN: [will be set after admin login]
TUTOR_TOKEN: [will be set after tutor login]
LEARNER_TOKEN: [will be set after learner login]
```

### 2. Collection Structure
Create a collection called "SkillLift Backend" with these folders:
- 🔐 Authentication
- 👥 User Management
- 📚 Course Management
- 🎓 Enrollment & Progress
- 📝 Assignments
- 💰 Payments & Transactions
- 🏆 Certificates
- 🤝 Mentorship
- 📋 KYC Management
- 🔔 Notifications
- ⭐ Ratings & Reviews
- 👨‍💼 Admin Dashboard

---

## 🔐 AUTHENTICATION TESTS

### 1. Admin Registration
```
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "fullName": "Admin User",
  "email": "admin@skilllift.com",
  "password": "Admin123!",
  "phone": "+2348012345678",
  "role": "admin"
}
```

### 2. Tutor Registration
```
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "fullName": "John Tutor",
  "email": "tutor@skilllift.com",
  "password": "Tutor123!",
  "phone": "+2348012345679",
  "role": "tutor"
}
```

### 3. Learner Registration
```
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "fullName": "Jane Learner",
  "email": "learner@skilllift.com",
  "password": "Learner123!",
  "phone": "+2348012345680",
  "role": "learner"
}
```

### 4. Login (All Roles)
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@skilllift.com",
  "password": "Admin123!"
}
```

**Save the returned token to your environment variable:**
- For admin: `ADMIN_TOKEN`
- For tutor: `TUTOR_TOKEN`
- For learner: `LEARNER_TOKEN`

### 5. Get Profile
```
GET {{BASE_URL}}/api/auth/profile
Authorization: Bearer {{ADMIN_TOKEN}}
```

---

## 👥 USER MANAGEMENT TESTS

### 1. Update Profile
```
PUT {{BASE_URL}}/api/users/profile
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: application/json

{
  "fullName": "John Updated Tutor",
  "phone": "+2348012345679",
  "profilePicture": "https://example.com/photo.jpg"
}
```

### 2. Change Password
```
PUT {{BASE_URL}}/api/users/change-password
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: application/json

{
  "currentPassword": "Tutor123!",
  "newPassword": "NewTutor123!"
}
```

---

## 📋 KYC MANAGEMENT TESTS

### 1. Submit Tutor KYC
```
POST {{BASE_URL}}/api/kyc/submit
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: multipart/form-data

{
  "userType": "tutor",
  "fullName": "John Tutor",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St, Lagos",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "postalCode": "100001",
  "idType": "national_id",
  "idNumber": "1234567890",
  "idExpiryDate": "2025-12-31",
  "emergencyContact": {
    "name": "Emergency Contact",
    "phone": "+2348012345681",
    "relationship": "Spouse"
  },
  "tutorDocuments": {
    "certificate": "Bachelor's in Computer Science",
    "experience": "5 years",
    "skills": "JavaScript, React, Node.js",
    "bio": "Experienced software developer and instructor"
  },
  "idDocumentFront": [file],
  "idDocumentBack": [file],
  "certificateDocument": [file],
  "previewVideo": [file]
}
```

### 2. Submit Learner KYC (for physical classes)
```
POST {{BASE_URL}}/api/kyc/submit
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: multipart/form-data

{
  "userType": "learner",
  "fullName": "Jane Learner",
  "dateOfBirth": "2000-01-01",
  "gender": "female",
  "address": "456 Oak St, Lagos",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "postalCode": "100002",
  "idType": "national_id",
  "idNumber": "0987654321",
  "idExpiryDate": "2025-12-31",
  "emergencyContact": {
    "name": "Parent Contact",
    "phone": "+2348012345682",
    "relationship": "Parent"
  },
  "learnerDocuments": {
    "parentGuardian": "Parent Name",
    "medicalInfo": "None"
  },
  "idDocumentFront": [file],
  "idDocumentBack": [file]
}
```

### 3. Get KYC Status
```
GET {{BASE_URL}}/api/kyc/status
Authorization: Bearer {{TUTOR_TOKEN}}
```

---

## 📚 COURSE MANAGEMENT TESTS

### 1. Create Course (Tutor)
```
POST {{BASE_URL}}/api/courses
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: multipart/form-data

{
  "title": "Complete Web Development Course",
  "description": "Learn HTML, CSS, JavaScript, and React from scratch",
  "category": "Programming",
  "type": "online_pre_recorded",
  "price": 50000,
  "currency": "NGN",
  "duration": "8 weeks",
  "difficulty": "beginner",
  "prerequisites": "Basic computer knowledge",
  "learningOutcomes": "Build responsive websites, understand modern web development",
  "thumbnail": [file],
  "previewVideo": [file],
  "courseContent": [file]
}
```

### 2. Create Live Course (Tutor)
```
POST {{BASE_URL}}/api/courses
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: multipart/form-data

{
  "title": "Live JavaScript Workshop",
  "description": "Interactive live coding session",
  "category": "Programming",
  "type": "online_live",
  "price": 25000,
  "currency": "NGN",
  "duration": "2 hours",
  "liveClassDetails": {
    "startDate": "2024-02-15T10:00:00Z",
    "endDate": "2024-02-15T12:00:00Z",
    "meetingLink": "https://zoom.us/j/123456789",
    "maxParticipants": 20
  },
  "thumbnail": [file],
  "previewVideo": [file]
}
```

### 3. Get All Courses (Public)
```
GET {{BASE_URL}}/api/courses?category=Programming&type=online_pre_recorded&priceMin=10000&priceMax=100000
```

### 4. Get Course Preview
```
GET {{BASE_URL}}/api/courses/{{courseId}}/preview
```

### 5. Get Tutor's Courses
```
GET {{BASE_URL}}/api/courses/my-courses
Authorization: Bearer {{TUTOR_TOKEN}}
```

### 6. Update Course
```
PUT {{BASE_URL}}/api/courses/{{courseId}}
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: multipart/form-data

{
  "title": "Updated Web Development Course",
  "price": 60000
}
```

### 7. Publish Course
```
PUT {{BASE_URL}}/api/courses/{{courseId}}/publish
Authorization: Bearer {{TUTOR_TOKEN}}
```

---

## 🎓 ENROLLMENT & PROGRESS TESTS

### 1. Enroll in Course (Learner)
```
POST {{BASE_URL}}/api/enrollments
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "course": "{{courseId}}",
  "paymentType": "full",
  "installmentPlan": "monthly"
}
```

### 2. Get My Enrollments (Learner)
```
GET {{BASE_URL}}/api/enrollments/my-enrollments
Authorization: Bearer {{LEARNER_TOKEN}}
```

### 3. Update Progress (Learner)
```
PUT {{BASE_URL}}/api/enrollments/{{enrollmentId}}/progress
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "progress": 75,
  "currentModule": "Module 4",
  "timeSpent": 120
}
```

### 4. Complete Course (Learner)
```
PUT {{BASE_URL}}/api/enrollments/{{enrollmentId}}/complete
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "finalScore": 85,
  "completionNotes": "Great course, learned a lot!"
}
```

### 5. Get Course Enrollments (Tutor)
```
GET {{BASE_URL}}/api/enrollments/course/{{courseId}}
Authorization: Bearer {{TUTOR_TOKEN}}
```

---

## 📝 ASSIGNMENT TESTS

### 1. Create Assignment (Tutor)
```
POST {{BASE_URL}}/api/assignments
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: multipart/form-data

{
  "title": "Build a Portfolio Website",
  "description": "Create a responsive portfolio website using HTML, CSS, and JavaScript",
  "course": "{{courseId}}",
  "type": "project",
  "difficulty": "intermediate",
  "instructions": "Design a modern portfolio website with at least 3 sections",
  "dueDate": "2024-03-15T23:59:59Z",
  "totalPoints": 100,
  "passingScore": 70,
  "rubric": {
    "design": 30,
    "functionality": 40,
    "codeQuality": 30
  },
  "attachments": [file]
}
```

### 2. Submit Assignment (Learner)
```
POST {{BASE_URL}}/api/assignment-submissions
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: multipart/form-data

{
  "assignment": "{{assignmentId}}",
  "content": "I've completed the portfolio website assignment",
  "attachments": [file],
  "links": ["https://github.com/username/portfolio"]
}
```

### 3. Grade Assignment (Tutor)
```
PUT {{BASE_URL}}/api/assignment-submissions/{{submissionId}}/grade
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: application/json

{
  "score": 85,
  "feedback": "Excellent work! Great design and functionality.",
  "rubricScores": {
    "design": 28,
    "functionality": 35,
    "codeQuality": 22
  }
}
```

### 4. Get Assignment Submissions (Tutor)
```
GET {{BASE_URL}}/api/assignment-submissions/assignment/{{assignmentId}}
Authorization: Bearer {{TUTOR_TOKEN}}
```

---

## 💰 PAYMENT & TRANSACTION TESTS

### 1. Initialize Payment
```
POST {{BASE_URL}}/api/payments/initialize
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "course": "{{courseId}}",
  "paymentType": "full",
  "installmentPlan": "monthly",
  "installmentCount": 3
}
```

**Save the returned `authorizationUrl` and `reference` for verification.**

### 2. Verify Payment
```
POST {{BASE_URL}}/api/payments/verify
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "reference": "{{reference}}"
}
```

### 3. Get Payment History
```
GET {{BASE_URL}}/api/payments/history
Authorization: Bearer {{LEARNER_TOKEN}}
```

### 4. Get Tutor Payment Stats
```
GET {{BASE_URL}}/api/payments/tutor-stats
Authorization: Bearer {{TUTOR_TOKEN}}
```

### 5. Get Transactions
```
GET {{BASE_URL}}/api/transactions/my-transactions
Authorization: Bearer {{LEARNER_TOKEN}}
```

---

## 🏆 CERTIFICATE TESTS

### 1. Generate Certificate
```
POST {{BASE_URL}}/api/certificates/generate
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "enrollment": "{{enrollmentId}}",
  "paymentAmount": 1500
}
```

### 2. Get My Certificates (Learner)
```
GET {{BASE_URL}}/api/certificates/my-certificates
Authorization: Bearer {{LEARNER_TOKEN}}
```

### 3. Verify Certificate
```
GET {{BASE_URL}}/api/certificates/verify/{{verificationCode}}
```

### 4. Download Certificate
```
GET {{BASE_URL}}/api/certificates/{{certificateId}}/download
Authorization: Bearer {{LEARNER_TOKEN}}
```

---

## 🤝 MENTORSHIP TESTS

### 1. Create Mentorship Program (Tutor)
```
POST {{BASE_URL}}/api/mentorship
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: application/json

{
  "course": "{{courseId}}",
  "title": "Business Development Mentorship",
  "description": "Learn how to monetize your web development skills",
  "type": "paid",
  "price": 2000,
  "currency": "NGN",
  "goals": "Help students start freelancing",
  "objectives": "Portfolio building, client acquisition, pricing strategies",
  "expectedOutcomes": "Students will be able to start earning from their skills",
  "startDate": "2024-02-20T10:00:00Z",
  "endDate": "2024-03-20T10:00:00Z",
  "totalSessions": 8
}
```

### 2. Join Mentorship (Learner)
```
POST {{BASE_URL}}/api/mentorship/{{mentorshipId}}/join
Authorization: Bearer {{LEARNER_TOKEN}}
```

### 3. Schedule Session (Tutor)
```
PUT {{BASE_URL}}/api/mentorship/{{mentorshipId}}/sessions
Authorization: Bearer {{TUTOR_TOKEN}}
Content-Type: application/json

{
  "sessionNumber": 1,
  "date": "2024-02-22T10:00:00Z",
  "duration": 60,
  "meetingLink": "https://zoom.us/j/987654321",
  "agenda": "Portfolio review and improvement"
}
```

### 4. Get Mentorship Details
```
GET {{BASE_URL}}/api/mentorship/{{mentorshipId}}
Authorization: Bearer {{TUTOR_TOKEN}}
```

---

## 🔔 NOTIFICATION TESTS

### 1. Get Notifications
```
GET {{BASE_URL}}/api/notifications
Authorization: Bearer {{LEARNER_TOKEN}}
```

### 2. Mark as Read
```
PUT {{BASE_URL}}/api/notifications/{{notificationId}}/read
Authorization: Bearer {{LEARNER_TOKEN}}
```

### 3. Get Unread Count
```
GET {{BASE_URL}}/api/notifications/unread-count
Authorization: Bearer {{LEARNER_TOKEN}}
```

---

## ⭐ RATINGS & REVIEWS TESTS

### 1. Rate Course (Learner)
```
POST {{BASE_URL}}/api/ratings
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "ratedEntity": "{{courseId}}",
  "entityType": "course",
  "overallRating": 5,
  "detailedRatings": {
    "contentQuality": 5,
    "teachingStyle": 5,
    "communication": 4,
    "valueForMoney": 5
  },
  "title": "Excellent Web Development Course",
  "review": "This course exceeded my expectations. The instructor explains complex concepts clearly.",
  "pros": "Clear explanations, practical projects, responsive instructor",
  "cons": "Could use more advanced topics"
}
```

### 2. Rate Tutor (Learner)
```
POST {{BASE_URL}}/api/ratings
Authorization: Bearer {{LEARNER_TOKEN}}
Content-Type: application/json

{
  "ratedEntity": "{{tutorId}}",
  "entityType": "tutor",
  "overallRating": 5,
  "detailedRatings": {
    "teachingAbility": 5,
    "communication": 5,
    "responsiveness": 4,
    "knowledge": 5
  },
  "title": "Great Tutor",
  "review": "John is an excellent tutor who really knows his stuff."
}
```

### 3. Get Course Ratings
```
GET {{BASE_URL}}/api/ratings/course/{{courseId}}
```

---

## 👨‍💼 ADMIN DASHBOARD TESTS

### 1. Get Dashboard Stats
```
GET {{BASE_URL}}/api/admin/dashboard
Authorization: Bearer {{ADMIN_TOKEN}}
```

### 2. Get All Users
```
GET {{BASE_URL}}/api/admin/users?role=tutor&status=active&page=1&limit=10
Authorization: Bearer {{ADMIN_TOKEN}}
```

### 3. Update User Status
```
PUT {{BASE_URL}}/api/admin/users/{{userId}}/status
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "status": "active"
}
```

### 4. Get Pending KYC
```
GET {{BASE_URL}}/api/admin/kyc/pending
Authorization: Bearer {{ADMIN_TOKEN}}
```

### 5. Approve KYC
```
PUT {{BASE_URL}}/api/admin/kyc/{{kycId}}/approve
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "notes": "All documents verified successfully"
}
```

### 6. Get Financial Summary
```
GET {{BASE_URL}}/api/admin/financial-summary?period=monthly
Authorization: Bearer {{ADMIN_TOKEN}}
```

### 7. Get Course Analytics
```
GET {{BASE_URL}}/api/admin/course-analytics?period=monthly
Authorization: Bearer {{ADMIN_TOKEN}}
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Complete Course Flow
1. Register tutor and learner
2. Submit tutor KYC and get admin approval
3. Create course as tutor
4. Enroll learner in course
5. Create and submit assignments
6. Grade assignments
7. Complete course
8. Generate certificate

### Scenario 2: Payment Flow
1. Initialize payment for course
2. Verify payment (simulate Paystack callback)
3. Check enrollment creation
4. Verify commission calculations
5. Check tutor earnings

### Scenario 3: Live Class Flow
1. Create live course with meeting details
2. Enroll learner
3. Send reminders
4. Record session
5. Upload replay

### Scenario 4: Mentorship Flow
1. Create mentorship program
2. Join mentorship
3. Schedule sessions
4. Track progress
5. Complete mentorship

---

## 🔍 TESTING TIPS

### 1. Environment Variables
- Always use environment variables for tokens
- Update tokens after each login
- Use different emails for different test users

### 2. File Uploads
- Use small test files (under 1MB)
- Test with different file types
- Verify Cloudinary URLs are returned

### 3. Error Handling
- Test with invalid data
- Test with expired tokens
- Test with missing required fields

### 4. Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### 5. Response Validation
- Check response structure
- Verify calculated fields (commissions, totals)
- Ensure proper relationships between models

---

## 🚨 COMMON ISSUES & SOLUTIONS

### 1. Token Expired
- Re-login and update environment variable
- Check token expiration time

### 2. File Upload Fails
- Verify file size limits
- Check file type restrictions
- Ensure proper multipart/form-data

### 3. Database Connection
- Check MongoDB connection
- Verify environment variables
- Check server logs

### 4. Payment Verification
- Use test Paystack keys
- Check webhook configuration
- Verify reference format

---

## 📊 PERFORMANCE TESTING

### 1. Load Testing
- Test with multiple concurrent users
- Monitor response times
- Check database performance

### 2. File Upload Testing
- Test with large files
- Test multiple simultaneous uploads
- Monitor Cloudinary performance

### 3. Database Testing
- Test with large datasets
- Monitor query performance
- Check indexing effectiveness

---

This testing guide covers all the major features of your SkillLift backend. Start with the authentication tests and work your way through each section systematically. Remember to update your environment variables after each login and test both successful and error scenarios.
