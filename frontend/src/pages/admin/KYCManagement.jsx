import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaCheck, FaTimes, FaEye, FaFileAlt, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { showSuccess, showError, showWarning } from '../../services/toastService.jsx';
import * as adminService from '../../services/adminService';
import { getFileUrl } from '../../utils/fileUtils';

const KYCManagement = () => {
  const [pendingKYC, setPendingKYC] = useState([]);
  const [allTutors, setAllTutors] = useState([]);
  const [kycStats, setKycStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    try {
      setLoading(true);
      const [pendingResponse, tutorsResponse, statsResponse] = await Promise.all([
        adminService.getPendingKYC(),
        adminService.getAllTutorsKYC(),
        adminService.getKYCStats()
      ]);
      
      setPendingKYC(pendingResponse.data);
      setAllTutors(tutorsResponse.data);
      setKycStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      showError('Failed to fetch KYC data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (tutorId) => {
    try {
      await adminService.approveKYC(tutorId, approveNotes);
      showSuccess('✅ KYC approved successfully!');
      setApproveNotes('');
      
      // Update local state immediately to prevent UI lag
      setPendingKYC(prev => prev.filter(tutor => tutor._id !== tutorId));
      setAllTutors(prev => prev.map(tutor => 
        tutor._id === tutorId 
          ? { ...tutor, tutorProfile: { ...tutor.tutorProfile, kycStatus: 'approved' } }
          : tutor
      ));
      
      // Then refresh data to ensure consistency
      setTimeout(() => {
        fetchKYCData();
      }, 500);
    } catch (error) {
      console.error('Error approving KYC:', error);
      showError('Failed to approve KYC');
    }
  };

  const handleRejectKYC = async (tutorId) => {
    if (!rejectReason.trim()) {
      showWarning('Please provide a rejection reason');
      return;
    }

    try {
      await adminService.rejectKYC(tutorId, rejectReason, rejectNotes);
      showSuccess('❌ KYC rejected successfully!');
      setRejectReason('');
      setRejectNotes('');
      setShowRejectModal(false);
      fetchKYCData();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      showError('Failed to reject KYC');
    }
  };

  const getKYCStatusBadge = (kycStatus) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      submitted: { color: 'bg-blue-100 text-blue-800', text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[kycStatus] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPendingKYC = () => (
    <div className="space-y-4">
      {pendingKYC.length === 0 ? (
        <div className="text-center py-8">
          <FaShieldAlt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending KYC submissions</h3>
          <p className="mt-1 text-sm text-gray-500">All tutors have completed their verification.</p>
        </div>
      ) : (
        pendingKYC.map((tutor) => (
          <div key={tutor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {tutor.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{tutor.name}</h3>
                  <p className="text-sm text-gray-500">{tutor.email}</p>
                  <p className="text-sm text-gray-500">{tutor.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  Submitted: {formatDate(tutor.tutorProfile?.kycDocuments?.submittedAt)}
                </span>
                <button
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setShowDetailsModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                  title="View Documents"
                >
                  <FaEye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleApproveKYC(tutor._id)}
                  className="text-green-600 hover:text-green-900"
                  title="Approve KYC"
                >
                  <FaCheck className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setShowRejectModal(true);
                  }}
                  className="text-red-600 hover:text-red-900"
                  title="Reject KYC"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAllTutors = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                KYC Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allTutors.map((tutor) => (
              <tr key={tutor._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {tutor.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{tutor.name}</div>
                      <div className="text-sm text-gray-500">{tutor.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getKYCStatusBadge(tutor.tutorProfile?.kycStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tutor.tutorProfile?.kycDocuments?.submittedAt 
                    ? formatDate(tutor.tutorProfile.kycDocuments.submittedAt)
                    : 'Not submitted'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tutor.tutorProfile?.kycDocuments?.reviewedAt 
                    ? formatDate(tutor.tutorProfile.kycDocuments.reviewedAt)
                    : 'Not reviewed'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    {tutor.tutorProfile?.kycStatus === 'submitted' && (
                      <>
                        <button
                          onClick={() => handleApproveKYC(tutor._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve KYC"
                        >
                          <FaCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTutor(tutor);
                            setShowRejectModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Reject KYC"
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
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
          <p className="text-gray-600">Manage tutor verification and document review</p>
        </div>
        <button
          onClick={fetchKYCData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaUser className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tutors</p>
              <p className="text-2xl font-bold text-gray-900">{kycStats.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaFileAlt className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">{kycStats.submitted || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{kycStats.approved || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaTimes className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{kycStats.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Review ({pendingKYC.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Tutors ({allTutors.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading KYC data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'pending' && renderPendingKYC()}
          {activeTab === 'all' && renderAllTutors()}
        </>
      )}

      {/* Document Viewer Modal */}
      {showDetailsModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                KYC Documents - {selectedTutor.name}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Tutor Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Tutor Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedTutor.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedTutor.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedTutor.phone || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">KYC Status:</span> {getKYCStatusBadge(selectedTutor.tutorProfile?.kycStatus)}
                  </div>
                </div>
              </div>

              {/* Document Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Document */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">ID Document</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedTutor.tutorProfile?.kycDocuments?.idDocumentType || 'Not specified'}
                    </div>
                    {selectedTutor.tutorProfile?.kycDocuments?.idDocument ? (
                      <div>
                        <span className="font-medium">Document:</span>
                        <div className="mt-2">
                          {(() => {
                            const filePath = selectedTutor.tutorProfile.kycDocuments.idDocument;
                            const fullUrl = getFileUrl(filePath);
                            console.log('🔍 ID Document Debug:', {
                              filePath,
                              fullUrl,
                              tutorName: selectedTutor.name
                            });
                            return (
                              <img 
                                src={fullUrl} 
                                alt="ID Document"
                                className="w-full h-64 object-contain border rounded"
                                onError={(e) => {
                                  console.error('❌ Failed to load ID document:', {
                                    filePath,
                                    fullUrl,
                                    error: e
                                  });
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                                onLoad={() => {
                                  console.log('✅ ID Document loaded successfully:', fullUrl);
                                }}
                              />
                            );
                          })()}
                          <div className="w-full h-64 border rounded flex items-center justify-center bg-gray-100">
                            <span className="text-gray-500">Document not available</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No document uploaded</div>
                    )}
                  </div>
                </div>

                {/* Address Document */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Address Proof</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedTutor.tutorProfile?.kycDocuments?.addressDocumentType || 'Not specified'}
                    </div>
                    {selectedTutor.tutorProfile?.kycDocuments?.addressDocument ? (
                      <div>
                        <span className="font-medium">Document:</span>
                        <div className="mt-2">
                          {(() => {
                            const filePath = selectedTutor.tutorProfile.kycDocuments.addressDocument;
                            const fullUrl = getFileUrl(filePath);
                            console.log('🔍 Address Document Debug:', {
                              filePath,
                              fullUrl,
                              tutorName: selectedTutor.name
                            });
                            return (
                              <img 
                                src={fullUrl} 
                                alt="Address Document"
                                className="w-full h-64 object-contain border rounded"
                                onError={(e) => {
                                  console.error('❌ Failed to load address document:', {
                                    filePath,
                                    fullUrl,
                                    error: e
                                  });
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                                onLoad={() => {
                                  console.log('✅ Address Document loaded successfully:', fullUrl);
                                }}
                              />
                            );
                          })()}
                          <div className="w-full h-64 border rounded flex items-center justify-center bg-gray-100">
                            <span className="text-gray-500">Document not available</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No document uploaded</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              {selectedTutor.tutorProfile?.kycDocuments?.profilePhoto && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Profile Photo</h4>
                  <div className="flex justify-center">
                    <img 
                      src={getFileUrl(selectedTutor.tutorProfile.kycDocuments.profilePhoto)} 
                      alt="Profile Photo"
                      className="w-32 h-32 object-cover rounded-full border"
                      onError={(e) => {
                        console.error('❌ Failed to load profile photo:', selectedTutor.tutorProfile.kycDocuments.profilePhoto);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="w-32 h-32 border rounded-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-500 text-xs">Photo not available</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Submission Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Submitted:</span> {
                      selectedTutor.tutorProfile?.kycDocuments?.submittedAt 
                        ? formatDate(selectedTutor.tutorProfile.kycDocuments.submittedAt)
                        : 'Not submitted'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Reviewed:</span> {
                      selectedTutor.tutorProfile?.kycDocuments?.reviewedAt 
                        ? formatDate(selectedTutor.tutorProfile.kycDocuments.reviewedAt)
                        : 'Not reviewed'
                    }
                  </div>
                  {selectedTutor.tutorProfile?.kycDocuments?.notes && (
                    <div className="col-span-2">
                      <span className="font-medium">Notes:</span> {selectedTutor.tutorProfile.kycDocuments.notes}
                    </div>
                  )}
                  {selectedTutor.tutorProfile?.kycDocuments?.rejectionReason && (
                    <div className="col-span-2">
                      <span className="font-medium">Rejection Reason:</span> {selectedTutor.tutorProfile.kycDocuments.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedTutor.tutorProfile?.kycStatus === 'submitted' && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleApproveKYC(selectedTutor._id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaCheck className="inline mr-2" />
                    Approve KYC
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTimes className="inline mr-2" />
                    Reject KYC
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject KYC</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reject KYC verification for <strong>{selectedTutor.name}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="2"
                  placeholder="Additional notes (optional)..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectNotes('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectKYC(selectedTutor._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCManagement;
