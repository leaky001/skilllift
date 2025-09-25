const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  upload,
  createProject,
  getTutorProjects,
  getTutorProjectSubmissions,
  getLearnerProjectSubmissions,
  getLearnerAssignedProjects,
  submitProject,
  reviewProjectSubmission,
  generateProjectCertificate,
  getLearnerCertificates
} = require('../controllers/projectController');

// Create project (tutor)
router.post('/', protect, createProject);

// Get projects for tutor
router.get('/tutor-projects', protect, getTutorProjects);

// Get project submissions for tutor
router.get('/tutor', protect, getTutorProjectSubmissions);

// Get project submissions for learner
router.get('/learner', protect, getLearnerProjectSubmissions);

// Get assigned projects for learner
router.get('/learner-assigned', protect, (req, res, next) => {
  console.log('🔍 Route /learner-assigned called');
  console.log('🔍 User:', req.user?.name, req.user?.role);
  getLearnerAssignedProjects(req, res, next);
});

// Submit project (learner)
router.post('/submit', protect, upload.any(), submitProject);

// Review project submission (tutor)
router.put('/:submissionId/review', protect, reviewProjectSubmission);

// Generate certificate for approved project (tutor)
router.post('/:submissionId/certificate', protect, generateProjectCertificate);

module.exports = router;
