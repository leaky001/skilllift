const { Project, ProjectSubmission, Certificate } = require('../models/Project');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/projects';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, documents, and zip files are allowed'));
    }
  }
});

// Get project submissions for tutor
const getTutorProjectSubmissions = async (req, res) => {
  try {
    const tutorId = req.user._id;
    
    // Find all courses that belong to this tutor
    const tutorCourses = await Course.find({ tutor: tutorId }).select('_id');
    const courseIds = tutorCourses.map(course => course._id);
    
    console.log('🔍 Tutor courses:', courseIds);
    
    // Find submissions for projects in tutor's courses
    const submissions = await ProjectSubmission.find({ 
      courseId: { $in: courseIds } 
    })
      .populate('learnerId', 'name email')
      .populate('courseId', 'title')
      .populate('projectId', 'title')
      .populate('tutorId', 'name')
      .sort({ submittedAt: -1 });

    const formattedSubmissions = submissions.map(submission => ({
      id: submission._id,
      _id: submission._id,
      title: submission.title,
      description: submission.description,
      githubLink: submission.githubLink,
      liveDemoLink: submission.liveDemoLink,
      status: submission.status,
      grade: submission.grade,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt,
      reviewDate: submission.reviewDate,
      learnerName: submission.learnerId?.name || 'Unknown',
      courseName: submission.courseId?.title || 'Unknown Course',
      projectTitle: submission.projectId?.title || 'Unknown Project',
      projectName: submission.projectId?.title || 'Unknown Project',
      certificateGenerated: submission.certificateGenerated
    }));

    res.json({
      success: true,
      submissions: formattedSubmissions
    });
  } catch (error) {
    console.error('Error fetching tutor project submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project submissions'
    });
  }
};

// Get project submissions for learner
const getLearnerProjectSubmissions = async (req, res) => {
  try {
    const learnerId = req.user._id;
    
    const submissions = await ProjectSubmission.find({ learnerId })
      .populate('courseId', 'title')
      .populate('projectId', 'title')
      .populate('tutorId', 'name')
      .sort({ submittedAt: -1 });

    const formattedSubmissions = submissions.map(submission => ({
      id: submission._id,
      title: submission.title,
      description: submission.description,
      githubLink: submission.githubLink,
      liveDemoLink: submission.liveDemoLink,
      status: submission.status,
      grade: submission.grade,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt,
      reviewDate: submission.reviewDate,
      courseName: submission.courseId?.title || 'Unknown Course',
      projectName: submission.projectId?.title || 'Unknown Project',
      tutorName: submission.tutorId?.name || 'Unknown Tutor',
      certificateGenerated: submission.certificateGenerated
    }));

    res.json({
      success: true,
      submissions: formattedSubmissions
    });
  } catch (error) {
    console.error('Error fetching learner project submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project submissions'
    });
  }
};

