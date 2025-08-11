const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/submissions/' });

const { submitAssignment, getSubmissions } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('file'), submitAssignment);
router.get('/', protect, getSubmissions);

module.exports = router;
