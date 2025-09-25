const mongoose = require('mongoose');

// Project Model
const projectSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Project Details
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  deadline: { type: Date },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now }
}, {
  // Ensure no custom id field conflicts
  _id: true,
  id: false
});

// Project Submission Model
const projectSubmissionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Submission Details
  title: { type: String, required: true },
  description: { type: String, required: true },
  files: [{ 
    name: String,
    url: String,
    type: String 
  }],
  githubLink: { type: String },
  liveDemoLink: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'needs_revision'],
    default: 'submitted'
  },
  
  // Tutor Review
  grade: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
  reviewDate: { type: Date },
  
  // Certificate
  certificateGenerated: { type: Boolean, default: false },
  certificateId: { type: String },
  
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  // Ensure no custom id field conflicts
  _id: true,
  id: false
});

// Certificate Model
const certificateSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectSubmission', required: false },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Certificate Data
  learnerName: { type: String, required: true },
  courseName: { type: String, required: true },
  projectName: { type: String, required: true },
  tutorName: { type: String, required: true },
  grade: { type: Number, required: true },
  completionDate: { type: Date, default: Date.now },
  
  // Verification
  verificationCode: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now }
}, {
  // Ensure no custom id field conflicts
  _id: true,
  id: false
});

// Generate verification code for certificates
certificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
const ProjectSubmission = mongoose.model('ProjectSubmission', projectSubmissionSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = {
  Project,
  ProjectSubmission,
  Certificate
};
