const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendKYCApprovalEmail, sendKYCRejectionEmail } = require('../utils/sendEmail');
const { upload } = require('../middleware/uploadMiddleware');

// Helper function to get admin user ID
const getAdminUserId = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('_id');
    return admin ? admin._id : null;
  } catch (error) {
    console.error('Error finding admin user:', error);
    return null;
  }
};

// @desc    Submit KYC documents
// @route   POST /api/kyc/submit
// @access  Private (Tutor only)
exports.submitKYC = asyncHandler(async (req, res) => {
  const { idDocumentType, addressDocumentType, notes } = req.body;
  
  // Check if user is a tutor
  if (req.user.role !== 'tutor') {
    return res.status(403).json({
      success: false,
      message: 'Only tutors can submit KYC documents'
    });
  }

  // Check if KYC is already submitted or approved
  if (req.user.tutorProfile?.kycStatus === 'submitted' || 
      req.user.tutorProfile?.kycStatus === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'KYC documents already submitted or approved'
    });
  }

  // Validate required fields
  if (!idDocumentType || !addressDocumentType) {
    return res.status(400).json({
      success: false,
      message: 'ID document type and address document type are required'
    });
  }

  // Handle file uploads
  const documents = {};
  
  if (req.files) {
    if (req.files.idDocument) {
      // Normalize path: convert backslashes to forward slashes for cross-platform compatibility
      documents.idDocument = req.files.idDocument[0].path.replace(/\\/g, '/');
    }
    if (req.files.addressDocument) {
      // Normalize path: convert backslashes to forward slashes for cross-platform compatibility
      documents.addressDocument = req.files.addressDocument[0].path.replace(/\\/g, '/');
    }
    if (req.files.profilePhoto) {
      // Normalize path: convert backslashes to forward slashes for cross-platform compatibility
      documents.profilePhoto = req.files.profilePhoto[0].path.replace(/\\/g, '/');
    }
  }

  // Add document types and notes
  documents.idDocumentType = idDocumentType;
  documents.addressDocumentType = addressDocumentType;
  documents.notes = notes;

  // Submit KYC
  await req.user.submitKYC(documents);

  // Create notification for admin
  try {
    const adminUserId = await getAdminUserId();
    if (adminUserId) {
        await Notification.create({
          recipient: adminUserId,
          type: 'kyc_submission',
          title: 'New KYC Submission',
          message: `${req.user.name} has submitted KYC documents for verification.`,
          data: { 
            tutorId: req.user._id,
            tutorName: req.user.name,
            tutorEmail: req.user.email
          }
        });
    }
  } catch (notificationError) {
    console.error('Admin notification creation failed:', notificationError.message);
    // Don't crash the KYC submission - just log the error
  }

  res.json({
    success: true,
    message: 'KYC documents submitted successfully. Please wait for admin review.',
    data: {
      kycStatus: req.user.tutorProfile.kycStatus,
      submittedAt: req.user.tutorProfile.kycDocuments.submittedAt
    }
  });
});

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
exports.getKYCStatus = asyncHandler(async (req, res) => {
  const kycStatus = req.user.getKYCStatus();
  
  res.json({
    success: true,
    data: {
      kycStatus,
      canCreateCourses: req.user.canCreateCourses(),
      canReceivePayments: req.user.canReceivePayments(),
      documents: req.user.role === 'tutor' ? req.user.tutorProfile?.kycDocuments : null
    }
  });
});

// @desc    Get all pending KYC submissions (Admin only)
// @route   GET /api/kyc/pending
// @access  Private (Admin only)
exports.getPendingKYC = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const pendingTutors = await User.find({
    role: 'tutor',
    'tutorProfile.kycStatus': 'submitted'
  }).select('name email phone tutorProfile createdAt')
    .sort({ 'tutorProfile.kycDocuments.submittedAt': 1 });

  res.json({
    success: true,
    data: pendingTutors
  });
});

