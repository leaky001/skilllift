const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// Courses
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript',
        price: 50,
        rating: 4.5,
        totalEnrollments: 120,
        tutor: { name: 'John Doe' },
        thumbnail: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Dev',
        status: 'published'
      },
      {
        _id: '2', 
        title: 'React Mastery',
        description: 'Advanced React concepts',
        price: 75,
        rating: 4.8,
        totalEnrollments: 89,
        tutor: { name: 'Jane Smith' },
        thumbnail: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=React',
        status: 'published'
      }
    ]
  });
});

// Payments
app.post('/api/payments/initialize', (req, res) => {
  res.json({
    success: true,
    data: {
      reference: 'ref_' + Date.now(),
      authorization_url: 'https://checkout.paystack.com/test',
      amount: 5000,
      status: 'pending'
    }
  });
});

app.post('/api/payments/verify', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'success',
      amount: 5000
    }
  });
});

// Other endpoints
app.get('/api/learner/live-classes', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/assignments/my-assignments', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/notifications/my-notifications', (req, res) => res.json({ success: true, data: [] }));
app.post('/api/enrollments', (req, res) => res.json({ success: true, data: { _id: 'enrollment_' + Date.now() } }));
app.post('/api/reviews', (req, res) => res.json({ success: true, data: { _id: 'review_' + Date.now() } }));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
