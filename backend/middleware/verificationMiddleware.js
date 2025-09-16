const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware to check if user's email is verified
const requireEmailVerification = asyncHandler(async (req, res, next) => {
  // Skip email verification check for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Check if user's email is verified
  if (req.user && !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this feature. Check your inbox for the verification code.',
      requiresEmailVerification: true,
      email: req.user.email
    });
  }

  next();
});

// Middleware to check if user's account is approved
const requireAccountApproval = asyncHandler(async (req, res, next) => {
  // Skip approval check for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Check if user's account is approved
  if (req.user && req.user.accountStatus === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval. Some features may be limited until approved.',
      requiresAccountApproval: true,
      accountStatus: req.user.accountStatus
    });
  }

  if (req.user && req.user.accountStatus === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Please contact support.',
      accountStatus: req.user.accountStatus
    });
  }

  next();
});

// Combined middleware for full access
const requireFullAccess = asyncHandler(async (req, res, next) => {
  // Skip checks for admin users
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Check email verification first
  if (req.user && !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this feature. Check your inbox for the verification code.',
      requiresEmailVerification: true,
      email: req.user.email
    });
  }

  // Check account approval
  if (req.user && req.user.accountStatus === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval. Some features may be limited until approved.',
      requiresAccountApproval: true,
      accountStatus: req.user.accountStatus
    });
  }

  if (req.user && req.user.accountStatus === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Please contact support.',
      accountStatus: req.user.accountStatus
    });
  }

  next();
});

module.exports = {
  requireEmailVerification,
  requireAccountApproval,
  requireFullAccess
};
