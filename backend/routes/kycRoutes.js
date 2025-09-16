const express = require('express');
const router = express.Router();
const {
  submitKYC,
  getKYCStatus,
  getPendingKYC,
  approveKYC,
  rejectKYC,
  getAllTutorsKYC,
  getKYCStats
} = require('../controllers/kycController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * /kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - idDocumentType
 *               - addressDocumentType
 *             properties:
 *               idDocumentType:
 *                 type: string
 *                 enum: [passport, drivers_license, national_id, other]
 *               addressDocumentType:
 *                 type: string
 *                 enum: [utility_bill, bank_statement, government_letter, other]
 *               idDocument:
 *                 type: string
 *                 format: binary
 *               addressDocument:
 *                 type: string
 *                 format: binary
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *               notes:
 *                 type: string
 */
router.post('/submit', 
  protect, 
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'addressDocument', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
  ]), 
  submitKYC
);

/**
 * @swagger
 * /kyc/status:
 *   get:
 *     summary: Get KYC status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status', protect, getKYCStatus);

/**
 * @swagger
 * /kyc/pending:
 *   get:
 *     summary: Get pending KYC submissions (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pending', protect, getPendingKYC);

/**
 * @swagger
 * /kyc/tutors:
 *   get:
 *     summary: Get all tutors with KYC status (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tutors', protect, getAllTutorsKYC);

/**
 * @swagger
 * /kyc/stats:
 *   get:
 *     summary: Get KYC statistics (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, getKYCStats);

/**
 * @swagger
 * /kyc/approve/{tutorId}:
 *   put:
 *     summary: Approve KYC (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 */
router.put('/approve/:tutorId', protect, approveKYC);

/**
 * @swagger
 * /kyc/reject/{tutorId}:
 *   put:
 *     summary: Reject KYC (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 */
router.put('/reject/:tutorId', protect, rejectKYC);

module.exports = router;
