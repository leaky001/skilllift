import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as courseService from '../../services/courseService';
import { liveClassService } from '../../services/liveClassService';
import { toast } from 'react-toastify';
import { 
  FaVideo, 
  FaBook, 
  FaUsers, 
  FaCalendarAlt,
  FaPlay,
  FaPlus,
  FaTimes,
  FaClock,
  FaStop
} from 'react-icons/fa';

const TutorLiveClasses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for live class creation
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    settings: {
      allowScreenShare: true,
      allowChat: true,
      allowLearnerScreenShare: false,
      maxParticipants: 50,
      autoRecord: true
    }
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await courseService.getTutorCourses();
      setCourses(response.data);
      
      // Extract all live classes from courses
      const allLiveClasses = response.data.flatMap(course => course.liveClasses || []);
      setLiveClasses(allLiveClasses);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/tutor/courses/create');
  };

  const handleCreateLiveClass = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: `${course.title} - Live Session`,
      description: `Live class for ${course.title}`,
      scheduledDate: '',
      duration: 60,
      settings: {
        allowScreenShare: true,
        allowChat: true,
        allowLearnerScreenShare: false,
        maxParticipants: 50,
        autoRecord: true
      }
    });
    setShowCreateModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmitLiveClass = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the live class');
      return;
    }

    if (!formData.scheduledDate) {
      toast.error('Please select a date and time for the live class');
      return;
    }

    try {
      setIsCreating(true);
      
      const liveClassData = {
        courseId: selectedCourse._id,
        title: formData.title,
        description: formData.description,
        scheduledDate: new Date(formData.scheduledDate),
        duration: parseInt(formData.duration),
        settings: formData.settings
      };

      const response = await liveClassService.createLiveClass(liveClassData);
      
      toast.success('Live class created successfully!');
      setShowCreateModal(false);
      setSelectedCourse(null);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        scheduledDate: '',
        duration: 60,
        settings: {
          allowScreenShare: true,
          allowChat: true,
          allowLearnerScreenShare: false,
          maxParticipants: 50,
          autoRecord: true
        }
      });

      // Reload courses to show updated live class count
      loadCourses();
      
    } catch (error) {
      console.error('Error creating live class:', error);
      toast.error('Failed to create live class. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };


  const handleStartLiveClass = async (liveClassId) => {
    try {
      console.log('🎯 Starting live class with ID:', liveClassId);
      // Always use startLiveClass - the backend handles both cases (starting new or joining existing)
      const response = await liveClassService.startLiveClass(liveClassId);
      console.log('🎯 API Response:', response);
      console.log('🎯 Response data:', response.data);
      
      // Navigate to full screen live class
      navigate(`/live-class/${liveClassId}`, {
        state: {
          liveClass: {
            ...response.data.liveClass,
            callId: response.data.callId,
            streamToken: response.data.streamToken
          },
          streamToken: response.data.streamToken,
          callId: response.data.callId,
          sessionId: response.data.sessionId
        }
      });
      
      toast.success('Live class started! Learners will be notified.');
      // Reload live classes to update the status
      loadCourses();
    } catch (error) {
      console.error('Error starting live class:', error);
      toast.error('Failed to start live class');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCourses}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600">Manage live classes for your courses</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create Course</span>
        </button>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Courses Yet</h3>
            <p className="text-gray-500 mb-6">Create your first course to start managing live classes.</p>
            <button
              onClick={handleCreateCourse}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Create Course
            </button>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <FaUsers />
                      <span>{course.enrolledLearners || 0} enrolled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt />
                      <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaVideo />
                      <span>{course.liveClasses?.length || 0} live classes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCreateLiveClass(course)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <FaPlus />
                    <span>Create Live Class</span>
                  </button>
                  
                  <button
                    onClick={() => navigate(`/tutor/courses/${course._id}`)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FaBook />
                    <span>View Course</span>
                  </button>
                </div>
              </div>

              {/* Live Classes for this course */}
              {course.liveClasses && course.liveClasses.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Live Classes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {course.liveClasses.map((liveClass) => (
                      <div key={liveClass._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Course Image */}
                        <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <FaBook className="text-6xl text-white opacity-80" />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              liveClass.status === 'live' 
                                ? 'bg-green-100 text-green-800' 
                                : liveClass.status === 'ready'
                                ? 'bg-blue-100 text-blue-800'
                                : liveClass.status === 'ended'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {liveClass.attendees?.length || 0} participants
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {liveClass.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {liveClass.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <FaCalendarAlt className="mr-2" />
                              {new Date(liveClass.scheduledDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FaClock className="mr-2" />
                              {liveClass.duration} minutes
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartLiveClass(liveClass._id)}
                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                              liveClass.status === 'ready' || liveClass.status === 'scheduled'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : liveClass.status === 'live'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={liveClass.status === 'ended' || liveClass.status === 'cancelled'}
                          >
                            <FaPlay className="mr-2" />
                            {liveClass.status === 'ready' || liveClass.status === 'scheduled' ? 'Start Live Class' : 
                             liveClass.status === 'live' ? 'Join Live Class' : 'Not Available'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {courses.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaBook className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((total, course) => total + (course.enrolledLearners || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaVideo className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Live Classes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.reduce((total, course) => total + (course.liveClasses?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Live Class Modal */}
      {showCreateModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Live Class</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Course: {selectedCourse.title}</h3>
              <p className="text-blue-700 text-sm">{selectedCourse.description}</p>
            </div>

            <form onSubmit={handleSubmitLiveClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live Class Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter live class title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter live class description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Class Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="settings.allowScreenShare"
                      checked={formData.settings.allowScreenShare}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Allow screen sharing
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="settings.allowChat"
                      checked={formData.settings.allowChat}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Enable chat during class
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="settings.allowLearnerScreenShare"
                      checked={formData.settings.allowLearnerScreenShare}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Allow learners to share screen
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="settings.autoRecord"
                      checked={formData.settings.autoRecord}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Automatically record session
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      name="settings.maxParticipants"
                      value={formData.settings.maxParticipants}
                      onChange={handleFormChange}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FaVideo />
                      <span>Create Live Class</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorLiveClasses;
