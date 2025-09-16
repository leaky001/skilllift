import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { createAssignment } from '../../services/tutorService';
import { getCourse } from '../../services/courseService';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CreateAssignment = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  
  // Check if user needs to complete KYC
  const tutorStatus = user?.tutorProfile?.kycStatus || 'pending';
  const requiresKYC = tutorStatus !== 'approved';
  
  // Refresh user profile on component mount to get latest KYC status
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        await refreshUser();
        // Force a second refresh after a short delay to ensure we get the latest data
        setTimeout(async () => {
          try {
            await refreshUser();
          } catch (error) {
            console.error('Failed to refresh user profile (second attempt):', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    };
    
    refreshProfile();
  }, []);
  
  // Get courseId from URL params or query string
  const actualCourseId = courseId || new URLSearchParams(location.search).get('courseId');
  const courseTitle = new URLSearchParams(location.search).get('courseTitle');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignmentType: 'homework',
    instructions: '',
    dueDate: '',
    points: 100,
    weight: 10,
    submissionType: 'file',
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10,
    maxSubmissions: 1,
    allowLateSubmission: false,
    latePenalty: 10,
    resources: [{ title: '', url: '', description: '' }],
    rubric: [{ criterion: '', points: 0, description: '' }],
    tags: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (actualCourseId) {
      loadCourse();
    }
  }, [actualCourseId]);

  const loadCourse = async () => {
    try {
      setCourseLoading(true);
      const response = await getCourse(actualCourseId);
      if (response.success) {
        setCourse(response.data);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleTagsInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.instructions.trim()) newErrors.instructions = 'Instructions are required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.points || formData.points <= 0) newErrors.points = 'Points must be greater than 0';
    if (!formData.weight || formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';

    if (formData.dueDate && new Date(formData.dueDate) <= new Date()) {
      newErrors.dueDate = 'Due date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const cleanedData = {
        ...formData,
        resources: formData.resources.filter(r => r.title && r.url),
        rubric: formData.rubric.filter(r => r.criterion && r.points),
        tags: formData.tags.filter(tag => tag.trim()),
        courseId: actualCourseId
      };

      const response = await createAssignment(cleanedData);

      if (response.success) {
        showSuccess('Assignment created successfully!');
        if (onSuccess) {
          onSuccess();
        } else {
          // Navigate back to course view with assignments tab active
          navigate(`/tutor/courses/${actualCourseId}?tab=assignments`);
        }
      } else {
        showError(response.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      showError('Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user needs to complete KYC, show friendly message
  if (requiresKYC) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/tutor/assignments')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <FaArrowLeft className="mr-2" />
                Back to Assignments
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
            </div>

            {/* KYC Required Message */}
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FaShieldAlt className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {tutorStatus === 'pending' ? 'Complete Your KYC Verification' : 
                 tutorStatus === 'submitted' ? 'KYC Under Review' :
                 tutorStatus === 'rejected' ? 'KYC Verification Required' :
                 'Your Account is Currently Pending'}
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                {tutorStatus === 'pending' ? 'You need to complete your KYC verification before you can create assignments. Click below to submit your documents.' :
                 tutorStatus === 'submitted' ? 'Your KYC documents are currently under review. You will be notified once approved.' :
                 tutorStatus === 'rejected' ? 'Your KYC verification was rejected. Please resubmit your documents with the required corrections.' :
                 'Once you are done with your KYC, the admin team will be able to approve and you\'ll be able to create assignments for learners to complete.'}
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                {(tutorStatus === 'pending' || tutorStatus === 'rejected') && (
                  <button
                    onClick={() => navigate('/tutor/kyc-submission')}
                    className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Complete KYC
                  </button>
                )}
                <button
                  onClick={() => navigate('/tutor/dashboard')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/tutor/assignments')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
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
    <div className={onSuccess ? "" : "min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6"}>
      <div className={onSuccess ? "" : "max-w-4xl mx-auto"}>
        {/* Header */}
        {!onSuccess && (
          <div className="mb-8">
            <div className="mb-4">
              <nav className="flex items-center space-x-2 text-sm text-neutral-500">
                <button 
                  onClick={() => navigate('/tutor/courses')}
                  className="hover:text-primary-600"
                >
                  My Courses
                </button>
                <span>›</span>
                <span className="text-neutral-900 font-medium">{courseTitle || course.title}</span>
                <span>›</span>
                <span className="text-primary-600 font-medium">Create Assignment</span>
              </nav>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Assignment</h1>
                <p className="text-neutral-600">
                  Add a new assignment to <span className="font-semibold text-primary-600">"{courseTitle || course.title}"</span>
                </p>
              </div>
              <button
                onClick={onCancel || (() => navigate(`/tutor/courses/${actualCourseId}`))}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Course Info Card */}
        {!onSuccess && (
          <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <div className="text-primary-600 text-xl">📚</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{course.title || 'Untitled Course'}</h3>
                  <p className="text-neutral-600">{course.category || 'General'} • {course.level || 'Beginner'}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-600">Course ID: {course._id || 'Unknown'}</div>
                <div className="text-sm text-neutral-600">Tutor: {course.tutor?.name || course.tutor?._id || 'Unknown'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="Enter assignment title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Assignment Type *
              </label>
              <select
                name="assignmentType"
                value={formData.assignmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="homework">📚 Homework</option>
                <option value="project">🎯 Project</option>
                <option value="quiz">📝 Quiz</option>
                <option value="assessment">📊 Assessment</option>
                <option value="reading">📖 Reading</option>
                <option value="discussion">💬 Discussion</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="Brief description of the assignment"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Instructions *
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.instructions ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="Detailed instructions for students"
              />
              {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions}</p>}
            </div>

            {/* Due Date and Points */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Due Date *
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-500' : 'border-neutral-300'
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.points ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="100"
              />
              {errors.points && <p className="text-red-500 text-sm mt-1">{errors.points}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Weight (%) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="1"
                max="100"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.weight ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="10"
              />
              {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Submission Type *
              </label>
              <select
                name="submissionType"
                value={formData.submissionType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="file">📁 File Upload</option>
                <option value="text">✏️ Text Input</option>
                <option value="multiple-choice">☑️ Multiple Choice</option>
                <option value="link">🔗 Link/URL</option>
                <option value="none">❌ No Submission</option>
              </select>
            </div>

            {/* Late Submission Settings */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={handleInputChange}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Allow Late Submissions</span>
                </label>
              </div>
              
              {formData.allowLateSubmission && (
                <div className="mt-4 ml-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Late Penalty (% per day)
                  </label>
                  <input
                    type="number"
                    name="latePenalty"
                    value={formData.latePenalty}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onCancel || (() => navigate('/tutor/assignments'))}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
