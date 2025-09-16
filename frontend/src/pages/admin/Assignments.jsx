import React, { useState } from 'react';
import { 
  FaClipboardList, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaGraduationCap,
  FaBookOpen
} from 'react-icons/fa';

const AdminAssignments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock assignments data
  const assignments = [
    {
      id: 1,
      title: 'Web Development Final Project',
      course: 'Advanced Web Development',
      tutor: 'Muiz Abass',
      student: 'Ridwan Idris',
      status: 'submitted',
      submittedAt: '2024-01-20T14:30:00Z',
      dueDate: '2024-01-25T23:59:00Z',
      grade: null,
      feedback: ''
    },
    {
      id: 2,
      title: 'Digital Marketing Campaign Analysis',
      course: 'Digital Marketing Fundamentals',
      tutor: 'Mistura Rokibat',
      student: 'Abdullah Sofiyat',
      status: 'graded',
      submittedAt: '2024-01-19T10:15:00Z',
      dueDate: '2024-01-20T23:59:00Z',
      grade: 'A',
      feedback: 'Excellent analysis with comprehensive insights'
    },
    {
      id: 3,
      title: 'JavaScript Algorithms',
      course: 'JavaScript Programming',
      tutor: 'Rodiyat Kabir',
      student: 'Emma Wilson',
      status: 'overdue',
      submittedAt: null,
      dueDate: '2024-01-18T23:59:00Z',
      grade: null,
      feedback: ''
    },
    {
      id: 4,
      title: 'UI/UX Design Portfolio',
      course: 'Design Principles',
      tutor: 'Muiz Abass',
      student: 'Michael Chen',
      status: 'submitted',
      submittedAt: '2024-01-20T16:45:00Z',
      dueDate: '2024-01-22T23:59:00Z',
      grade: null,
      feedback: ''
    }
  ];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.student.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'text-primary-600 bg-primary-50 border-primary-200';
      case 'graded': return 'text-success-600 bg-success-50 border-success-200';
      case 'overdue': return 'text-error-600 bg-error-50 border-error-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <FaClock className="w-4 h-4" />;
      case 'graded': return <FaCheck className="w-4 h-4" />;
      case 'overdue': return <FaTimes className="w-4 h-4" />;
      default: return <FaClipboardList className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Assignment Management</h1>
        <p className="text-neutral-600">Monitor and manage course assignments across the platform, track submissions, and oversee grading.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Assignments</p>
              <p className="text-2xl font-bold text-neutral-900">{assignments.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FaClipboardList className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Submitted</p>
              <p className="text-2xl font-bold text-primary-600">
                {assignments.filter(a => a.status === 'submitted').length}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FaClock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Graded</p>
              <p className="text-2xl font-bold text-success-600">
                {assignments.filter(a => a.status === 'graded').length}
              </p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <FaCheck className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Overdue</p>
              <p className="text-2xl font-bold text-error-600">
                {assignments.filter(a => a.status === 'overdue').length}
              </p>
            </div>
            <div className="p-3 bg-error-50 rounded-lg">
              <FaTimes className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="overdue">Overdue</option>
            </select>
            
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <FaFilter className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{assignment.title}</div>
                      <div className="text-sm text-neutral-500">ID: {assignment.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaBookOpen className="w-4 h-4 text-neutral-400 mr-2" />
                      <span className="text-sm text-neutral-900">{assignment.course}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUser className="w-4 h-4 text-neutral-400 mr-2" />
                      <span className="text-sm text-neutral-900">{assignment.student}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaGraduationCap className="w-4 h-4 text-neutral-400 mr-2" />
                      <span className="text-sm text-neutral-900">{assignment.tutor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">{assignment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assignment.grade ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        {assignment.grade}
                      </span>
                    ) : (
                      <span className="text-sm text-neutral-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {assignment.status === 'submitted' && (
                        <button
                          onClick={() => console.log('Grade assignment:', assignment.id)}
                          className="text-success-600 hover:text-success-900"
                          title="Grade Assignment"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => console.log('Delete assignment:', assignment.id)}
                        className="text-error-600 hover:text-error-900"
                        title="Delete Assignment"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {showModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Assignment Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <p className="text-neutral-900 font-medium">{selectedAssignment.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Course</label>
                  <p className="text-neutral-600">{selectedAssignment.course}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Student</label>
                  <p className="text-neutral-600">{selectedAssignment.student}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tutor</label>
                  <p className="text-neutral-600">{selectedAssignment.tutor}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedAssignment.status)}`}>
                    {getStatusIcon(selectedAssignment.status)}
                    <span className="ml-1 capitalize">{selectedAssignment.status}</span>
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Due Date</label>
                <p className="text-neutral-600">{new Date(selectedAssignment.dueDate).toLocaleString()}</p>
              </div>
              
              {selectedAssignment.submittedAt && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Submitted At</label>
                  <p className="text-neutral-600">{new Date(selectedAssignment.submittedAt).toLocaleString()}</p>
                </div>
              )}
              
              {selectedAssignment.grade && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Grade</label>
                  <p className="text-neutral-900 font-medium">{selectedAssignment.grade}</p>
                </div>
              )}
              
              {selectedAssignment.feedback && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Feedback</label>
                  <p className="text-neutral-600">{selectedAssignment.feedback}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
              {selectedAssignment.status === 'submitted' && (
                <button
                  onClick={() => {
                    console.log('Grade assignment:', selectedAssignment.id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Grade Assignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
