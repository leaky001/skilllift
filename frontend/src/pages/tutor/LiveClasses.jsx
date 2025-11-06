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
  FaStop,
  FaSync
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
    
    // Auto-refresh every 5 seconds to pick up status changes
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing live classes...');
      loadCourses();
    }, 5000); // Refresh every 5 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
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

      // Reload courses immediately to show updated live class
      console.log('🔄 Reloading courses after creating live class...');
      await loadCourses();
      
    } catch (error) {
      console.error('Error creating live class:', error);
      toast.error('Failed to create live class. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };


  const handleStartLiveClass = async (liveClass, courseId = null) => {
    try {
      // Determine the course ID
      let actualCourseId = courseId;
      
      // If no courseId provided, try to find it from the courses
      if (!actualCourseId) {
        const courseWithLiveClass = courses.find(course => 
          course.liveClasses && course.liveClasses.some(lc => lc._id === liveClass._id)
        );
        actualCourseId = courseWithLiveClass?._id;
      }
      
      // If still no courseId, try to use liveClass.courseId
      if (!actualCourseId) {
        // Check if courseId is populated (object) or just an ID (string)
        if (liveClass.courseId) {
          actualCourseId = typeof liveClass.courseId === 'string' 
            ? liveClass.courseId 
            : liveClass.courseId._id || liveClass.courseId.id;
        }
      }
      
      if (!actualCourseId) {
        console.error('❌ No course ID found for live class:', liveClass);
        toast.error('Unable to determine course for this live class');
        return;
      }
      
      console.log('🎯 Starting Google Meet live class for course:', actualCourseId);
      
      // Navigate to Google Meet live class using course ID
      navigate(`/live-class/${actualCourseId}`);
      
      toast.success('Redirecting to Google Meet live class!');
      // Reload live classes to update the status
      loadCourses();
    } catch (error) {
      console.error('❌ Error starting live class:', error);
      toast.error(`Failed to start live class: ${error.message}`);
    }
  };

  const handleDeleteLiveClass = async (liveClassId) => {
    if (!window.confirm('Are you sure you want to delete this live class? This action cannot be undone.')) {
      return;
    }

    try {
      await liveClassService.deleteLiveClass(liveClassId);
      toast.success('Live class deleted successfully!');
      console.log('🔄 Reloading courses after deleting live class...');
      await loadCourses(); // Reload to update the list
    } catch (error) {
      console.error('Error deleting live class:', error);
      toast.error('Failed to delete live class');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading live classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Courses</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={loadCourses}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Live Classes</h1>
              <p className="text-slate-600 text-lg">Manage live classes for your courses • Auto-refreshing every 5s</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadCourses();
                }}
                className="inline-flex items-center justify-center px-5 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-200 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                title="Refresh live classes"
              >
                <FaSync className="mr-2" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleCreateCourse}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl shadow-md hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <FaPlus className="mr-2" />
                <span>Create Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-slate-100">
              <div className="text-7xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Courses Yet</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">Create your first course to start managing live classes.</p>
              <button
                onClick={handleCreateCourse}
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl shadow-md hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <FaPlus className="mr-2" />
                Create Course
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        course.status === 'published' 
                          ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                          : 'bg-accent-100 text-accent-800 border border-accent-200'
                      }`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-4 leading-relaxed">{course.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <FaUsers className="text-primary-600" />
                        <span className="font-medium">{course.enrolledLearners || 0} enrolled</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <FaCalendarAlt className="text-primary-600" />
                        <span className="font-medium">Created {new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <FaVideo className="text-primary-600" />
                        <span className="font-medium">{course.liveClasses?.length || 0} live classes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => handleCreateLiveClass(course)}
                      className="inline-flex items-center px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <FaPlus className="mr-2" />
                      <span>Create Live Class</span>
                    </button>
                    
                    <button
                      onClick={() => navigate(`/tutor/courses/${course._id}`)}
                      className="inline-flex items-center px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <FaBook className="mr-2" />
                      <span>View Course</span>
                    </button>
                  </div>
                </div>

                {/* Live Classes for this course */}
                {course.liveClasses && course.liveClasses.length > 0 && (
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Live Classes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {course.liveClasses.map((liveClass) => (
                        <div key={liveClass._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group">
                          {/* Course Image */}
                          <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative overflow-hidden">
                            <FaVideo className="text-6xl text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                                liveClass.status === 'live' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : liveClass.status === 'ready'
                                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                                  : liveClass.status === 'ended' || liveClass.status === 'completed'
                                  ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                  : 'bg-accent-100 text-accent-800 border border-accent-200'
                              }`}>
                                {liveClass.status === 'completed' ? 'Completed' : liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3">
                              <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                <FaUsers className="text-white text-sm" />
                                <span className="text-white text-sm font-bold">
                                  {liveClass.attendees?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                              {liveClass.title}
                            </h3>

                            <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {liveClass.description}
                            </p>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <FaCalendarAlt className="mr-2 text-primary-600" />
                                <span className="font-medium">{new Date(liveClass.scheduledDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}</span>
                              </div>
                              <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <FaClock className="mr-2 text-primary-600" />
                                <span className="font-medium">{liveClass.duration} minutes</span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStartLiveClass(liveClass, course._id)}
                                className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
                                  liveClass.status === 'ready' || liveClass.status === 'scheduled'
                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                    : liveClass.status === 'live'
                                    ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                                disabled={liveClass.status === 'ended' || liveClass.status === 'cancelled' || liveClass.status === 'completed'}
                              >
                                <FaPlay className="mr-2" />
                                {liveClass.status === 'ready' || liveClass.status === 'scheduled' ? 'Start Live Class' : 
                                 liveClass.status === 'live' ? 'Join Live Class' : 
                                 liveClass.status === 'completed' ? 'Live Class Ended' : 'Not Available'}
                              </button>
                              
                              <button
                                onClick={() => handleDeleteLiveClass(liveClass._id)}
                                className="bg-red-100 text-red-600 px-3 py-2.5 rounded-xl hover:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
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
          <div className="mt-8 bg-white rounded-xl shadow-md border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">All Available Live Classes</h2>
                <p className="text-slate-600 mt-1">Join any live class or manage your own</p>
              </div>
              <div className="px-4 py-2 bg-primary-100 text-primary-800 rounded-xl border border-primary-200 font-semibold">
                {liveClasses.filter(lc => lc.status === 'live').length} active now
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveClasses.map((liveClass) => {
                // Determine if this is MY live class or someone else's
                const tutorLiveClasses = courses.flatMap(c => c.liveClasses || []);
                const isMyLiveClass = tutorLiveClasses.some(lc => lc._id === liveClass._id);
                
                return (
                  <div key={liveClass._id} className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 group">
                    {/* Header with ownership indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        liveClass.status === 'live' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : liveClass.status === 'ready'
                          ? 'bg-primary-100 text-primary-800 border border-primary-200'
                          : liveClass.status === 'ended' || liveClass.status === 'completed'
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'bg-accent-100 text-accent-800 border border-accent-200'
                      }`}>
                        {liveClass.status === 'completed' ? 'Completed' : liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isMyLiveClass 
                          ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                          : 'bg-secondary-100 text-secondary-800 border border-secondary-200'
                      }`}>
                        {isMyLiveClass ? 'MY CLASS' : 'JOINABLE'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {liveClass.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {liveClass.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                        <FaCalendarAlt className="mr-2 text-primary-600" />
                        <span className="font-medium">{new Date(liveClass.scheduledDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                        <FaClock className="mr-2 text-primary-600" />
                        <span className="font-medium">{liveClass.duration || 60} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                        <FaUsers className="mr-2 text-primary-600" />
                        <span className="font-medium">{liveClass.attendees?.length || 0} participants</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartLiveClass(liveClass)}
                        className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
                          liveClass.status === 'ready' || liveClass.status === 'scheduled'
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : liveClass.status === 'live'
                            ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                        disabled={liveClass.status === 'ended' || liveClass.status === 'cancelled' || liveClass.status === 'completed'}
                      >
                        <FaPlay className="mr-2" />
                        {liveClass.status === 'ready' || liveClass.status === 'scheduled' 
                          ? 'Start Live Class' 
                          : liveClass.status === 'live'
                          ? 'Join Live Class'
                          : liveClass.status === 'completed'
                          ? 'Live Class Ended'
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
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-100 p-6 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl shadow-sm">
                  <FaBook className="text-primary-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-slate-900">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-100 p-6 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl shadow-sm">
                  <FaUsers className="text-secondary-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Enrollments</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {courses.reduce((total, course) => total + (course.enrolledLearners || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-100 p-6 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl shadow-sm">
                  <FaVideo className="text-accent-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-1">Live Classes</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {courses.reduce((total, course) => total + (course.liveClasses?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Live Class Modal */}
      {showCreateModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Create Live Class</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-1">Course: {selectedCourse.title}</h3>
              <p className="text-primary-700 text-sm">{selectedCourse.description}</p>
            </div>

            <form onSubmit={handleSubmitLiveClass} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Live Class Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                  placeholder="Enter live class title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                  placeholder="Enter live class description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Live Class Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      name="settings.allowScreenShare"
                      checked={formData.settings.allowScreenShare}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">
                      Allow screen sharing
                    </label>
                  </div>

                  <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      name="settings.allowChat"
                      checked={formData.settings.allowChat}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">
                      Enable chat during class
                    </label>
                  </div>

                  <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      name="settings.allowLearnerScreenShare"
                      checked={formData.settings.allowLearnerScreenShare}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">
                      Allow learners to share screen
                    </label>
                  </div>

                  <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      name="settings.autoRecord"
                      checked={formData.settings.autoRecord}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-slate-700 cursor-pointer">
                      Automatically record session
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      name="settings.maxParticipants"
                      value={formData.settings.maxParticipants}
                      onChange={handleFormChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
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