// @desc    Approve KYC (Admin only)
// @route   PUT /api/kyc/approve/:tutorId
// @access  Private (Admin only)
exports.approveKYC = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { tutorId } = req.params;
  const { notes } = req.body;

  const tutor = await User.findById(tutorId);
  
  if (!tutor) {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  if (tutor.role !== 'tutor') {
    return res.status(400).json({
      success: false,
      message: 'User is not a tutor'
    });
  }

  if (tutor.tutorProfile?.kycStatus !== 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'KYC is not in submitted status'
    });
  }

  await tutor.approveKYC(req.user._id, notes);

  // Create notification for tutor
  await Notification.create({
    recipient: tutor._id,
    sender: req.user._id,
    type: 'kyc_approval',
    title: 'KYC Verification Approved',
    message: 'Congratulations! Your KYC verification has been approved. You can now create courses and receive payments.',
    isRead: false,
    priority: 'high'
  });

  // Send email notification to tutor
  try {
    await sendKYCApprovalEmail(tutor);
    console.log('✅ KYC approval email sent to:', tutor.email);
  } catch (emailError) {
    console.error('❌ Failed to send KYC approval email:', emailError.message);
    // Don't fail the approval if email fails
  }

  res.json({
    success: true,
    message: 'KYC approved successfully',
    data: {
      tutorId: tutor._id,
      tutorName: tutor.name,
      kycStatus: tutor.tutorProfile.kycStatus,
      approvedAt: tutor.tutorProfile.kycDocuments.reviewedAt
    }
  });
});

// @desc    Reject KYC (Admin only)
// @route   PUT /api/kyc/reject/:tutorId
// @access  Private (Admin only)
exports.rejectKYC = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { tutorId } = req.params;
  const { reason, notes } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required'
    });
  }

  const tutor = await User.findById(tutorId);
  
  if (!tutor) {
    return res.status(404).json({
      success: false,
      message: 'Tutor not found'
    });
  }

  if (tutor.role !== 'tutor') {
    return res.status(400).json({
      success: false,
      message: 'User is not a tutor'
    });
  }

  if (tutor.tutorProfile?.kycStatus !== 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'KYC is not in submitted status'
    });
  }

  await tutor.rejectKYC(req.user._id, reason, notes);

  // Create notification for tutor
  await Notification.create({
    recipient: tutor._id,
    sender: req.user._id,
    type: 'kyc_rejection',
    title: 'KYC Verification Rejected',
    message: `Your KYC verification has been rejected. Reason: ${reason}. Please resubmit your documents with the required corrections.`,
    isRead: false,
    priority: 'high',
    data: { rejectionReason: reason }
  });

  // Send email notification to tutor
  try {
    await sendKYCRejectionEmail(tutor, reason);
    console.log('✅ KYC rejection email sent to:', tutor.email);
  } catch (emailError) {
    console.error('❌ Failed to send KYC rejection email:', emailError.message);
    // Don't fail the rejection if email fails
  }

  res.json({
    success: true,
    message: 'KYC rejected successfully',
    data: {
      tutorId: tutor._id,
      tutorName: tutor.name,
      kycStatus: tutor.tutorProfile.kycStatus,
      rejectionReason: reason,
      rejectedAt: tutor.tutorProfile.kycDocuments.reviewedAt
    }
  });
});

// @desc    Get all tutors with KYC status (Admin only)
// @route   GET /api/kyc/tutors
// @access  Private (Admin only)
exports.getAllTutorsKYC = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const tutors = await User.find({ role: 'tutor' })
    .select('name email phone tutorProfile createdAt')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: tutors
  });
});

// @desc    Get KYC statistics (Admin only)
// @route   GET /api/kyc/stats
// @access  Private (Admin only)
exports.getKYCStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const stats = await User.aggregate([
    { $match: { role: 'tutor' } },
    {
      $group: {
        _id: '$tutorProfile.kycStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  const formattedStats = {
    total: 0,
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    formattedStats.total += stat.count;
    formattedStats[stat._id || 'pending'] = stat.count;
  });

  res.json({
    success: true,
    data: formattedStats
  });
});
