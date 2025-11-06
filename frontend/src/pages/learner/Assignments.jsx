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
        return 'text-green-800 bg-green-100 border-green-200';
      case 'submitted':
        return 'text-blue-800 bg-blue-100 border-blue-200';
      case 'graded':
        return 'text-purple-800 bg-purple-100 border-purple-200';
      case 'overdue':
        return 'text-red-800 bg-red-100 border-red-200';
      default:
        return 'text-slate-800 bg-slate-100 border-slate-200';
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
      <div className="assignment-card bg-white rounded-xl shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden w-full">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                {assignment.title}
              </h3>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {assignment.description}
              </p>
              
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center text-slate-600">
                  <FaBookOpen className="mr-2 text-primary-600" />
                  <span className="truncate font-medium">{assignment.course?.title || 'Unknown Course'}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <FaGraduationCap className="mr-2 text-primary-600" />
                  <span className="truncate font-medium">{assignment.tutor?.name || 'Unknown Tutor'}</span>
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex flex-col items-end space-y-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(assignment.status)}`}>
                {getStatusIcon(assignment.status)}
                <span className="ml-1.5 capitalize">{assignment.status}</span>
              </span>
              
              {submissionStatus && (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                  submissionStatus === 'graded' ? 'text-green-800 bg-green-100 border-green-200' :
                  submissionStatus === 'submitted' ? 'text-blue-800 bg-blue-100 border-blue-200' :
                  'text-slate-800 bg-slate-100 border-slate-200'
                }`}>
                  {submissionStatus === 'graded' && submissionScore !== null ? (
                    <>
                      <FaTrophy className="mr-1.5" />
                      <span>{submissionScore}/{submissionMaxScore || assignment.points || assignment.totalPoints}</span>
                      {submissionGrade && (
                        <span className="ml-1.5 font-bold">({submissionGrade})</span>
                      )}
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-1.5" />
                      <span>Submitted</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg flex items-center justify-center mr-3">
                    <FaCalendarAlt className="text-primary-600" />
                  </div>
                  <span className="text-sm font-semibold text-primary-900">Due Date</span>
                </div>
              </div>
              <div className="text-sm font-bold text-primary-900 mb-1">
                {formatDate(assignment.dueDate)}
              </div>
              <div className="text-xs text-primary-700 font-medium">
                {timeRemaining}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-lg flex items-center justify-center mr-3">
                    <FaTrophy className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-900">Points</span>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-900 mb-1">
                {assignment.totalPoints || assignment.points || 0} pts
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                Pass: {assignment.passingScore || 70}%
              </div>
            </div>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center">
                <FaFileAlt className="mr-2 text-purple-600" />
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
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Attachments</h4>
              <div className="space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center">
                      <FaFileAlt className="text-primary-600 mr-2" />
                      <span className="text-sm text-slate-700 font-medium">{attachment.name}</span>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors">
                      <FaDownload />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grade Details */}
          {submissionStatus === 'graded' && submissionScore !== null && (
            <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center">
                <FaTrophy className="mr-2 text-green-600" />
                Grade Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 font-medium">Score:</span>
                  <span className="font-bold text-green-900">
                    {submissionScore}/{submissionMaxScore || assignment.points || assignment.totalPoints}
                  </span>
                </div>
                {submissionGrade && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 font-medium">Grade:</span>
                    <span className="font-bold text-green-900 text-lg">{submissionGrade}</span>
                  </div>
                )}
                {submissionFeedback && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="text-sm text-green-700 font-semibold">Feedback:</span>
                    <p className="text-sm text-green-800 mt-2 bg-white p-3 rounded-lg border border-green-200">
                      {submissionFeedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 text-sm">
                <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200">
                  {assignment.type || 'Assignment'}
                </span>
                <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200">
                  {assignment.difficulty || 'Medium'}
                </span>
              </div>
              
              <Link
                to={`/learner/assignments/${assignment._id}`}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center hover:shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">My Assignments</h1>
          <p className="text-slate-600 text-lg">Track your assignments and submissions</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Available Assignments
                <span className="ml-2 bg-slate-100 text-slate-900 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                  {filteredAssignments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'submissions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                My Submissions
                <span className="ml-2 bg-slate-100 text-slate-900 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                  {mySubmissions.length}
                </span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
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
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
              >
                <option value="all">All Types</option>
                <option value="project">Project</option>
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="essay">Essay</option>
              </select>
            </div>

            {/* Content */}
            {activeTab === 'available' ? (
              <div>
                {filteredAssignments.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaFileAlt className="text-4xl text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No assignments found</h3>
                    <p className="text-slate-600 text-lg">
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
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaUpload className="text-4xl text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No submissions yet</h3>
                    <p className="text-slate-600 text-lg">
                      You haven't submitted any assignments yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mySubmissions.map(submission => (
                      <div key={submission._id} className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg mb-2">
                              {submission.assignment?.title || 'Unknown Assignment'}
                            </h4>
                            <p className="text-sm text-slate-600 flex items-center">
                              <FaCalendarAlt className="mr-2 text-primary-600" />
                              Submitted: {formatDate(submission.submittedAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                              submission.status === 'graded' ? 'text-green-800 bg-green-100 border-green-200' :
                              submission.status === 'submitted' ? 'text-blue-800 bg-blue-100 border-blue-200' :
                              'text-slate-800 bg-slate-100 border-slate-200'
                            }`}>
                              {submission.status === 'graded' && submission.score !== null ? (
                                <>
                                  <FaTrophy className="mr-1.5" />
                                  <span>{submission.score}/{submission.maxScore}</span>
                                  {submission.grade && (
                                    <span className="ml-1.5 font-bold">({submission.grade})</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <FaUpload className="mr-1.5" />
                                  <span className="capitalize">{submission.status}</span>
                                </>
                              )}
                            </span>
                            <Link
                              to={`/learner/assignments/${submission.assignment._id}`}
                              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 text-sm"
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
