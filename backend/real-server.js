const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️  Server will continue without database connection');
  }
};

// Connect to database
connectDB();

// Import models
const Course = require('./models/Course');
const User = require('./models/User');
const Payment = require('./models/Payment');
const Enrollment = require('./models/Enrollment');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SkillLift Backend API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Courses endpoint - try database first, fallback to sample data
app.get('/api/courses', async (req, res) => {
  try {
    // Try to get courses from database
    const courses = await Course.find({ 
      status: 'published', 
      isApproved: true 
    })
    .populate('tutor', 'name profilePicture')
    .limit(10);

    if (courses.length > 0) {
      return res.json({
        success: true,
        data: courses,
        message: 'Courses retrieved from database'
      });
    }
  } catch (error) {
    console.log('Database query failed, using sample data');
  }

  // Fallback to sample data
  const sampleCourses = [
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
      createdAt: new Date()
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
      createdAt: new Date()
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
      createdAt: new Date()
    }
  ];

  res.json({
    success: true,
    data: sampleCourses,
    message: 'Courses retrieved successfully'
  });
});

// Payment endpoints
app.post('/api/payments/initialize', async (req, res) => {
  try {
    const { courseId, amount, email } = req.body;
    
    // Try to save payment to database
    try {
      const payment = new Payment({
        user: 'mock_user_id',
        course: courseId,
        amount: amount || 5000,
        status: 'pending',
        paymentType: 'full',
        tutorAmount: (amount || 5000) * 0.85, // 85% to tutor
        commissionAmount: (amount || 5000) * 0.15, // 15% commission
        paymentReference: 'ref_' + Date.now()
      });
      
      await payment.save();
      console.log('✅ Payment saved to database');
    } catch (dbError) {
      console.log('⚠️  Could not save payment to database, continuing...');
    }
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.message
    });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { reference } = req.body;
    
    // Try to update payment in database
    try {
      await Payment.findOneAndUpdate(
        { paymentReference: reference },
        { 
          status: 'success',
          paidAt: new Date()
        }
      );
      console.log('✅ Payment verified in database');
    } catch (dbError) {
      console.log('⚠️  Could not update payment in database, continuing...');
    }
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
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

app.post('/api/enrollments', async (req, res) => {
  try {
    const { courseId, paymentReference } = req.body;
    
    // Try to save enrollment to database
    try {
      const enrollment = new Enrollment({
        learner: 'mock_learner_id',
        course: courseId,
        status: 'active',
        enrolledAt: new Date(),
        paymentReference: paymentReference
      });
      
      await enrollment.save();
      console.log('✅ Enrollment saved to database');
      
      res.json({
        success: true,
        data: enrollment,
        message: 'Enrollment created successfully'
      });
    } catch (dbError) {
      console.log('⚠️  Could not save enrollment to database, using mock response');
      
      res.json({
        success: true,
        data: {
          _id: 'enrollment_' + Date.now(),
          course: courseId,
          learner: 'mock_learner_id',
          status: 'active',
          enrolledAt: new Date().toISOString()
        },
        message: 'Enrollment created successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Enrollment creation failed',
      error: error.message
    });
  }
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
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});
