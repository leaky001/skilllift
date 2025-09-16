import apiService from './api';

// ===== FILE UPLOAD SERVICE =====

export const uploadFile = async (file, type, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    // Add additional options
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    const response = await apiService.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (options.onProgress) {
          options.onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// ===== VIDEO UPLOAD FOR REPLAYS =====

export const uploadReplayVideo = async (file, sessionId, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('sessionId', sessionId);
    
    if (options.title) formData.append('title', options.title);
    if (options.description) formData.append('description', options.description);
    if (options.category) formData.append('category', options.category);
    if (options.level) formData.append('level', options.level);
    if (options.tags) formData.append('tags', JSON.stringify(options.tags));

    const response = await apiService.post('/upload/replay', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (options.onProgress) {
          options.onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading replay video:', error);
    throw error;
  }
};

export const getVideoUploadStatus = async (uploadId) => {
  try {
    const response = await apiService.get(`/upload/status/${uploadId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting upload status:', error);
    throw error;
  }
};

export const cancelVideoUpload = async (uploadId) => {
  try {
    const response = await apiService.delete(`/upload/cancel/${uploadId}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling upload:', error);
    throw error;
  }
};

// ===== CERTIFICATE UPLOAD =====

export const uploadCertificate = async (file, certificateData) => {
  try {
    const formData = new FormData();
    formData.append('certificate', file);
    
    Object.keys(certificateData).forEach(key => {
      formData.append(key, certificateData[key]);
    });

    const response = await apiService.post('/upload/certificate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading certificate:', error);
    throw error;
  }
};

export const generateCertificatePDF = async (certificateData) => {
  try {
    const response = await apiService.post('/upload/certificate/generate', certificateData);
    return response.data;
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
};

// ===== COURSE MATERIAL UPLOAD =====

export const uploadCourseMaterial = async (file, courseId, materialData) => {
  try {
    const formData = new FormData();
    formData.append('material', file);
    formData.append('courseId', courseId);
    
    Object.keys(materialData).forEach(key => {
      formData.append(key, materialData[key]);
    });

    const response = await apiService.post('/upload/course-material', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading course material:', error);
    throw error;
  }
};

// ===== PROFILE IMAGE UPLOAD =====

export const uploadProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiService.post('/upload/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// ===== ASSIGNMENT SUBMISSION UPLOAD =====

export const uploadAssignmentSubmission = async (files, assignmentId, submissionData) => {
  try {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    
    // Handle multiple files
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    } else {
      formData.append('files', files);
    }
    
    Object.keys(submissionData).forEach(key => {
      formData.append(key, submissionData[key]);
    });

    const response = await apiService.post('/upload/assignment-submission', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading assignment submission:', error);
    throw error;
  }
};

// ===== FILE VALIDATION =====

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===== FILE UTILITIES =====

export const getFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const isImageFile = (file) => {
  return file.type.startsWith('image/');
};

export const isVideoFile = (file) => {
  return file.type.startsWith('video/');
};

export const isPDFFile = (file) => {
  return file.type === 'application/pdf';
};

export const createFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };

    if (isImageFile(file)) {
      reader.readAsDataURL(file);
    } else {
      resolve(null);
    }
  });
};

// ===== CLOUD STORAGE INTEGRATION =====

export const uploadToCloudStorage = async (file, path, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    const response = await apiService.post('/upload/cloud', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to cloud storage:', error);
    throw error;
  }
};

export const deleteFromCloudStorage = async (fileUrl) => {
  try {
    const response = await apiService.delete('/upload/cloud', {
      data: { fileUrl }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting from cloud storage:', error);
    throw error;
  }
};

// ===== BATCH UPLOAD =====

export const uploadMultipleFiles = async (files, type, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadFile(file, type, options)
    );
    
    const results = await Promise.allSettled(uploadPromises);
    
    return results.map((result, index) => ({
      file: files[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : result.reason
    }));
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};
