const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SkillLift Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple courses endpoint that returns mock data
app.get('/api/courses', (req, res) => {
  const mockCourses = [
    {
      _id: '1',
      title: 'Web Development Basics',
      description: 'Learn the fundamentals of web development',
      category: 'Programming',
      price: 50,
      rating: 4.5,
      totalEnrollments: 120,
      tutor: {
        name: 'John Doe',
        profilePicture: 'https://via.placeholder.com/100'
      },
      thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Development',
      status: 'published',
      isApproved: true
    },
    {
      _id: '2',
      title: 'React Advanced',
      description: 'Master React with advanced concepts',
      category: 'Programming',
      price: 75,
      rating: 4.8,
      totalEnrollments: 89,
      tutor: {
        name: 'Jane Smith',
        profilePicture: 'https://via.placeholder.com/100'
      },
      thumbnail: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=React',
      status: 'published',
      isApproved: true
    }
  ];

  res.json({
    success: true,
    data: mockCourses,
    message: 'Courses retrieved successfully',
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1
    }
  });
});

// Simple live classes endpoint
app.get('/api/learner/live-classes', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Live classes retrieved successfully'
  });
});

// Simple assignments endpoint
app.get('/api/assignments/my-assignments', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Assignments retrieved successfully'
  });
});

// Simple notifications endpoint
app.get('/api/notifications/my-notifications', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Notifications retrieved successfully'
  });
});

// Payment endpoints
app.post('/api/payments/initialize', (req, res) => {
  const { courseId, amount, email } = req.body;
  
  // Mock payment initialization
  const mockPayment = {
    success: true,
    data: {
      reference: 'mock_ref_' + Date.now(),
      authorization_url: 'https://checkout.paystack.com/mock_checkout',
      access_code: 'mock_access_code',
      amount: amount || 5000, // Default 50 Naira in kobo
      currency: 'NGN',
      status: 'pending'
    },
    message: 'Payment initialized successfully'
  };
  
  res.json(mockPayment);
});

app.post('/api/payments/verify', (req, res) => {
  const { reference } = req.body;
  
  // Mock payment verification
  const mockVerification = {
    success: true,
    data: {
      reference: reference,
      status: 'success',
      amount: 5000,
      currency: 'NGN',
      customer: {
        email: 'test@example.com',
        name: 'Test User'
      },
      paid_at: new Date().toISOString()
    },
    message: 'Payment verified successfully'
  };
  
  res.json(mockVerification);
});

// Enrollments endpoint
app.post('/api/enrollments', (req, res) => {
  const { courseId, paymentReference } = req.body;
  
  // Mock enrollment creation
  const mockEnrollment = {
    success: true,
    data: {
      _id: 'mock_enrollment_' + Date.now(),
      course: courseId,
      learner: 'mock_learner_id',
      status: 'active',
      enrolledAt: new Date().toISOString(),
      paymentReference: paymentReference
    },
    message: 'Enrollment created successfully'
  };
  
  res.json(mockEnrollment);
});

// Reviews endpoint
app.post('/api/reviews', (req, res) => {
  const { courseId, rating, review, title } = req.body;
  
  // Mock review creation
  const mockReview = {
    success: true,
    data: {
      _id: 'mock_review_' + Date.now(),
      courseId: courseId,
      rating: rating || 5,
      review: review || 'Great course!',
      title: title || 'Excellent',
      createdAt: new Date().toISOString()
    },
    message: 'Review created successfully'
  };
  
  res.json(mockReview);
});

const PORT = 3002; // Use a different port
app.listen(PORT, () => {
  console.log(`🚀 Simple SkillLift Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
});
