import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { getAssignment, deleteAssignment, publishAssignment, archiveAssignment } from '../../services/assignmentService';
import { getCourse } from '../../services/courseService';
import { 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEyeSlash,
  FaArchive,
  FaRocket,
  FaArrowLeft,
  FaFileAlt,
  FaLink,
  FaDownload,
  FaExternalLinkAlt
} from 'react-icons/fa';

const ViewAssignment = () => {
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    if (courseId && assignmentId) {
      loadCourse();
      loadAssignment();
    }
  }, [courseId, assignmentId]);

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

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignment(assignmentId);
      if (response.success) {
        setAssignment(response.data);
      } else {
        showError('Failed to load assignment');
        navigate(`/tutor/courses/${courseId}/assignments`);
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      showError('Failed to load assignment');
      navigate(`/tutor/courses/${courseId}/assignments`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteAssignment(assignmentId);
      if (response.success) {
        showSuccess('Assignment deleted successfully');
        navigate(`/tutor/courses/${courseId}/assignments`);
      } else {
        showError(response.message || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      showError('Failed to delete assignment');
    }
  };

  const handlePublish = async () => {
    try {
      const response = await publishAssignment(assignmentId);
      if (response.success) {
        showSuccess('Assignment published successfully');
        loadAssignment();
      } else {
        showError(response.message || 'Failed to publish assignment');
      }
    } catch (error) {
      console.error('Error publishing assignment:', error);
      showError('Failed to publish assignment');
    }
  };

  const handleArchive = async () => {
    try {
      const response = await archiveAssignment(assignmentId);
      if (response.success) {
        showSuccess('Assignment archived successfully');
        loadAssignment();
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (courseLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Assignment Not Found</h1>
            <button
              onClick={() => navigate(`/tutor/courses/${courseId}/assignments`)}
              className="btn-primary"
            >
              Back to Assignments
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => navigate(`/tutor/courses/${courseId}/assignments`)}
                  className="btn-outline"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Assignments
                </button>
                {getStatusBadge(assignment.status)}
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">{assignment.title}</h1>
              <p className="text-neutral-600">Assignment for "{course.title}"</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/tutor/courses/${courseId}/assignments/${assignmentId}/edit`}
                className="btn-outline"
              >
                <FaEdit className="mr-2" />
                Edit
              </Link>
              
              {assignment.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="btn-primary"
                >
                  <FaRocket className="mr-2" />
                  Publish
                </button>
              )}
              
              {assignment.status === 'published' && (
                <button
                  onClick={handleArchive}
                  className="btn-outline text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  <FaArchive className="mr-2" />
                  Archive
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Assignment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getAssignmentTypeIcon(assignment.assignmentType)}</span>
                    <span className="text-neutral-900 capitalize">{assignment.assignmentType}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <p className="text-neutral-700">{assignment.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Instructions</label>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-neutral-700 whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Submission Type</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getSubmissionTypeIcon(assignment.submissionType)}</span>
                    <span className="text-neutral-900 capitalize">{assignment.submissionType}</span>
                  </div>
                </div>

                {assignment.submissionType === 'file' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Max File Size</label>
                      <p className="text-neutral-700">{assignment.maxFileSize} MB</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Max Submissions</label>
                      <p className="text-neutral-700">{assignment.maxSubmissions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resources */}
            {assignment.resources && assignment.resources.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Resources</h2>
                <div className="space-y-3">
                  {assignment.resources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <FaLink className="text-primary-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-neutral-600">{resource.description}</p>
                        )}
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm"
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rubric */}
            {assignment.rubric && assignment.rubric.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Grading Rubric</h2>
                <div className="space-y-3">
                  {assignment.rubric.map((item, index) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-neutral-900">{item.criterion}</h4>
                        <span className="text-sm font-medium text-primary-600">{item.points} points</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-neutral-600">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Course</label>
                  <p className="text-neutral-900">{course.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                  <p className="text-neutral-700">{course.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Level</label>
                  <p className="text-neutral-700">{course.level}</p>
                </div>
              </div>
            </div>

            {/* Assignment Stats */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Assignment Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Points</span>
                  <span className="font-medium text-neutral-900">{assignment.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Weight</span>
                  <span className="font-medium text-neutral-900">{assignment.weight}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status</span>
                  <span className="font-medium text-neutral-900 capitalize">{assignment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Created</span>
                  <span className="font-medium text-neutral-900">{formatDateTime(assignment.createdAt)}</span>
                </div>
                {assignment.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Published</span>
                    <span className="font-medium text-neutral-900">{formatDateTime(assignment.publishedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Due Date</h3>
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-lg font-medium text-neutral-900 mb-1">
                  {formatDateTime(assignment.dueDate)}
                </div>
                <div className="text-sm text-neutral-600">
                  {formatDueDate(assignment.dueDate)}
                </div>
              </div>
            </div>

            {/* Late Submission */}
            {assignment.allowLateSubmission && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Late Submission</h3>
                <div className="text-center">
                  <div className="text-3xl mb-2">⏰</div>
                  <div className="text-sm text-neutral-600 mb-1">Late submissions allowed</div>
                  <div className="text-lg font-medium text-neutral-900">
                    {assignment.latePenalty}% penalty per day
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {assignment.tags && assignment.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {assignment.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssignment;
