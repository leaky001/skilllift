// Utility functions for handling file URLs

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Constructs the full URL for uploaded files
 * @param {string} filePath - The file path from the backend (e.g., '/uploads/thumbnails/filename.png')
 * @returns {string} The full URL to access the file
 */
export const getFileUrl = (filePath) => {
  console.log('🔍 getFileUrl called with:', filePath);
  console.log('🔍 API_BASE_URL:', API_BASE_URL);
  
  if (!filePath || filePath === 'undefined' || filePath === 'null') {
    console.log('❌ No valid filePath provided');
    return null;
  }
  
  // If it's already a full URL (e.g., Cloudinary URL), return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    console.log('✅ Full URL detected:', filePath);
    return filePath;
  }
  
  // For static files, we need to use the base URL without /api
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // Normalize file path: convert backslashes to forward slashes
  let normalizedPath = filePath.replace(/\\/g, '/');
  
  // If it's a relative path starting with /, construct the full URL
  if (normalizedPath.startsWith('/')) {
    const fullUrl = `${baseUrl}${normalizedPath}`;
    console.log('✅ Constructed full URL:', fullUrl);
    return fullUrl;
  }
  
  // If path already starts with 'uploads/', don't add another 'uploads/'
  if (normalizedPath.startsWith('uploads/')) {
    const fullUrl = `${baseUrl}/${normalizedPath}`;
    console.log('✅ Constructed uploads URL (already has uploads):', fullUrl);
    return fullUrl;
  }
  
  // If it's just a filename, assume it's in uploads directory
  const fullUrl = `${baseUrl}/uploads/${normalizedPath}`;
  console.log('✅ Constructed uploads URL:', fullUrl);
  return fullUrl;
};

/**
 * Constructs the full URL for course thumbnails
 * @param {string} thumbnailPath - The thumbnail path from the course object
 * @returns {string} The full URL to access the thumbnail
 */
export const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath || thumbnailPath === 'undefined' || thumbnailPath === 'null') {
    return null;
  }
  
  return getFileUrl(thumbnailPath);
};

/**
 * Constructs the full URL for course preview videos
 * @param {string} videoPath - The video path from the course object
 * @returns {string} The full URL to access the video
 */
export const getVideoUrl = (videoPath) => {
  return getFileUrl(videoPath);
};

/**
 * Constructs the full URL for course content files
 * @param {string} contentPath - The content file path from the course object
 * @returns {string} The full URL to access the content file
 */
export const getContentUrl = (contentPath) => {
  return getFileUrl(contentPath);
};

/**
 * Gets a placeholder image URL for courses without thumbnails
 * @param {string} category - The course category
 * @returns {string} A placeholder image URL
 */
export const getPlaceholderImage = (category = 'general') => {
  // Use built-in SVG placeholders instead of external URLs
  const categoryMap = {
    'Business': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0I4MkY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CdXNpbmVzczwvdGV4dD48L3N2Zz4=',
    'Technology': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBCOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UZWNobm9sb2d5PC90ZXh0Pjwvc3ZnPg==',
    'Design': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZXNpZ248L3RleHQ+PC9zdmc+',
    'Marketing': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjU5RTBCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXJrZXRpbmc8L3RleHQ+PC9zdmc+',
    'Programming': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9ncmFtbWluZzwvdGV4dD48L3N2Zz4=',
    'Health': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDZCNkQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZWFsdGg8L3RleHQ+PC9zdmc+',
    'Education': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjODRDQzE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FZHVjYXRpb248L3RleHQ+PC9zdmc+',
    'Finance': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjk3MzE2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GaW5hbmNlPC90ZXh0Pjwvc3ZnPg==',
    'Lifestyle': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUM0ODk5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MaWZlc3R5bGU8L3RleHQ+PC9zdmc+',
    'Web Development': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0I4MkY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5XZWIgRGV2ZWxvcG1lbnQ8L3RleHQ+PC9zdmc+',
    'Digital Marketing': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjU5RTBCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EaWdpdGFsIE1hcmtldGluZzwvdGV4dD48L3N2Zz4=',
    'general': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNkI3MjgwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db3Vyc2U8L3RleHQ+PC9zdmc+'
  };
  
  return categoryMap[category] || categoryMap.general;
};

/**
 * Gets a CSS-based placeholder for when external images fail
 * @param {string} category - The course category
 * @returns {string} CSS background style
 */
export const getCSSPlaceholder = (category = 'general') => {
  const categoryColors = {
    'Business': '#3B82F6',
    'Technology': '#10B981',
    'Design': '#8B5CF6',
    'Marketing': '#F59E0B',
    'Programming': '#EF4444',
    'Health': '#06B6D4',
    'Education': '#84CC16',
    'Finance': '#F97316',
    'Lifestyle': '#EC4899',
    'Web Development': '#3B82F6',
    'Digital Marketing': '#F59E0B',
    'general': '#6B7280'
  };
  
  const color = categoryColors[category] || categoryColors.general;
  return `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
};

/**
 * Checks if a file path is a local file (not a full URL)
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if it's a local file
 */
export const isLocalFile = (filePath) => {
  if (!filePath) return false;
  return !filePath.startsWith('http://') && !filePath.startsWith('https://');
};

/**
 * Gets the file extension from a file path
 * @param {string} filePath - The file path
 * @returns {string} The file extension (without the dot)
 */
export const getFileExtension = (filePath) => {
  if (!filePath) return '';
  const lastDotIndex = filePath.lastIndexOf('.');
  return lastDotIndex > -1 ? filePath.substring(lastDotIndex + 1).toLowerCase() : '';
};

/**
 * Checks if a file is an image based on its extension
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if it's an image file
 */
export const isImageFile = (filePath) => {
  const ext = getFileExtension(filePath);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

/**
 * Checks if a file is a video based on its extension
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if it's a video file
 */
export const isVideoFile = (filePath) => {
  const ext = getFileExtension(filePath);
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext);
};

/**
 * Checks if a file is a document based on its extension
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if it's a document file
 */
export const isDocumentFile = (filePath) => {
  const ext = getFileExtension(filePath);
  return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext);
};
