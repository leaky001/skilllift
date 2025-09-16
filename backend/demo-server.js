const express = require('express');
const cors = require('cors');
const https = require('https');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for ratings/reviews
const ratings = [
  {
    _id: 'rating_1',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    learnerId: 'learner_1',
    learnerName: 'Sarah Johnson',
    learnerEmail: 'sarah@example.com',
    tutorId: 'tutor_1',
    tutorName: 'John Doe',
    rating: 5,
    title: 'Excellent Course!',
    review: 'This course exceeded my expectations. The instructor explains complex concepts in a simple way. Highly recommended!',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isVerified: true
  },
  {
    _id: 'rating_2',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    learnerId: 'learner_2',
    learnerName: 'Mike Chen',
    learnerEmail: 'mike@example.com',
    tutorId: 'tutor_1',
    tutorName: 'John Doe',
    rating: 4,
    title: 'Great Learning Experience',
    review: 'Very comprehensive course with practical examples. The live classes were particularly helpful.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isVerified: true
  },
  {
    _id: 'rating_3',
    courseId: '2',
    courseTitle: 'Advanced React Development',
    learnerId: 'learner_3',
    learnerName: 'Emily Davis',
    learnerEmail: 'emily@example.com',
    tutorId: 'tutor_2',
    tutorName: 'Jane Smith',
    rating: 5,
    title: 'Outstanding React Course',
    review: 'Perfect for developers looking to master React. The instructor is knowledgeable and patient.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isVerified: true
  },
  {
    _id: 'rating_4',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    learnerId: 'learner_4',
    learnerName: 'Alex Rodriguez',
    learnerEmail: 'alex@example.com',
    tutorId: 'tutor_1',
    tutorName: 'John Doe',
    rating: 3,
    title: 'Good but could be better',
    review: 'The course is good overall, but some sections could use more detailed explanations.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isVerified: true
  }
];

// In-memory storage for live classes
const liveClasses = [
  {
    _id: 'liveclass_1',
    title: 'Introduction to React Hooks',
    courseId: '1', // Approved course
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    meetingLink: 'https://zoom.us/j/123456789',
    meetingPassword: 'react123',
    tutorId: 'tutor1',
    status: 'scheduled',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'liveclass_2',
    title: 'Advanced JavaScript Concepts',
    courseId: '1', // Approved course
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    meetingLink: 'https://zoom.us/j/987654321',
    meetingPassword: 'js2024',
    tutorId: 'tutor1',
    status: 'scheduled',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'liveclass_3',
    title: 'Flutter Basics',
    courseId: '4', // Unapproved course
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    meetingLink: 'https://zoom.us/j/555666777',
    meetingPassword: 'flutter123',
    tutorId: 'tutor2',
    status: 'scheduled',
    createdAt: new Date().toISOString()
  }
];

// In-memory storage for courses (for approved course checks)
const courses = [
  {
    _id: '1',
    title: 'Complete Web Development Bootcamp',
    isApproved: true
  },
  {
    _id: '2',
    title: 'Advanced React Development',
    isApproved: true
  },
  {
    _id: '3',
    title: 'Python for Data Science',
    isApproved: true
  },
  {
    _id: '4',
    title: 'Mobile App Development with Flutter',
    isApproved: false
  }
];

