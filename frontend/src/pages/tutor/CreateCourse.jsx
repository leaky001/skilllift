import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaBookOpen,
  FaDollarSign,
  FaClock,
  FaUsers,
  FaTag,
  FaFileAlt,
  FaPlay
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { createCourse } from '../../services/tutorService';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    duration: '',
    level: 'beginner',
    language: 'english',
    courseType: 'online-prerecorded',
    tags: '',
    prerequisites: '',
    learningOutcomes: '',
    thumbnail: null,
    // Live class details
    liveClassDetails: {
      description: ''
    },
    lessons: []
  });
  
  const [files, setFiles] = useState({
    thumbnail: null,
    content: []
  });

  // Refresh user profile on component mount to get latest KYC status
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    };
    
    refreshProfile();
  }, []);

  // Check KYC status and redirect if not approved
  useEffect(() => {
    if (user && user.role === 'tutor') {
      const kycStatus = user.tutorProfile?.kycStatus;
      console.log('🔍 Tutor KYC Status:', kycStatus);
      
      if (kycStatus !== 'approved') {
        console.log('❌ Tutor KYC not approved, redirecting to KYC submission');
        showError('You must complete KYC verification before creating courses. Please submit your KYC documents and wait for admin approval.');
        navigate('/tutor/kyc-submission');
        return;
      }
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'thumbnail') {
      setFiles(prev => ({
        ...prev,
        thumbnail: files[0]
      }));
    } else if (name === 'content') {
      setFiles(prev => ({
        ...prev,
        content: [...prev.content, ...Array.from(files)]
      }));
    }
  };

  const removeContentFile = (index) => {
    setFiles(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'tutor') {
      showError('You are not authorized to create courses');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      showError('Course title is required');
      return;
    }
    if (!formData.description.trim()) {
      showError('Course description is required');
      return;
    }
    if (!formData.category) {
      showError('Course category is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      showError('Valid price is required');
      return;
    }
    if (!formData.duration.trim()) {
      showError('Course duration is required');
      return;
    }
    if (!formData.learningOutcomes.trim()) {
      showError('Learning outcomes are required');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      
      // Add basic form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'thumbnail' && key !== 'content' && key !== 'lessons' && key !== 'liveClassDetails') {
          submitData.append(key, formData[key]);
        }
      });

      // Add liveClassDetails as JSON (only for live courses)
      if (formData.courseType === 'online-live') {
        submitData.append('liveClassDetails', JSON.stringify(formData.liveClassDetails));
      }
      
      // Add lessons as JSON (only for pre-recorded courses)
      if (formData.courseType === 'online-prerecorded') {
        submitData.append('lessons', JSON.stringify(formData.lessons));
      }

      // Add files
      if (files.thumbnail) {
        submitData.append('thumbnail', files.thumbnail);
      }
      
      files.content.forEach(file => {
        submitData.append('content', file);
      });

      const response = await createCourse(submitData);
      
      if (response.success) {
        showSuccess('Course created successfully!');
        navigate('/tutor/courses');
      } else {
        showError(response.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        showError(error.response.data?.message || 'Invalid course data. Please check all fields.');
      } else if (error.response?.status === 401) {
        showError('You are not authorized to create courses. Please log in again.');
      } else if (error.response?.status === 500) {
        showError('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        showError('Request timeout. Please try again.');
      } else {
        showError('Failed to create course. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user can't create courses, show message
  if (!user || user.role !== 'tutor') {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaBookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
            <p className="text-slate-600 mb-6">You are not authorized to create courses.</p>
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/courses')}
            className="flex items-center text-slate-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Create New Course</h1>
          <p className="text-slate-600 mt-2">Fill in the details below to create your course</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category</option>
                  <option value="web-development">Web Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., React, Python, UI/UX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your course content and what students will learn"
              />
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 8 weeks, 40 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Language *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Course Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Type *
              </label>
              <select
                name="courseType"
                value={formData.courseType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="online-prerecorded">Online Pre-recorded</option>
                <option value="online-live">Online Live</option>
              </select>
            </div>

            {/* Live Class Info - Only show when course type is online-live */}
            {formData.courseType === 'online-live' && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <FaVideo className="mr-2" />
                  Live Class Information
                </h3>
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaVideo className="text-blue-600 mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Platform Live Classes</h4>
                      <p className="text-blue-800 text-sm mb-3">
                        Live classes will be conducted directly on the SkillLift platform using our built-in streaming system.
                        You'll be able to schedule live sessions, stream video/audio, and interact with learners in real-time.
                      </p>
                      <div className="text-sm text-blue-700">
                        <p className="mb-1">✅ Built-in video streaming</p>
                        <p className="mb-1">✅ Real-time chat and Q&A</p>
                        <p className="mb-1">✅ Screen sharing capabilities</p>
                        <p className="mb-1">✅ Automatic session recording</p>
                        <p className="mb-1">✅ Attendance tracking</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Live Class Description
                  </label>
                  <textarea
                    name="liveClassDescription"
                    value={formData.liveClassDetails?.description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      liveClassDetails: {
                        ...prev.liveClassDetails,
                        description: e.target.value
                      }
                    }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe what learners can expect from the live classes..."
                  />
                </div>
              </div>
            )}

            {/* Tags, Prerequisites, and Learning Outcomes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., react, javascript, web development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prerequisites
                </label>
                <input
                  type="text"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Basic HTML knowledge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Learning Outcomes *
                </label>
                <input
                  type="text"
                  name="learningOutcomes"
                  value={formData.learningOutcomes}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Build a complete web application"
                />
              </div>
            </div>


            {formData.courseType === 'online-prerecorded' && (
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <FaBookOpen className="mr-2" />
                    Course Lessons
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      lessons: [...prev.lessons, {
                        title: '',
                        description: '',
                        lessonType: 'video',
                        durationMinutes: 0,
                        order: prev.lessons.length + 1,
                        isFree: false,
                        isPreview: false
                      }]
                    }))}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Add Lesson
                  </button>
                </div>
              
              {formData.lessons.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FaBookOpen className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                  <p>No lessons added yet. Click "Add Lesson" to get started.</p>
                  <p className="text-sm mt-1">You can add lessons after creating the course, or add them now.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.lessons.map((lesson, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">Lesson {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            lessons: prev.lessons.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Lesson Title *
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => {
                              const newLessons = [...formData.lessons];
                              newLessons[index].title = e.target.value;
                              setFormData(prev => ({ ...prev, lessons: newLessons }));
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter lesson title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={lesson.durationMinutes}
                            onChange={(e) => {
                              const newLessons = [...formData.lessons];
                              newLessons[index].durationMinutes = parseInt(e.target.value) || 0;
                              setFormData(prev => ({ ...prev, lessons: newLessons }));
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) => {
                              const newLessons = [...formData.lessons];
                              newLessons[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, lessons: newLessons }));
                            }}
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Describe what this lesson covers"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Lesson Type
                          </label>
                          <select
                            value={lesson.lessonType}
                            onChange={(e) => {
                              const newLessons = [...formData.lessons];
                              newLessons[index].lessonType = e.target.value;
                              setFormData(prev => ({ ...prev, lessons: newLessons }));
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={lesson.isFree}
                              onChange={(e) => {
                                const newLessons = [...formData.lessons];
                                newLessons[index].isFree = e.target.checked;
                                setFormData(prev => ({ ...prev, lessons: newLessons }));
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-slate-700">Free Lesson</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={lesson.isPreview}
                              onChange={(e) => {
                                const newLessons = [...formData.lessons];
                                newLessons[index].isPreview = e.target.checked;
                                setFormData(prev => ({ ...prev, lessons: newLessons }));
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-slate-700">Preview</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* File Uploads */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <FaImage className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Upload Thumbnail
                  </label>
                  {files.thumbnail && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected: {files.thumbnail.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Content Files
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <FaFileAlt className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <input
                    type="file"
                    name="content"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    id="content-upload"
                  />
                  <label
                    htmlFor="content-upload"
                    className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Upload Content Files
                  </label>
                  {files.content.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.content.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-100 p-2 rounded">
                          <span className="text-sm text-slate-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeContentFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/tutor/courses')}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <FaSave className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCourse;