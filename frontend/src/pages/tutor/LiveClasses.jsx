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
      setError(null);
      
      console.log('🎯 Loading tutor courses and live classes...');
      
      // Load tutor's courses first
      let tutorCourses = [];
      try {
        const tutorCoursesResponse = await courseService.getTutorCourses();
        if (tutorCoursesResponse.success) {
          tutorCourses = tutorCoursesResponse.data || [];
          setCourses(tutorCourses);
          console.log('✅ Tutor courses loaded:', tutorCourses.length);
        } else {
          console.warn('⚠️ Tutor courses response not successful:', tutorCoursesResponse);
          setCourses([]);
        }
      } catch (courseError) {
        console.error('❌ Error loading tutor courses:', courseError);
        setCourses([]);
        // Don't fail completely, continue with live classes
      }
      
      // Load live classes
      let liveClasses = [];
      try {
        const liveClassesResponse = await liveClassService.getLiveClasses();
        if (liveClassesResponse.success) {
          liveClasses = liveClassesResponse.data || [];
          console.log('✅ Live classes loaded:', liveClasses.length);
        } else {
          console.warn('⚠️ Live classes response not successful:', liveClassesResponse);
          liveClasses = [];
        }
      } catch (liveClassError) {
        console.error('❌ Error loading live classes:', liveClassError);
        liveClasses = [];
      }
      
      // Extract tutor's own live classes from courses
      const tutorLiveClasses = tutorCourses.flatMap(course => course.liveClasses || []);
      
      // Combine: tutor's classes + all other live classes
      const combinedLiveClasses = [...tutorLiveClasses, ...liveClasses];
      
      // Remove duplicates by live class ID
      const uniqueLiveClasses = combinedLiveClasses.filter((liveClass, index, array) => 
        array.findIndex(l => l._id === liveClass._id) === index
      );
      
      setLiveClasses(uniqueLiveClasses);
      
      console.log('🎯 Live Classes Summary:', {
        tutorCourses: tutorCourses.length,
        tutorLiveClasses: tutorLiveClasses.length,
        allLiveClasses: liveClasses.length,
        combinedTotal: uniqueLiveClasses.length
      });
      
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      setError('Failed to load courses. Please refresh the page.');
      toast.error('Failed to load courses. Please refresh the page.');
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
      // Use universal joinLiveClass endpoint - backend determines role and handles all cases
      const response = await liveClassService.joinLiveClass(liveClassId);
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

  const handleDeleteLiveClass = async (liveClassId) => {
    if (!window.confirm('Are you sure you want to delete this live class? This action cannot be undone.')) {
      return;
    }

    try {
      await liveClassService.deleteLiveClass(liveClassId);
      toast.success('Live class deleted successfully!');
      loadCourses(); // Reload to update the list
    } catch (error) {
      console.error('Error deleting live class:', error);
      toast.error('Failed to delete live class');
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

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartLiveClass(liveClass._id)}
                              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
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
                            
                            <button
                              onClick={() => handleDeleteLiveClass(liveClass._id)}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                              title="Delete Live Class"
                            >
                              <FaTimes />
                            </button>
                          </div>
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

      {/* CRITICAL FIX: Show ALL Available Live Classes (including learners') */}
      {liveClasses.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Available Live Classes</h2>
              <p className="text-gray-600">Join any live class or manage your own</p>
            </div>
            <div className="text-sm text-gray-500">
              {liveClasses.filter(lc => lc.status === 'live').length} active now
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((liveClass) => {
              // Determine if this is MY live class or someone else's
              const tutorLiveClasses = courses.flatMap(c => c.liveClasses || []);
              const isMyLiveClass = tutorLiveClasses.some(lc => lc._id === liveClass._id);
              
              return (
                <div key={liveClass._id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  {/* Header with ownership indicator */}
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isMyLiveClass 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isMyLiveClass ? 'MY CLASS' : 'JOINABLE'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {liveClass.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
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
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      {liveClass.duration || 60} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUsers className="mr-2" />
                      {liveClass.attendees?.length || 0} participants
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartLiveClass(liveClass._id)}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        liveClass.status === 'ready' || liveClass.status === 'scheduled'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : liveClass.status === 'live'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                      }`}
                      disabled={liveClass.status === 'ended' || liveClass.status === 'cancelled'}
                    >
                      <FaPlay className="mr-2" />
                      {liveClass.status === 'ready' || liveClass.status === 'scheduled' 
                        ? 'Start Live Class' 
                        : liveClass.status === 'live'
                        ? 'Join Live Class'
                        : 'Not Available'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
