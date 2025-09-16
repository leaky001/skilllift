const asyncHandler = require('express-async-handler');

// @desc    Check if tutor has approved KYC
// @access  Private (Tutor only)
exports.requireKYCApproval = asyncHandler(async (req, res, next) => {
  // Only apply to tutors
  if (req.user.role !== 'tutor') {
    return next();
  }

  // Check KYC status
  if (!req.user.canCreateCourses()) {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required. Please complete your KYC verification to access this feature.',
      kycStatus: req.user.getKYCStatus(),
      requiresKYC: true
    });
  }

  next();
});

// @desc    Check if tutor can receive payments
// @access  Private (Tutor only)
exports.requirePaymentEligibility = asyncHandler(async (req, res, next) => {
  // Only apply to tutors
  if (req.user.role !== 'tutor') {
    return next();
  }

  // Check if tutor can receive payments
  if (!req.user.canReceivePayments()) {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required to receive payments. Please complete your KYC verification.',
      kycStatus: req.user.getKYCStatus(),
      requiresKYC: true
    });
  }

  next();
});

// @desc    Check if user is admin
// @access  Private (Admin only)
exports.requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
});

// @desc    Check if user is tutor
// @access  Private (Tutor only)
exports.requireTutor = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({
      success: false,
      message: 'Tutor access required'
    });
  }

  next();
});

// @desc    Check if user is learner
// @access  Private (Learner only)
exports.requireLearner = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'learner') {
    return res.status(403).json({
      success: false,
      message: 'Learner access required'
    });
  }

  next();
});