// Submit project
const submitProject = async (req, res) => {
  try {
    const learnerId = req.user._id;
    const { title, description, githubLink, liveDemoLink, projectId, courseId } = req.body;

    console.log('🔍 Submitting project with data:', { title, description, projectId, courseId, learnerId });
    console.log('🔍 Request body:', req.body);
    console.log('🔍 Project ID type:', typeof projectId);
    console.log('🔍 Course ID type:', typeof courseId);
    console.log('🔍 Project ID value:', projectId);
    console.log('🔍 Course ID value:', courseId);

    // Find the project
    let project;
    if (projectId) {
      project = await Project.findById(projectId).populate('courseId').populate('tutorId');
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
    } else if (courseId) {
      // Fallback: find or create project for this course
      project = await Project.findOne({ courseId }).populate('courseId').populate('tutorId');
      if (!project) {
        const course = await Course.findById(courseId).populate('tutor');
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'Course not found'
          });
        }
        
        project = new Project({
          courseId,
          tutorId: course.tutor._id,
          title: `${course.title} - Final Project`,
          description: 'Complete the final project to earn your certificate',
          requirements: 'Build a project that demonstrates your understanding of the course material'
        });
        await project.save();
        // Populate after saving
        project = await Project.findById(project._id).populate('courseId').populate('tutorId');
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either projectId or courseId is required'
      });
    }

    // Get the course and tutor information
    const course = project.courseId;
    const tutorId = project.tutorId;
    
    console.log('🔍 Course object:', course);
    console.log('🔍 Tutor ID:', tutorId);
    console.log('🔍 Course type:', typeof course);
    console.log('🔍 Tutor ID type:', typeof tutorId);
    
    // Validate that we have the required data
    if (!course) {
      console.error('❌ Course not found in project');
      return res.status(500).json({
        success: false,
        message: 'Course not found in project'
      });
    }
    
    if (!tutorId) {
      console.error('❌ Tutor ID not found in project');
      return res.status(500).json({
        success: false,
        message: 'Tutor ID not found in project'
      });
    }
    
    // Ensure we have the correct course ID format
    const finalCourseId = course._id || course;
    const finalTutorId = tutorId._id || tutorId;
    
    console.log('🔍 Final course ID:', finalCourseId);
    console.log('🔍 Final tutor ID:', finalTutorId);

    // Handle file uploads
    const files = [];
    if (req.files) {
      for (const file of req.files) {
        files.push({
          name: file.originalname,
          url: `/uploads/projects/${file.filename}`,
          type: file.mimetype
        });
      }
    }

    // Create submission
    const submission = new ProjectSubmission({
      projectId: project._id,
      learnerId,
      courseId: finalCourseId,
      tutorId: finalTutorId,
      title,
      description,
      githubLink,
      liveDemoLink,
      files,
      status: 'submitted'
    });
    
    console.log('🔍 Creating submission with data:', {
      projectId: project._id,
      learnerId,
      courseId: finalCourseId,
      tutorId: finalTutorId,
      title,
      description
    });

    await submission.save();

    console.log('✅ Project submission created successfully:', submission._id);

    res.json({
      success: true,
      message: 'Project submitted successfully',
      submission: {
        id: submission._id,
        title: submission.title,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    console.error('❌ Error submitting project:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error submitting project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Review project submission
const reviewProjectSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback, status } = req.body;
    const tutorId = req.user._id;

    console.log('🔍 Review submission - submissionId:', submissionId);
    console.log('🔍 Review submission - tutorId:', tutorId);
    console.log('🔍 Review submission - req.body:', req.body);
    console.log('🔍 Review submission - grade:', grade);
    console.log('🔍 Review submission - feedback:', feedback);
    console.log('🔍 Review submission - status:', status);

    const submission = await ProjectSubmission.findById(submissionId);
    console.log('🔍 Found submission:', submission);
    
    if (!submission) {
      console.log('❌ Submission not found');
      return res.status(404).json({
        success: false,
        message: 'Project submission not found'
      });
    }

    // Update submission
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = status;
    submission.reviewDate = new Date();
    submission.updatedAt = new Date();

    console.log('🔍 Updating submission with:', {
      grade: submission.grade,
      feedback: submission.feedback,
      status: submission.status,
      reviewDate: submission.reviewDate
    });

    await submission.save();
    console.log('✅ Submission updated successfully');

    res.json({
      success: true,
      message: 'Review submitted successfully',
      submission: {
        id: submission._id,
        grade: submission.grade,
        feedback: submission.feedback,
        status: submission.status,
        reviewDate: submission.reviewDate
      }
    });
  } catch (error) {
    console.error('❌ Error reviewing project submission:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error reviewing project submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Generate certificate for approved project
const generateProjectCertificate = async (req, res) => {
  try {
    const { submissionId } = req.params;

    console.log('🔍 Generate certificate - submissionId:', submissionId);
    console.log('🔍 Generate certificate - req.user:', req.user);

    const submission = await ProjectSubmission.findById(submissionId)
      .populate('learnerId', 'name')
      .populate('courseId', 'title')
      .populate('projectId', 'title')
      .populate('tutorId', 'name');

    console.log('🔍 Found submission for certificate:', submission);
    console.log('🔍 Submission status:', submission?.status);
    console.log('🔍 Certificate already generated:', submission?.certificateGenerated);
    console.log('🔍 Submission learnerId:', submission?.learnerId);
    console.log('🔍 Submission courseId:', submission?.courseId);
    console.log('🔍 Submission projectId:', submission?.projectId);
    console.log('🔍 Submission tutorId:', submission?.tutorId);

    if (!submission) {
      console.log('❌ Submission not found for certificate generation');
      return res.status(404).json({
        success: false,
        message: 'Project submission not found'
      });
    }

    if (submission.status !== 'approved') {
      console.log('❌ Submission not approved, status:', submission.status);
      return res.status(400).json({
        success: false,
        message: 'Project must be approved before generating certificate'
      });
    }

    if (submission.certificateGenerated) {
      console.log('❌ Certificate already generated');
      return res.status(400).json({
        success: false,
        message: 'Certificate already generated for this project'
      });
    }

    // Validate required populated fields
    if (!submission.learnerId || !submission.courseId || !submission.projectId || !submission.tutorId) {
      console.log('❌ Missing required populated fields');
      console.log('❌ learnerId:', submission.learnerId);
      console.log('❌ courseId:', submission.courseId);
      console.log('❌ projectId:', submission.projectId);
      console.log('❌ tutorId:', submission.tutorId);
      return res.status(500).json({
        success: false,
        message: 'Missing required data for certificate generation'
      });
    }

    // Create certificate
    console.log('🔍 Creating certificate with data:', {
      learnerId: submission.learnerId._id,
      courseId: submission.courseId._id,
      projectId: submission.projectId._id,
      submissionId: submission._id,
      tutorId: submission.tutorId._id,
      learnerName: submission.learnerId.name,
      courseName: submission.courseId.title,
      projectName: submission.title,
      tutorName: submission.tutorId.name,
      grade: submission.grade,
      completionDate: submission.reviewDate || new Date()
    });

    // Convert grade to number if it's a string, or use default if null
    let numericGrade = submission.grade;
    if (submission.grade === null || submission.grade === undefined) {
      // Default grade if none provided
      numericGrade = 85; // Default to B grade
    } else if (typeof submission.grade === 'string') {
      // Convert letter grades to numbers
      const gradeMap = {
        'A+': 100, 'A': 95, 'A-': 90,
        'B+': 87, 'B': 85, 'B-': 80,
        'C+': 77, 'C': 75, 'C-': 70,
        'D+': 67, 'D': 65, 'D-': 60,
        'F': 0
      };
      numericGrade = gradeMap[submission.grade] || 85;
    }

    console.log('🔍 Original grade:', submission.grade);
    console.log('🔍 Numeric grade:', numericGrade);

    // Generate verification code
    const verificationCode = `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const certificate = new Certificate({
      learnerId: submission.learnerId._id,
      courseId: submission.courseId._id,
      projectId: submission.projectId._id,
      submissionId: submission._id,
      tutorId: submission.tutorId._id,
      learnerName: submission.learnerId.name,
      courseName: submission.courseId.title,
      projectName: submission.title,
      tutorName: submission.tutorId.name,
      grade: numericGrade,
      completionDate: submission.reviewDate || new Date(),
      verificationCode: verificationCode
    });

    console.log('🔍 Certificate object created:', certificate);
    await certificate.save();
    console.log('✅ Certificate saved successfully:', certificate._id);

    // Update submission
    submission.certificateGenerated = true;
    submission.certificateId = certificate._id;
    await submission.save();

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate._id,
        learnerName: certificate.learnerName,
        courseName: certificate.courseName,
        projectName: certificate.projectName,
        tutorName: certificate.tutorName,
        grade: certificate.grade,
        completionDate: certificate.completionDate,
        verificationCode: certificate.verificationCode
      }
    });
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Internal server error'
    });
  }
};

// Get learner certificates
const getLearnerCertificates = async (req, res) => {
  try {
    const learnerId = req.user._id;

    const certificates = await Certificate.find({ learnerId })
      .populate('courseId', 'title')
      .populate('projectId', 'title')
      .populate('tutorId', 'name')
      .sort({ createdAt: -1 });

    const formattedCertificates = certificates.map(certificate => ({
      id: certificate._id,
      learnerName: certificate.learnerName,
      courseName: certificate.courseName,
      projectName: certificate.projectName,
      tutorName: certificate.tutorName,
      grade: certificate.grade,
      completionDate: certificate.completionDate,
      verificationCode: certificate.verificationCode,
      createdAt: certificate.createdAt
    }));

    res.json({
      success: true,
      certificates: formattedCertificates
    });
  } catch (error) {
    console.error('Error fetching learner certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates'
    });
  }
};

// Get tutor certificates
const getTutorCertificates = async (req, res) => {
  try {
    const tutorId = req.user._id;

    console.log('🔍 Fetching certificates for tutor:', tutorId);

    const certificates = await Certificate.find({ tutorId })
      .populate('courseId', 'title')
      .populate('projectId', 'title')
      .populate('learnerId', 'name email')
      .sort({ createdAt: -1 });

    console.log('🔍 Found certificates:', certificates.length);

    const formattedCertificates = certificates.map(certificate => ({
      id: certificate._id,
      studentName: certificate.learnerName,
      courseName: certificate.courseName,
      projectName: certificate.projectName,
      tutorName: certificate.tutorName,
      grade: certificate.grade,
      completionDate: certificate.completionDate,
      verificationCode: certificate.verificationCode,
      createdAt: certificate.createdAt,
      status: 'issued' // All certificates are considered issued
    }));

    console.log('🔍 Formatted certificates:', formattedCertificates);

    res.json({
      success: true,
      certificates: formattedCertificates
    });
  } catch (error) {
    console.error('Error fetching tutor certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates'
    });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { title, description, requirements, deadline, courseId } = req.body;
    const tutorId = req.user._id;
    
    console.log('🔍 Creating project with courseId:', courseId);
    console.log('🔍 Tutor ID:', tutorId);
    console.log('🔍 Request body:', req.body);

    // Verify the course belongs to the tutor
    const course = await Course.findById(courseId);
    console.log('🔍 Found course:', course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    console.log('🔍 Course tutor:', course.tutor);
    console.log('🔍 Tutor ID:', tutorId);
    console.log('🔍 Course tutor type:', typeof course.tutor);
    console.log('🔍 Tutor ID type:', typeof tutorId);

    if (course.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create projects for your own courses'
      });
    }

    // Check if a project with the same title already exists for this course
    const existingProject = await Project.findOne({ 
      courseId, 
      title: { $regex: new RegExp(`^${title}$`, 'i') } 
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'A project with this title already exists for this course'
      });
    }

    // Create project
    const project = new Project({
      courseId,
      tutorId,
      title,
      description,
      requirements,
      deadline: deadline ? new Date(deadline) : null
    });

    await project.save();

    // Send notifications to enrolled learners
    try {
      const enrollments = await Enrollment.find({ course: courseId }).populate('learner', 'name email');
      
      for (const enrollment of enrollments) {
        // Create notification for each enrolled learner
        const notification = new Notification({
          recipient: enrollment.learner._id,
          type: 'assignment_created',
          title: 'New Project Assigned!',
          message: `Your tutor has assigned a new project: "${title}". Complete it to earn your certificate!`,
          data: {
            projectId: project._id,
            courseId: courseId,
            tutorId: tutorId,
            projectTitle: title,
            courseName: course.title
          },
          isRead: false
        });
        
        await notification.save();
        console.log(`📧 Notification sent to learner: ${enrollment.learner.name}`);
      }
      
      console.log(`📧 Sent project notifications to ${enrollments.length} learners`);
    } catch (notificationError) {
      console.error('❌ Error sending notifications:', notificationError);
      // Don't fail the project creation if notifications fail
    }

    res.json({
      success: true,
      message: 'Project created successfully',
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        deadline: project.deadline,
        courseId: project.courseId,
        createdAt: project.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get projects for tutor
const getTutorProjects = async (req, res) => {
  try {
    const tutorId = req.user._id;
    
    const projects = await Project.find({ tutorId })
      .populate('courseId', 'title description')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      id: project._id,
      title: project.title,
      description: project.description,
      requirements: project.requirements,
      deadline: project.deadline,
      isActive: project.isActive,
      createdAt: project.createdAt,
      courseName: project.courseId?.title || 'Unknown Course',
      courseDescription: project.courseId?.description || ''
    }));

    res.json({
      success: true,
      projects: formattedProjects
    });
  } catch (error) {
    console.error('Error fetching tutor projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
};

// Get assigned projects for learner
const getLearnerAssignedProjects = async (req, res) => {
  try {
    const learnerId = req.user._id;
    console.log('🔍 Getting assigned projects for learner:', learnerId);
    console.log('🔍 Learner user object:', req.user);
    
    // Find projects for courses that the learner is enrolled in
    const enrollments = await Enrollment.find({ learner: learnerId }).populate('course');
    console.log('🔍 Found enrollments:', enrollments.length);
    console.log('🔍 Enrollment details:', enrollments.map(e => ({
      courseId: e.course._id,
      courseTitle: e.course.title,
      status: e.status
    })));
    
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course._id);
    console.log('🔍 Enrolled course IDs:', enrolledCourseIds);
    
    // Get all projects for enrolled courses
    const allProjects = await Project.find({ 
      courseId: { $in: enrolledCourseIds },
      isActive: true 
    })
      .populate('courseId', 'title description')
      .populate('tutorId', 'name')
      .sort({ createdAt: -1 });

    console.log('🔍 All active projects in database:', allProjects.map(p => ({
      id: p._id,
      title: p.title,
      courseId: p.courseId._id,
      courseTitle: p.courseId.title
    })));

    // Get project IDs that the learner has already submitted
    const submittedProjectIds = await ProjectSubmission.find({ 
      learnerId: learnerId 
    }).distinct('projectId');

    console.log('🔍 Submitted project IDs:', submittedProjectIds);
    console.log('🔍 Submitted project IDs as strings:', submittedProjectIds.map(id => id.toString()));

    // Filter out projects that have already been submitted
    const projects = allProjects.filter(project => {
      const projectIdString = project._id.toString();
      const isSubmitted = submittedProjectIds.some(submittedId => 
        submittedId.toString() === projectIdString
      );
      console.log(`🔍 Project ${project.title} (${projectIdString}) - Submitted: ${isSubmitted}`);
      return !isSubmitted;
    });

    console.log('🔍 Found projects for enrolled courses:', projects.length);
    console.log('🔍 Project details:', projects.map(p => ({
      id: p._id,
      title: p.title,
      courseId: p.courseId._id,
      courseTitle: p.courseId.title
    })));

    const formattedProjects = projects.map(project => {
      console.log('🔍 Mapping project:', {
        _id: project._id,
        id: project.id,
        title: project.title,
        courseId: project.courseId._id
      });
      
      return {
        id: project._id,
        courseId: project.courseId._id,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        deadline: project.deadline,
        isActive: project.isActive,
        createdAt: project.createdAt,
        courseName: project.courseId?.title || 'Unknown Course',
        courseDescription: project.courseId?.description || '',
        tutorName: project.tutorId?.name || 'Unknown Tutor'
      };
    });

    console.log('🔍 Final formatted projects:', formattedProjects);
    
    res.json({
      success: true,
      projects: formattedProjects
    });
  } catch (error) {
    console.error('Error fetching learner assigned projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned projects'
    });
  }
};

// Generate certificate (for manual certificate creation)
const generateCertificate = async (req, res) => {
  try {
    const { studentName, studentEmail, courseName, grade, completionDate, notes } = req.body;
    const tutorId = req.user._id;

    console.log('🔍 Generating certificate with data:', {
      studentName,
      studentEmail,
      courseName,
      grade,
      completionDate,
      notes,
      tutorId
    });

    // Validate required fields
    if (!studentName || !courseName) {
      return res.status(400).json({
        success: false,
        message: 'Student name and course name are required'
      });
    }

    // Convert grade to number if it's a string
    let numericGrade = grade;
    if (grade && typeof grade === 'string') {
      const gradeMap = {
        'A+': 100, 'A': 95, 'A-': 90,
        'B+': 87, 'B': 85, 'B-': 80,
        'C+': 77, 'C': 75, 'C-': 70,
        'D+': 67, 'D': 65, 'D-': 60,
        'F': 0
      };
      numericGrade = gradeMap[grade] || 85;
    } else if (!grade) {
      numericGrade = 85; // Default grade
    }

    // Generate verification code
    const verificationCode = `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create certificate
    const certificate = new Certificate({
      learnerId: null, // Manual certificate, no specific learner
      courseId: null, // Manual certificate, no specific course
      projectId: null, // Manual certificate, no specific project
      submissionId: null, // Manual certificate, no specific submission
      tutorId: tutorId,
      learnerName: studentName,
      courseName: courseName,
      projectName: 'Manual Certificate',
      tutorName: req.user.name,
      grade: numericGrade,
      completionDate: completionDate ? new Date(completionDate) : new Date(),
      verificationCode: verificationCode
    });

    console.log('🔍 Certificate object created:', certificate);
    await certificate.save();
    console.log('✅ Certificate saved successfully:', certificate._id);

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate._id,
        learnerName: certificate.learnerName,
        courseName: certificate.courseName,
        projectName: certificate.projectName,
        tutorName: certificate.tutorName,
        grade: certificate.grade,
        completionDate: certificate.completionDate,
        verificationCode: certificate.verificationCode
      }
    });
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    
    res.status(500).json({
      success: false,
      message: 'Error generating certificate',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Internal server error'
    });
  }
};

module.exports = {
  upload,
  createProject,
  getTutorProjects,
  getTutorProjectSubmissions,
  getLearnerProjectSubmissions,
  getLearnerAssignedProjects,
  submitProject,
  reviewProjectSubmission,
  generateProjectCertificate,
  getLearnerCertificates,
  getTutorCertificates,
  generateCertificate
};
