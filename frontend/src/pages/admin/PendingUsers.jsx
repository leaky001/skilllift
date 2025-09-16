import React, { useState, useEffect } from 'react';
import { FaUsers, FaCheck, FaTimes, FaEye, FaClock } from 'react-icons/fa';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import * as adminService from '../../services/adminService';

const PendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingUsers, setProcessingUsers] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingUsers();
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
              showError('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      console.log('🔍 Approving user:', userId);
      
      // Set processing state
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      const response = await adminService.approveUser(userId);
      console.log('🔍 Approval response:', response);
      
      if (response.success) {
        showSuccess('User approved successfully! 🎉');
        
        // Show success message
        setSuccessMessage(`✅ User approved successfully! They can now login and create courses.`);
        setTimeout(() => setSuccessMessage(''), 5000);
        
        // Update the UI immediately
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        
        // Show success animation
        const userRow = document.querySelector(`[data-user-id="${userId}"]`);
        if (userRow) {
          userRow.classList.add('bg-green-50', 'border-l-4', 'border-green-400');
          setTimeout(() => {
            userRow.remove();
          }, 2000);
        }
      } else {
        console.error('❌ Approval failed:', response.message);
                  showError(response.message || 'Failed to approve user');
      }
    } catch (error) {
      console.error('❌ Error approving user:', error);
      console.error('❌ Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        showError('User not found. Please refresh the page.');
      } else if (error.response?.status === 400) {
                  showError(error.response.data?.message || 'User is not pending approval');
      } else if (error.code === 'ERR_NETWORK') {
                  showError('Network error. Please check if the backend server is running.');
      } else {
                  showError('Failed to approve user. Please try again.');
      }
    } finally {
      // Clear processing state
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRejectUser = async (userId) => {
    if (!rejectionReason.trim()) {
              showError('Please provide a rejection reason');
      return;
    }

    try {
      // Set processing state
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      const response = await adminService.rejectUser(userId, rejectionReason);
      
      if (response.success) {
        showSuccess('User rejected successfully');
        setShowRejectModal(false);
        setRejectionReason('');
        
        // Update the UI immediately
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        
        // Show rejection animation
        const userRow = document.querySelector(`[data-user-id="${userId}"]`);
        if (userRow) {
          userRow.classList.add('bg-red-50', 'border-l-4', 'border-red-400');
          setTimeout(() => {
            userRow.remove();
          }, 2000);
        }
      } else {
                  showError(response.message || 'Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
              showError('Failed to reject user');
    } finally {
      // Clear processing state
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: 'bg-purple-100 text-purple-800',
      tutor: 'bg-blue-100 text-blue-800',
      learner: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig[role] || roleConfig.learner}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="p-6">
             {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div className="flex items-center space-x-3">
           <FaUsers className="text-2xl text-primary-600" />
           <h1 className="text-2xl font-bold text-gray-900">Pending User Approvals</h1>
         </div>
         <div className="flex items-center space-x-4">
           <div className="text-sm text-gray-500">
             Total Pending: {pendingUsers.length}
           </div>
           <button
             onClick={fetchPendingUsers}
             className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
             title="Refresh pending users list"
           >
             <FaUsers className="w-4 h-4 mr-2" />
             Refresh
           </button>
         </div>
       </div>

       {/* Success Message */}
       {successMessage && (
         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
           <div className="flex items-center">
             <FaCheck className="h-5 w-5 text-green-600 mr-3" />
             <p className="text-green-800 font-medium">{successMessage}</p>
           </div>
         </div>
       )}

      {/* Pending Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading pending users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user._id} data-user-id={user._id} className="hover:bg-gray-50 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => getUserDetails(user)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="View Details"
                            disabled={processingUsers.has(user._id)}
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            className={`text-green-600 hover:text-green-900 transition-colors ${
                              processingUsers.has(user._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Approve User"
                            disabled={processingUsers.has(user._id)}
                          >
                            {processingUsers.has(user._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <FaCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRejectModal(true);
                            }}
                            className={`text-red-600 hover:text-red-900 transition-colors ${
                              processingUsers.has(user._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Reject User"
                            disabled={processingUsers.has(user._id)}
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pendingUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">All Users Approved! 🎉</h3>
                <p className="mt-2 text-sm text-gray-500">No pending user registrations. All users have been reviewed and approved.</p>
                <div className="mt-4">
                  <button
                    onClick={fetchPendingUsers}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaUsers className="mr-2" />
                    Refresh List
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1">{getRoleBadge(selectedUser.role)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registered</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                                 <button
                                       onClick={() => handleApproveUser(selectedUser._id)}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                      processingUsers.has(selectedUser._id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={processingUsers.has(selectedUser._id)}
                                   >
                    {processingUsers.has(selectedUser._id) ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </div>
                    ) : (
                      'Approve'
                    )}
                  </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setShowRejectModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject User Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject User</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please provide a reason for rejecting {selectedUser.name}'s registration.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
              />
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                                 <button
                                       onClick={() => handleRejectUser(selectedUser._id)}
                    className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
                      processingUsers.has(selectedUser._id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={processingUsers.has(selectedUser._id)}
                 >
                                       {processingUsers.has(selectedUser._id) ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Rejecting...
                      </div>
                    ) : (
                      'Reject User'
                    )}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
