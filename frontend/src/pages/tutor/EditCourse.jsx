import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { 
  FaUpload, 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaArrowLeft,
  FaImage,
  FaVideo,
  FaFile,
  FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getCourse, updateCourse } from '../../services/tutorService';

const EditCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [course, setCourse] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner',
    courseType: 'online-prerecorded',
    liveClassDetails: {
      meetingLink: '',
      meetingPlatform: 'google-meet',
      maxParticipants: 20
    }
  });

  const [files, setFiles] = useState({
    thumbnail: null,
    previewVideo: null,
    content: []
  });

  const [previewUrls, setPreviewUrls] = useState({
    thumbnail: '',
    previewVideo: ''
  });

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Music',
    'Photography',
    'Cooking',
    'Fitness',
    'Language',
    'Other'
  ];

  useEffect(() => {
    console.log('EditCourse useEffect - courseId:', courseId);
    if (courseId) {
      loadCourse();
    } else {
      console.error('No courseId provided');
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setCourseLoading(true);
      console.log('Loading course with ID:', courseId);
      const response = await getCourse(courseId);
      console.log('Course response:', response);
      
      // Handle both response structures (with and without success property)
      const courseData = response.success ? response.data : response;
      console.log('Course data:', courseData);
      
      if (courseData) {
        setCourse(courseData);
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          category: courseData.category || '',
          price: courseData.price || '',
          duration: courseData.duration || '',
          level: courseData.level || 'beginner',
          courseType: courseData.courseType || 'online-prerecorded',
          liveClassDetails: courseData.liveClassDetails || {
            meetingLink: '',
            meetingPlatform: 'google-meet',
            maxParticipants: 20
          }
        });
        
        // Set preview URLs for existing files
        if (courseData.thumbnail) {
          setPreviewUrls(prev => ({
            ...prev,
            thumbnail: courseData.thumbnail
          }));
        }
        if (courseData.previewVideo) {
          setPreviewUrls(prev => ({
            ...prev,
            previewVideo: courseData.previewVideo
          }));
        }
      } else {
        showError('Failed to load course');
        navigate('/tutor/courses');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showError('Failed to load course');
      navigate('/tutor/courses');
    } finally {
      setCourseLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [fileType]: url
      }));
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    setPreviewUrls(prev => ({
      ...prev,
      [fileType]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'liveClassDetails') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files if they exist
      if (files.thumbnail) {
        formDataToSend.append('thumbnail', files.thumbnail);
      }
      if (files.previewVideo) {
        formDataToSend.append('previewVideo', files.previewVideo);
      }

      const response = await updateCourse(courseId, formDataToSend);

      if (response.success) {
        showSuccess('Course updated successfully! 🎉');
        setTimeout(() => {
          navigate('/tutor/courses');
        }, 2000);
      } else {
        showError(response.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      showError('Failed to update course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h1>
            <button
              onClick={() => navigate('/tutor/courses')}
              className="btn-primary"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/tutor/courses')}
                  className="flex items-center text-white hover:text-primary-100 mr-6 transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Courses
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Edit Course</h1>
                  <p className="text-primary-100">Update your course information</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary-100 text-sm">Course Status</div>
                <div className="text-white font-semibold capitalize">{course.status}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter course title"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what students will learn in this course"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 8 weeks"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Course Media */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Course Media</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Course Thumbnail
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    {previewUrls.thumbnail ? (
                      <div className="relative">
                        <img
                          src={previewUrls.thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('thumbnail')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FaImage className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                        <p className="text-sm text-neutral-600 mb-2">Upload course thumbnail</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'thumbnail')}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label
                          htmlFor="thumbnail-upload"
                          className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer"
                        >
                          <FaUpload className="mr-2" />
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Video */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Preview Video
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    {previewUrls.previewVideo ? (
                      <div className="relative">
                        <video
                          src={previewUrls.previewVideo}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('previewVideo')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FaVideo className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                        <p className="text-sm text-neutral-600 mb-2">Upload preview video</p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileChange(e, 'previewVideo')}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer"
                        >
                          <FaUpload className="mr-2" />
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => navigate('/tutor/courses')}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                <span>{isLoading ? 'Updating...' : 'Update Course'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditCourse;
