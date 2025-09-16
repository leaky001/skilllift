import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaFileAlt, 
  FaVideo, 
  FaImage, 
  FaLink, 
  FaTimes, 
  FaCheckCircle,
  FaCloudUploadAlt,
  FaPlay,
  FaEye,
  FaDownload,
  FaTrash,
  FaSave,
  FaPaperPlane
} from 'react-icons/fa';

const SubmitAssignmentForm = ({ assignment, onSubmit, onCancel }) => {
  const [submissionType, setSubmissionType] = useState('files');
  const [files, setFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef();
  const videoInputRef = useRef();

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleVideoUpload = (event) => {
    const videoFile = event.target.files[0];
    if (videoFile) {
      setVideoUrl(URL.createObjectURL(videoFile));
    }
  };

  const handleImageUpload = (event) => {
    const imageFiles = Array.from(event.target.files);
    const newImages = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setImageUrls([...imageUrls, ...newImages]);
  };

  const addLink = () => {
    const link = prompt('Enter link URL:');
    if (link) {
      setLinks([...links, { id: Date.now(), url: link, title: `Link ${links.length + 1}` }]);
    }
  };

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const removeImage = (imageId) => {
    setImageUrls(imageUrls.filter(img => img.id !== imageId));
  };

  const removeLink = (linkId) => {
    setLinks(links.filter(link => link.id !== linkId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate submission delay
    setTimeout(() => {
      const submission = {
        assignmentId: assignment.id,
        type: submissionType,
        files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
        videoUrl,
        imageUrls: imageUrls.map(img => ({ name: img.name })),
        links: links.map(link => ({ url: link.url, title: link.title })),
        notes,
        submittedAt: new Date().toISOString()
      };

      onSubmit(submission);
      setIsSubmitting(false);
      setUploadProgress(0);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Submit Assignment</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Assignment Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{assignment.title}</h3>
        <p className="text-gray-600 mb-2">Course: {assignment.course}</p>
        <p className="text-gray-600 mb-2">Due: {assignment.dueDate} at {assignment.dueTime}</p>
        <p className="text-gray-600">Max Score: {assignment.maxScore} points</p>
      </div>

      {/* Submission Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Submission Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'files', label: 'Files', icon: FaFileAlt },
            { id: 'video', label: 'Video', icon: FaVideo },
            { id: 'images', label: 'Images', icon: FaImage },
            { id: 'links', label: 'Links', icon: FaLink }
          ].map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSubmissionType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  submissionType === type.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon className="mx-auto mb-2" size={24} />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Upload Section */}
      {submissionType === 'files' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Files
          </label>
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
          >
            <FaCloudUploadAlt className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">Click to upload files or drag and drop</p>
            <p className="text-sm text-gray-500">PDF, DOC, PPT, ZIP, Images (Max 50MB each)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif"
            />
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <FaFileAlt className="text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video Upload Section */}
      {submissionType === 'video' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Video
          </label>
          <div
            onClick={() => videoInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
          >
            <FaVideo className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">Click to upload video or drag and drop</p>
            <p className="text-sm text-gray-500">MP4, MOV, AVI (Max 500MB)</p>
            <input
              ref={videoInputRef}
              type="file"
              onChange={handleVideoUpload}
              className="hidden"
              accept="video/*"
            />
          </div>

          {videoUrl && (
            <div className="mt-4">
              <video
                controls
                className="w-full rounded-lg"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      )}

      {/* Image Upload Section */}
      {submissionType === 'images' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Images
          </label>
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
          >
            <FaImage className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">Click to upload images or drag and drop</p>
            <p className="text-sm text-gray-500">JPG, PNG, GIF (Max 10MB each)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

          {imageUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {imageUrls.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links Section */}
      {submissionType === 'links' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add Links
          </label>
          <button
            onClick={addLink}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors"
          >
            <FaLink className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-gray-600">Click to add a link</p>
          </button>

          {links.length > 0 && (
            <div className="mt-4 space-y-2">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <FaLink className="text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{link.title}</p>
                      <p className="text-xs text-gray-500">{link.url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Add any additional notes or comments about your submission..."
        />
      </div>

      {/* Upload Progress */}
      {isSubmitting && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (
            (submissionType === 'files' && files.length === 0) ||
            (submissionType === 'video' && !videoUrl) ||
            (submissionType === 'images' && imageUrls.length === 0) ||
            (submissionType === 'links' && links.length === 0)
          )}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <FaSave className="animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <FaPaperPlane />
              <span>Submit Assignment</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SubmitAssignmentForm;
