const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('express-async-handler');

// @desc    Search courses, learners, assignments
// @route   GET /api/search
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  try {
    const { q: query, type } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = query.trim();
    const results = [];

    // Search courses
    if (!type || type === 'tutor') {
      const courses = await Course.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } }
        ],
        tutor: req.user._id
      }).limit(5);

      courses.forEach(course => {
        results.push({
          id: course._id,
          title: course.title,
          description: course.description,
          type: 'course'
        });
      });
    }

    // Search learners (students enrolled in tutor's courses)
    if (!type || type === 'tutor') {
      const tutorCourses = await Course.find({ tutor: req.user._id }).select('_id');
      const courseIds = tutorCourses.map(course => course._id);

      const enrollments = await Enrollment.find({
        course: { $in: courseIds }
      }).populate('learner', 'name email');

      const learners = enrollments.map(enrollment => enrollment.learner);
      const uniqueLearners = learners.filter((learner, index, self) => 
        index === self.findIndex(l => l._id.toString() === learner._id.toString())
      );

      uniqueLearners.forEach(learner => {
        if (learner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            learner.email.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            id: learner._id,
            name: learner.name,
            email: learner.email,
            type: 'learner'
          });
        }
      });
    }

    // Search assignments
    if (!type || type === 'tutor') {
      const assignments = await Assignment.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ],
        tutor: req.user._id
      }).limit(5);

      assignments.forEach(assignment => {
        results.push({
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          type: 'assignment'
        });
      });
    }

    res.json({
      success: true,
      data: results.slice(0, 10) // Limit to 10 results total
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
}));

module.exports = router;
