import React, { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheck, 
  FaTimes,
  FaUser,
  FaGraduationCap,
  FaFlag,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Mock complaints data
  const complaints = [
    {
      id: 1,
      title: 'Inappropriate Content in Course',
      description: 'The course contains content that violates our community guidelines.',
      complainant: 'Ridwan Idris',
      complainantRole: 'learner',
      complainantEmail: 'ridwan.idris@gmail.com',
      accused: 'Muiz Abass',
      accusedRole: 'tutor',
      accusedEmail: 'muiz.abass@gmail.com',
      type: 'content',
      status: 'pending',
      priority: 'high',
      submittedDate: '2024-01-25',
      lastUpdated: '2024-01-25',
      evidence: ['screenshot1.png', 'course_video.mp4'],
      category: 'Community Guidelines Violation'
    },
    {
      id: 2,
      title: 'Payment Dispute',
      description: 'I was charged twice for the same course. Need refund for duplicate payment.',
      complainant: 'Mistura Rokibat',
      complainantRole: 'learner',
      complainantEmail: 'mistura.rokibat@gmail.com',
      accused: 'System',
      accusedRole: 'system',
      accusedEmail: 'support@skilllift.com',
      type: 'payment',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-01-23',
      lastUpdated: '2024-01-24',
      evidence: ['payment_receipt.pdf', 'bank_statement.pdf'],
      category: 'Payment Issue'
    },
    {
      id: 3,
      title: 'Harassment Report',
      description: 'Received inappropriate messages from another user during live sessions.',
      complainant: 'Rodiyat Kabir',
      complainantRole: 'learner',
      complainantEmail: 'rodiyat.kabir@gmail.com',
      accused: 'Abdullah Sofiyat',
      accusedRole: 'tutor',
      accusedEmail: 'abdullah.sofiyat@gmail.com',
      type: 'harassment',
      status: 'investigating',
      priority: 'critical',
      submittedDate: '2024-01-22',
      lastUpdated: '2024-01-25',
      evidence: ['chat_logs.txt', 'session_recording.mp4'],
      category: 'Harassment'
    },
    {
      id: 4,
      title: 'Course Quality Issue',
      description: 'The course material is outdated and doesn\'t match the description.',
      complainant: 'Muiz Abass',
      complainantRole: 'learner',
      complainantEmail: 'muiz.abass@gmail.com',
      accused: 'Mistura Rokibat',
      accusedRole: 'tutor',
      accusedEmail: 'mistura.rokibat@gmail.com',
      type: 'quality',
      status: 'pending',
      priority: 'low',
      submittedDate: '2024-01-21',
      lastUpdated: '2024-01-21',
      evidence: ['course_description.pdf', 'actual_content.pdf'],
      category: 'Course Quality'
    },
    {
      id: 5,
      title: 'Technical Issue',
      description: 'Cannot access the platform. Getting error messages constantly.',
      complainant: 'Abdullah Sofiyat',
      complainantRole: 'tutor',
      complainantEmail: 'abdullah.sofiyat@gmail.com',
      accused: 'System',
      accusedRole: 'system',
      accusedEmail: 'support@skilllift.com',
      type: 'technical',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-01-20',
      lastUpdated: '2024-01-22',
      evidence: ['error_screenshots.png', 'browser_logs.txt'],
      category: 'Technical Support'
    }
  ];

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesType = typeFilter === 'all' || complaint.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-accent-100 text-accent-800';
      case 'investigating': return 'bg-primary-100 text-primary-800';
      case 'resolved': return 'bg-success-100 text-success-800';
      case 'dismissed': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-error-100 text-error-800';
      case 'high': return 'bg-accent-100 text-accent-800';
      case 'medium': return 'bg-primary-100 text-primary-800';
      case 'low': return 'bg-success-100 text-success-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'harassment': return <FaFlag className="text-error-600" />;
      case 'content': return <FaExclamationTriangle className="text-accent-600" />;
      case 'payment': return <FaCheckCircle className="text-primary-600" />;
      case 'quality': return <FaTimesCircle className="text-secondary-600" />;
      case 'technical': return <FaClock className="text-neutral-600" />;
      default: return <FaExclamationTriangle className="text-neutral-600" />;
    }
  };

  const handleComplaintAction = (complaintId, action) => {
    console.log(`${action} complaint ${complaintId}`);
    // TODO: Implement complaint actions
  };

  const openComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Complaints & Reports</h1>
        <p className="text-neutral-600">Handle user complaints, reports, and disputes to maintain platform integrity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Complaints</p>
              <p className="text-2xl font-bold text-neutral-900">{complaints.length}</p>
            </div>
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-neutral-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-accent-600">
                {complaints.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-accent-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Investigating</p>
              <p className="text-2xl font-bold text-primary-600">
                {complaints.filter(c => c.status === 'investigating').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaSearch className="text-primary-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Resolved</p>
              <p className="text-2xl font-bold text-success-600">
                {complaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <FaCheck className="text-success-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search complaints by title, description, or complainant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="harassment">Harassment</option>
              <option value="content">Content</option>
              <option value="payment">Payment</option>
              <option value="quality">Quality</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Complaint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Complainant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Accused
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-neutral-900 mb-1">{complaint.title}</div>
                      <div className="text-sm text-neutral-500 truncate">{complaint.description}</div>
                      <div className="text-xs text-neutral-400 mt-1">{complaint.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(complaint.type)}
                      <span className="text-sm text-neutral-900 capitalize">{complaint.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {complaint.complainantRole === 'tutor' ? 
                        <FaGraduationCap className="text-secondary-600" /> : 
                        <FaUser className="text-primary-600" />
                      }
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{complaint.complainant}</div>
                        <div className="text-xs text-neutral-500">{complaint.complainantEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {complaint.accusedRole === 'tutor' ? 
                        <FaGraduationCap className="text-secondary-600" /> : 
                        complaint.accusedRole === 'learner' ?
                        <FaUser className="text-primary-600" /> :
                        <FaExclamationTriangle className="text-neutral-600" />
                      }
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{complaint.accused}</div>
                        <div className="text-xs text-neutral-500">{complaint.accusedEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {new Date(complaint.submittedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openComplaintModal(complaint)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {complaint.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleComplaintAction(complaint.id, 'investigate')}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <FaSearch className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleComplaintAction(complaint.id, 'resolve')}
                            className="text-success-600 hover:text-success-900"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleComplaintAction(complaint.id, 'dismiss')}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Complaint Details</h3>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Priority</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Type</p>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedComplaint.type)}
                    <span className="text-sm text-neutral-900 capitalize">{selectedComplaint.type}</span>
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">{selectedComplaint.title}</h4>
                <p className="text-neutral-600">{selectedComplaint.description}</p>
                <p className="text-sm text-neutral-500 mt-2">Category: {selectedComplaint.category}</p>
              </div>

              {/* Parties Involved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h5 className="font-medium text-neutral-900 mb-3">Complainant</h5>
                  <div className="flex items-center space-x-3">
                    {selectedComplaint.complainantRole === 'tutor' ? 
                      <FaGraduationCap className="text-secondary-600 text-xl" /> : 
                      <FaUser className="text-primary-600 text-xl" />
                    }
                    <div>
                      <p className="font-medium text-neutral-900">{selectedComplaint.complainant}</p>
                      <p className="text-sm text-neutral-600">{selectedComplaint.complainantEmail}</p>
                      <p className="text-xs text-neutral-500 capitalize">{selectedComplaint.complainantRole}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h5 className="font-medium text-neutral-900 mb-3">Accused</h5>
                  <div className="flex items-center space-x-3">
                    {selectedComplaint.accusedRole === 'tutor' ? 
                      <FaGraduationCap className="text-secondary-600 text-xl" /> : 
                      selectedComplaint.accusedRole === 'learner' ?
                      <FaUser className="text-primary-600 text-xl" /> :
                      <FaExclamationTriangle className="text-neutral-600 text-xl" />
                    }
                    <div>
                      <p className="font-medium text-neutral-900">{selectedComplaint.accused}</p>
                      <p className="text-sm text-neutral-600">{selectedComplaint.accusedEmail}</p>
                      <p className="text-xs text-neutral-500 capitalize">{selectedComplaint.accusedRole}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-neutral-900 mb-3">Evidence</h5>
                  <div className="space-y-2">
                    {selectedComplaint.evidence.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-neutral-600">
                        <FaEye className="text-primary-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-neutral-900 mb-3">Timeline</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Submitted:</span>
                      <span className="text-neutral-900">{new Date(selectedComplaint.submittedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Last Updated:</span>
                      <span className="text-neutral-900">{new Date(selectedComplaint.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-neutral-200">
                {selectedComplaint.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleComplaintAction(selectedComplaint.id, 'investigate')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Start Investigation
                    </button>
                    <button
                      onClick={() => handleComplaintAction(selectedComplaint.id, 'resolve')}
                      className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleComplaintAction(selectedComplaint.id, 'dismiss')}
                      className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                      Dismiss
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 bg-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;