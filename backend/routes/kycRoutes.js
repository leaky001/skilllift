const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/id-docs/' });

const { submitKYC, getKYCStatus } = require('../controllers/kycController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('idDocument'), submitKYC);
router.get('/status', protect, getKYCStatus);

module.exports = router;