// In-memory storage for live class replays (only for approved courses)
const replays = [
  {
    _id: 'replay_1',
    liveClassId: 'liveclass_1',
    courseId: '1',
    title: 'React Hooks - Part 1',
    recordingUrl: 'https://example.com/recordings/react-hooks-part1.mp4',
    duration: 45,
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'replay_2',
    liveClassId: 'liveclass_1',
    courseId: '1',
    title: 'React Hooks - Part 2',
    recordingUrl: 'https://example.com/recordings/react-hooks-part2.mp4',
    duration: 52,
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// In-memory storage for payments (in real app, use database)
const payments = [];

// In-memory storage for enrollments (in real app, use database)
const enrollments = [
  {
    _id: 'enrollment_demo_1',
    courseId: '1',
    learnerEmail: 'sandrajessbell@gmail.com',
    enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: 'active',
    progress: 25,
    paymentReference: 'demo_payment_ref_1',
    paymentAmount: 2500000, // 25000 in kobo
    course: {
      _id: '1',
      title: 'Complete Web Development Bootcamp',
      category: 'Technology',
      thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Development',
      price: 25000,
      durationInMonths: 3,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months from now
    }
  }
];

// In-memory storage for notifications (in real app, use database)
const notifications = [
  {
    _id: 'notif_1',
    userId: 'sandrajessbell@gmail.com',
    type: 'payment_confirmation',
    title: 'Payment Confirmed',
    message: 'Your payment of ₦50.00 has been confirmed successfully!',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    priority: 'high'
  },
  {
    _id: 'notif_2',
    userId: 'sandrajessbell@gmail.com',
    type: 'live_class_scheduled',
    title: 'New Live Class Scheduled',
    message: 'Introduction to React Hooks - Live class scheduled for tomorrow at 10:00 AM',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    priority: 'medium'
  },
  {
    _id: 'notif_3',
    userId: 'sandrajessbell@gmail.com',
    type: 'enrollment_confirmed',
    title: 'Enrollment Confirmed',
    message: 'You have been enrolled in Complete Web Development Bootcamp. Welcome to the course!',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    priority: 'high'
  },
  {
    _id: 'notif_4',
    userId: 'sandrajessbell@gmail.com',
    type: 'assignment_due',
    title: 'Assignment Due Soon',
    message: 'Your React Hooks assignment is due in 2 days. Don\'t forget to submit!',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    priority: 'medium'
  },
  {
    _id: 'notif_5',
    userId: 'sandrajessbell@gmail.com',
    type: 'course_update',
    title: 'Course Content Updated',
    message: 'New lessons have been added to Complete Web Development Bootcamp. Check them out!',
    courseId: '1',
    courseTitle: 'Complete Web Development Bootcamp',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    priority: 'low'
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SkillLift Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Test notifications endpoint
app.get('/test-notifications', (req, res) => {
  res.json({
    success: true,
    data: notifications,
    count: notifications.length,
    message: 'All notifications retrieved'
  });
});

// Courses endpoint
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Complete Web Development Bootcamp',
        description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build full-stack applications from scratch with hands-on projects.',
        category: 'Technology',
        price: 25000,
        rating: 4.8,
        totalEnrollments: 156,
        duration: '45 hours',
        content: [{}, {}, {}, {}, {}],
        tutor: {
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Development',
        status: 'published',
        isApproved: true,
        createdAt: new Date()
      },
      {
        _id: '2',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn SEO, social media marketing, email marketing, and content strategy to grow your business online effectively.',
        category: 'Marketing',
        price: 15000,
        rating: 4.7,
        totalEnrollments: 89,
        duration: '28 hours',
        content: [{}, {}, {}],
        tutor: {
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Marketing',
        status: 'published',
        isApproved: true,
        createdAt: new Date()
      },
      {
        _id: '3',
        title: 'Advanced JavaScript Mastery',
        description: 'Master modern JavaScript ES6+, async programming, design patterns, and advanced concepts for professional development.',
        category: 'Technology',
        price: 18000,
        rating: 4.9,
        totalEnrollments: 156,
        duration: '32 hours',
        content: [{}, {}, {}, {}],
        tutor: {
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=JavaScript',
        status: 'published',
        isApproved: true,
        createdAt: new Date()
      }
    ],
    message: 'Courses retrieved successfully'
  });
});

// Tutor courses endpoint - Get courses created by the tutor
app.get('/api/courses/tutor/my-courses', (req, res) => {
  try {
    // In a real app, you would get the tutor ID from authentication
    const tutorId = 'tutor_123'; // For demo purposes
    
    // Sample tutor courses data
    const tutorCourses = [
      {
        _id: '1',
        title: 'Complete Web Development Bootcamp',
        description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build full-stack applications from scratch with hands-on projects.',
        category: 'Technology',
        price: 25000,
        rating: 4.8,
        totalEnrollments: 156,
        duration: '45 hours',
        durationInMonths: 3,
        level: 'Beginner',
        content: [{}, {}, {}, {}, {}],
        tutor: {
          _id: tutorId,
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Development',
        status: 'published',
        isApproved: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        _id: '2',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn SEO, social media marketing, email marketing, and content strategy to grow your business online effectively.',
        category: 'Marketing',
        price: 15000,
        rating: 4.7,
        totalEnrollments: 89,
        duration: '28 hours',
        durationInMonths: 2,
        level: 'Intermediate',
        content: [{}, {}, {}],
        tutor: {
          _id: tutorId,
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Marketing',
        status: 'published',
        isApproved: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        _id: '3',
        title: 'Advanced JavaScript Mastery',
        description: 'Master modern JavaScript ES6+, async programming, design patterns, and advanced concepts for professional development.',
        category: 'Technology',
        price: 18000,
        rating: 4.9,
        totalEnrollments: 156,
        duration: '32 hours',
        durationInMonths: 2,
        level: 'Advanced',
        content: [{}, {}, {}, {}],
        tutor: {
          _id: tutorId,
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=JavaScript',
        status: 'published',
        isApproved: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        _id: '4',
        title: 'React Development Course',
        description: 'Learn React from basics to advanced concepts including hooks, context, and state management.',
        category: 'Technology',
        price: 20000,
        rating: 4.6,
        totalEnrollments: 78,
        duration: '40 hours',
        durationInMonths: 3,
        level: 'Intermediate',
        content: [{}, {}, {}, {}, {}],
        tutor: {
          _id: tutorId,
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/61DAFB/FFFFFF?text=React',
        status: 'draft',
        isApproved: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        _id: '5',
        title: 'Python for Data Science',
        description: 'Comprehensive course covering Python programming, data analysis, and machine learning basics.',
        category: 'Technology',
        price: 22000,
        rating: 4.8,
        totalEnrollments: 95,
        duration: '50 hours',
        durationInMonths: 4,
        level: 'Beginner',
        content: [{}, {}, {}, {}, {}, {}],
        tutor: {
          _id: tutorId,
          name: 'Kabir',
          profilePicture: 'https://via.placeholder.com/100'
        },
        thumbnail: 'https://via.placeholder.com/400x300/3776AB/FFFFFF?text=Python',
        status: 'pending',
        isApproved: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ];
    
    res.json({
      success: true,
      data: tutorCourses,
      message: 'Tutor courses retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor courses',
      error: error.message
    });
  }
});

// Paystack Integration

// Paystack configuration
const PAYSTACK_SECRET_KEY = 'sk_test_b9950d127d1b48b599f430284e1f1d716f538043';
const PAYSTACK_PUBLIC_KEY = 'pk_test_9d5ba0955f0e11dc4292453950a61bc326730cb7';

// Email configuration
const EMAIL_USER = 'lakybass19@gmail.com';
const EMAIL_PASS = 'zjka avyj otqe yfbm';

// Create email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Email sending function for class schedule notification
const sendClassScheduleEmail = async (learnerEmail, courseData, upcomingClasses) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: learnerEmail,
      subject: '📅 Your Class Schedule - SkillLift',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📅 Your Class Schedule</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Payment confirmed! Here are your upcoming classes</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">${courseData.title}</h2>
              <p style="color: #666; line-height: 1.6;">Your payment has been confirmed and you're now enrolled in this course!</p>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">📚 Upcoming Classes</h3>
              ${upcomingClasses.map(classItem => `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea;">
                  <h4 style="color: #333; margin: 0 0 10px 0;">${classItem.title}</h4>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">📅 Date & Time:</span>
                    <span style="color: #333; font-weight: bold;">${new Date(classItem.scheduledDate).toLocaleString()}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">⏱️ Duration:</span>
                    <span style="color: #333;">${classItem.duration} minutes</span>
                  </div>
                  <div style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-top: 10px;">
                    <p style="color: #1976d2; margin: 0; font-size: 14px;">
                      <strong>Meeting Link:</strong> <a href="${classItem.meetingLink}" style="color: #1976d2;">Join Class</a><br>
                      <strong>Password:</strong> ${classItem.meetingPassword}
                    </p>
                  </div>
                </div>
              `).join('')}
              
              ${upcomingClasses.length === 0 ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
                  <p style="color: #856404; margin: 0;">No upcoming classes scheduled yet. You'll be notified when classes are added!</p>
                </div>
              ` : ''}
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #28a745;">
              <h4 style="color: #155724; margin: 0 0 10px 0;">💡 Important Notes</h4>
              <ul style="color: #155724; margin: 0; padding-left: 20px;">
                <li>Join classes 5 minutes early to test your connection</li>
                <li>Make sure you have a stable internet connection</li>
                <li>You'll receive email reminders 24 hours before each class</li>
                <li>Recordings will be available after each live class</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Welcome to SkillLift! We're excited to have you in our community! 🎓
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Class schedule email sent successfully');
  } catch (error) {
    console.error('❌ Error sending class schedule email:', error);
  }
};

// Email sending function for payment confirmation
const sendPaymentConfirmationEmail = async (paymentData) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: paymentData.customer.email,
      subject: '🎉 Payment Confirmation - SkillLift',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your payment</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Payment Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Reference:</strong>
                <span style="color: #666;">${paymentData.reference}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Amount:</strong>
                <span style="color: #28a745; font-weight: bold;">₦${(paymentData.amount / 100).toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Currency:</strong>
                <span style="color: #666;">${paymentData.currency}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Payment Date:</strong>
                <span style="color: #666;">${new Date(paymentData.paid_at).toLocaleDateString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <strong>Status:</strong>
                <span style="color: #28a745; font-weight: bold;">✅ Successful</span>
              </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">📚 What's Next?</h3>
              <p style="margin: 0; color: #333;">
                Your payment has been verified successfully! The admin will enroll you in the course when it starts. 
                You'll receive another email notification when your enrollment is confirmed.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/learner/courses" 
                 style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View My Courses
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              <p>Thank you for choosing SkillLift! 🚀</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Payment confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
  }
};

// Function to create notifications
const createNotification = (userId, type, title, message, courseId, courseTitle, priority = 'medium') => {
  const notification = {
    _id: `notif_${Date.now()}`,
    userId: userId,
    type: type,
    title: title,
    message: message,
    courseId: courseId,
    courseTitle: courseTitle,
    isRead: false,
    createdAt: new Date().toISOString(),
    priority: priority
  };
  
  notifications.push(notification);
  return notification;
};

// Email sending function for live class notifications
const sendLiveClassNotificationEmail = async (classData, learnerEmail) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: learnerEmail,
      subject: '📚 New Live Class Scheduled - SkillLift',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📚 Live Class Scheduled!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your tutor has scheduled a new live class</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Class Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Class Title:</strong>
                <span style="color: #666;">${classData.title}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Course:</strong>
                <span style="color: #666;">${classData.courseTitle}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Date & Time:</strong>
                <span style="color: #28a745; font-weight: bold;">${new Date(classData.scheduledDate).toLocaleDateString()} at ${new Date(classData.scheduledDate).toLocaleTimeString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Duration:</strong>
                <span style="color: #666;">${classData.duration} minutes</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Meeting Link:</strong>
                <span style="color: #2196f3; font-weight: bold;">${classData.meetingLink || 'Will be provided before class'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <strong>Password:</strong>
                <span style="color: #666;">${classData.meetingPassword || 'Will be provided before class'}</span>
              </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">📝 Class Description</h3>
              <p style="margin: 0; color: #333;">${classData.description}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ Important Reminders</h3>
              <ul style="margin: 0; color: #333;">
                <li>Join the class 5 minutes early</li>
                <li>Test your audio and video beforehand</li>
                <li>Have your questions ready</li>
                <li>Check your internet connection</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/learner/live-classes" 
                 style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View All Live Classes
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              <p>See you in class! 🚀</p>
              <p>If you have any questions, please contact your tutor.</p>
            </div>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Live class notification email sent successfully');
  } catch (error) {
    console.error('❌ Error sending live class notification email:', error);
  }
};

// Payment endpoints with real Paystack integration
app.post('/api/payments/initialize', async (req, res) => {
  try {
    const { courseId, amount, email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for payment'
      });
    }

    // Calculate amounts
    const totalAmount = amount || 5000; // Amount in kobo (50 Naira)
    const commissionRate = 0.15; // 15% commission
    const commissionAmount = Math.round(totalAmount * commissionRate);
    const tutorAmount = totalAmount - commissionAmount;

    // Paystack initialization data
    const paystackData = {
      email: email,
      amount: totalAmount,
      currency: 'NGN',
      metadata: {
        courseId: courseId,
        commissionAmount: commissionAmount,
        tutorAmount: tutorAmount
      },
      callback_url: 'http://localhost:5173/payment/verify'
    };

    // Initialize Paystack payment
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const paystackResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(paystackData));
      req.end();
    });

    if (paystackResponse.status) {
      res.json({
        success: true,
        data: {
          reference: paystackResponse.data.reference,
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          amount: totalAmount,
          currency: 'NGN',
          status: 'pending',
          commissionAmount: commissionAmount,
          tutorAmount: tutorAmount
        },
        message: 'Payment initialized successfully'
      });
    } else {
      throw new Error(paystackResponse.message || 'Paystack initialization failed');
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
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
    
    console.log('🔍 Payment verification request received');
    console.log('Reference:', reference);
    console.log('Request body:', req.body);
    
    if (!reference) {
      console.log('❌ No reference provided');
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    // Verify payment with Paystack
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    };

    const paystackResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log('✅ Paystack verification response:', parsed);
            resolve(parsed);
          } catch (e) {
            console.error('❌ Error parsing Paystack response:', e);
            reject(e);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Paystack request error:', error);
        reject(error);
      });
      req.end();
    });

    console.log('🔄 Processing Paystack response:', paystackResponse);
    
    // For testing purposes, if reference starts with "TEST_", return success
    if (reference.startsWith('TEST_')) {
      console.log('🧪 Test reference detected, returning mock success');
      
      const mockPaymentData = {
        reference: reference,
        status: 'success',
        amount: 5000,
        currency: 'NGN',
        customer: {
          email: 'sandrajessbell@gmail.com', // Use the email from the logs
          name: 'Test Customer'
        },
        paid_at: new Date().toISOString(),
        metadata: {
          courseId: 'test-course-id',
          commissionAmount: 750,
          tutorAmount: 4250
        }
      };
      
      // Send payment confirmation email
      await sendPaymentConfirmationEmail(mockPaymentData);
      
      // Send class schedule email with upcoming classes
      const courseData = courses.find(c => c._id === 'test-course-id') || {
        _id: 'test-course-id',
        title: 'Complete Web Development Bootcamp'
      };
      
      const upcomingClasses = liveClasses.filter(lc => 
        lc.courseId === 'test-course-id' && 
        new Date(lc.scheduledDate) > new Date()
      );
      
      await sendClassScheduleEmail(mockPaymentData.customer.email, courseData, upcomingClasses);
      
      // Create notification for payment confirmation
      createNotification(
        'sandrajessbell@gmail.com',
        'payment_confirmation',
        'Payment Confirmed',
        `Your payment of ₦${(mockPaymentData.amount / 100).toLocaleString()} has been confirmed successfully!`,
        'test-course-id',
        'Complete Web Development Bootcamp',
        'high'
      );
      
      // Store payment for admin access
      const paymentRecord = {
        _id: `payment_${Date.now()}`,
        reference: mockPaymentData.reference,
        amount: mockPaymentData.amount,
        status: 'successful',
        paymentType: 'full',
        courseId: 'test-course-id',
        courseTitle: 'Complete Web Development Bootcamp',
        learnerEmail: 'sandrajessbell@gmail.com',
        tutorEmail: 'tutor@example.com',
        commissionAmount: mockPaymentData.commissionAmount,
        tutorAmount: mockPaymentData.tutorAmount,
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString()
      };
      payments.push(paymentRecord);
      
      return res.json({
        success: true,
        data: mockPaymentData,
        message: 'Payment verified successfully (test mode)'
      });
    }
    
    if (paystackResponse.status && paystackResponse.data.status === 'success') {
      const paymentData = paystackResponse.data;
      
      // Send payment confirmation email
      await sendPaymentConfirmationEmail(paymentData);
      
      // Send class schedule email with upcoming classes
      const courseData = courses.find(c => c._id === paymentData.metadata?.courseId) || {
        _id: paymentData.metadata?.courseId || 'unknown',
        title: paymentData.metadata?.courseTitle || 'Course'
      };
      
      const upcomingClasses = liveClasses.filter(lc => 
        lc.courseId === paymentData.metadata?.courseId && 
        new Date(lc.scheduledDate) > new Date()
      );
      
      await sendClassScheduleEmail(paymentData.customer.email, courseData, upcomingClasses);
      
      res.json({
        success: true,
        data: {
          reference: paymentData.reference,
          status: paymentData.status,
          amount: paymentData.amount,
          currency: paymentData.currency,
          customer: {
            email: paymentData.customer.email,
            name: paymentData.customer.name || 'Customer'
          },
          paid_at: paymentData.paid_at,
          metadata: paymentData.metadata
        },
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: paystackResponse.data
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Tutor dashboard endpoints
app.get('/api/tutor/dashboard/stats', (req, res) => {
  try {
    const stats = [
      { 
        title: 'Total Courses', 
        value: '5', 
        icon: 'FaBookOpen', 
        color: 'text-blue-600', 
        bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
        borderColor: 'border-blue-200',
        gradient: 'from-blue-500 to-blue-600',
        change: '+2 this month'
      },
      { 
        title: 'Upcoming Sessions', 
        value: '3', 
        icon: 'FaVideo', 
        color: 'text-emerald-600', 
        bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
        borderColor: 'border-emerald-200',
        gradient: 'from-emerald-500 to-emerald-600',
        change: 'Next in 2 hours'
      },
      { 
        title: 'Total Learners', 
        value: '574', 
        icon: 'FaUsers', 
        color: 'text-purple-600', 
        bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
        borderColor: 'border-purple-200',
        gradient: 'from-purple-500 to-purple-600',
        change: '+18 this week'
      },
      { 
        title: 'Monthly Earnings', 
        value: '₦245,000', 
        icon: 'FaDollarSign', 
        color: 'text-amber-600', 
        bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
        borderColor: 'border-amber-200',
        gradient: 'from-amber-500 to-amber-600',
        change: '+12% vs last month'
      }
    ];
    
    res.json({
      success: true,
      data: stats,
      message: 'Tutor dashboard stats retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor dashboard stats',
      error: error.message
    });
  }
});

app.get('/api/tutor/dashboard/recent-learners', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentLearners = [
      {
        id: 1,
        name: 'Muiz Abass',
        course: 'JavaScript Fundamentals',
        signupDate: 'Jan 15, 2025',
        avatar: 'MA',
        progress: 75,
        rating: 4.8
      },
      {
        id: 2,
        name: 'Mistura Rokibat',
        course: 'React Development',
        signupDate: 'Jan 14, 2025',
        avatar: 'MR',
        progress: 60,
        rating: 4.9
      },
      {
        id: 3,
        name: 'Ridwan Idris',
        course: 'Python for Beginners',
        signupDate: 'Jan 13, 2025',
        avatar: 'RI',
        progress: 45,
        rating: 4.7
      },
      {
        id: 4,
        name: 'Sarah Johnson',
        course: 'Digital Marketing',
        signupDate: 'Jan 12, 2025',
        avatar: 'SJ',
        progress: 80,
        rating: 4.6
      },
      {
        id: 5,
        name: 'Ahmed Hassan',
        course: 'Web Development',
        signupDate: 'Jan 11, 2025',
        avatar: 'AH',
        progress: 90,
        rating: 4.9
      }
    ].slice(0, limit);
    
    res.json({
      success: true,
      data: recentLearners,
      message: 'Recent learners retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching recent learners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent learners',
      error: error.message
    });
  }
});

app.get('/api/tutor/dashboard/upcoming-sessions', (req, res) => {
  try {
    const upcomingSessions = [
      {
        id: 1,
        title: 'JavaScript Fundamentals - Variables & Functions',
        date: 'JAN 25',
        time: '2:00 PM - 3:30 PM',
        learners: 24,
        status: 'ready'
      },
      {
        id: 2,
        title: 'React Development - Advanced Hooks',
        date: 'JAN 26',
        time: '10:00 AM - 12:00 PM',
        learners: 18,
        status: 'scheduled'
      },
      {
        id: 3,
        title: 'Python for Beginners - Data Types',
        date: 'JAN 27',
        time: '4:00 PM - 5:30 PM',
        learners: 31,
        status: 'scheduled'
      }
    ];
    
    res.json({
      success: true,
      data: upcomingSessions,
      message: 'Upcoming sessions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming sessions',
      error: error.message
    });
  }
});

app.get('/api/tutor/dashboard/notifications', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const notifications = [
      {
        id: 1,
        title: 'New Learner Enrolled',
        message: 'Muiz Abass joined JavaScript Fundamentals course',
        time: '2 hours ago',
        type: 'enrollment',
        read: false
      },
      {
        id: 2,
        title: 'Live Session Reminder',
        message: 'Your React Development class starts in 2 hours',
        time: '4 hours ago',
        type: 'live',
        read: false
      },
      {
        id: 3,
        title: 'Payment Received',
        message: '₦15,000 received for Python course',
        time: '1 day ago',
        type: 'payment',
        read: true
      },
      {
        id: 4,
        title: 'Course Approved',
        message: 'Your Advanced JavaScript course has been approved',
        time: '2 days ago',
        type: 'approval',
        read: true
      },
      {
        id: 5,
        title: 'New Review',
        message: 'You received a 5-star review for Web Development course',
        time: '3 days ago',
        type: 'review',
        read: false
      }
    ].slice(0, limit);
    
    res.json({
      success: true,
      data: notifications,
      message: 'Tutor notifications retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor notifications',
      error: error.message
    });
  }
});

app.get('/api/tutor/dashboard/course-performance', (req, res) => {
  try {
    const period = req.query.period || 'month';
    
    const coursePerformance = [
      {
        id: 1,
        title: 'JavaScript Fundamentals',
        learners: 89,
        completion: 78,
        rating: 4.8,
        earnings: '₦89,000'
      },
      {
        id: 2,
        title: 'React Development',
        learners: 67,
        completion: 82,
        rating: 4.9,
        earnings: '₦67,000'
      },
      {
        id: 3,
        title: 'Python for Beginners',
        learners: 45,
        completion: 71,
        rating: 4.7,
        earnings: '₦45,000'
      }
    ];
    
    res.json({
      success: true,
      data: coursePerformance,
      message: 'Course performance retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching course performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course performance',
      error: error.message
    });
  }
});

app.get('/api/tutor/dashboard/earnings', (req, res) => {
  try {
    const period = req.query.period || 'month';
    
    const earnings = {
      totalEarnings: 245000,
      monthlyEarnings: 245000,
      weeklyEarnings: 61000,
      dailyEarnings: 12450,
      currency: 'NGN',
      period: period,
      growth: 12.5,
      breakdown: {
        courseSales: 180000,
        liveSessions: 45000,
        assignments: 20000
      }
    };
    
    res.json({
      success: true,
      data: earnings,
      message: 'Tutor earnings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor earnings',
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

// Tutor assignments endpoint
app.get('/api/assignments/tutor/my-assignments', (req, res) => {
  try {
    const tutorAssignments = [
      {
        _id: 'assignment_1',
        title: 'JavaScript Fundamentals Quiz',
        courseId: '1',
        courseTitle: 'Complete Web Development Bootcamp',
        description: 'Test your understanding of JavaScript basics',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        totalSubmissions: 45,
        status: 'published',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        _id: 'assignment_2',
        title: 'React Component Building',
        courseId: '1',
        courseTitle: 'Complete Web Development Bootcamp',
        description: 'Build a reusable React component',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        maxScore: 150,
        totalSubmissions: 32,
        status: 'published',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        _id: 'assignment_3',
        title: 'Marketing Strategy Analysis',
        courseId: '2',
        courseTitle: 'Digital Marketing Fundamentals',
        description: 'Analyze a real marketing campaign',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxScore: 200,
        totalSubmissions: 28,
        status: 'published',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];
    
    res.json({
      success: true,
      data: tutorAssignments,
      message: 'Tutor assignments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor assignments',
      error: error.message
    });
  }
});

// Tutor live classes endpoint
app.get('/api/tutor/live-classes', (req, res) => {
  try {
    const tutorLiveClasses = [
      {
        _id: 'liveclass_1',
        title: 'Introduction to React Hooks',
        courseId: '1',
        courseTitle: 'Complete Web Development Bootcamp',
        description: 'Learn about useState, useEffect, and custom hooks in React',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 90,
        meetingLink: 'https://zoom.us/j/123456789',
        meetingPassword: 'react123',
        status: 'scheduled',
        attendees: 12,
        maxAttendees: 25,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        _id: 'liveclass_2',
        title: 'Advanced JavaScript Concepts',
        courseId: '3',
        courseTitle: 'Advanced JavaScript Mastery',
        description: 'Deep dive into closures, prototypes, and async programming',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 120,
        meetingLink: 'https://zoom.us/j/987654321',
        meetingPassword: 'js2025',
        status: 'scheduled',
        attendees: 18,
        maxAttendees: 30,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        _id: 'liveclass_3',
        title: 'Digital Marketing Strategy Workshop',
        courseId: '2',
        courseTitle: 'Digital Marketing Fundamentals',
        description: 'Hands-on workshop on creating effective marketing campaigns',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 150,
        meetingLink: 'https://zoom.us/j/456789123',
        meetingPassword: 'marketing',
        status: 'scheduled',
        attendees: 8,
        maxAttendees: 20,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
    
    res.json({
      success: true,
      data: tutorLiveClasses,
      message: 'Tutor live classes retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor live classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor live classes',
      error: error.message
    });
  }
});

// Get user's enrollments
app.get('/api/enrollments/my-enrollments', (req, res) => {
  try {
    // In a real app, you would get the user ID from authentication
    const userEmail = 'sandrajessbell@gmail.com'; // For demo purposes
    
    // Filter enrollments for the current user
    const userEnrollments = enrollments.filter(enrollment => 
      enrollment.learnerEmail === userEmail
    );
    
    res.json({
      success: true,
      data: userEnrollments,
      message: 'Enrollments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
});

app.get('/api/notifications/my-notifications', (req, res) => {
  // In a real app, you would get the user ID from authentication
  const userId = 'sandrajessbell@gmail.com'; // For demo purposes
  
  // Filter notifications for the current user
  const userNotifications = notifications
    .filter(notif => notif.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
  
  // Calculate unread count
  const unreadCount = userNotifications.filter(notif => !notif.isRead).length;
  
  res.json({ 
    success: true, 
    data: userNotifications,
    unreadCount: unreadCount,
    message: 'Notifications retrieved successfully' 
  });
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;
  
  const notification = notifications.find(notif => notif._id === notificationId);
  if (notification) {
    notification.isRead = true;
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
});

// Mark all notifications as read
app.put('/api/notifications/mark-all-read', (req, res) => {
  const userId = 'sandrajessbell@gmail.com'; // For demo purposes
  
  notifications.forEach(notif => {
    if (notif.userId === userId) {
      notif.isRead = true;
    }
  });
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// ===== ADMIN PAYMENT ENDPOINTS =====

// Get all payments for admin
app.get('/api/admin/payments', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { status, paymentType, startDate, endDate } = req.query;
  
  let filteredPayments = [...payments];
  
  // Apply filters
  if (status) {
    filteredPayments = filteredPayments.filter(p => p.status === status);
  }
  if (paymentType) {
    filteredPayments = filteredPayments.filter(p => p.paymentType === paymentType);
  }
  if (startDate || endDate) {
    filteredPayments = filteredPayments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      if (startDate && paymentDate < new Date(startDate)) return false;
      if (endDate && paymentDate > new Date(endDate)) return false;
      return true;
    });
  }
  
  // Sort by newest first
  filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const total = filteredPayments.length;
  const paginatedPayments = filteredPayments.slice(skip, skip + limit);
  
  res.json({
    success: true,
    data: paginatedPayments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get payment statistics for admin
app.get('/api/admin/payments/stats', (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  const filteredPayments = payments.filter(p => 
    new Date(p.createdAt) >= startDate && p.status === 'successful'
  );
  
  const stats = {
    totalPayments: filteredPayments.length,
    totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    totalCommission: filteredPayments.reduce((sum, p) => sum + p.commissionAmount, 0),
    totalTutorAmount: filteredPayments.reduce((sum, p) => sum + p.tutorAmount, 0),
    averagePayment: filteredPayments.length > 0 ? 
      filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length : 0
  };
  
  res.json({
    success: true,
    data: {
      timeframe,
      ...stats
    }
  });
});

// ===== LIVE CLASS REPLAY ENDPOINTS =====

// Upload replay for a live class (only for approved courses)
app.post('/api/tutor/live-classes/:liveClassId/replays', (req, res) => {
  try {
    const { liveClassId } = req.params;
    const { title, course, description, type, status, visibility, tags, topic, isFeatured } = req.body;
    
    if (!title || !course || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Title, course, and topic are required'
      });
    }
    
    // Find the live class
    const liveClass = liveClasses.find(lc => lc._id === liveClassId);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }
    
    // Check if course is approved (simplified check)
    const courseData = courses.find(c => c.title === course);
    if (!courseData || !courseData.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Replays can only be uploaded for approved courses'
      });
    }
    
    // Create comprehensive replay record
    const replay = {
      _id: `replay_${Date.now()}`,
      liveClassId: liveClassId,
      courseId: courseData._id,
      title: title,
      course: course,
      description: description || '',
      type: type || 'live-recording',
      status: status || 'draft',
      visibility: visibility || 'course-only',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      topic: topic,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      recordingUrl: 'https://example.com/uploaded-video.mp4', // In real app, this would be the uploaded file URL
      thumbnail: 'https://example.com/uploaded-thumbnail.jpg', // In real app, this would be the uploaded thumbnail URL
      transcript: 'https://example.com/uploaded-transcript.txt', // In real app, this would be the uploaded transcript URL
      duration: Math.floor(Math.random() * 120) + 30, // Random duration between 30-150 minutes
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} GB`,
      uploadDate: new Date().toISOString(),
      views: 0,
      likes: 0,
      accessCount: 0,
      quality: '1080p',
      subtitles: 'English'
    };
    
    replays.push(replay);
    
    console.log('✅ Replay uploaded successfully:', {
      id: replay._id,
      title: replay.title,
      course: replay.course,
      topic: replay.topic,
      type: replay.type,
      status: replay.status
    });
    
    res.json({
      success: true,
      data: replay,
      message: 'Replay uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload replay',
      error: error.message
    });
  }
});

// Get replays for a specific live class (only for approved courses)
app.get('/api/live-classes/:liveClassId/replays', (req, res) => {
  try {
    const { liveClassId } = req.params;
    
    // Find the live class
    const liveClass = liveClasses.find(lc => lc._id === liveClassId);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }
    
    // Check if course is approved
    const course = courses.find(c => c._id === liveClass.courseId);
    if (!course || !course.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Replays are only available for approved courses'
      });
    }
    
    const classReplays = replays.filter(replay => 
      replay.liveClassId === liveClassId
    );
    
    res.json({
      success: true,
      data: classReplays,
      message: 'Replays retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching replays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replays',
      error: error.message
    });
  }
});

