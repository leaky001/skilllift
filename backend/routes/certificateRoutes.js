const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLearnerCertificates, getTutorCertificates, generateCertificate } = require('../controllers/projectController');

// Get learner certificates
router.get('/learner', protect, getLearnerCertificates);

// Get tutor certificates
router.get('/tutor', protect, getTutorCertificates);

// Generate certificate
router.post('/', protect, generateCertificate);

module.exports = router;
