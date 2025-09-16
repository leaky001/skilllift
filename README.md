# SkillLift - Online Learning Platform

A comprehensive online learning platform built with React, Node.js, and MongoDB. SkillLift enables tutors to create and manage courses while learners can enroll, learn, and earn certificates.

## 🚀 Features

### For Tutors
- **Course Management**: Create, edit, and manage courses
- **Live Classes**: Conduct real-time online sessions
- **KYC Verification**: Complete identity verification process
- **Earnings Tracking**: Monitor course revenue and payments
- **Student Management**: Track student progress and engagement

### For Learners
- **Course Discovery**: Browse and search for courses
- **Enrollment System**: Enroll in courses with secure payments
- **Learning Progress**: Track course completion and progress
- **Certificates**: Earn certificates upon course completion
- **Live Sessions**: Join real-time learning sessions

### For Admins
- **User Management**: Approve/reject user registrations
- **Course Moderation**: Review and approve course submissions
- **KYC Verification**: Process tutor identity verification
- **Analytics Dashboard**: Monitor platform metrics
- **Payment Management**: Handle payment disputes and refunds

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Cloudinary** - Cloud storage
- **Paystack** - Payment processing
- **Nodemailer** - Email service

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SkillLift
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration
# See Environment Variables section below

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration

# Start development server
npm run dev
```

### 4. Database Setup
```bash
# Ensure MongoDB is running
mongod

# The application will automatically create collections
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/skilllift

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@skilllift.com

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=SkillLift
VITE_APP_VERSION=1.0.0

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Feature Flags
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_CERTIFICATES=true
VITE_ENABLE_MENTORSHIP=true
```

## 📁 Project Structure

```
SkillLift/
├── backend/
│   ├── config/          # Database and external service configs
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React contexts
│   │   ├── pages/       # Page components
│   │   ├── routes/      # Route definitions
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full platform access and management
- **Tutor**: Course creation and management
- **Learner**: Course enrollment and learning

### Security Features
- JWT-based authentication
- Role-based access control
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- File upload security
- CORS protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all published courses
- `POST /api/courses` - Create new course (tutor only)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (tutor only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/pending` - Get pending users (admin only)
- `PUT /api/users/:id/approve` - Approve user (admin only)

### KYC
- `POST /api/kyc/submit` - Submit KYC application
- `GET /api/kyc/status` - Get KYC status
- `GET /api/kyc/applications` - Get KYC applications (admin only)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or self-hosted MongoDB
2. Configure environment variables for production
3. Deploy to Heroku, Vercel, or your preferred platform
4. Set up SSL certificates

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables
4. Set up custom domain (optional)

## 🔧 Development

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices
- Use TypeScript for better type safety (recommended)

### Git Workflow
1. Create feature branch from main
2. Make changes and commit with descriptive messages
3. Push and create pull request
4. Code review and merge

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic course management
- User authentication
- Payment integration
- KYC verification system

---

**Note**: This is a development version. For production use, ensure all security measures are properly configured and tested.
