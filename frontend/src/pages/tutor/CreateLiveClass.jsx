import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { createLiveClass } from '../../services/liveClassService';
import { getTutorCourse } from '../../services/courseService';
import { FaBookOpen, FaCalendarAlt, FaClock, FaUsers, FaPlay, FaSave, FaTimes, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CreateLiveClass = ({ onSuccess, onCancel }) => {
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
    courseId: actualCourseId,
    scheduledDate: '',
    duration: 60,
    maxParticipants: 50,
    type: 'lecture',
    level: 'beginner',
    prerequisites: [],
    materials: [],
    tags: [],
    isPublic: true,
    requiresApproval: false,
    price: 0,
    currency: 'USD',
    platform: 'skilllift', // Always use SkillLift platform
    recordingEnabled: true,
    chatEnabled: true,
    qaEnabled: true,
    breakoutRooms: false,
    waitingRoom: true,
    screenShare: true,
    whiteboard: true,
    polls: false,
    handRaise: true
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
      const response = await getTutorCourse(actualCourseId);
      if (response.success) {
        const courseData = response.data;
        setCourse(courseData);
        
        // Auto-fill title with course title if available
        if (courseTitle) {
          setFormData(prev => ({ ...prev, title: courseTitle }));
        } else {
          // Auto-fill with course name for direct creation
          setFormData(prev => ({ ...prev, title: courseData.title }));
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filter out meeting-related fields since we're using SkillLift platform
      const { meetingLink, meetingId, meetingPassword, ...cleanFormData } = formData;
      
      const response = await createLiveClass(cleanFormData);
      if (response.success) {
        showSuccess('Live class created successfully!');
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          navigate(`/tutor/courses/${actualCourseId}`);
        }
      } else {
        showError(response.message || 'Failed to create live class');
      }
    } catch (error) {
      console.error('Error creating live class:', error);
      showError('Failed to create live class. Please try again.');
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
                onClick={() => navigate('/tutor/live-classes')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <FaArrowLeft className="mr-2" />
                Back to Live Classes
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Create Live Class</h1>
            </div>

            {/* KYC Required Message */}
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <FaShieldAlt className="h-12 w-12 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {tutorStatus === 'pending' ? 'Complete Your KYC Verification' : 
                 tutorStatus === 'submitted' ? 'KYC Under Review' :
                 tutorStatus === 'rejected' ? 'KYC Verification Required' :
                 'Your Account is Currently Pending'}
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                {tutorStatus === 'pending' ? 'You need to complete your KYC verification before you can create live classes. Click below to submit your documents.' :
                 tutorStatus === 'submitted' ? 'Your KYC documents are currently under review. You will be notified once approved.' :
                 tutorStatus === 'rejected' ? 'Your KYC verification was rejected. Please resubmit your documents with the required corrections.' :
                 'Once you are done with your KYC, the admin team will be able to approve and you\'ll be able to create live classes for learners to join.'}
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
                  className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/tutor/live-classes')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Live Classes
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Course Not Found</h2>
            <p className="text-neutral-600 mb-6">The course you're trying to create a live class for could not be found.</p>
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
        {/* Header */}
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
              <span className="text-primary-600 font-medium">Create Live Class</span>
            </nav>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Live Class</h1>
              <p className="text-neutral-600">
                Add a new live class to <span className="font-semibold text-primary-600">"{courseTitle || course.title}"</span>
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

        {/* Course Information Card */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex items-start space-x-4">
            {/* Course Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <FaBookOpen className="text-primary-600 text-2xl" />
              </div>
            </div>
            
            {/* Course Details */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{course.title || 'Untitled Course'}</h3>
              <p className="text-neutral-600 mb-3">{course.category || 'General'} • {course.level || 'Beginner'}</p>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {course.status || 'Unknown'}
                </span>
                {course.isApproved && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    Approved
                  </span>
                )}
              </div>
              
              {/* Course Meta */}
              <div className="text-sm text-neutral-500">
                <p>Course ID: {course._id || 'Unknown'}</p>
                <p>Tutor: {course.tutor?.name || course.tutor?._id || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Class Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Live Class Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={`Enter live class title (e.g., "${course?.title || 'Course Name'}")`}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this live class will cover"
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FaClock className="inline mr-2" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="300"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FaUsers className="inline mr-2" />
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <FaPlay className="inline mr-2" />
                  Live Class Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="lecture">Lecture</option>
                  <option value="workshop">Workshop</option>
                  <option value="discussion">Discussion</option>
                  <option value="qna">Q&A Session</option>
                  <option value="demo">Demo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Class Platform Info */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <div className="flex items-start">
                <FaPlay className="text-primary-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Live Class Platform</h3>
                  <p className="text-primary-800 mb-3">
                    This live class will be conducted on the SkillLift platform. No external meeting links needed.
                  </p>
                  <ul className="text-primary-800 space-y-1 text-sm">
                    <li>• Video and audio streaming</li>
                    <li>• Real-time chat</li>
                    <li>• Q&A and hand raising</li>
                    <li>• Screen sharing and whiteboard</li>
                    <li>• Automatic recording (if enabled)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Live Class Features */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Live Class Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="recordingEnabled"
                  checked={formData.recordingEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Enable Recording
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="chatEnabled"
                  checked={formData.chatEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Enable Chat
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="qaEnabled"
                  checked={formData.qaEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Enable Q&A
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="waitingRoom"
                  checked={formData.waitingRoom}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Waiting Room
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="screenShare"
                  checked={formData.screenShare}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Screen Sharing
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="whiteboard"
                  checked={formData.whiteboard}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Whiteboard
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="handRaise"
                  checked={formData.handRaise}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Hand Raise
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="breakoutRooms"
                  checked={formData.breakoutRooms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Breakout Rooms
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="polls"
                  checked={formData.polls}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="ml-2 text-sm text-neutral-700">
                  Polls & Surveys
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel || (() => navigate(`/tutor/courses/${actualCourseId}`))}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <FaSave className="mr-2" />
                  Create Live Class
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLiveClass;