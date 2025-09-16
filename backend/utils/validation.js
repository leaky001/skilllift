

const validateFileUpload = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxSize = 5 * 1024 * 1024) => {
  const errors = [];

  if (!file) {
    return { isValid: true, errors: [] };
  }

  // Check file size (5MB default)
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateVideoUpload = (file, maxSize = 100 * 1024 * 1024) => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  return validateFileUpload(file, allowedTypes, maxSize);
};

module.exports = {
  validateFileUpload,
  validateVideoUpload
};
