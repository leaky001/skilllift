import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaClock, 
  FaStar, 
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaDownload,
  FaUpload,
  FaCalendarAlt,
  FaBookOpen,
  FaGraduationCap,
  FaChartLine,
  FaTrophy,
  FaExclamationTriangle,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { getMyAssignments, getMySubmissions } from '../../services/assignment';

const LearnerAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load assignments
      const assignmentsResponse = await getMyAssignments();
      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data || []);
      } else {
        console.error('Failed to load assignments:', assignmentsResponse.message);
        showError('Failed to load assignments');
      }

      // Load submissions
      const submissionsResponse = await getMySubmissions();
      if (submissionsResponse.success) {
        setMySubmissions(submissionsResponse.data || []);
      } else {
        console.error('Failed to load submissions:', submissionsResponse.message);
        showError('Failed to load submissions');
      }
    } catch (error) {
      console.error('Error loading data:', error);
              showError('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAssignments();
  }, [searchQuery, selectedStatus, assignments]);

  const filterAssignments = useCallback(() => {
    let filtered = assignments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.tutor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === selectedStatus);
    }

    setFilteredAssignments(filtered);
  }, [searchQuery, selectedStatus, assignments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff <= 0) {
      return 'Overdue';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = mySubmissions.find(sub => sub.assignment._id === assignmentId || sub.assignment === assignmentId);
    return submission ? submission.status : null;
  };

  const getSubmissionScore = (assignmentId) => {
    const submission = mySubmissions.find(sub => sub.assignment._id === assignmentId || sub.assignment === assignmentId);
    return submission ? submission.score : null;
  };

  const getSubmissionGrade = (assignmentId) => {
    const submission = mySubmissions.find(sub => sub.assignment._id === assignmentId || sub.assignment === assignmentId);
    return submission ? submission.grade : null;
  };

  const getSubmissionMaxScore = (assignmentId) => {
    const submission = mySubmissions.find(sub => sub.assignment._id === assignmentId || sub.assignment === assignmentId);
    return submission ? submission.maxScore : null;
  };

  const getSubmissionFeedback = (assignmentId) => {
    const submission = mySubmissions.find(sub => sub.assignment._id === assignmentId || sub.assignment === assignmentId);
    return submission ? submission.tutorFeedback : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'graded':
        return 'text-purple-600 bg-purple-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaClock />;
      case 'submitted':
        return <FaUpload />;
      case 'graded':
        return <FaCheckCircle />;
      case 'overdue':
        return <FaExclamationTriangle />;
      default:
        return <FaClock />;
    }
  };

  const AssignmentCard = ({ assignment }) => {
    const submissionStatus = getSubmissionStatus(assignment._id);
    const submissionScore = getSubmissionScore(assignment._id);
    const submissionGrade = getSubmissionGrade(assignment._id);
    const submissionMaxScore = getSubmissionMaxScore(assignment._id);
    const submissionFeedback = getSubmissionFeedback(assignment._id);
    const timeRemaining = getTimeRemaining(assignment.dueDate);

    return (
      <div className="assignment-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden w-full">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                {assignment.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {assignment.description}
              </p>
              
              <div className="flex flex-col space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <FaBookOpen className="mr-2 text-blue-500" />
                  <span className="truncate">{assignment.course?.title || 'Unknown Course'}</span>
                </div>
                <div className="flex items-center">
                  <FaGraduationCap className="mr-2 text-green-500" />
                  <span className="truncate">{assignment.tutor?.name || 'Unknown Tutor'}</span>
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex flex-col items-end space-y-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                {getStatusIcon(assignment.status)}
                <span className="ml-1 capitalize">{assignment.status}</span>
              </span>
              
              {submissionStatus && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  submissionStatus === 'graded' ? 'text-green-700 bg-green-100' :
                  submissionStatus === 'submitted' ? 'text-blue-700 bg-blue-100' :
                  'text-gray-700 bg-gray-100'
                }`}>
                  {submissionStatus === 'graded' && submissionScore !== null ? (
                    <>
                      <FaTrophy className="mr-1" />
                      <span>{submissionScore}/{submissionMaxScore || assignment.points || assignment.totalPoints}</span>
                      {submissionGrade && (
                        <span className="ml-1 font-bold">({submissionGrade})</span>
                      )}
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-1" />
                      <span>Submitted</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Due Date</span>
                </div>
                <span className="text-sm font-bold text-blue-900">
                  {formatDate(assignment.dueDate)}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1 font-medium">
                {timeRemaining}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaTrophy className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Points</span>
                </div>
                <span className="text-sm font-bold text-green-900">
                  {assignment.totalPoints || assignment.points || 0} pts
                </span>
              </div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                Pass: {assignment.passingScore || 70}%
              </div>
            </div>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                <FaFileAlt className="mr-2" />
                Instructions
              </h4>
              <p className="text-sm text-purple-800 line-clamp-3">
                {assignment.instructions}
              </p>
            </div>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h4>
              <div className="space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center">
                      <FaFileAlt className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      <FaDownload />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grade Details */}
          {submissionStatus === 'graded' && submissionScore !== null && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                <FaTrophy className="mr-2" />
                Grade Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Score:</span>
                  <span className="font-semibold text-green-800">
                    {submissionScore}/{submissionMaxScore || assignment.points || assignment.totalPoints}
                  </span>
                </div>
                {submissionGrade && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Grade:</span>
                    <span className="font-bold text-green-800 text-lg">{submissionGrade}</span>
                  </div>
                )}
                {submissionFeedback && (
                  <div className="mt-2">
                    <span className="text-sm text-green-700 font-medium">Feedback:</span>
                    <p className="text-sm text-green-800 mt-1 bg-white p-2 rounded border">
                      {submissionFeedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                  {assignment.type || 'Assignment'}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                  {assignment.difficulty || 'Medium'}
                </span>
              </div>
              
              <Link
                to={`/learner/assignments/${assignment._id}`}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center"
              >
                <FaEye className="mr-2" />
                {submissionStatus === 'graded' ? 'View Grade Details' : 
                 submissionStatus ? 'View Submission' : 'Submit Assignment'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">My Assignments</h1>
          <p className="text-lg text-slate-600">Track your assignments and submissions</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-5 px-1 border-b-3 font-semibold text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Available Assignments ({filteredAssignments.length})
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-5 px-1 border-b-3 font-semibold text-sm transition-colors ${
                  activeTab === 'submissions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                My Submissions ({mySubmissions.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64 transition-colors"
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="project">Project</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                  <option value="essay">Essay</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'available' ? (
              <div>
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl text-neutral-300 mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">No assignments found</h3>
                    <p className="text-neutral-500">
                      {searchQuery || selectedStatus !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'You have no assignments available at the moment'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAssignments.map(assignment => (
                      <AssignmentCard key={assignment._id} assignment={assignment} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {mySubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl text-neutral-300 mb-4">📤</div>
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">No submissions yet</h3>
                    <p className="text-neutral-500">
                      You haven't submitted any assignments yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mySubmissions.map(submission => (
                      <div key={submission._id} className="bg-neutral-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              {submission.assignment?.title || 'Unknown Assignment'}
                            </h4>
                            <p className="text-sm text-neutral-600">
                              Submitted: {formatDate(submission.submittedAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.status === 'graded' ? 'text-green-600 bg-green-100' :
                              submission.status === 'submitted' ? 'text-blue-600 bg-blue-100' :
                              'text-gray-600 bg-gray-100'
                            }`}>
                              {submission.status === 'graded' && submission.score !== null ? (
                                <>
                                  <FaTrophy className="mr-1" />
                                  <span>{submission.score}/{submission.maxScore}</span>
                                  {submission.grade && (
                                    <span className="ml-1 font-bold">({submission.grade})</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <FaUpload className="mr-1" />
                                  <span>{submission.status}</span>
                                </>
                              )}
                            </span>
                            <Link
                              to={`/learner/assignments/${submission.assignment._id}`}
                              className="btn-secondary text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAssignments;
