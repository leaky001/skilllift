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
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      assignments: '/api/assignments',
      courses: '/api/courses',
      payments: '/api/payments',
      enrollments: '/api/enrollments',
      reviews: '/api/reviews',
      notifications: '/api/notifications'
    }
  });
});

// Courses endpoint
app.get('/api/courses', (req, res) => {
  const courses = [
    {
      _id: '1',
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS, and JavaScript from scratch',
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
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'React Mastery Course',
      description: 'Advanced React concepts and best practices',
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
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js',
      category: 'Programming',
      price: 60,
      rating: 4.7,
      totalEnrollments: 156,
      tutor: {
        name: 'Mike Johnson',
        profilePicture: 'https://via.placeholder.com/100'
      },
      thumbnail: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Node.js',
      status: 'published',
      isApproved: true,
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: courses,
    message: 'Courses retrieved successfully',
    pagination: {
      page: 1,
      limit: 10,
      total: courses.length,
      pages: 1
    }
  });
});

// Payment endpoints
app.post('/api/payments/initialize', (req, res) => {
  const { courseId, amount, email } = req.body;
  
  res.json({
    success: true,
    data: {
      reference: 'ref_' + Date.now(),
      authorization_url: 'https://checkout.paystack.com/test_checkout',
      access_code: 'access_code_' + Date.now(),
      amount: amount || 5000,
      currency: 'NGN',
      status: 'pending'
    },
    message: 'Payment initialized successfully'
  });
});

app.post('/api/payments/verify', (req, res) => {
  const { reference } = req.body;
  
  res.json({
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
  });
});

// Other endpoints
app.get('/api/learner/live-classes', (req, res) => {
  res.json({ success: true, data: [], message: 'Live classes retrieved successfully' });
});

app.get('/api/assignments/my-assignments', (req, res) => {
  res.json({ success: true, data: [], message: 'Assignments retrieved successfully' });
});

app.get('/api/notifications/my-notifications', (req, res) => {
  res.json({ success: true, data: [], message: 'Notifications retrieved successfully' });
});

app.post('/api/enrollments', (req, res) => {
  res.json({
    success: true,
    data: {
      _id: 'enrollment_' + Date.now(),
      course: req.body.courseId,
      learner: 'learner_id',
      status: 'active',
      enrolledAt: new Date().toISOString()
    },
    message: 'Enrollment created successfully'
  });
});

app.post('/api/reviews', (req, res) => {
  res.json({
    success: true,
    data: {
      _id: 'review_' + Date.now(),
      courseId: req.body.courseId,
      rating: req.body.rating || 5,
      review: req.body.review || 'Great course!',
      title: req.body.title || 'Excellent',
      createdAt: new Date().toISOString()
    },
    message: 'Review created successfully'
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 SkillLift Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
  console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`🎓 Enrollments: http://localhost:${PORT}/api/enrollments`);
});
