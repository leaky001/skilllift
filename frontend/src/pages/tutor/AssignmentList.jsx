import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { getCourseAssignments, deleteAssignment, publishAssignment, archiveAssignment } from '../../services/assignmentService';
import { getCourse } from '../../services/courseService';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCalendarAlt, 
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaEyeSlash,
  FaArchive,
  FaRocket
} from 'react-icons/fa';

const AssignmentList = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourse();
      loadAssignments();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setCourseLoading(true);
      const response = await getCourse(courseId);
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

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await getCourseAssignments(courseId);
      if (response.success) {
        setAssignments(response.data);
      } else {
        showError('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      showError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteAssignment(assignmentId);
      if (response.success) {
        showSuccess('Assignment deleted successfully');
        loadAssignments();
      } else {
        showError(response.message || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      showError('Failed to delete assignment');
    }
  };

  const handlePublish = async (assignmentId) => {
    try {
      const response = await publishAssignment(assignmentId);
      if (response.success) {
        showSuccess('Assignment published successfully');
        loadAssignments();
      } else {
        showError(response.message || 'Failed to publish assignment');
      }
    } catch (error) {
      console.error('Error publishing assignment:', error);
      showError('Failed to publish assignment');
    }
  };

  const handleArchive = async (assignmentId) => {
    try {
      const response = await archiveAssignment(assignmentId);
      if (response.success) {
        showSuccess('Assignment archived successfully');
        loadAssignments();
      } else {
        showError(response.message || 'Failed to archive assignment');
      }
    } catch (error) {
      console.error('Error archiving assignment:', error);
      showError('Failed to archive assignment');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FaEyeSlash, label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Published' },
      archived: { color: 'bg-yellow-100 text-yellow-800', icon: FaArchive, label: 'Archived' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getAssignmentTypeIcon = (type) => {
    const typeIcons = {
      homework: '📚',
      project: '🎯',
      quiz: '📝',
      assessment: '📊',
      reading: '📖',
      discussion: '💬'
    };
    return typeIcons[type] || '📋';
  };

  const getSubmissionTypeIcon = (type) => {
    const submissionIcons = {
      file: '📁',
      text: '✏️',
      'multiple-choice': '☑️',
      link: '🔗',
      none: '❌'
    };
    return submissionIcons[type] || '📋';
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Due Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-yellow-600 font-medium">Due Tomorrow</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-medium">Due in {diffDays} days</span>;
    } else {
      return <span className="text-neutral-600">{date.toLocaleDateString()}</span>;
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
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Course Assignments</h1>
              <p className="text-neutral-600">Manage assignments for "{course.title}"</p>
            </div>
            <div className="flex space-x-4">
              <Link
                to={`/tutor/assignments/create?courseId=${courseId}`}
                className="btn-primary"
              >
                <FaPlus className="mr-2" />
                Create Assignment
              </Link>
              <button
                onClick={() => navigate(`/tutor/courses/${courseId}`)}
                className="btn-outline"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <div className="text-primary-600 text-xl">📚</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{course.title}</h3>
              <p className="text-neutral-600">{course.category} • {course.level}</p>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900">Assignments ({assignments.length})</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No assignments yet</h3>
              <p className="text-neutral-600 mb-6">Create your first assignment to get started</p>
              <Link
                to={`/tutor/assignments/create?courseId=${courseId}`}
                className="btn-primary"
              >
                <FaPlus className="mr-2" />
                Create Assignment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getAssignmentTypeIcon(assignment.assignmentType)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">{assignment.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(assignment.status)}
                            <span className="text-sm text-neutral-500">
                              {getSubmissionTypeIcon(assignment.submissionType)} {assignment.submissionType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-neutral-600 mb-4 line-clamp-2">{assignment.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-neutral-400" />
                          <span className="text-neutral-600">Due:</span>
                          <span className="font-medium">{formatDueDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaClock className="text-neutral-400" />
                          <span className="text-neutral-600">Points:</span>
                          <span className="font-medium">{assignment.points}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-600">Weight:</span>
                          <span className="font-medium">{assignment.weight}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-600">Type:</span>
                          <span className="font-medium capitalize">{assignment.assignmentType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        to={`/tutor/courses/${courseId}/assignments/${assignment._id}`}
                        className="btn-outline text-sm"
                      >
                        <FaEye className="mr-2" />
                        View
                      </Link>
                      <Link
                        to={`/tutor/courses/${courseId}/assignments/${assignment._id}/edit`}
                        className="btn-outline text-sm"
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </Link>
                      
                      {assignment.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(assignment._id)}
                          className="btn-primary text-sm"
                        >
                          <FaRocket className="mr-2" />
                          Publish
                        </button>
                      )}
                      
                      {assignment.status === 'published' && (
                        <button
                          onClick={() => handleArchive(assignment._id)}
                          className="btn-outline text-sm text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                        >
                          <FaArchive className="mr-2" />
                          Archive
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentList;
