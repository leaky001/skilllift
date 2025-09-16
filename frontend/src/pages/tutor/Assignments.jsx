import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheckCircle, 
  FaClock, 
  FaStar,
  FaFileAlt,
  FaDownload,
  FaUpload,
  FaFilter,
  FaSearch,
  FaSave,
  FaCalendarAlt,
  FaBookOpen,
  FaUsers,
  FaExclamationTriangle,
  FaCheckDouble,
  FaGraduationCap,
  FaChartLine,
  FaTrophy,
  FaPlay,
  FaPause,
  FaStop,
  FaTimes,
  FaSpinner,
  FaUser,
  FaLink
} from 'react-icons/fa';
import { 
  getTutorAssignments, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment,
  publishAssignment,
  unpublishAssignment,
  getAssignmentSubmissions,
  gradeAssignmentSubmission
} from '../../services/assignment';
import { useAuth } from '../../context/AuthContext';


// SubmissionCard component
const SubmissionCard = ({ submission, onGrade, onViewDetails }) => (
  <div className="p-6 hover:bg-slate-50 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <FaUser className="text-indigo-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {submission.learner?.name || 'Unknown Student'}
            </h3>
            <p className="text-sm text-slate-600 truncate">
              {submission.learner?.email || 'No email'}
            </p>
          </div>
        </div>
        
        <div className="mb-3">
          <h4 className="font-medium text-slate-900 mb-1">
            Assignment: {submission.assignment?.title || 'Unknown Assignment'}
          </h4>
          <p className="text-sm text-slate-600 line-clamp-2">
            {submission.assignment?.description || 'No description'}
          </p>
        </div>
        
        <div className="mb-3">
          <h5 className="font-medium text-slate-900 mb-1">Submission Content:</h5>
          <p className="text-sm text-slate-600 line-clamp-3">
            {submission.content || 'No content provided'}
          </p>
        </div>
        
        {submission.submissionNotes && (
          <div className="mb-3">
            <h5 className="font-medium text-slate-900 mb-1">Notes:</h5>
            <p className="text-sm text-slate-600 line-clamp-2">
              {submission.submissionNotes}
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {submission.attachments && submission.attachments.length > 0 && (
            <div className="flex items-center text-sm text-slate-600">
              <FaFileAlt className="mr-1" />
              <span>{submission.attachments.length} file(s)</span>
            </div>
          )}
          {submission.videos && submission.videos.length > 0 && (
            <div className="flex items-center text-sm text-slate-600">
              <FaPlay className="mr-1" />
              <span>{submission.videos.length} video(s)</span>
            </div>
          )}
          {submission.links && submission.links.length > 0 && (
            <div className="flex items-center text-sm text-slate-600">
              <FaLink className="mr-1" />
              <span>{submission.links.length} link(s)</span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-slate-500">
          Submitted: {new Date(submission.submittedAt).toLocaleString()}
          {submission.isLate && (
            <span className="ml-2 text-amber-600 font-medium">(Late)</span>
          )}
        </div>
      </div>
      
      <div className="ml-4 flex flex-col items-end space-y-2">
        <button
          onClick={() => onViewDetails(submission)}
          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          <FaEye className="inline mr-1" />
          View Details
        </button>
        
        {submission.grade ? (
          <div className="text-right">
            <div className="text-sm text-slate-600">Grade</div>
            <div className="text-lg font-semibold text-emerald-600">
              {submission.grade.score}/{submission.grade.maxScore}
            </div>
            <div className="text-sm text-slate-600">
              {submission.grade.letterGrade}
            </div>
            <button
              onClick={() => onGrade(submission)}
              className="mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-xs"
            >
              <FaEdit className="inline mr-1" />
              Edit Grade
            </button>
          </div>
        ) : (
          <button
            onClick={() => onGrade(submission)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <FaGraduationCap className="inline mr-1" />
            Grade
          </button>
        )}
      </div>
    </div>
  </div>
);

// AssignmentCard component
const AssignmentCard = ({ 
  assignment, 
  onDelete, 
  onStatusChange, 
  onViewSubmissions,
  getStatusColor,
  getStatusIcon,
  formatDate
}) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 assignment-card h-full flex flex-col">
    <div className="p-6 assignment-card-content flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 break-words line-clamp-2">
            {assignment.title}
          </h3>
          <p className="text-sm text-slate-600 mb-3 line-clamp-3 break-words">
            {assignment.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-3">
            <div className="flex items-center min-w-0">
              <FaBookOpen className="mr-1 flex-shrink-0" />
              <span className="truncate max-w-32" title={assignment.course?.title || 'Unknown Course'}>
                {assignment.course?.title || 'Unknown Course'}
              </span>
            </div>
            <div className="flex items-center">
              <FaUsers className="mr-1 flex-shrink-0" />
              <span>{assignment.submissionCount || 0} submissions</span>
            </div>
            <div className="flex items-center">
              <FaGraduationCap className="mr-1 flex-shrink-0" />
              <span>{assignment.gradedCount || 0} graded</span>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
            {getStatusIcon(assignment.status)}
            <span className="ml-1 capitalize">{assignment.status}</span>
          </span>
          
          <div className="mt-2 text-right">
            <div className="text-sm text-slate-600">
              Due: {formatDate(assignment.dueDate)}
            </div>
            <div className="text-sm text-slate-600">
              {assignment.totalPoints} points
            </div>
          </div>
        </div>
      </div>

      {assignment.instructions && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-900 mb-1">Instructions</h4>
          <p className="text-sm text-indigo-800 line-clamp-2 break-words">
            {assignment.instructions}
          </p>
        </div>
      )}

      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Attachments ({assignment.attachments.length})</h4>
          <div className="grid grid-cols-2 gap-2">
            {assignment.attachments.slice(0, 4).map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <FaFileAlt className="text-slate-400 mr-2" />
                  <span className="text-xs text-slate-700 truncate">{attachment.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 assignment-card-actions mt-auto">
        <div className="flex items-center space-x-2 text-sm text-slate-600 min-w-0 flex-1">
          <span className="truncate">Type: {assignment.type}</span>
          <span>•</span>
          <span className="truncate">Difficulty: {assignment.difficulty}</span>
        </div>
        
        <div className="flex space-x-2 flex-shrink-0 ml-2">
          {assignment.submissionCount > 0 && (
            <button
              onClick={() => onViewSubmissions(assignment._id)}
              className="btn-secondary text-sm"
              title="View Submissions"
            >
              <FaEye />
            </button>
          )}
          
          <Link
            to={`/tutor/assignments/${assignment._id}`}
            className="btn-secondary text-sm"
            title="Edit Assignment"
          >
            <FaEdit />
          </Link>
          
          {assignment.status === 'draft' ? (
            <button
              onClick={() => onStatusChange(assignment._id, 'active')}
              className="btn-primary text-sm"
              title="Publish Assignment"
            >
              <FaPlay />
            </button>
          ) : assignment.status === 'active' ? (
            <button
              onClick={() => onStatusChange(assignment._id, 'draft')}
              className="btn-secondary text-sm"
              title="Unpublish Assignment"
            >
              <FaPause />
            </button>
          ) : null}
          
          <button
            onClick={() => onDelete(assignment._id)}
            className="btn-secondary text-red-600 hover:bg-red-50 text-sm"
            title="Delete Assignment"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TutorAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'submissions'
  const [showSubmissionDetailsModal, setShowSubmissionDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Constants
  const assignmentTypes = ['practical', 'analysis', 'project', 'portfolio', 'quiz', 'essay'];
  const statuses = ['all', 'active', 'completed', 'draft'];
  const courses = ['all', 'Web Development Fundamentals', 'Digital Marketing Mastery', 'Entrepreneurship Fundamentals', 'Data Science Basics'];

  // Load assignments on component mount
  useEffect(() => {
    loadAssignments();
  }, []);

  // Load submissions when switching to submissions tab
  useEffect(() => {
    if (activeTab === 'submissions') {
      loadAllSubmissions();
    }
  }, [activeTab]);

  // Load assignments function
  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await getTutorAssignments();
      
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        console.error('Failed to load assignments:', response.message);
        showError('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      showError('Error loading assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load all submissions across all assignments
  const loadAllSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const allSubmissions = [];
      
      // Get submissions for each assignment
      for (const assignment of assignments) {
        try {
          const response = await getAssignmentSubmissions(assignment._id);
          if (response.success && response.data.length > 0) {
            // Add assignment info to each submission
            const submissionsWithAssignment = response.data.map(submission => ({
              ...submission,
              assignment: assignment
            }));
            allSubmissions.push(...submissionsWithAssignment);
          }
        } catch (error) {
          console.error(`Error loading submissions for assignment ${assignment._id}:`, error);
        }
      }
      
      // Sort by submission date (newest first)
      allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error('Error loading all submissions:', error);
      showError('Error loading submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Delete assignment function
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
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
        showError('Error deleting assignment');
      }
    }
  };

  // Change assignment status function
  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      const response = newStatus === 'active' 
        ? await publishAssignment(assignmentId)
        : await unpublishAssignment(assignmentId);
      
      if (response.success) {
        showSuccess(`Assignment ${newStatus === 'active' ? 'published' : 'unpublished'} successfully`);
        loadAssignments();
      } else {
        showError(response.message || `Failed to ${newStatus === 'active' ? 'publish' : 'unpublish'} assignment`);
      }
    } catch (error) {
      console.error('Error changing assignment status:', error);
      showError('Error changing assignment status');
    }
  };

  // Load submissions function
  const loadSubmissions = async (assignmentId) => {
    try {
      setSubmissionsLoading(true);
      setSelectedAssignment(assignments.find(a => a._id === assignmentId));
      const response = await getAssignmentSubmissions(assignmentId);
      
      if (response.success) {
        setSubmissions(response.data || []);
        setShowSubmissionsModal(true);
      } else {
        showError(response.message || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      showError('Error loading submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // View submission details function
  const handleViewSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetailsModal(true);
  };

  // Grade submission function
  const handleGradeSubmission = async (submission, gradeData = null) => {
    // If called from SubmissionCard, show a simple grading modal
    if (gradeData === null) {
      const score = prompt('Enter score:');
      const grade = prompt('Enter letter grade (A, B, C, D, F):');
      const feedback = prompt('Enter feedback (optional):');
      
      if (!score || !grade) {
        showWarning('Please enter both score and grade');
        return;
      }
      
      gradeData = {
        score: parseInt(score),
        grade,
        feedback: feedback || ''
      };
    }
    
    try {
      const response = await gradeAssignmentSubmission(submission._id, gradeData);
      if (response.success) {
        showSuccess('Submission graded successfully');
        
        // Update the submission in the local state
        setSubmissions(prevSubmissions => 
          prevSubmissions.map(sub => 
            sub._id === submission._id 
              ? { ...sub, grade: gradeData }
              : sub
          )
        );
        
        // Reload submissions if we're on the submissions tab
        if (activeTab === 'submissions') {
          loadAllSubmissions();
        } else {
          loadSubmissions(selectedAssignment._id);
        }
      } else {
        showError(response.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      showError('Error grading submission');
    }
  };

  // Filter assignments when filters change
  useEffect(() => {
    filterAssignments();
  }, [searchQuery, selectedCourse, selectedStatus, selectedType, assignments]);

  // Filter assignments function
  const filterAssignments = useCallback(() => {
    let filtered = assignments;

    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(assignment => assignment.course?.title === selectedCourse);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(assignment => assignment.type === selectedType);
    }

    setFilteredAssignments(filtered);
  }, [searchQuery, selectedCourse, selectedStatus, selectedType, assignments]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color function
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-100';
      case 'draft':
        return 'text-slate-600 bg-slate-100';
      case 'completed':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  // Get status icon function
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle />;
      case 'draft':
        return <FaFileAlt />;
      case 'completed':
        return <FaCheckDouble />;
      default:
        return <FaClock />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">My Assignments</h1>
              <p className="text-slate-600">Create and manage assignments for your courses</p>
            </div>
            <Link
              to="/tutor/assignments/create"
              className="btn-primary"
            >
              <FaPlus className="mr-2" />
              Create Assignment
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FaFileAlt className="text-indigo-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FaCheckCircle className="text-emerald-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {assignments.filter(a => a.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FaUpload className="text-amber-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {assignments.reduce((total, a) => total + (a.submissionCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FaGraduationCap className="text-emerald-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Graded</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {assignments.reduce((total, a) => total + (a.gradedCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FaFileAlt className="inline mr-2" />
                Assignments ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'submissions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FaUpload className="inline mr-2" />
                Submissions ({submissions.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {courses.slice(1).map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statuses.slice(1).map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {assignmentTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assignment Grid */}
        {activeTab === 'assignments' && (
          <>
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl text-slate-300 mb-4">📝</div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No assignments found</h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || selectedCourse !== 'all' || selectedStatus !== 'all' || selectedType !== 'all'
                    ? 'Try adjusting your filters'
                    : "You haven't created any assignments yet"
                  }
                </p>
                {!searchQuery && selectedCourse === 'all' && selectedStatus === 'all' && selectedType === 'all' && (
                  <button
                    key="create-first-assignment"
                    onClick={() => navigate('/tutor/assignments/create')}
                    className="btn-primary"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Assignment
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {filteredAssignments.map(assignment => (
                  <AssignmentCard 
                    key={assignment._id} 
                    assignment={assignment}
                    onDelete={handleDeleteAssignment}
                    onStatusChange={handleStatusChange}
                    onViewSubmissions={loadSubmissions}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-xl shadow-lg">
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-600">Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl text-slate-300 mb-4">📤</div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No submissions yet</h3>
                <p className="text-slate-500">Students haven't submitted any assignments yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {submissions.map(submission => (
                  <SubmissionCard 
                    key={submission._id} 
                    submission={submission}
                    onGrade={handleGradeSubmission}
                    onViewDetails={handleViewSubmissionDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Submissions for "{selectedAssignment.title}"
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
                </p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-indigo-500 text-2xl mr-3" />
                  <span className="text-slate-600">Loading submissions...</span>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-slate-300 mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No submissions yet</h3>
                  <p className="text-slate-500">Students haven't submitted this assignment yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map((submission, index) => (
                    <div key={submission._id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold text-sm">
                                {submission.learner?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {submission.learner?.name || 'Unknown Student'}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {submission.learner?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                            {submission.isLate && (
                              <span className="flex items-center text-amber-600">
                                <FaExclamationTriangle className="mr-1" />
                                Late by {submission.lateBy} minutes
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'graded' ? 'bg-emerald-100 text-emerald-800' :
                              submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {submission.status}
                            </span>
                          </div>
                        </div>
                        {submission.status === 'graded' && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
                              {submission.score}/{submission.maxScore}
                            </div>
                            <div className="text-sm text-slate-600">
                              {submission.percentage?.toFixed(1)}%
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              Grade: {submission.grade}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Submission Content */}
                      {submission.content && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-900 mb-2">Content:</h5>
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-slate-700 whitespace-pre-wrap">{submission.content}</p>
                          </div>
                        </div>
                      )}

                      {/* Submission Notes */}
                      {submission.submissionNotes && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-900 mb-2">Student Notes:</h5>
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-slate-700">{submission.submissionNotes}</p>
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {submission.attachments && submission.attachments.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-900 mb-2">Attachments:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {submission.attachments.map((attachment, attIndex) => (
                              <div key={attIndex} className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-3">
                                <FaFileAlt className="text-indigo-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{attachment.name}</p>
                                  <p className="text-sm text-slate-600">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                  <FaDownload />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      {submission.links && submission.links.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-900 mb-2">Links:</h5>
                          <div className="space-y-2">
                            {submission.links.map((link, linkIndex) => (
                              <div key={linkIndex} className="bg-white rounded-lg p-3 border border-slate-200">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                  {link.title || link.url}
                                </a>
                                {link.description && (
                                  <p className="text-sm text-slate-600 mt-1">{link.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tutor Feedback */}
                      {submission.tutorFeedback && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-900 mb-2">Your Feedback:</h5>
                          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                            <p className="text-slate-700">{submission.tutorFeedback}</p>
                          </div>
                        </div>
                      )}

                      {/* Grading Section */}
                      {submission.status !== 'graded' && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <h5 className="font-semibold text-slate-900 mb-3">Grade This Submission:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Score (out of {submission.maxScore})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={submission.maxScore}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter score"
                                id={`score-${submission._id}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Grade
                              </label>
                              <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                id={`grade-${submission._id}`}
                              >
                                <option value="">Select Grade</option>
                                <option value="A">A (90-100%)</option>
                                <option value="B">B (80-89%)</option>
                                <option value="C">C (70-79%)</option>
                                <option value="D">D (60-69%)</option>
                                <option value="F">F (Below 60%)</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Feedback
                            </label>
                            <textarea
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Provide feedback to the student..."
                              id={`feedback-${submission._id}`}
                            />
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => {
                                const score = document.getElementById(`score-${submission._id}`).value;
                                const grade = document.getElementById(`grade-${submission._id}`).value;
                                const feedback = document.getElementById(`feedback-${submission._id}`).value;
                                
                                if (!score || !grade) {
                                  showWarning('Please enter both score and grade');
                                  return;
                                }
                                
                                handleGradeSubmission(submission, {
                                  score: parseInt(score),
                                  grade,
                                  feedback
                                });
                              }}
                              className="btn-primary"
                            >
                              <FaCheckCircle className="mr-2" />
                              Submit Grade
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showSubmissionDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Submission Details
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedSubmission.learner?.name || 'Unknown Student'} - {selectedSubmission.assignment?.title || 'Unknown Assignment'}
                </p>
              </div>
              <button
                onClick={() => setShowSubmissionDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Name:</span>
                      <p className="font-medium">{selectedSubmission.learner?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Email:</span>
                      <p className="font-medium">{selectedSubmission.learner?.email || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Assignment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-slate-600">Title:</span>
                      <p className="font-medium">{selectedSubmission.assignment?.title || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Description:</span>
                      <p className="text-slate-700">{selectedSubmission.assignment?.description || 'No description'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Points:</span>
                      <p className="font-medium">{selectedSubmission.assignment?.points || 0} points</p>
                    </div>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Submission Content</h3>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedSubmission.content || 'No content provided'}
                    </p>
                  </div>
                </div>

                {/* Submission Notes */}
                {selectedSubmission.submissionNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Student Notes</h3>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedSubmission.submissionNotes}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Attachments ({selectedSubmission.attachments.length})</h3>
                    <div className="space-y-2">
                      {selectedSubmission.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <div className="flex items-center space-x-2">
                            <FaFileAlt className="text-slate-500" />
                            <span className="text-sm font-medium">{attachment.name}</span>
                            <span className="text-xs text-slate-500">({attachment.size} bytes)</span>
                          </div>
                          <a
                            href={attachment.url}
                            download
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            <FaDownload className="inline mr-1" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {selectedSubmission.videos && selectedSubmission.videos.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Videos ({selectedSubmission.videos.length})</h3>
                    <div className="space-y-2">
                      {selectedSubmission.videos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <div className="flex items-center space-x-2">
                            <FaPlay className="text-slate-500" />
                            <span className="text-sm font-medium">{video.name}</span>
                            <span className="text-xs text-slate-500">({video.size} bytes)</span>
                          </div>
                          <a
                            href={video.url}
                            download
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            <FaDownload className="inline mr-1" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {selectedSubmission.links && selectedSubmission.links.length > 0 && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Links ({selectedSubmission.links.length})</h3>
                    <div className="space-y-2">
                      {selectedSubmission.links.map((link, index) => (
                        <div key={index} className="bg-white rounded p-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                          >
                            <FaLink className="mr-1" />
                            {link.title || link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Submission Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Submitted:</span>
                      <p className="font-medium">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Status:</span>
                      <p className="font-medium">
                        {selectedSubmission.isLate ? (
                          <span className="text-amber-600">Late Submission</span>
                        ) : (
                          <span className="text-emerald-600">On Time</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grade Section */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Grade</h3>
                    <button
                      onClick={() => handleGradeSubmission(selectedSubmission)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FaGraduationCap className="inline mr-1" />
                      {selectedSubmission.grade ? 'Update Grade' : 'Grade Submission'}
                    </button>
                  </div>
                  
                  {selectedSubmission.grade ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-slate-600">Score:</span>
                          <p className="text-lg font-semibold text-emerald-600">
                            {selectedSubmission.grade.score}/{selectedSubmission.grade.maxScore}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Grade:</span>
                          <p className="text-lg font-semibold text-emerald-600">
                            {selectedSubmission.grade.letterGrade}
                          </p>
                        </div>
                      </div>
                      {selectedSubmission.grade.feedback && (
                        <div>
                          <span className="text-sm text-slate-600">Feedback:</span>
                          <p className="text-slate-700 bg-slate-50 rounded p-2 mt-1">
                            {selectedSubmission.grade.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No grade assigned yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorAssignments;