// Get all replays for a tutor (only for approved courses)
app.get('/api/tutor/replays', (req, res) => {
  try {
    const tutorId = 'tutor_123'; // In real app, get from authentication
    
    const tutorReplays = replays.filter(replay => {
      // Only show replays for approved courses
      const course = courses.find(c => c._id === replay.courseId);
      return course && course.isApproved;
    });
    
    res.json({
      success: true,
      data: tutorReplays,
      message: 'Tutor replays retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching tutor replays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor replays',
      error: error.message
    });
  }
});

// Update replay (only title)
app.put('/api/tutor/replays/:replayId', (req, res) => {
  try {
    const { replayId } = req.params;
    const { title } = req.body;
    
    const replay = replays.find(r => r._id === replayId);
    if (!replay) {
      return res.status(404).json({
        success: false,
        message: 'Replay not found'
      });
    }
    
    if (title) replay.title = title;
    
    res.json({
      success: true,
      data: replay,
      message: 'Replay updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update replay',
      error: error.message
    });
  }
});

// Delete replay
app.delete('/api/tutor/replays/:replayId', (req, res) => {
  try {
    const { replayId } = req.params;
    
    const replayIndex = replays.findIndex(r => r._id === replayId);
    if (replayIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Replay not found'
      });
    }
    
    replays.splice(replayIndex, 1);
    
    res.json({
      success: true,
      message: 'Replay deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete replay',
      error: error.message
    });
  }
});

