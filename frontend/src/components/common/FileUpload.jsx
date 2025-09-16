import React, { useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  FaCloudUploadAlt, 
  FaFile, 
  FaVideo, 
  FaImage, 
  FaFileAlt,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaPlay,
  FaPause,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import apiService from '../../services/api';

const FileUpload = ({
  onUploadComplete,
  onUploadError,
  allowedTypes = ['image', 'video', 'document'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  multiple = false,
  uploadType = 'course', // course, assignment, profile, etc.
  className = '',
  showPreview = true,
  showProgress = true
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // File type configurations
  const fileTypes = {
    image: {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      icon: FaImage,
      maxSize: 10 * 1024 * 1024 // 10MB for images
    },
    video: {
      extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      mimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
      icon: FaVideo,
      maxSize: 500 * 1024 * 1024 // 500MB for videos
    },
    document: {
      extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
      mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
      icon: FaFileAlt,
      maxSize: 50 * 1024 * 1024 // 50MB for documents
    }
  };

  // Validate file
  const validateFile = useCallback((file) => {
    const errors = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB limit`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const fileMimeType = file.type;
    
    let isValidType = false;
    for (const type of allowedTypes) {
      if (fileTypes[type]) {
        if (fileTypes[type].extensions.includes(fileExtension) || 
            fileTypes[type].mimeTypes.includes(fileMimeType)) {
          isValidType = true;
          break;
        }
      }
    }

    if (!isValidType) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check individual file size limits
    for (const type of allowedTypes) {
      if (fileTypes[type]) {
        if (fileTypes[type].extensions.includes(fileExtension) || 
            fileTypes[type].mimeTypes.includes(fileMimeType)) {
          if (file.size > fileTypes[type].maxSize) {
            errors.push(`${type} files cannot exceed ${(fileTypes[type].maxSize / (1024 * 1024)).toFixed(0)}MB`);
          }
          break;
        }
      }
    }

    return errors;
  }, [allowedTypes, maxFileSize, fileTypes]);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
          url: null,
          thumbnail: null
        });
      } else {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => showError(error));
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles);
      }
    }
  }, [validateFile, multiple]);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Upload file to Cloudinary
  const uploadFile = async (fileData) => {
    try {
      // Get upload signature from backend
      const signatureResponse = await apiService.post('/upload/signature', {
        uploadType,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type
      });

      if (!signatureResponse.data.success) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, timestamp, apiKey, folder } = signatureResponse.data;

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('resource_type', fileData.type.startsWith('video/') ? 'video' : 'auto');

      // Upload to Cloudinary
      const uploadResponse = await apiService.post('/upload/cloudinary', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            [fileData.id]: progress
          }));
        }
      });

      if (uploadResponse.data.success) {
        return uploadResponse.data.data;
      } else {
        throw new Error(uploadResponse.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Process all files
  const processFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];
    const errors = [];

    for (const fileData of files) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ));

        // Upload file
        const uploadResult = await uploadFile(fileData);

        // Update file with success
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'completed',
            url: uploadResult.url,
            thumbnail: uploadResult.thumbnail,
            publicId: uploadResult.publicId
          } : f
        ));

        results.push({
          ...fileData,
          url: uploadResult.url,
          thumbnail: uploadResult.thumbnail,
          publicId: uploadResult.publicId
        });

        showSuccess(`${fileData.name} uploaded successfully!`);
      } catch (error) {
        // Update file with error
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'error' } : f
        ));

        errors.push({
          file: fileData,
          error: error.message
        });

        showError(`Failed to upload ${fileData.name}: ${error.message}`);
      }
    }

    setUploading(false);

    if (results.length > 0) {
      onUploadComplete?.(multiple ? results : results[0]);
    }

    if (errors.length > 0) {
      onUploadError?.(errors);
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Retry upload
  const retryUpload = async (fileId) => {
    const fileData = files.find(f => f.id === fileId);
    if (fileData) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'uploading' } : f
        ));

        const uploadResult = await uploadFile(fileData);
        
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'completed',
            url: uploadResult.url,
            thumbnail: uploadResult.thumbnail,
            publicId: uploadResult.publicId
          } : f
        ));

        showSuccess(`${fileData.name} uploaded successfully!`);
        onUploadComplete?.(multiple ? [fileData] : fileData);
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'error' } : f
        ));
        showError(`Failed to upload ${fileData.name}: ${error.message}`);
      }
    }
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FaImage;
    if (fileType.startsWith('video/')) return FaVideo;
    if (fileType.startsWith('application/') || fileType.startsWith('text/')) return FaFileAlt;
    return FaFile;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type category
  const getFileTypeCategory = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('application/') || fileType.startsWith('text/')) return 'document';
    return 'other';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-gray-600 mb-4">
          Supported formats: {allowedTypes.join(', ')} (Max: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB)
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.map(type => fileTypes[type]?.mimeTypes.join(',')).join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={processFiles}
              disabled={uploading || files.every(f => f.status === 'completed')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload All Files'
              )}
            </button>
          </div>

          <div className="space-y-3">
            {files.map((fileData) => {
              const FileIcon = getFileIcon(fileData.type);
              const fileTypeCategory = getFileTypeCategory(fileData.type);
              
              return (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        fileTypeCategory === 'image' ? 'bg-green-100 text-green-600' :
                        fileTypeCategory === 'video' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <FileIcon className="text-xl" />
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {fileData.name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileData.size)} • {fileTypeCategory}
                      </p>
                      
                      {/* Progress Bar */}
                      {showProgress && fileData.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[fileData.id] || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {uploadProgress[fileData.id] || 0}% complete
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Status Icon */}
                      {fileData.status === 'pending' && (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaFile className="text-gray-400 text-sm" />
                        </div>
                      )}
                      
                      {fileData.status === 'uploading' && (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaSpinner className="animate-spin text-blue-600 text-sm" />
                        </div>
                      )}
                      
                      {fileData.status === 'completed' && (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheck className="text-green-600 text-sm" />
                        </div>
                      )}
                      
                      {fileData.status === 'error' && (
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <FaExclamationTriangle className="text-red-600 text-sm" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      {fileData.status === 'completed' && (
                        <>
                          {showPreview && (
                            <button
                              onClick={() => window.open(fileData.url, '_blank')}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="Preview"
                            >
                              <FaEye />
                            </button>
                          )}
                          <button
                            onClick={() => window.open(fileData.url, '_blank')}
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="Download"
                          >
                            <FaDownload />
                          </button>
                        </>
                      )}
                      
                      {fileData.status === 'error' && (
                        <button
                          onClick={() => retryUpload(fileData.id)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Retry"
                        >
                          <FaPlay />
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Remove"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {showPreview && fileData.thumbnail && fileData.status === 'completed' && (
                    <div className="mt-3">
                      <img 
                        src={fileData.thumbnail} 
                        alt={fileData.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
