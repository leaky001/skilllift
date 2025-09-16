const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const User = require('../models/User');

// Get platform settings
exports.getPlatformSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        platform: {
          name: 'SkillLift',
          description: 'Empowering learners and tutors to achieve their goals through innovative online education.',
          logo: '/images/logo.png',
          favicon: '/images/favicon.ico',
          supportEmail: 'support@skilllift.com',
          contactPhone: '+234 800 123 4567',
          address: 'Lagos, Nigeria',
          timezone: 'Africa/Lagos',
          language: 'English',
          currency: 'NGN',
          currencySymbol: '₦'
        },
        fees: {
          platformFeePercentage: 15,
          minimumWithdrawal: 5000,
          maximumWithdrawal: 1000000,
          transactionFee: 100,
          refundFee: 0
        },
        security: {
          requireEmailVerification: true,
          requirePhoneVerification: false,
          maxLoginAttempts: 5,
          sessionTimeout: 24,
          passwordMinLength: 8,
          requireTwoFactor: false
        },
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false,
          courseUpdates: true,
          paymentNotifications: true
        },
        courses: {
          autoApprove: false,
          requireContentReview: true,
          maxFileSize: 100, // MB
          allowedFileTypes: ['pdf', 'mp4', 'jpg', 'png', 'doc', 'docx'],
          maxCoursesPerTutor: 50,
          maxStudentsPerCourse: 1000,
          allowTutorRegistration: true,
          requireApprovalForTutors: true
        },
        payments: {
          paystackEnabled: true,
          paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
          paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
          allowInstallments: true,
          maxInstallments: 12,
          installmentFee: 0
        },
        features: {
          liveClasses: true,
          assignments: true,
          certificates: true,
          mentorship: true,
          discussionForums: true,
          mobileApp: false,
          apiAccess: false
        }
      });
      
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform settings',
      error: error.message
    });
  }
});

// Update platform settings (admin only)
exports.updatePlatformSettings = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const updateData = req.body;

  try {
    // Verify user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update settings based on provided data
    if (updateData.platform) {
      Object.assign(settings.platform, updateData.platform);
    }
    
    if (updateData.fees) {
      Object.assign(settings.fees, updateData.fees);
    }
    
    if (updateData.security) {
      Object.assign(settings.security, updateData.security);
    }
    
    if (updateData.notifications) {
      Object.assign(settings.notifications, updateData.notifications);
    }
    
    if (updateData.courses) {
      Object.assign(settings.courses, updateData.courses);
    }
    
    if (updateData.payments) {
      // Don't allow updating sensitive payment keys from this endpoint
      const { paystackSecretKey, ...safePaymentData } = updateData.payments;
      Object.assign(settings.payments, safePaymentData);
    }
    
    if (updateData.features) {
      Object.assign(settings.features, updateData.features);
    }

    settings.updatedAt = new Date();
    settings.updatedBy = adminId;

    await settings.save();

    res.json({
      success: true,
      message: 'Platform settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update platform settings',
      error: error.message
    });
  }
});

// Update specific setting category (admin only)
exports.updateSettingCategory = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const { category } = req.params;
  const updateData = req.body;

  try {
    // Verify user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Validate category
    const validCategories = ['platform', 'fees', 'security', 'notifications', 'courses', 'payments', 'features'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid setting category'
      });
    }

    // Update specific category
    if (category === 'payments') {
      // Don't allow updating sensitive payment keys
      const { paystackSecretKey, ...safePaymentData } = updateData;
      Object.assign(settings[category], safePaymentData);
    } else {
      Object.assign(settings[category], updateData);
    }

    settings.updatedAt = new Date();
    settings.updatedBy = adminId;

    await settings.save();

    res.json({
      success: true,
      message: `${category} settings updated successfully`,
      data: settings[category]
    });
  } catch (error) {
    console.error(`Error updating ${category} settings:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to update ${category} settings`,
      error: error.message
    });
  }
});

