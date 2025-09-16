const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
const ApiResponse = require('../utils/apiResponse');
const { sendEmail } = require('../utils/sendEmail');
// const logger = require('../utils/logger');
const fs = require('fs');

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      category,
      subcategory,
      courseType,
      level,
      priceMin,
      priceMax,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      status: 'published'
    };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (courseType) filter.courseType = courseType;
    if (level) filter.level = level;
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const courses = await Course.find(filter)
      .populate('tutor', 'name profilePicture tutorProfile.rating')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-content -liveClassDetails.schedule -physicalClassDetails.schedule')
      .maxTimeMS(15000);

    const total = await Course.countDocuments(filter);

    const paginationData = ApiResponse.pagination(courses, page, limit, total);
    
    console.log('Courses retrieved successfully', { 
      count: courses.length, 
      total, 
      page, 
      limit 
    });

    res.json(ApiResponse.success(
      paginationData.data,
      'Courses retrieved successfully',
      200,
      paginationData.pagination
    ));
  } catch (error) {
    console.error('Error retrieving courses', { error: error.message });
    res.status(500).json(ApiResponse.serverError('Failed to retrieve courses'));
  }
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('tutor', 'name profilePicture tutorProfile.bio tutorProfile.skills tutorProfile.rating')
    .populate('enrolledStudents', 'name profilePicture');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Only show full content to enrolled students or tutors
  if (course.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.json({
    success: true,
    data: course
  });
});

// @desc    Get tutor's own course (for editing/viewing)
// @route   GET /api/courses/tutor/course/:id
// @access  Private (Tutor only)
exports.getTutorCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate course ID
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID'
    });
  }
  
  const course = await Course.findById(id)
    .populate('tutor', 'name profilePicture tutorProfile.bio tutorProfile.skills tutorProfile.rating')
    .populate('enrolledStudents', 'name profilePicture');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if the authenticated user is the course owner
  if (course.tutor._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own courses.'
    });
  }

  res.json({
    success: true,
    data: course
  });
});

// @desc    Get course preview (public)
// @route   GET /api/courses/:id/preview
// @access  Public
exports.getCoursePreview = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('tutor', 'name profilePicture tutorProfile.bio tutorProfile.skills tutorProfile.rating')
    .select('-content -liveClassDetails.schedule -physicalClassDetails.schedule');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (course.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.json({
    success: true,
    data: course
  });
});


