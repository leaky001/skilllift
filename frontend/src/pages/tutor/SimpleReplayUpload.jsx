import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../../services/toastService';
import { 
  FaUpload, 
  FaVideo, 
  FaFileAlt, 
  FaCalendarAlt,
  FaBookOpen,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const SimpleReplayUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    replayFile: null,
    replayFilePreview: null
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tutor/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCourses(result.data || []);
      } else {
        console.error('Failed to load courses');
        showError('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      showError('Failed to load courses');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
      if (!allowedTypes.includes(file.type)) {
        showError('Please upload a valid video file (MP4, AVI, MOV, WMV)');
        return;
      }

      // Validate file size (max 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
      if (file.size > maxSize) {
        showError('File size must be less than 2GB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        replayFile: file,
        replayFilePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseId || !formData.topic || !formData.replayFile) {
      showError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('courseId', formData.courseId);
      uploadData.append('topic', formData.topic);
      uploadData.append('replayFile', formData.replayFile);

      // Upload to the new API endpoint
      const response = await fetch('http://localhost:3001/api/tutor/replays/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadData
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess('Replay uploaded successfully! Students will be notified.');
        
        // Reset form
        setFormData({
          courseId: '',
          topic: '',
          replayFile: null,
          replayFilePreview: null
        });
        
        // Navigate back to dashboard
        setTimeout(() => {
          navigate('/tutor/dashboard');
        }, 1500);
      } else {
        showError(result.message || 'Failed to upload replay');
      }
      
    } catch (error) {
      showError('Failed to upload replay. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(course => course._id === formData.courseId);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Upload Class Replay</h1>
          <p className="text-slate-600 mt-2">Share your live class recording with enrolled students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <FaBookOpen className="mr-2 text-primary-600" />
              Course Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Course *
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.totalEnrollments || 0} students enrolled)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-primary-800">
                      {selectedCourse.totalEnrollments || 0} students will be notified when you upload this replay
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Topic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-secondary-600" />
              Class Details
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What topic did you cover? *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Introduction to React Hooks, CSS Grid Layout, JavaScript Promises..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              />
              <p className="text-sm text-slate-500 mt-1">
                Briefly describe what you taught in this live class
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <FaVideo className="mr-2 text-accent-600" />
              Upload Replay Video
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="replayFile"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="replayFile" className="cursor-pointer">
                  <FaUpload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    {formData.replayFile ? 'Change Video File' : 'Click to upload video'}
                  </p>
                  <p className="text-sm text-slate-500">
                    MP4, AVI, MOV, WMV up to 2GB
                  </p>
                </label>
              </div>

              {formData.replayFilePreview && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <video
                      src={formData.replayFilePreview}
                      className="w-24 h-16 rounded object-cover"
                      controls
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{formData.replayFile.name}</p>
                      <p className="text-sm text-slate-500">
                        {(formData.replayFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tutor/dashboard')}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading || !formData.courseId || !formData.topic || !formData.replayFile}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Upload Replay
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleReplayUpload;