// Reset settings to defaults (admin only)
exports.resetSettingsToDefaults = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  try {
    // Verify user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Create default settings
    const defaultSettings = new Settings({
      platform: {
        name: 'SkillLift',
        description: 'Empowering learners and tutors to achieve their goals through innovative online education.',
        logo: '/images/logo.png',
        favicon: '/images/favicon.ico',
        supportEmail: 'support@skilllift.com',
        contactPhone: '+234 800 123 4567',
        address: 'Lagos, Nigeria',
        timezone: 'Africa/Lagos',
        language: 'English',
        currency: 'NGN',
        currencySymbol: '₦'
      },
      fees: {
        platformFeePercentage: 15,
        minimumWithdrawal: 5000,
        maximumWithdrawal: 1000000,
        transactionFee: 100,
        refundFee: 0
      },
      security: {
        requireEmailVerification: true,
        requirePhoneVerification: false,
        maxLoginAttempts: 5,
        sessionTimeout: 24,
        passwordMinLength: 8,
        requireTwoFactor: false
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: false,
        courseUpdates: true,
        paymentNotifications: true
      },
      courses: {
        autoApprove: false,
        requireContentReview: true,
        maxFileSize: 100,
        allowedFileTypes: ['pdf', 'mp4', 'jpg', 'png', 'doc', 'docx'],
        maxCoursesPerTutor: 50,
        maxStudentsPerCourse: 1000,
        allowTutorRegistration: true,
        requireApprovalForTutors: true
      },
      payments: {
        paystackEnabled: true,
        paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
        allowInstallments: true,
        maxInstallments: 12,
        installmentFee: 0
      },
      features: {
        liveClasses: true,
        assignments: true,
        certificates: true,
        mentorship: true,
        discussionForums: true,
        mobileApp: false,
        apiAccess: false
      }
    });

    // Delete existing settings and create new ones
    await Settings.deleteMany({});
    await defaultSettings.save();

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
});

// Get public settings (no authentication required)
exports.getPublicSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Platform settings not found'
      });
    }

    // Return only public settings
    const publicSettings = {
      platform: {
        name: settings.platform.name,
        description: settings.platform.description,
        logo: settings.platform.logo,
        supportEmail: settings.platform.supportEmail,
        contactPhone: settings.platform.contactPhone,
        address: settings.platform.address,
        timezone: settings.platform.timezone,
        language: settings.platform.language,
        currency: settings.platform.currency,
        currencySymbol: settings.platform.currencySymbol
      },
      fees: {
        platformFeePercentage: settings.fees.platformFeePercentage,
        minimumWithdrawal: settings.fees.minimumWithdrawal,
        maximumWithdrawal: settings.fees.maximumWithdrawal,
        transactionFee: settings.fees.transactionFee
      },
      features: settings.features,
      courses: {
        maxFileSize: settings.courses.maxFileSize,
        allowedFileTypes: settings.courses.allowedFileTypes,
        allowTutorRegistration: settings.courses.allowTutorRegistration,
        requireApprovalForTutors: settings.courses.requireApprovalForTutors
      }
    };

    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public settings',
      error: error.message
    });
  }
});

// Update payment settings (admin only, with secure key handling)
exports.updatePaymentSettings = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const { 
    paystackEnabled, 
    paystackPublicKey, 
    paystackSecretKey,
    allowInstallments,
    maxInstallments,
    installmentFee 
  } = req.body;

  try {
    // Verify user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update payment settings
    if (paystackEnabled !== undefined) settings.payments.paystackEnabled = paystackEnabled;
    if (paystackPublicKey) settings.payments.paystackPublicKey = paystackPublicKey;
    if (paystackSecretKey) settings.payments.paystackSecretKey = paystackSecretKey;
    if (allowInstallments !== undefined) settings.payments.allowInstallments = allowInstallments;
    if (maxInstallments) settings.payments.maxInstallments = maxInstallments;
    if (installmentFee !== undefined) settings.payments.installmentFee = installmentFee;

    settings.updatedAt = new Date();
    settings.updatedBy = adminId;

    await settings.save();

    res.json({
      success: true,
      message: 'Payment settings updated successfully',
      data: {
        paystackEnabled: settings.payments.paystackEnabled,
        allowInstallments: settings.payments.allowInstallments,
        maxInstallments: settings.payments.maxInstallments,
        installmentFee: settings.payments.installmentFee
      }
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment settings',
      error: error.message
    });
  }
});

// Get settings audit log (admin only)
exports.getSettingsAuditLog = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  try {
    // Verify user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    // For now, return basic audit info
    // In a production system, you'd have a separate audit log collection
    const auditLog = [
      {
        action: 'settings_updated',
        timestamp: settings.updatedAt,
        admin: settings.updatedBy,
        details: 'Settings were updated'
      }
    ];

    res.json({
      success: true,
      data: auditLog,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: auditLog.length,
        pages: Math.ceil(auditLog.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching settings audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings audit log',
      error: error.message
    });
  }
});

// Export settings (admin only)
exports.exportSettings = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const { format = 'json' } = req.query;

  try {
    // Verify user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const settings = await Settings.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'No settings found to export'
      });
    }

    if (format === 'json') {
      res.json({
        success: true,
        data: settings,
        exportedAt: new Date(),
        exportedBy: adminId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Only JSON is supported.'
      });
    }
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export settings',
      error: error.message
    });
  }
});
