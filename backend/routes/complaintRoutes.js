const express = require('express');
const router = express.Router();
const complaintMessageController = require('../controllers/complaintMessageController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload, handleUploadError, cleanupUploads } = require('../middleware/uploadMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// ===== COMPLAINTS ROUTES =====

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private
router.post(
  '/',
  upload.array('evidence', 5),
  complaintMessageController.submitComplaint
);

// @desc    Get complaints by user
// @route   GET /api/complaints/my-complaints
// @access  Private
router.get('/my-complaints', complaintMessageController.getMyComplaints);

// @desc    Get complaint details
// @route   GET /api/complaints/:id
// @access  Private
router.get('/:id', complaintMessageController.getComplaint);

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
router.put('/:id', complaintMessageController.updateComplaint);

// @desc    Assign complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
router.put('/:id/assign', authorize('admin'), complaintMessageController.assignComplaint);

// @desc    Resolve complaint
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Admin)
router.put('/:id/resolve', authorize('admin'), complaintMessageController.resolveComplaint);

// @desc    Close complaint
// @route   PUT /api/complaints/:id/close
// @access  Private (Admin)
router.put('/:id/close', authorize('admin'), complaintMessageController.closeComplaint);

// @desc    Add admin response
// @route   POST /api/complaints/:id/response
// @access  Private (Admin)
router.post('/:id/response', authorize('admin'), complaintMessageController.addAdminResponse);

// @desc    Get complaint statistics
// @route   GET /api/complaints/statistics
// @access  Private (Admin)
router.get('/statistics', authorize('admin'), complaintMessageController.getComplaintStatistics);

module.exports = router;