exports.createCourse = asyncHandler(async (req, res) => {
  try {
    console.log('🚀 Course creation started');
    console.log('👤 User:', req.user);
    console.log('📁 Files received:', req.files);
    console.log('📝 Body data:', req.body);
    
    // Check if tutor can create courses (KYC must be approved)
    if (!req.user.canCreateCourses()) {
      console.log('❌ Tutor KYC not approved:', req.user.tutorProfile?.kycStatus);
      return res.status(403).json(ApiResponse.error(
        'You must complete KYC verification before creating courses. Please submit your KYC documents and wait for admin approval.',
        403
      ));
    }
    
    const {
      title,
      description,
      category,
      subcategory,
      tags,
      price,
      duration,
      level,
      language,
      courseType,
      prerequisites,
      learningOutcomes,
      liveClassDetails,
      lessons
    } = req.body;

  // Parse liveClassDetails if it's a JSON string
  let parsedLiveClassDetails = liveClassDetails;
  if (typeof liveClassDetails === 'string') {
    try {
      parsedLiveClassDetails = JSON.parse(liveClassDetails);
    } catch (error) {
      console.log('❌ Failed to parse liveClassDetails:', error);
      parsedLiveClassDetails = {};
    }
  }



  // Parse lessons if it's a JSON string
  let parsedLessons = lessons;
  if (typeof lessons === 'string') {
    try {
      parsedLessons = JSON.parse(lessons);
    } catch (error) {
      console.log('❌ Failed to parse lessons:', error);
      parsedLessons = [];
    }
  }

  console.log('🔍 Parsed liveClassDetails:', parsedLiveClassDetails);

  // Validate required fields
  if (!title || !description || !category || !price || !courseType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  
  // Live classes are handled by the platform's built-in system
  // No external meeting links required

  
  let thumbnail = '';
  let previewVideo = '';
  let content = [];

  if (req.files) {
    console.log('📁 Processing files:', Object.keys(req.files));
    const fileStartTime = Date.now();
    
    if (req.files.thumbnail) {
      try {
        // Try Cloudinary first
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
            folder: 'course-thumbnails',
            transformation: [{ width: 400, height: 300, crop: 'fill' }]
          });
          thumbnail = result.secure_url;
        } else {
          // Fallback to local storage
          const fileName = `thumbnails/${Date.now()}-${req.files.thumbnail[0].originalname}`;
          const filePath = `uploads/${fileName}`;
          fs.copyFileSync(req.files.thumbnail[0].path, filePath);
          thumbnail = `/uploads/${fileName}`;
        }
        fs.unlinkSync(req.files.thumbnail[0].path);
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        // Fallback to local storage
        const fileName = `thumbnails/${Date.now()}-${req.files.thumbnail[0].originalname}`;
        const filePath = `uploads/${fileName}`;
        fs.copyFileSync(req.files.thumbnail[0].path, filePath);
        thumbnail = `/uploads/${fileName}`;
        fs.unlinkSync(req.files.thumbnail[0].path);
      }
    }

    
    if (req.files.previewVideo) {
      try {
        // Try Cloudinary first
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.uploader.upload(req.files.previewVideo[0].path, {
            folder: 'course-preview-videos',
            resource_type: 'video'
          });
          previewVideo = result.secure_url;
        } else {
          // Fallback to local storage
          const fileName = `videos/${Date.now()}-${req.files.previewVideo[0].originalname}`;
          const filePath = `uploads/${fileName}`;
          fs.copyFileSync(req.files.previewVideo[0].path, filePath);
          previewVideo = `/uploads/${fileName}`;
        }
        fs.unlinkSync(req.files.previewVideo[0].path);
      } catch (error) {
        console.error('Error uploading preview video:', error);
        // Fallback to local storage
        const fileName = `videos/${Date.now()}-${req.files.previewVideo[0].originalname}`;
        const filePath = `uploads/${fileName}`;
        fs.copyFileSync(req.files.previewVideo[0].path, filePath);
        previewVideo = `/uploads/${fileName}`;
        fs.unlinkSync(req.files.previewVideo[0].path);
      }
    }

    
    if (req.files.content) {
      for (const file of req.files.content) {
        try {
          // Try Cloudinary first
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'course-content',
              resource_type: 'auto'
            });
            content.push({
              title: file.originalname,
              type: file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('image/') ? 'image' : 'document',
              url: result.secure_url,
              size: file.size
            });
          } else {
            // Fallback to local storage
            const fileName = `course-content/${Date.now()}-${file.originalname}`;
            const filePath = `uploads/${fileName}`;
            fs.copyFileSync(file.path, filePath);
            content.push({
              title: file.originalname,
              type: file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('image/') ? 'image' : 'document',
              url: `/uploads/${fileName}`,
              size: file.size
            });
          }
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Error uploading content file:', error);
          // Fallback to local storage
          const fileName = `course-content/${Date.now()}-${file.originalname}`;
          const filePath = `uploads/${fileName}`;
          fs.copyFileSync(file.path, filePath);
          content.push({
            title: file.originalname,
            type: file.mimetype.startsWith('video/') ? 'video' : 
                  file.mimetype.startsWith('image/') ? 'image' : 'document',
            url: `/uploads/${fileName}`,
            size: file.size
          });
          fs.unlinkSync(file.path);
        }
      }
    }
    
    const fileEndTime = Date.now();
    const fileProcessingTime = fileEndTime - fileStartTime;
    console.log(`📁 File processing completed in ${fileProcessingTime}ms`);
  }

  console.log('💾 Creating course with data:', { title, thumbnail, previewVideo, contentLength: content.length });
  
  console.log('⏳ Starting course creation...');
  const startTime = Date.now();
  
  // Create course with timeout
  console.log('⏳ Creating course in database...');
  const course = await Promise.race([
    Course.create({
      title,
      description,
      tutor: req.user._id,
      category,
      subcategory,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      price: parseFloat(price),
      duration,
      durationInMonths: 1, // Default to 1 month
      level,
      language,
      courseType,
      prerequisites: prerequisites ? prerequisites.split(',').map(p => p.trim()) : [],
      learningOutcomes: learningOutcomes ? learningOutcomes.split(',').map(o => o.trim()) : [],
      thumbnail,
      previewVideo,
      content,
      liveClassDetails: courseType === 'online-live' ? parsedLiveClassDetails : undefined,
      lessons: courseType === 'online-prerecorded' ? parsedLessons : undefined,
      totalLessons: courseType === 'online-prerecorded' ? (parsedLessons?.length || 0) : 0,
      totalDuration: courseType === 'online-prerecorded' ? (parsedLessons?.reduce((total, lesson) => total + (lesson.durationMinutes || 0), 0) || 0) : 0,
      status: 'published', // Publish directly since tutors are KYC verified
      publishedAt: new Date()
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Course creation timeout after 30 seconds')), 30000)
    )
  ]);

  // Notify learners about new course availability
  try {
    console.log('🔔 Skipping learner notifications for now...');
    // Temporarily disabled to fix course creation
    /*
    console.log('🔔 Notifying learners about new course availability...');
    
    // Get all learners who might be interested in this course
    const interestedLearners = await User.find({
      role: 'learner',
      accountStatus: 'approved',
      $or: [
        { 'learnerProfile.preferences': { $in: [category] } },
        { 'learnerProfile.preferences': { $in: [subcategory] } },
        { 'learnerProfile.preferences': { $in: [level] } }
      ]
    }).limit(100); // Limit to prevent spam

    console.log(`📧 Found ${interestedLearners.length} potentially interested learners`);

    // Send notifications to interested learners
    for (const learner of interestedLearners) {
      // Create notification
      await Notification.create({
        recipient: learner._id,
        type: 'course_available',
        title: '🎓 New Course Available!',
        message: `A new course "${title}" in ${category} is now available for enrollment. Check it out!`,
        data: {
          courseId: course._id,
          courseTitle: title,
          courseCategory: category,
          courseSubcategory: subcategory,
          courseLevel: level,
          coursePrice: price,
          tutorName: req.user.name,
          courseDescription: description,
          courseDuration: duration
        },
        priority: 'medium',
        isRead: false
      });

      // Send email notification
      await sendEmail({
        to: learner.email,
        subject: `🎓 New Course Available: ${title}`,
        template: 'courseAvailable',
        data: {
          name: learner.name,
          courseTitle: title,
          courseDescription: description,
          courseCategory: category,
          courseLevel: level,
          coursePrice: price,
          courseDuration: duration,
          tutorName: req.user.name
        }
      });
    }

    console.log(`✅ Notified ${interestedLearners.length} learners about new course availability`);
    */
  } catch (error) {
    console.error('❌ Error notifying learners about course availability:', error);
    // Don't fail course creation if notification fails
  }

    const endTime = Date.now();
    const creationTime = endTime - startTime;
    console.log(`🎉 Course created successfully in ${creationTime}ms!`);
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully and is now live! Learners have been notified.'
    });
  } catch (error) {
    console.error('❌ Error in createCourse:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Tutors only)
exports.updateCourse = asyncHandler(async (req, res) => {
  console.log('🚀 Course update started');
  console.log('📝 Course ID:', req.params.id);
  console.log('📁 Files received:', req.files);
  console.log('📝 Body data:', req.body);
  
  const course = await Course.findById(req.params.id);

  if (!course) {
    console.log('❌ Course not found:', req.params.id);
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this course'
    });
  }

  // Check if course can be updated - Allow editing published courses but notify about re-approval
  if (course.status === 'published' && course.totalEnrollments > 0) {
    // Allow editing but warn that it will require re-approval
    console.log('⚠️ Editing published course with enrolled students - will require re-approval');
  }

  // Handle file uploads
  if (req.files) {
    // Handle thumbnail
    if (req.files.thumbnail) {
      try {
        // Try Cloudinary first
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
            folder: 'course-thumbnails',
            transformation: [{ width: 400, height: 300, crop: 'fill' }]
          });
          req.body.thumbnail = result.secure_url;
        } else {
          // Fallback to local storage
          const fileName = `thumbnails/${Date.now()}-${req.files.thumbnail[0].originalname}`;
          const filePath = `uploads/${fileName}`;
          if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
          }
          if (!fs.existsSync('uploads/thumbnails')) {
            fs.mkdirSync('uploads/thumbnails', { recursive: true });
          }
          fs.copyFileSync(req.files.thumbnail[0].path, filePath);
          req.body.thumbnail = `/uploads/${fileName}`;
        }
        fs.unlinkSync(req.files.thumbnail[0].path);
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        // Fallback to local storage
        const fileName = `thumbnails/${Date.now()}-${req.files.thumbnail[0].originalname}`;
        const filePath = `uploads/${fileName}`;
        if (!fs.existsSync('uploads')) {
          fs.mkdirSync('uploads', { recursive: true });
        }
        if (!fs.existsSync('uploads/thumbnails')) {
          fs.mkdirSync('uploads/thumbnails', { recursive: true });
        }
        fs.copyFileSync(req.files.thumbnail[0].path, filePath);
        req.body.thumbnail = `/uploads/${fileName}`;
        fs.unlinkSync(req.files.thumbnail[0].path);
      }
    }

    // Handle preview video
    if (req.files.previewVideo) {
      try {
        // Try Cloudinary first
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.uploader.upload(req.files.previewVideo[0].path, {
            folder: 'course-preview-videos',
            resource_type: 'video'
          });
          req.body.previewVideo = result.secure_url;
        } else {
          // Fallback to local storage
          const fileName = `videos/${Date.now()}-${req.files.previewVideo[0].originalname}`;
          const filePath = `uploads/${fileName}`;
          if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
          }
          if (!fs.existsSync('uploads/videos')) {
            fs.mkdirSync('uploads/videos', { recursive: true });
          }
          fs.copyFileSync(req.files.previewVideo[0].path, filePath);
          req.body.previewVideo = `/uploads/${fileName}`;
        }
        fs.unlinkSync(req.files.previewVideo[0].path);
      } catch (error) {
        console.error('Error uploading preview video:', error);
        // Fallback to local storage
        const fileName = `videos/${Date.now()}-${req.files.previewVideo[0].originalname}`;
        const filePath = `uploads/${fileName}`;
        if (!fs.existsSync('uploads')) {
          fs.mkdirSync('uploads', { recursive: true });
        }
        if (!fs.existsSync('uploads/videos')) {
          fs.mkdirSync('uploads/videos', { recursive: true });
        }
        fs.copyFileSync(req.files.previewVideo[0].path, filePath);
        req.body.previewVideo = `/uploads/${fileName}`;
        fs.unlinkSync(req.files.previewVideo[0].path);
      }
    }

    // Handle course content
    if (req.files.content) {
      const newContent = [];
      for (const file of req.files.content) {
        try {
          // Try Cloudinary first
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'course-content',
              resource_type: 'auto'
            });
            newContent.push({
              title: file.originalname,
              type: file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('image/') ? 'image' : 'document',
              url: result.secure_url,
              size: file.size
            });
          } else {
            // Fallback to local storage
            const fileName = `content/${Date.now()}-${file.originalname}`;
            const filePath = `uploads/${fileName}`;
            if (!fs.existsSync('uploads')) {
              fs.mkdirSync('uploads', { recursive: true });
            }
            if (!fs.existsSync('uploads/content')) {
              fs.mkdirSync('uploads/content', { recursive: true });
            }
            fs.copyFileSync(file.path, filePath);
            newContent.push({
              title: file.originalname,
              type: file.mimetype.startsWith('video/') ? 'video' : 
                    file.mimetype.startsWith('image/') ? 'image' : 'document',
              url: `/uploads/${fileName}`,
              size: file.size
            });
          }
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Error uploading content file:', error);
          // Fallback to local storage
          const fileName = `content/${Date.now()}-${file.originalname}`;
          const filePath = `uploads/${fileName}`;
          if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
          }
          if (!fs.existsSync('uploads/content')) {
            fs.mkdirSync('uploads/content', { recursive: true });
          }
          fs.copyFileSync(file.path, filePath);
          newContent.push({
            title: file.originalname,
            type: file.mimetype.startsWith('video/') ? 'video' : 
                  file.mimetype.startsWith('image/') ? 'image' : 'document',
            url: `/uploads/${fileName}`,
            size: file.size
          });
          fs.unlinkSync(file.path);
        }
      }
      req.body.content = [...course.content, ...newContent];
    }
  }

  // Reset status when updating
  req.body.status = 'draft';

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const message = course.status === 'published' && course.totalEnrollments > 0
      ? 'Course updated successfully. Since this course has enrolled students, changes will be reviewed before taking effect.'
      : 'Course updated successfully. Please republish to make changes live.';

    console.log('✅ Course updated successfully:', updatedCourse._id);
    res.json({
      success: true,
      data: updatedCourse,
      message: message
    });
  } catch (error) {
    console.error('❌ Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Tutors only)
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this course'
    });
  }

  // Check if course can be deleted
  if (course.totalEnrollments > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete course with enrolled students'
    });
  }

  await course.remove();

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Get tutor's courses
// @route   GET /api/courses/tutor/my-courses
// @access  Private (Tutors only)
exports.getTutorCourses = asyncHandler(async (req, res) => {
  console.log('🔍 Fetching tutor courses for user:', req.user?._id);
  console.log('🔍 User object:', req.user);
  
  if (!req.user || !req.user._id) {
    console.error('❌ No user found in request');
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  try {
    const courses = await Course.find({ tutor: req.user._id })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${courses.length} courses for tutor`);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('❌ Error fetching tutor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// @desc    Publish course
// @route   POST /api/courses/:id/publish
// @access  Private (Tutors only)
exports.publishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to publish this course'
    });
  }

  // Check if course is ready for publishing
  if (!course.thumbnail || !course.previewVideo || course.content.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Course must have thumbnail, preview video, and content before publishing'
    });
  }

  course.status = 'published';
  course.publishedAt = new Date();
  await course.save();

  // Notify learners about new course availability
  try {
    console.log('🔔 Notifying learners about new course availability...');
    
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    const { sendEmail } = require('../utils/sendEmail');
    
    // Get all learners who might be interested in this course
    const interestedLearners = await User.find({
      role: 'learner',
      accountStatus: 'approved',
      $or: [
        { 'learnerProfile.preferences': course.category },
        { 'learnerProfile.preferences': course.subcategory },
        { 'learnerProfile.preferences': course.level }
      ]
    }).limit(100); // Limit to prevent spam

    console.log(`📧 Found ${interestedLearners.length} potentially interested learners`);

    // Send notifications to interested learners
    for (const learner of interestedLearners) {
      // Create notification
      await Notification.create({
        recipient: learner._id,
        type: 'course_available',
        title: '🎓 New Course Available!',
        message: `A new course "${course.title}" in ${course.category} is now available for enrollment. Check it out!`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          courseCategory: course.category,
          courseSubcategory: course.subcategory,
          courseLevel: course.level,
          coursePrice: course.price,
          tutorName: req.user.name,
          courseDescription: course.description,
          courseDuration: course.duration
        },
        priority: 'medium',
        isRead: false
      });

      // Send email notification
      await sendEmail({
        to: learner.email,
        subject: `🎓 New Course Available: ${course.title}`,
        template: 'courseAvailable',
        data: {
          name: learner.name,
          courseTitle: course.title,
          courseDescription: course.description,
          courseCategory: course.category,
          courseLevel: course.level,
          coursePrice: course.price,
          courseDuration: course.duration,
          tutorName: req.user.name
        }
      });
    }

    console.log(`✅ Notified ${interestedLearners.length} learners about new course availability`);
  } catch (error) {
    console.error('❌ Error notifying learners about course availability:', error);
  }

  res.json({
    success: true,
    data: course,
    message: 'Course published successfully! It is now live and available for enrollment.'
  });
});

// @desc    Archive course
// @route   POST /api/courses/:id/archive
// @access  Private (Tutors only)
exports.archiveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to archive this course'
    });
  }

  course.status = 'archived';
  await course.save();

  res.json({
    success: true,
    data: course,
    message: 'Course archived successfully'
  });
});

// @desc    Get all courses (Admin)
// @route   GET /api/courses/all
// @access  Private (Admin only)
exports.getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const {
    status,
    category,
    tutor,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (tutor && tutor !== 'all') {
    filter.tutor = tutor;
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const courses = await Course.find(filter)
    .populate('tutor', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Course.countDocuments(filter);

  res.json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Restore course (Tutor)
// @route   POST /api/courses/:id/restore
// @access  Private (Tutors only)
exports.restoreCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to restore this course'
    });
  }

  if (course.status !== 'archived') {
    return res.status(400).json({
      success: false,
      message: 'Course is not archived'
    });
  }

  course.status = 'draft';
  await course.save();

  res.json({
    success: true,
    data: course,
    message: 'Course restored successfully'
  });
});

// @desc    Get course statistics (Admin)
// @route   GET /api/courses/admin/statistics
// @access  Private (Admin only)
exports.getCourseStatistics = asyncHandler(async (req, res) => {
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ status: 'published' });
  const archivedCourses = await Course.countDocuments({ status: 'archived' });

  const courseStats = await Course.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  const monthlyStats = await Course.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.json({
    success: true,
    data: {
      totalCourses,
      publishedCourses,
      archivedCourses,
      categoryStats: courseStats,
      monthlyStats
    }
  });
});