// ===== RATING/REVIEW ENDPOINTS =====

// Get all ratings for a specific course
app.get('/api/courses/:courseId/ratings', (req, res) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter ratings by course
    const courseRatings = ratings.filter(rating => 
      rating.courseId === courseId && rating.isVerified
    );
    
    // Sort by newest first
    courseRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = courseRatings.length;
    const paginatedRatings = courseRatings.slice(skip, skip + limit);
    
    // Calculate average rating
    const averageRating = courseRatings.length > 0 ? 
      courseRatings.reduce((sum, r) => sum + r.rating, 0) / courseRatings.length : 0;
    
    // Count ratings by star
    const ratingCounts = {
      5: courseRatings.filter(r => r.rating === 5).length,
      4: courseRatings.filter(r => r.rating === 4).length,
      3: courseRatings.filter(r => r.rating === 3).length,
      2: courseRatings.filter(r => r.rating === 2).length,
      1: courseRatings.filter(r => r.rating === 1).length
    };
    
    res.json({
      success: true,
      data: {
        ratings: paginatedRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: total,
        ratingCounts: ratingCounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Course ratings retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching course ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course ratings',
      error: error.message
    });
  }
});

// Get all ratings for a specific tutor
app.get('/api/tutors/:tutorId/ratings', (req, res) => {
  try {
    const { tutorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter ratings by tutor
    const tutorRatings = ratings.filter(rating => 
      rating.tutorId === tutorId && rating.isVerified
    );
    
    // Sort by newest first
    tutorRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = tutorRatings.length;
    const paginatedRatings = tutorRatings.slice(skip, skip + limit);
    
    // Calculate average rating
    const averageRating = tutorRatings.length > 0 ? 
      tutorRatings.reduce((sum, r) => sum + r.rating, 0) / tutorRatings.length : 0;
    
    res.json({
      success: true,
      data: {
        ratings: paginatedRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Tutor ratings retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching tutor ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor ratings',
      error: error.message
    });
  }
});

// Create a new rating/review
app.post('/api/ratings', (req, res) => {
  try {
    const { courseId, tutorId, rating, title, review, learnerId, learnerName, learnerEmail } = req.body;
    
    // Validate required fields
    if (!courseId || !tutorId || !rating || !title || !review) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, tutor ID, rating, title, and review are required'
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if learner already rated this course
    const existingRating = ratings.find(r => 
      r.courseId === courseId && r.learnerEmail === learnerEmail
    );
    
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this course'
      });
    }
    
    // Find course and tutor names
    const course = courses.find(c => c._id === courseId);
    const tutorName = 'John Doe'; // In real app, get from user data
    
    // Create new rating
    const newRating = {
      _id: `rating_${Date.now()}`,
      courseId: courseId,
      courseTitle: course ? course.title : 'Unknown Course',
      learnerId: learnerId || `learner_${Date.now()}`,
      learnerName: learnerName || 'Anonymous',
      learnerEmail: learnerEmail || 'anonymous@example.com',
      tutorId: tutorId,
      tutorName: tutorName,
      rating: parseInt(rating),
      title: title,
      review: review,
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    
    ratings.push(newRating);
    
    res.json({
      success: true,
      data: newRating,
      message: 'Rating submitted successfully'
    });
    
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rating',
      error: error.message
    });
  }
});

