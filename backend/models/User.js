const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false },
  role: {
    type: String,
    enum: ['admin', 'tutor', 'learner'],
    default: 'learner',
  },
  profilePicture: String,
  accountStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'blocked'], 
    default: 'pending' 
  },
  
  // Tutor-specific fields
  tutorProfile: {
    skills: [String],
    experience: String,
    bio: String,
    previewVideo: String,
    totalEarnings: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    // KYC Verification fields
    kycStatus: { 
      type: String, 
      enum: ['pending', 'submitted', 'approved', 'rejected'], 
      default: 'pending' 
    },
    kycDocuments: {
      idDocument: String, // URL to uploaded ID document
      idDocumentType: { 
        type: String, 
        enum: ['passport', 'drivers_license', 'national_id', 'other'] 
      },
      addressDocument: String, // URL to uploaded address proof
      addressDocumentType: { 
        type: String, 
        enum: ['utility_bill', 'bank_statement', 'government_letter', 'other'] 
      },
      profilePhoto: String, // URL to profile photo
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rejectionReason: String,
      notes: String
    }
  },
  
  // Learner-specific fields
  learnerProfile: {
    preferences: [String],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    totalSpent: { type: Number, default: 0 },
    certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }]
  },

  // Common fields
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerificationCode: String,
  emailVerificationCodeExpires: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  roleValidationAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  

}, { 
  timestamps: true 
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set expire
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return verificationToken;
};

// Generate email verification code
userSchema.methods.getEmailVerificationCode = function() {
  // Generate 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set code and expiry
  this.emailVerificationCode = verificationCode;
  this.emailVerificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return verificationCode;
};

// Track failed role validation attempts
userSchema.methods.incRoleValidationAttempts = async function() {
  this.roleValidationAttempts = (this.roleValidationAttempts || 0) + 1;
  
  // Lock account after 5 failed role validation attempts
  if (this.roleValidationAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
    this.accountStatus = 'blocked';
  }
  
  await this.save();
  return this;
};

// Reset role validation attempts on successful login
userSchema.methods.resetRoleValidationAttempts = async function() {
  if (this.roleValidationAttempts > 0) {
    this.roleValidationAttempts = 0;
    await this.save();
  }
  return this;
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  return this.updateOne(updates);
};

// KYC Helper Methods
userSchema.methods.isKYCApproved = function() {
  return this.role === 'tutor' && this.tutorProfile?.kycStatus === 'approved';
};

userSchema.methods.canCreateCourses = function() {
  return this.role === 'tutor' && this.isKYCApproved();
};

userSchema.methods.canReceivePayments = function() {
  return this.role === 'tutor' && this.isKYCApproved();
};

userSchema.methods.getKYCStatus = function() {
  if (this.role !== 'tutor') return 'not_required';
  return this.tutorProfile?.kycStatus || 'pending';
};

userSchema.methods.submitKYC = function(documents) {
  if (this.role !== 'tutor') {
    throw new Error('Only tutors can submit KYC documents');
  }
  
  this.tutorProfile.kycStatus = 'submitted';
  this.tutorProfile.kycDocuments = {
    ...this.tutorProfile.kycDocuments,
    ...documents,
    submittedAt: new Date()
  };
  
  return this.save();
};

userSchema.methods.approveKYC = function(adminId, notes = '') {
  if (this.role !== 'tutor') {
    throw new Error('Only tutors can have KYC approved');
  }

  // Ensure tutorProfile exists
  if (!this.tutorProfile) {
    this.tutorProfile = {};
  }

  this.tutorProfile.kycStatus = 'approved';

  // Ensure kycDocuments exists as an object before accessing properties
  if (!this.tutorProfile.kycDocuments) {
    this.tutorProfile.kycDocuments = {};
  }

  this.tutorProfile.kycDocuments.reviewedAt = new Date();
  this.tutorProfile.kycDocuments.reviewedBy = adminId;
  this.tutorProfile.kycDocuments.notes = notes;
  
  return this.save();
};

userSchema.methods.rejectKYC = function(adminId, reason, notes = '') {
  if (this.role !== 'tutor') {
    throw new Error('Only tutors can have KYC rejected');
  }

  // Ensure tutorProfile exists
  if (!this.tutorProfile) {
    this.tutorProfile = {};
  }

  this.tutorProfile.kycStatus = 'rejected';

  // Ensure kycDocuments exists as an object before accessing properties
  if (!this.tutorProfile.kycDocuments) {
    this.tutorProfile.kycDocuments = {};
  }

  this.tutorProfile.kycDocuments.reviewedAt = new Date();
  this.tutorProfile.kycDocuments.reviewedBy = adminId;
  this.tutorProfile.kycDocuments.rejectionReason = reason;
  this.tutorProfile.kycDocuments.notes = notes;
  
  return this.save();
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
