# SkillLift Backend - Comprehensive Learning Platform

## 🚀 Overview

SkillLift is a comprehensive learning platform that connects tutors with learners, offering online and physical courses, mentorship programs, and certification systems. This backend provides a robust API for managing all aspects of the platform.

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-role system**: Admin, Tutor, Learner
- **Secure authentication** with JWT tokens
- **Account verification** and approval workflows
- **KYC verification** for tutors and learners
- **Password management** with reset capabilities

### 📚 Course Management
- **Multiple course types**: Online (prerecorded/live), Physical
- **Content management** with file uploads
- **Course approval system** for quality control
- **Preview videos** for course discovery
- **Live class scheduling** with meeting links

### 💰 Payment & Financial System
- **Paystack integration** for secure payments
- **Commission calculation** (15% platform fee)
- **Installment payment** support
- **Transaction tracking** and reporting
- **Tutor payout management**

### 🎓 Learning & Progress
- **Student enrollment** management
- **Progress tracking** (0-100%)
- **Assignment submission** and grading
- **Certificate generation** upon completion
- **Live class attendance** tracking

### 🤝 Mentorship System
- **Mentor-learner matching**
- **Session scheduling** and management
- **Progress tracking** and milestones
- **Resource sharing** and communication

### 📊 Admin Dashboard
- **Comprehensive analytics** and reporting
- **User management** and moderation
- **Content approval** workflows
- **Financial monitoring** and insights
- **Platform statistics** and trends

## 🏗️ Architecture

### Models
- **User**: Comprehensive user profiles with role-based data
- **Course**: Full course management with content and scheduling
- **Enrollment**: Student enrollment and progress tracking
- **Payment**: Payment processing and commission management
- **Transaction**: Financial transaction tracking
- **Assignment**: Course assignments and submissions
- **Certificate**: Digital certificate generation
- **Mentorship**: Mentorship program management
- **KYC**: Identity verification system
- **Rating**: Review and rating system
- **Notification**: Multi-channel notification system

### Controllers
- **Auth Controller**: Authentication and user management
- **Course Controller**: Course CRUD and approval
- **Payment Controller**: Payment processing and verification
- **Admin Controller**: Platform administration
- **Enrollment Controller**: Student enrollment management
- **Assignment Controller**: Assignment and grading system

### Middleware
- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **File Upload**: Secure file handling with validation
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation and sanitization

## 🛠️ Technology Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payment**: Paystack integration
- **Email**: Nodemailer
- **PDF Generation**: PDFKit
- **Validation**: Express-validator
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager
- Cloudinary account
- Paystack account
- Gmail account (for email notifications)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skilllift-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/skilllift
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=30d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Paystack Configuration
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
   
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Or use MongoDB Atlas for cloud hosting
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password

### Course Endpoints
- `GET /api/courses` - Get all published courses
- `POST /api/courses` - Create new course (tutors only)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (tutors only)
- `DELETE /api/courses/:id` - Delete course (tutors only)

### Payment Endpoints
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/installment` - Process installment
- `GET /api/payments/history` - Payment history

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/kyc/:id/approve` - Approve KYC
- `GET /api/admin/analytics/*` - Analytics endpoints

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password hashing** using bcrypt
- **Input validation** and sanitization
- **Role-based access control** (RBAC)
- **Rate limiting** to prevent abuse
- **File upload validation** and security
- **CORS configuration** for cross-origin requests

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── db.js             # Database connection
│   └── cloudinary.js     # Cloudinary configuration
├── controllers/           # Route controllers
│   ├── authController.js # Authentication logic
│   ├── courseController.js # Course management
│   ├── paymentController.js # Payment processing
│   └── adminController.js # Admin operations
├── middleware/            # Custom middleware
│   ├── authMiddleware.js # Authentication middleware
│   ├── uploadMiddleware.js # File upload handling
│   └── errorHandler.js   # Error handling
├── models/               # Database models
│   ├── User.js          # User model
│   ├── Course.js        # Course model
│   ├── Payment.js       # Payment model
│   └── ...              # Other models
├── routes/               # API routes
│   ├── authRoutes.js    # Authentication routes
│   ├── courseRoutes.js  # Course routes
│   ├── paymentRoutes.js # Payment routes
│   └── ...              # Other routes
├── utils/                # Utility functions
│   ├── generateToken.js # JWT token generation
│   ├── sendEmail.js     # Email functionality
│   └── ...              # Other utilities
├── uploads/              # File upload directory
├── server.js             # Main server file
└── package.json          # Dependencies
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## 📊 Database Schema

### User Model
- Basic info (name, email, phone, password)
- Role-based profiles (tutor/learner)
- Account status and verification
- Security features (login attempts, account locking)

### Course Model
- Course details and metadata
- Content management (videos, documents)
- Live class scheduling
- Pricing and enrollment tracking

### Payment Model
- Payment processing and status
- Commission calculations
- Installment management
- Refund handling

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure production email settings
5. Set up SSL certificates
6. Configure reverse proxy (Nginx)

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔧 Configuration

### Environment Variables
- **Database**: MongoDB connection string
- **JWT**: Secret key and expiration settings
- **Cloudinary**: File storage configuration
- **Paystack**: Payment gateway settings
- **Email**: SMTP configuration
- **Security**: Rate limiting and CORS settings

### Database Indexes
- User email and phone uniqueness
- Course search and filtering
- Payment reference tracking
- Enrollment performance optimization

## 📈 Performance Optimization

- **Database indexing** for fast queries
- **File compression** for uploads
- **Caching strategies** for frequently accessed data
- **Pagination** for large datasets
- **Async operations** for non-blocking requests

## 🛡️ Error Handling

- **Comprehensive error middleware**
- **Validation error handling**
- **Database error management**
- **Payment error recovery**
- **User-friendly error messages**

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced payment system
- **v1.2.0** - Advanced analytics and reporting
- **v1.3.0** - Live class and mentorship features

---

**Built with ❤️ by the SkillLift Team**