// Update a rating/review
app.put('/api/ratings/:ratingId', (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, title, review } = req.body;
    
    const ratingIndex = ratings.findIndex(r => r._id === ratingId);
    if (ratingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Update rating fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      ratings[ratingIndex].rating = parseInt(rating);
    }
    
    if (title) ratings[ratingIndex].title = title;
    if (review) ratings[ratingIndex].review = review;
    
    res.json({
      success: true,
      data: ratings[ratingIndex],
      message: 'Rating updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rating',
      error: error.message
    });
  }
});

// Delete a rating/review
app.delete('/api/ratings/:ratingId', (req, res) => {
  try {
    const { ratingId } = req.params;
    
    const ratingIndex = ratings.findIndex(r => r._id === ratingId);
    if (ratingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    ratings.splice(ratingIndex, 1);
    
    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
});

// Get learner's ratings
app.get('/api/learner/ratings', (req, res) => {
  try {
    const learnerEmail = 'sandrajessbell@gmail.com'; // In real app, get from authentication
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter ratings by learner
    const learnerRatings = ratings.filter(rating => 
      rating.learnerEmail === learnerEmail
    );
    
    // Sort by newest first
    learnerRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = learnerRatings.length;
    const paginatedRatings = learnerRatings.slice(skip, skip + limit);
    
    res.json({
      success: true,
      data: {
        ratings: paginatedRatings,
        totalRatings: total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Learner ratings retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching learner ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learner ratings',
      error: error.message
    });
  }
});

app.post('/api/enrollments', async (req, res) => {
  try {
    const { courseId, paymentReference, email } = req.body;
    
    if (!courseId || !paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and payment reference are required'
      });
    }

    // Verify payment first
    const verifyOptions = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${paymentReference}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    };

    const paystackResponse = await new Promise((resolve, reject) => {
      const req = https.request(verifyOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    if (paystackResponse.status && paystackResponse.data.status === 'success') {
      // Payment verified, create enrollment for enrolled learners
      const enrollment = {
        _id: `enrollment_${Date.now()}`,
        courseId: courseId,
        learnerEmail: email,
        enrolledAt: new Date(),
        status: 'active',
        progress: 0,
        paymentReference: paymentReference,
        paymentAmount: paystackResponse.data.amount,
        course: {
          _id: courseId,
          title: 'Complete Web Development Bootcamp',
          category: 'Technology',
          thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Development',
          price: 25000,
          durationInMonths: 3,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months from now
        }
      };
      
      // Store enrollment in memory
      enrollments.push(enrollment);
      
      // Create enrollment notification
      createNotification(
        email,
        'enrollment_confirmed',
        'Enrollment Confirmed',
        'You have been enrolled in the course. Welcome!',
        courseId,
        'Complete Web Development Bootcamp',
        'high'
      );
      
      // Store payment for admin access
      const paymentRecord = {
        _id: `payment_${Date.now()}`,
        reference: paymentReference,
        amount: paystackResponse.data.amount,
        status: 'successful',
        paymentType: 'full',
        courseId: courseId,
        courseTitle: 'Complete Web Development Bootcamp',
        learnerEmail: email,
        tutorEmail: 'tutor@example.com',
        commissionAmount: paystackResponse.data.metadata?.commissionAmount || 0,
        tutorAmount: paystackResponse.data.metadata?.tutorAmount || 0,
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString()
      };
      payments.push(paymentRecord);
      
      res.json({
        success: true,
        data: {
          enrollment: enrollment,
          paymentVerified: true,
          paymentReference: paymentReference,
          paymentAmount: paystackResponse.data.amount,
          commissionAmount: paystackResponse.data.metadata?.commissionAmount || 0,
          tutorAmount: paystackResponse.data.metadata?.tutorAmount || 0,
          message: 'Payment verified and enrollment created successfully!'
        },
        message: 'Enrollment created successfully.'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Cannot create enrollment.',
        error: 'Payment not verified'
      });
    }

  } catch (error) {
    console.error('Enrollment creation error:', error);
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

// Live class creation endpoint
app.post('/api/live-classes', async (req, res) => {
  try {
    const { title, description, courseId, courseTitle, scheduledDate, duration, meetingLink, meetingPassword, tutorId } = req.body;
    
    // Create live class
    const liveClass = {
      _id: `liveclass_${Date.now()}`,
      title: title,
      description: description,
      courseId: courseId,
      courseTitle: courseTitle,
      scheduledDate: scheduledDate,
      duration: duration,
      meetingLink: meetingLink,
      meetingPassword: meetingPassword,
      tutorId: tutorId,
      status: 'scheduled',
      createdAt: new Date(),
      replays: [] // Initialize replays array
    };
    
    // Simulate enrolled learners (in real app, fetch from database)
    const enrolledLearners = [
      'sandrajessbell@gmail.com',
      'learner2@example.com',
      'learner3@example.com'
    ];
    
    // Send email notifications to all enrolled learners
    for (const learnerEmail of enrolledLearners) {
      await sendLiveClassNotificationEmail(liveClass, learnerEmail);
      
      // Create notification for live class
      createNotification(
        learnerEmail,
        'live_class_scheduled',
        'New Live Class Scheduled',
        `${liveClass.title} - Live class scheduled for ${new Date(liveClass.scheduledDate).toLocaleDateString()} at ${new Date(liveClass.scheduledDate).toLocaleTimeString()}`,
        liveClass.courseId,
        liveClass.courseTitle,
        'medium'
      );
    }
    
    res.json({
      success: true,
      data: liveClass,
      message: 'Live class created and notifications sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating live class',
      error: error.message
    });
  }
});

// Get live classes for a specific course (for enrolled learners)
app.get('/api/courses/:courseId/live-classes', (req, res) => {
  const { courseId } = req.params;
  
  // Mock live classes data for the course
  const liveClasses = [
    {
      _id: 'liveclass_1',
      title: 'Introduction to React Hooks',
      description: 'Learn about useState, useEffect, and custom hooks in React',
      courseId: courseId,
      courseTitle: 'Complete Web Development Bootcamp',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      duration: 90,
      meetingLink: 'https://zoom.us/j/123456789',
      meetingPassword: 'react123',
      tutorId: 'tutor1',
      tutorName: 'Kabir',
      status: 'scheduled',
      attendees: 12,
      maxAttendees: 25,
      createdAt: new Date().toISOString(),
      replays: [
        {
          replayId: 'replay_1',
          title: 'React Hooks - Part 1',
          url: 'https://example.com/recordings/react-hooks-part1.mp4',
          duration: 45,
          uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          replayId: 'replay_2',
          title: 'React Hooks - Part 2',
          url: 'https://example.com/recordings/react-hooks-part2.mp4',
          duration: 52,
          uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      _id: 'liveclass_2',
      title: 'Advanced JavaScript Concepts',
      description: 'Deep dive into closures, prototypes, and async programming',
      courseId: courseId,
      courseTitle: 'Complete Web Development Bootcamp',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      duration: 120,
      meetingLink: 'https://zoom.us/j/987654321',
      meetingPassword: 'js2024',
      tutorId: 'tutor1',
      tutorName: 'Kabir',
      status: 'scheduled',
      attendees: 8,
      maxAttendees: 25,
      createdAt: new Date().toISOString(),
      replays: [
        {
          replayId: 'replay_3',
          title: 'ES6+ Features',
          url: 'https://example.com/recordings/es6-features.mp4',
          duration: 38,
          uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      _id: 'liveclass_3',
      title: 'Project Building Session',
      description: 'Build a complete todo app using React and Node.js',
      courseId: courseId,
      courseTitle: 'Complete Web Development Bootcamp',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      duration: 180,
      meetingLink: 'https://zoom.us/j/555666777',
      meetingPassword: 'project123',
      tutorId: 'tutor1',
      tutorName: 'Kabir',
      status: 'scheduled',
      attendees: 15,
      maxAttendees: 25,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: liveClasses,
    message: 'Live classes retrieved successfully'
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
