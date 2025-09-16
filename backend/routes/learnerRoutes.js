const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { joinLiveClass, getLearnerLiveClasses } = require('../controllers/liveClassController');

// Apply authentication middleware to all routes
router.use(protect);

// Get learner's live classes (classes they can attend)
router.get('/live-classes', getLearnerLiveClasses);

// Join a live class
router.post('/live-classes/:id/join', joinLiveClass);

// Get learner's assignments
router.get('/assignments/my-assignments', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get courses the learner is enrolled in
    const enrollments = await Enrollment.find({ learner: userId, status: 'active' })
      .populate('course', 'title category');
    
    const courseIds = enrollments.map(enrollment => enrollment.course._id);
    
    // Get assignments for enrolled courses
    const Assignment = require('../models/Assignment');
    const assignments = await Assignment.find({
      course: { $in: courseIds }
    })
    .populate('course', 'title category')
    .populate('tutor', 'name email')
    .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching learner assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
});

module.exports = router;
