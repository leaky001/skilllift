const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create upload directory if it doesn't exist
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Determine subdirectory based on file type
    let subDir = 'general';
    if (file.fieldname === 'thumbnail') subDir = 'thumbnails';
    else if (file.fieldname === 'previewVideo') subDir = 'videos';
    else if (file.fieldname === 'content') subDir = 'course-content';
    else if (file.fieldname === 'attachments') subDir = 'assignments';
    else if (file.fieldname === 'videos') subDir = 'submissions';
    else if (file.fieldname === 'profilePicture') subDir = 'profile-pictures';
    else if (file.fieldname === 'certificate') subDir = 'certificates';
    else if (file.fieldname === 'idDocument' || file.fieldname === 'addressDocument') subDir = 'id-docs';
    else if (file.fieldname === 'profilePhoto') subDir = 'profile-pictures';
    else if (file.fieldname === 'replayFile') subDir = 'replays';
    
    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
  const allowedDocumentTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  // Check file type based on field name
  let isAllowed = false;
  
  if (file.fieldname === 'thumbnail' || file.fieldname === 'profilePicture') {
    isAllowed = allowedImageTypes.includes(file.mimetype);
  } else if (file.fieldname === 'previewVideo') {
    isAllowed = allowedVideoTypes.includes(file.mimetype);
  } else if (file.fieldname === 'content' || file.fieldname === 'attachments') {
    isAllowed = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes].includes(file.mimetype);
  } else if (file.fieldname === 'videos') {
    isAllowed = allowedVideoTypes.includes(file.mimetype);
  } else if (file.fieldname === 'certificate') {
    isAllowed = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype);
  } else if (file.fieldname === 'replayFile') {
    isAllowed = allowedVideoTypes.includes(file.mimetype);
  } else {
    isAllowed = true; // Allow other file types
  }
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${file.fieldname}: ${getAllowedTypes(file.fieldname)}`), false);
  }
};

// Helper function to get allowed file types for a field
function getAllowedTypes(fieldName) {
  switch (fieldName) {
    case 'thumbnail':
    case 'profilePicture':
      return 'JPEG, JPG, PNG, GIF, WEBP';
    case 'previewVideo':
      return 'MP4, AVI, MOV, WMV, FLV, WEBM';
    case 'content':
    case 'attachments':
      return 'Images, Videos, PDF, Word, Excel, Text files';
    case 'videos':
      return 'MP4, AVI, MOV, WMV, FLV, WEBM';
    case 'certificate':
      return 'PDF, JPEG, PNG';
    case 'replayFile':
      return 'MP4, AVI, MOV, WMV, FLV, WEBM';
    default:
      return 'All file types';
  }
}

// Configure multer with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max file size for replay videos
    files: 10 // Maximum 10 files per request
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 2GB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed per request.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Clean up uploaded files on error
const cleanupUploads = (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function to clean up files on error
  res.send = function(data) {
    if (res.statusCode >= 400 && req.files) {
      // Clean up uploaded files on error
      Object.values(req.files).flat().forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    // Call original send function
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  upload,
  handleUploadError,
  cleanupUploads
};
