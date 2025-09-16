import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaSpinner, FaEye, FaUsers, FaClock, FaStar, FaBookOpen, FaPlay, FaDownload, FaShare, FaPlus, FaFileAlt, FaCalendarAlt, FaGraduationCap, FaUserGraduate, FaCheckCircle, FaExclamationTriangle, FaBook } from 'react-icons/fa';
import { getTutorCourse } from '../../services/courseService';
import { getTutorAssignments } from '../../services/tutorService';
import { getThumbnailUrl, getPlaceholderImage } from '../../utils/fileUtils';
import { showError, showSuccess } from '../../services/toastService';
import LessonManagement from '../../components/LessonManagement';

const ViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Check if course ID is valid
        if (!courseId || courseId === 'undefined') {
          console.error('❌ Invalid course ID:', courseId);
          showError('Invalid course ID. Please select a course from the list.');
          navigate('/tutor/courses');
          return;
        }
        
        console.log('🔄 Fetching course with ID:', courseId);
        const response = await getTutorCourse(courseId);
        if (response.success) {
          setCourse(response.data);
          console.log('✅ Course loaded successfully:', response.data.title);
          // Load assignments for this course
          await loadAssignments();
        } else {
          console.error('❌ Failed to load course:', response.message);
          showError('Failed to load course');
          navigate('/tutor/courses');
        }
      } catch (error) {
        console.error('❌ Error fetching course:', error);
        console.error('❌ Error details:', error.response?.data);
        showError('Error loading course. Please try again.');
        navigate('/tutor/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  // Handle URL parameter to automatically switch to assignments tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'assignments') {
      setActiveTab('assignments');
      // Reload assignments when switching to assignments tab
      loadAssignments();
    }
  }, [location.search]);

  const loadAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await getTutorAssignments();
      if (response.success) {
        // Filter assignments for this specific course
        const courseAssignments = response.data.filter(assignment => 
          assignment.course && assignment.course._id === courseId
        );
        setAssignments(courseAssignments);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
        <p className="ml-3 text-lg text-gray-700">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Course not found.</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'archived':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTargetAudienceColor = (audience) => {
    switch (audience) {
      case 'new_students':
        return 'text-blue-600 bg-blue-100';
      case 'all_students':
        return 'text-purple-600 bg-purple-100';
      case 'advanced_students':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAssignmentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAssignmentOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.status === 'draft') {
      return { text: 'Draft', color: 'text-gray-600 bg-gray-100' };
    }
    
    if (dueDate < now) {
      return { text: 'Overdue', color: 'text-red-600 bg-red-100' };
    }
    
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 1) {
      return { text: 'Due Soon', color: 'text-yellow-600 bg-yellow-100' };
    }
    
    return { text: 'Active', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tutor/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Courses
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">Course Details & Analytics</p>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to={`/tutor/courses/${courseId}/edit`}
                className="btn-primary"
              >
                <FaEdit className="mr-2" />
                Edit Course
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: FaEye },
                ...(course.courseType === 'online-prerecorded' ? [{ id: 'lessons', name: 'Lessons', icon: FaBook }] : []),
                { id: 'assignments', name: 'Assignments', icon: FaFileAlt },
                { id: 'analytics', name: 'Analytics', icon: FaUsers }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Reload assignments when switching to assignments tab
                      if (tab.id === 'assignments') {
                        loadAssignments();
                      }
                    }}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.name}
                    {tab.id === 'assignments' && assignments.length > 0 && (
                      <span className="ml-2 bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                        {assignments.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Course Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={getThumbnailUrl(course.thumbnail) || getPlaceholderImage(course.category)}
                alt={course.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = getPlaceholderImage(course.category);
                }}
              />
            </div>

            {/* Course Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <p className="text-gray-900">{course.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <p className="text-gray-900 capitalize">{course.level || 'Beginner'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <p className="text-gray-900">{course.duration || '8 weeks'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <p className="text-gray-900 font-semibold">{formatCurrency(course.price)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="text-gray-900">{formatDate(course.createdAt)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 leading-relaxed">{course.description}</p>
              </div>
            </div>

            {/* Course Content */}
            {course.content && course.content.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
                <div className="space-y-3">
                  {course.content.map((item, index) => (
                    <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 mr-3">
                        {item.type === 'video' ? (
                          <FaPlay className="text-blue-600" />
                        ) : item.type === 'image' ? (
                          <FaEye className="text-green-600" />
                        ) : (
                          <FaDownload className="text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(item.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

            {activeTab === 'lessons' && course.courseType === 'online-prerecorded' && (
              <div className="space-y-6">
                <LessonManagement courseId={courseId} course={course} />
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-6">
                {/* Assignment Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Course Assignments</h2>
                      <p className="text-gray-600 mt-1">Create and manage assignments for {course.title}</p>
                    </div>
                    {course.status === 'published' && (
                      <Link
                        to={`/tutor/assignments/create?courseId=${courseId}`}
                        className="btn-primary"
                      >
                        <FaPlus className="mr-2" />
                        Create Assignment
                      </Link>
                    )}
                  </div>
                  
                  {course.status !== 'published' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="text-yellow-600 mr-2" />
                        <p className="text-yellow-800">
                          You can only create assignments for published courses.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <FaFileAlt className="text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Total Assignments</p>
                            <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Active Assignments</p>
                            <p className="text-2xl font-bold text-green-600">
                              {assignments.filter(a => a.status === 'published').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <FaUserGraduate className="text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Total Submissions</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {assignments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignments List */}
                {assignmentsLoading ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <FaSpinner className="animate-spin text-2xl text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading assignments...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first assignment to engage your students and track their progress.
                    </p>
                    {course.status === 'published' && (
                      <Link
                        to={`/tutor/assignments/create?courseId=${courseId}`}
                        className="btn-primary"
                      >
                        <FaPlus className="mr-2" />
                        Create Your First Assignment
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const status = getAssignmentStatus(assignment);
                      return (
                        <div key={assignment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                  {assignment.title}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.text}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 mb-3">{assignment.description}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  Due: {formatAssignmentDate(assignment.dueDate)}
                                </div>
                                <div className="flex items-center">
                                  <FaGraduationCap className="mr-1" />
                                  {assignment.points} points
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                                  {assignment.difficulty || 'beginner'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTargetAudienceColor(assignment.targetAudience)}`}>
                                  {assignment.targetAudience === 'new_students' ? 'New Students' : 
                                   assignment.targetAudience === 'all_students' ? 'All Students' : 
                                   assignment.targetAudience === 'advanced_students' ? 'Advanced Students' : 'All Students'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Link
                                to={`/tutor/assignments/${assignment._id}`}
                                className="btn-secondary text-sm"
                              >
                                <FaEye className="mr-1" />
                                View
                              </Link>
                              <Link
                                to={`/tutor/assignments/${assignment._id}/edit`}
                                className="btn-primary text-sm"
                              >
                                <FaEdit className="mr-1" />
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Analytics</h2>
                  <p className="text-gray-600">Analytics features coming soon...</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'assignments' ? 'Assignment Statistics' : 'Course Statistics'}
              </h3>
              
              <div className="space-y-4">
                {activeTab === 'assignments' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaFileAlt className="text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Total Assignments</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {assignments.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCheckCircle className="text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">Active Assignments</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {assignments.filter(a => a.status === 'published').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUserGraduate className="text-purple-600 mr-2" />
                        <span className="text-sm text-gray-600">Total Submissions</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {assignments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="text-yellow-600 mr-2" />
                        <span className="text-sm text-gray-600">Overdue</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {assignments.filter(a => isAssignmentOverdue(a.dueDate)).length}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUsers className="text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Enrolled Students</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {course.enrollmentCount || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-600 mr-2" />
                        <span className="text-sm text-gray-600">Rating</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {course.rating || 0}/5
                      </span>
                    </div>
                    
                    {course.courseType === 'online-prerecorded' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaBookOpen className="text-green-600 mr-2" />
                          <span className="text-sm text-gray-600">Lessons</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {course.content?.length || 0}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {activeTab === 'assignments' ? (
                  <>
                    {course.status === 'published' ? (
                      <Link
                        to={`/tutor/assignments/create?courseId=${courseId}`}
                        className="w-full btn-primary text-center"
                      >
                        <FaPlus className="mr-2 inline" />
                        Create Assignment
                      </Link>
                    ) : (
                      <div className="w-full p-3 bg-gray-100 text-gray-500 text-center rounded-lg">
                        <FaExclamationTriangle className="mr-2 inline" />
                        Course must be approved
                      </div>
                    )}
                    
                    <Link
                      to={`/tutor/assignments`}
                      className="w-full btn-secondary text-center"
                    >
                      <FaFileAlt className="mr-2 inline" />
                      All Assignments
                    </Link>
                    
                    <Link
                      to={`/tutor/courses/${courseId}`}
                      className="w-full btn-secondary text-center"
                    >
                      <FaEye className="mr-2 inline" />
                      Course Overview
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/tutor/courses/${courseId}/edit`}
                      className="w-full btn-primary text-center"
                    >
                      <FaEdit className="mr-2 inline" />
                      Edit Course
                    </Link>
                    
                    <Link
                      to={`/tutor/courses/${courseId}?tab=assignments`}
                      className="w-full btn-secondary text-center"
                    >
                      <FaFileAlt className="mr-2 inline" />
                      Manage Assignments
                    </Link>
                    
                    <button className="w-full btn-secondary">
                      <FaShare className="mr-2 inline" />
                      Share Course
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;
