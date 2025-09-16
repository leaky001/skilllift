const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platform: {
    name: {
      type: String,
      default: 'SkillLift',
      required: true
    },
    description: {
      type: String,
      default: 'Empowering learners and tutors to achieve their goals through innovative online education.'
    },
    logo: {
      type: String,
      default: '/images/logo.png'
    },
    favicon: {
      type: String,
      default: '/images/favicon.ico'
    },
    supportEmail: {
      type: String,
      default: 'support@skilllift.com'
    },
    contactPhone: {
      type: String,
      default: '+234 800 123 4567'
    },
    address: {
      type: String,
      default: 'Lagos, Nigeria'
    },
    timezone: {
      type: String,
      default: 'Africa/Lagos'
    },
    language: {
      type: String,
      default: 'English'
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    currencySymbol: {
      type: String,
      default: '₦'
    }
  },
  fees: {
    platformFeePercentage: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },
    minimumWithdrawal: {
      type: Number,
      default: 5000,
      min: 0
    },
    maximumWithdrawal: {
      type: Number,
      default: 1000000,
      min: 0
    },
    transactionFee: {
      type: Number,
      default: 100,
      min: 0
    },
    refundFee: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  security: {
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    requirePhoneVerification: {
      type: Boolean,
      default: false
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    sessionTimeout: {
      type: Number,
      default: 24, // hours
      min: 1,
      max: 168
    },
    passwordMinLength: {
      type: Number,
      default: 8,
      min: 6,
      max: 50
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    courseUpdates: {
      type: Boolean,
      default: true
    },
    paymentNotifications: {
      type: Boolean,
      default: true
    },

  },
  courses: {
    autoApprove: {
      type: Boolean,
      default: false
    },
    requireContentReview: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 100, // MB
      min: 1,
      max: 1000
    },
    allowedFileTypes: [{
      type: String,
      enum: ['pdf', 'mp4', 'avi', 'mov', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
    }],
    maxCoursesPerTutor: {
      type: Number,
      default: 50,
      min: 1,
      max: 1000
    },
    maxStudentsPerCourse: {
      type: Number,
      default: 1000,
      min: 1,
      max: 10000
    },
    allowTutorRegistration: {
      type: Boolean,
      default: true
    },
    requireApprovalForTutors: {
      type: Boolean,
      default: true
    }
  },
  payments: {
    paystackEnabled: {
      type: Boolean,
      default: true
    },
    paystackPublicKey: {
      type: String,
      default: ''
    },
    paystackSecretKey: {
      type: String,
      default: ''
    },
    allowInstallments: {
      type: Boolean,
      default: true
    },
    maxInstallments: {
      type: Number,
      default: 12,
      min: 1,
      max: 24
    },
    installmentFee: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  features: {
    liveClasses: {
      type: Boolean,
      default: true
    },
    assignments: {
      type: Boolean,
      default: true
    },
    certificates: {
      type: Boolean,
      default: true
    },
    mentorship: {
      type: Boolean,
      default: true
    },
    discussionForums: {
      type: Boolean,
      default: true
    },
    mobileApp: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
settingsSchema.index({ updatedAt: -1 });

// Method to get setting value by path
settingsSchema.methods.getSetting = function(path) {
  return path.split('.').reduce((obj, key) => obj && obj[key], this);
};

// Method to set setting value by path
settingsSchema.methods.setSetting = function(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const obj = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, this);
  obj[lastKey] = value;
  return this;
};

// Static method to get or create settings
settingsSchema.statics.getOrCreate = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

// Pre-save middleware to validate settings
settingsSchema.pre('save', function(next) {
  // Validate platform fee percentage
  if (this.fees.platformFeePercentage < 0 || this.fees.platformFeePercentage > 100) {
    return next(new Error('Platform fee percentage must be between 0 and 100'));
  }

  // Validate withdrawal limits
  if (this.fees.minimumWithdrawal >= this.fees.maximumWithdrawal) {
    return next(new Error('Minimum withdrawal must be less than maximum withdrawal'));
  }

  // Validate file size limits
  if (this.courses.maxFileSize < 1 || this.courses.maxFileSize > 1000) {
    return next(new Error('Maximum file size must be between 1 and 1000 MB'));
  }

  // Validate course limits
  if (this.courses.maxCoursesPerTutor < 1) {
    return next(new Error('Maximum courses per tutor must be at least 1'));
  }

  if (this.courses.maxStudentsPerCourse < 1) {
    return next(new Error('Maximum students per course must be at least 1'));
  }

  // Validate installment limits
  if (this.payments.maxInstallments < 1 || this.payments.maxInstallments > 24) {
    return next(new Error('Maximum installments must be between 1 and 24'));
  }

  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
