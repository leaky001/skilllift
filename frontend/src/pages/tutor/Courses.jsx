import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { showSuccess, showError, showCourseCreated, showCourseUpdated, showCourseDeleted } from '../../services/toastService.jsx';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheckCircle, 
  FaClock, 
  FaStar,
  FaUsers,
  FaMoneyBillWave,
  FaGraduationCap,
  FaFileAlt,
  FaFilter,
  FaSearch,
  FaTimes,
  FaArchive,
  FaUndo,
  FaEllipsisV,
  FaCalendarAlt,
  FaBookOpen,
  FaBook,
  FaChartLine,
  FaTrophy,
  FaPlay,
  FaPause,
  FaStop,
  FaVideo
} from 'react-icons/fa';
import { getTutorCourses, archiveCourse, restoreCourse, deleteCourse } from '../../services/tutorService';
import { getTutorAssignments } from '../../services/assignment';
import { getTutorLiveClasses } from '../../services/liveClassService';
import { useAuth } from '../../context/AuthContext';
import { getThumbnailUrl, getPlaceholderImage } from '../../utils/fileUtils';

const TutorCourses = () => {
  console.log('🚀 TutorCourses component function called');
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourseType, setSelectedCourseType] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Course categories
  const categories = [
    'Beauty & Fashion',
    'Business',
    'Technology',
    'Health & Wellness',
    'Arts & Design',
    'Education',
    'Marketing',
    'Finance',
    'Sports',
    'Music',
    'Cooking',
    'Photography',
    'Writing',
    'Language Learning',
    'Personal Development'
  ];

  // Fetch tutor courses from API
  useEffect(() => {
    console.log('🚀 Courses component mounted');
    console.log('👤 User from context:', user);
    console.log('🔑 Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
    console.log('🔄 About to call loadData()');
    loadData();
  }, []); // Only run once on mount

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Loading tutor courses...');
      console.log('👤 Current user:', user);
      
      // Load courses
      const coursesResponse = await getTutorCourses();
      console.log('📚 Courses response:', coursesResponse);
      if (coursesResponse.success) {
        const courseData = coursesResponse.data || [];
        console.log('✅ Courses loaded successfully:', courseData);
        console.log('📋 Course details:', courseData.map(course => ({
          id: course._id,
          title: course.title,
          status: course.status,
          courseType: course.courseType,
          category: course.category,
          description: course.description?.substring(0, 50) + '...'
        })));
        setCourses(courseData);
        console.log('🔄 Courses set in state, length:', courseData.length);
      } else {
        console.error('❌ Failed to load courses:', coursesResponse.message);
        showError('Failed to load courses');
      }

      // Load assignments
      const assignmentsResponse = await getTutorAssignments();
      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data || []);
      } else {
        console.error('Failed to load assignments:', assignmentsResponse.message);
        showError('Failed to load assignments');
      }

      // Load live classes
      const liveClassesResponse = await getTutorLiveClasses();
      if (liveClassesResponse.success) {
        setLiveClasses(liveClassesResponse.data || []);
      } else {
        console.error('Failed to load live classes:', liveClassesResponse.message);
        showError('Failed to load live classes');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      showError(`Failed to load data: ${error.message}`);
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
      console.log('✅ Loading set to false');
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      let response;
      
      if (newStatus === 'archived') {
        response = await archiveCourse(courseId);
      } else if (newStatus === 'active') {
        response = await restoreCourse(courseId);
      }

      if (response && response.success) {
        showSuccess(`Course ${newStatus} successfully`);
        loadData(); // Reload data
      } else {
        showError(response?.message || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error updating course status:', error);
              showError('Error updating course status');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const response = await deleteCourse(courseId);
        if (response.success) {
          showCourseDeleted();
          loadData(); // Reload data
        } else {
          showError(response.message || 'Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
                  showError('Error deleting course');
      }
    }
  };

  const filteredCourses = useMemo(() => {
    console.log('🔍 About to calculate filteredCourses');
    console.log('🔍 Courses array:', courses);
    console.log('🔍 Search query:', searchQuery);
    console.log('🔍 Selected status:', selectedStatus);
    console.log('🔍 Selected category:', selectedCategory);
    
    const result = courses.filter(course => {
      console.log('🔍 Filtering course:', course.title, 'Status:', course.status, 'Category:', course.category);
      
      const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesCourseType = selectedCourseType === 'all' || course.courseType === selectedCourseType;
      
      console.log('🔍 Course filter results:', {
        title: course.title,
        matchesSearch,
        matchesStatus,
        matchesCategory,
        matchesCourseType,
        finalResult: matchesSearch && matchesStatus && matchesCategory && matchesCourseType
      });
      
      return matchesSearch && matchesStatus && matchesCategory && matchesCourseType;
    });
    
    console.log('✅ filteredCourses calculated:', result.length);
    return result;
  }, [courses, searchQuery, selectedStatus, selectedCategory, selectedCourseType]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'text-primary-600 bg-primary-100';
      case 'pending':
        return 'text-primary-600 bg-primary-100';
      case 'draft':
        return 'text-slate-600 bg-slate-100';
      case 'archived':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <FaCheckCircle className="text-primary-600" />;
      case 'pending':
        return <FaClock className="text-primary-600" />;
      case 'draft':
        return <FaFileAlt className="text-slate-600" />;
      case 'archived':
        return <FaArchive className="text-error-600" />;
      default:
        return <FaFileAlt className="text-slate-600" />;
    }
  };

  const formatCurrency = (amount) => {
    try {
      console.log('💰 formatCurrency called with:', amount);
      if (!amount || amount === 0) return 'Free';
      // Convert to number if it's a string
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return 'Free';
      const result = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numAmount);
      console.log('💰 formatCurrency result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in formatCurrency:', error);
      return 'Free';
    }
  };

  const formatDate = (dateString) => {
    try {
      console.log('📅 formatDate called with:', dateString);
      const result = new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      console.log('📅 formatDate result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in formatDate:', error);
      return 'Invalid Date';
    }
  };

  const getCourseAssignments = (courseId) => {
    return assignments.filter(assignment => assignment.courseId === courseId);
  };

  const getCourseLiveClasses = (courseId) => {
    return liveClasses.filter(liveClass => liveClass.courseId === courseId);
  };

  const getCompletedLiveClasses = (courseId) => {
    return liveClasses.filter(liveClass => 
      liveClass.courseId === courseId && 
      liveClass.status === 'completed' && 
      liveClass.recordings && 
      liveClass.recordings.length > 0
    );
  };

  const CourseCard = ({ course }) => {
    try {
      
      return (
    <div className="bg-white rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-neutral-100 overflow-hidden h-full flex flex-col course-card-text">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 flex-shrink-0">
        <img 
          src={getThumbnailUrl(course.thumbnail) || getPlaceholderImage(course.category)} 
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('❌ Image failed to load:', e.target.src);
            e.target.src = getPlaceholderImage(course.category);
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
            {getStatusIcon(course.status)}
            <span className="ml-1 capitalize">{course.status}</span>
          </span>
          
          {/* Course Type Badge */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            course.courseType === 'online-live' 
              ? 'bg-primary-100 text-primary-800' 
              : 'bg-primary-100 text-primary-800'
          }`}>
            {course.courseType === 'online-live' ? (
              <>
                <FaVideo className="mr-1 h-3 w-3" />
                <span>Live Classes</span>
              </>
            ) : (
              <>
                <FaPlay className="mr-1 h-3 w-3" />
                <span>Pre-recorded</span>
              </>
            )}
          </span>
        </div>
        
        {/* Feature Badges - Only for approved courses */}
        {course.status === 'published' && course.isApproved && (
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 shadow-sm">
              <FaFileAlt className="mr-1 h-3 w-3" />
              Assignment
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 shadow-sm">
              <FaPlay className="mr-1 h-3 w-3" />
              Live Class
            </span>
            {getCompletedLiveClasses(course._id).length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 shadow-sm">
                <FaVideo className="mr-1 h-3 w-3" />
                Replay
              </span>
            )}
          </div>
        )}
        
        {/* Rating */}
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center space-x-1">
            <FaStar className="text-primary-500 text-sm" />
            <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
              {course.rating || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Course Title and Description */}
        <div className="mb-4 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 leading-tight line-clamp-2 break-words overflow-hidden">
            {course.title}
          </h3>
          <p className="text-sm text-neutral-600 mb-3 leading-relaxed line-clamp-3 break-words overflow-hidden">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2">
            <span className="bg-neutral-100 px-2 py-1 rounded truncate max-w-20" title={course.category}>
              {course.category}
            </span>
            <span className="flex-shrink-0">•</span>
            <span className="truncate max-w-16">{course.level || 'Beginner'}</span>
            <span className="flex-shrink-0">•</span>
            <span className="truncate max-w-20">{course.duration || '8 weeks'}</span>
          </div>
          
          {/* Course Type Indicator */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              course.courseType === 'online-live' 
                ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                : 'bg-primary-100 text-primary-700 border border-primary-200'
            }`}>
              {course.courseType === 'online-live' ? (
                <>
                  <FaVideo className="mr-1 h-3 w-3" />
                  <span>Live Classes</span>
                </>
              ) : (
                <>
                  <FaPlay className="mr-1 h-3 w-3" />
                  <span>Pre-recorded</span>
                </>
              )}
            </span>
            
            {/* Additional info based on course type */}
            {course.courseType === 'online-live' ? (
              <span className="text-xs text-neutral-500">
                • {getCourseLiveClasses(course._id).length} sessions scheduled
              </span>
            ) : (
              <span className="text-xs text-neutral-500">
                • {course.totalLessons || 0} lessons available
              </span>
            )}
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
            <div className="text-xl font-bold text-primary-600">
              {course.totalEnrollments || 0}
            </div>
            <div className="text-xs text-primary-600 font-medium">Students</div>
          </div>
          
          {course.courseType === 'online-live' ? (
            <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="text-xl font-bold text-primary-600">
                {getCourseLiveClasses(course._id).length}
              </div>
              <div className="text-xs text-primary-600 font-medium">Live Sessions</div>
            </div>
          ) : (
            <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="text-xl font-bold text-primary-600">
                {course.totalLessons || 0}
              </div>
              <div className="text-xs text-primary-600 font-medium">Lessons</div>
            </div>
          )}
          
          <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
            <div className="text-xl font-bold text-primary-600">
              {getCourseAssignments(course._id).length}
            </div>
            <div className="text-xs text-primary-600 font-medium">Assignments</div>
          </div>
        </div>

        {/* Price Display */}
        <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200 mb-4">
          <div className="text-lg font-bold text-primary-700">
            {formatCurrency(course.price)}
          </div>
          <div className="text-xs text-primary-600 font-medium">Course Price</div>
        </div>

        {/* Course Meta */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 mb-2">
            <div className="flex items-center space-x-1 min-w-0">
              <FaFileAlt className="text-primary-600 flex-shrink-0" />
              <span className="truncate">{getCourseAssignments(course._id).length} assignments</span>
            </div>
            
            {course.courseType === 'online-live' ? (
              <div className="flex items-center space-x-1 min-w-0">
                <FaPlay className="text-primary-600 flex-shrink-0" />
                <span className="truncate">{getCourseLiveClasses(course._id).length} live classes</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 min-w-0">
                <FaBook className="text-primary-600 flex-shrink-0" />
                <span className="truncate">{course.totalLessons || 0} lessons</span>
              </div>
            )}
            
            {course.courseType === 'online-live' && getCompletedLiveClasses(course._id).length > 0 && (
              <div className="flex items-center space-x-1 min-w-0">
                <FaVideo className="text-primary-600 flex-shrink-0" />
                <span className="truncate">{getCompletedLiveClasses(course._id).length} replays</span>
              </div>
            )}
          </div>
          <div className="text-sm text-neutral-500 truncate">
            Created {formatDate(course.createdAt)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-neutral-100 mt-auto">
          <div className="flex flex-col space-y-2">
            {/* Primary Actions */}
            <div className="flex space-x-2 min-w-0">
              <Link
                to={`/tutor/courses/${course._id}`}
                className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors min-w-0"
              >
                <FaEye className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="truncate">View</span>
              </Link>
              
              {(course.status === 'draft' || course.status === 'pending') && (
                <Link
                  to={`/tutor/courses/${course._id}/edit`}
                  className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors min-w-0"
                >
                  <FaEdit className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Edit</span>
                </Link>
              )}
            </div>
            

            {/* Feature Actions - Only for published courses */}
            {course.status === 'published' && (
              <div className="space-y-2">
                {/* Course Type Specific Actions */}
                {course.courseType === 'online-live' ? (
                  <>
                    {/* Live Class Actions - Only Assignment and Live Class buttons */}
                    <div className="flex space-x-2 min-w-0">
                      <Link
                        to={`/tutor/assignments/create?courseId=${course._id}&courseTitle=${encodeURIComponent(course.title)}`}
                        className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm min-w-0 course-card-button"
                        title={`Create assignment for ${course.title}`}
                      >
                        <FaFileAlt className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Assignment</span>
                      </Link>
                      
                      <Link
                        to={`/tutor/live-classes/create?courseId=${course._id}&courseTitle=${encodeURIComponent(course.title)}`}
                        className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm min-w-0 course-card-button"
                        title={`Create live class for ${course.title}`}
                      >
                        <FaPlay className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Live Class</span>
                      </Link>
                    </div>
                    
                    {/* Replay Actions - Only show if there are completed live classes with recordings */}
                    {getCompletedLiveClasses(course._id).length > 0 && (
                      <div className="flex space-x-2 min-w-0">
                        <Link
                          to={`/tutor/live-classes/${getCompletedLiveClasses(course._id)[0]._id}/recordings`}
                          className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm min-w-0"
                          title={`View replays for ${course.title}`}
                        >
                          <FaVideo className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">View Replays</span>
                        </Link>
                        
                        <Link
                          to={`/tutor/live-classes/${getCompletedLiveClasses(course._id)[0]._id}/upload-recording`}
                          className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm min-w-0"
                          title={`Upload more recordings for ${course.title}`}
                        >
                          <FaPlus className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">Upload Recording</span>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Pre-recorded Course Actions - Assignment and Lessons buttons */}
                    <div className="flex space-x-2 min-w-0">
                      <Link
                        to={`/tutor/assignments/create?courseId=${course._id}&courseTitle=${encodeURIComponent(course.title)}`}
                        className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm min-w-0 course-card-button"
                        title={`Create assignment for ${course.title}`}
                      >
                        <FaFileAlt className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Assignment</span>
                      </Link>
                      
                      <Link
                        to={`/tutor/courses/${course._id}?tab=lessons`}
                        className="flex-1 inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm min-w-0 course-card-button"
                        title={`Manage lessons for ${course.title}`}
                      >
                        <FaBook className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Lessons</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Secondary Actions */}
          <div className="flex justify-end space-x-1 mt-2">
            {course.status === 'archived' ? (
              <button
                onClick={() => handleStatusChange(course._id, 'active')}
                className="inline-flex items-center p-2 text-sm font-medium text-primary-600 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors"
                title="Restore Course"
              >
                <FaUndo className="h-4 w-4" />
              </button>
            ) : course.status !== 'archived' ? (
              <button
                onClick={() => handleStatusChange(course._id, 'archived')}
                className="inline-flex items-center p-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                title="Archive Course"
              >
                <FaArchive className="h-4 w-4" />
              </button>
            ) : null}
            
            <button
              onClick={() => handleDeleteCourse(course._id)}
              className="inline-flex items-center p-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              title="Delete Course"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    );
    } catch (error) {
      console.error('❌ Error rendering CourseCard:', error);
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error rendering course:</strong> {error.message}
        </div>
      );
    }
  };

  if (loading) {
    console.log('🔄 Component is in loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  console.log('🎨 Component is NOT in loading state, about to render main content');
  console.log('📊 Current state values:', {
    courses: courses.length,
    filteredCourses: filteredCourses.length,
    loading,
    searchQuery,
    selectedStatus,
    selectedCategory
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Courses</h1>
              <p className="text-neutral-600">Manage and track your course performance</p>
            </div>
            <Link
              to="/tutor/courses/create"
              className="btn-primary"
            >
              <FaPlus className="mr-2" />
              Create Course
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FaBookOpen className="text-primary-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Total Courses</p>
                  <p className="text-2xl font-bold text-neutral-900">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="flex items-center">
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <FaUsers className="text-secondary-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Total Students</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {courses.reduce((total, course) => total + (course.totalEnrollments || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="flex items-center">
                <div className="p-3 bg-accent-100 rounded-lg">
                  <FaMoneyBillWave className="text-accent-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {formatCurrency(courses.reduce((total, course) => total + (course.price || 0), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft">
              <div className="flex items-center">
                <div className="p-3 bg-accent-100 rounded-lg">
                  <FaGraduationCap className="text-accent-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Published</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {courses.filter(c => c.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedCourseType}
                onChange={(e) => setSelectedCourseType(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="online-live">Live Classes</option>
                <option value="online-prerecorded">Pre-recorded</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="btn-secondary"
              >
                <FaChartLine className="mr-2" />
                {showStats ? 'Hide' : 'Show'} Stats
              </button>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-neutral-300 mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No courses found</h3>
            <p className="text-neutral-500 mb-6">
              {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedCourseType !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't created any courses yet"
              }
            </p>
            {!searchQuery && selectedStatus === 'all' && selectedCategory === 'all' && selectedCourseType === 'all' && (
              <Link to="/tutor/courses/create" className="btn-primary">
                <FaPlus className="mr-2" />
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {console.log('🎨 About to render courses:', filteredCourses.length, 'courses')}
            {filteredCourses.map((course, index) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorCourses;
