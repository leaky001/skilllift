const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireKYCApproval } = require('../middleware/roleMiddleware');
const { getLearnerCertificates, getTutorCertificates, generateCertificate } = require('../controllers/projectController');

// Get learner certificates
router.get('/learner', protect, getLearnerCertificates);

// Get tutor certificates
router.get('/tutor', protect, authorize('tutor'), getTutorCertificates);

// Generate certificate - Require KYC approval for tutors
router.post('/', protect, authorize(['tutor', 'admin']), requireKYCApproval, generateCertificate);

module.exports = router;
