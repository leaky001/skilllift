const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const { sendEmailVerification, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/sendEmail');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').matches(/^(\+234|234|0)?[789][01]\d{8}$/).withMessage('Please provide a valid Nigerian phone number'),
  body('role').isIn(['tutor', 'learner']).withMessage('Role must be either tutor or learner')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['admin', 'tutor', 'learner']).withMessage('Role must be either admin, tutor, or learner')
];

// Helper function to get admin user ID
const getAdminUserId = async () => {
  const admin = await User.findOne({ role: 'admin' });
  return admin ? admin._id : null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { name, email, password, phone, role } = req.body;

  // SECURITY: Block admin registration through public API
  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be created through public registration. Contact system administrator.'
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Check if phone number is already in use
  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is already registered'
    });
  }

  // Create user with appropriate status based on role
  const accountStatus = role === 'learner' ? 'approved' : 'pending';
  
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    accountStatus: accountStatus // Learners auto-approved, tutors need approval
  });

  if (user) {
    // Generate email verification code
    const verificationCode = user.getEmailVerificationCode();
    await user.save();

    // Send email verification (don't let email failure crash registration)
    try {
      await sendEmailVerification(user, verificationCode);
    } catch (error) {
      console.error('Email verification sending failed:', error.message);
      // Don't crash the registration - just log the error
    }

    // Create notification for admin about new tutor registration (not learners)
    if (role === 'tutor') {
      try {
        const adminUserId = await getAdminUserId();
        if (adminUserId) {
          await Notification.create({
            recipient: adminUserId,
            type: 'new_tutor_registration',
            title: 'New Tutor Registration',
            message: `${name} (${email}) has registered as a tutor. They need to complete KYC verification.`,
            data: {
              userId: user._id,
              userName: name,
              userEmail: email,
              userRole: role,
              userPhone: phone
            }
          });
        }
      } catch (notificationError) {
        console.error('Admin notification creation failed:', notificationError.message);
        // Don't crash the registration - just log the error
      }
    }

    // Generate appropriate response message based on role
    let message = 'Registration successful! Please check your email for the verification code.';
    let requiresAccountApproval = false;
    
    if (role === 'learner') {
      message += ' You can now access the platform immediately after email verification.';
    } else if (role === 'tutor') {
      message += ' You must complete KYC verification before creating courses.';
      requiresAccountApproval = true;
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id)
      },
      message: message,
      requiresEmailVerification: true,
      requiresAccountApproval: requiresAccountApproval
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Validate that role is provided and valid
    if (!role || !['admin', 'tutor', 'learner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role is required and must be either "admin", "tutor", or "learner"'
      });
    }

    console.log('🔐 Login attempt:', { email, role });

    // Find user by email with extended timeout
    const user = await User.findOne({ email }).maxTimeMS(30000);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // CRITICAL SECURITY CHECK: Verify that the user's actual role matches the requested role
  if (user.role !== role) {
    // Log this security violation attempt
    console.warn(`SECURITY ALERT: Role mismatch login attempt - User: ${user.email}, Stored Role: ${user.role}, Requested Role: ${role}, IP: ${req.ip}`);
    
    // Increment role validation attempts and potentially lock account
    await user.incRoleValidationAttempts();
    
    return res.status(403).json({
      success: false,
      message: `Access denied. This account is registered as a ${user.role}, not a ${role}. Please use the correct login form.`
    });
  }

  // Check if account is locked
  if (user.isLocked()) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
    });
  }

  // Check password
  if (!(await user.matchPassword(password))) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check account status
  if (user.accountStatus === 'blocked') {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Please contact support.'
    });
  }

  // Special handling for admin users - they can always login regardless of account status
  if (user.role === 'admin') {
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    // Reset role validation attempts on successful login
    if (user.roleValidationAttempts > 0) {
      await user.resetRoleValidationAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      },
      message: 'Admin login successful'
    });
  }

  // Email verification check (disabled for now)
  // if (!user.isEmailVerified) {
  //   return res.status(403).json({
  //     success: false,
  //     message: 'Please verify your email before logging in. Check your inbox for the verification code.',
  //     requiresEmailVerification: true,
  //     email: user.email
  //   });
  // }

  // Allow pending users to login but inform them about their status
  if (user.accountStatus === 'pending') {
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id)
      },
      message: 'Login successful! Your account is pending admin approval. Some features may be limited until approved.'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  // Reset role validation attempts on successful login
  if (user.roleValidationAttempts > 0) {
    await user.resetRoleValidationAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      profilePicture: user.profilePicture,
      kycStatus: user.getKYCStatus(),
      canCreateCourses: user.canCreateCourses(),
      canReceivePayments: user.canReceivePayments(),
      token: generateToken(user._id)
    },
    message: 'Login successful'
  });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -loginAttempts -lockUntil')
    .populate('tutorProfile.skills')
    .populate('learnerProfile.completedCourses');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      kycStatus: user.getKYCStatus(),
      canCreateCourses: user.canCreateCourses(),
      canReceivePayments: user.canReceivePayments()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  let { name, phone, profilePicture, tutorProfile, learnerProfile } = req.body;
  
  // Handle FormData - parse tutorProfile and learnerProfile if they're strings
  if (typeof tutorProfile === 'string') {
    try {
      tutorProfile = JSON.parse(tutorProfile);
    } catch (error) {
      console.error('Error parsing tutorProfile:', error);
      tutorProfile = null;
    }
  }
  
  if (typeof learnerProfile === 'string') {
    try {
      learnerProfile = JSON.parse(learnerProfile);
    } catch (error) {
      console.error('Error parsing learnerProfile:', error);
      learnerProfile = null;
    }
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  if (name) user.name = name;
  if (phone) {
    // Check if phone is already in use by another user
    const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already registered by another user'
      });
    }
    user.phone = phone;
  }
  // Handle profile picture upload
  if (req.file) {
    // File was uploaded via multer
    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
  } else if (profilePicture) {
    // Profile picture URL provided directly
    user.profilePicture = profilePicture;
  }

  // Update tutor profile if provided
  if (tutorProfile && user.role === 'tutor') {
    if (!user.tutorProfile) {
      user.tutorProfile = {};
    }
    
    if (tutorProfile.bio !== undefined) {
      user.tutorProfile.bio = tutorProfile.bio;
    }
    
    if (tutorProfile.skills !== undefined) {
      user.tutorProfile.skills = tutorProfile.skills;
    }
    
    if (tutorProfile.experience !== undefined) {
      user.tutorProfile.experience = tutorProfile.experience;
    }
  }

  // Update learner profile if provided
  if (learnerProfile && user.role === 'learner') {
    if (!user.learnerProfile) {
      user.learnerProfile = {};
    }
    
    if (learnerProfile.bio !== undefined) {
      user.learnerProfile.bio = learnerProfile.bio;
    }
    
    if (learnerProfile.preferences !== undefined) {
      user.learnerProfile.preferences = learnerProfile.preferences;
    }
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      accountStatus: updatedUser.accountStatus,
      profilePicture: updatedUser.profilePicture,
      tutorProfile: updatedUser.tutorProfile,
      learnerProfile: updatedUser.learnerProfile
    },
    message: 'Profile updated successfully'
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User with this email not found'
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // Send reset email
  try {
    await sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({
      success: false,
      message: 'Email and verification code are required'
    });
  }

  // Temporary fix: Check if database is connected
  let user;
  try {
    user = await User.findOne({ email });
  } catch (error) {
    console.error('Database connection error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection error. Please check your MongoDB setup.',
      error: 'Database not connected'
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found. Please make sure you registered with this email address.'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Check if verification code matches and is not expired
  if (!user.emailVerificationCode || 
      user.emailVerificationCode !== verificationCode ||
      !user.emailVerificationCodeExpires ||
      user.emailVerificationCodeExpires < Date.now()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code'
    });
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  await user.save();

  // Send welcome email after verification
  try {
    await sendWelcomeEmail(user);
  } catch (error) {
    console.error('Welcome email sending failed:', error);
  }

  res.json({
    success: true,
    message: 'Email verified successfully! Welcome to SkillLift!',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      tutorProfile: user.tutorProfile, // Include tutor profile for tutors
      token: generateToken(user._id)
    }
  });
});

// @desc    Resend email verification code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Temporary fix: Check if database is connected
  let user;
  try {
    user = await User.findOne({ email });
  } catch (error) {
    console.error('Database connection error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection error. Please check your MongoDB setup.',
      error: 'Database not connected'
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found. Please make sure you registered with this email address.'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification code
  const verificationCode = user.getEmailVerificationCode();
  await user.save();

  // Send new verification email
  try {
    await sendEmailVerification(user, verificationCode);
    
    res.json({
      success: true,
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    console.error('Email verification sending failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
});

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = asyncHandler(async (req, res) => {
  try {
    // The protect middleware already verified the token and added user to req.user
    const user = req.user;
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

// Export validation middleware
exports.validateRegistration = validateRegistration;
exports.validateLogin = validateLogin;
