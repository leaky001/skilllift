import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaShieldAlt, FaCrown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Abdullah Sofiyat',
    email: user?.email || 'admin@skilllift.com',
    phone: '+234 801 234 5678',
    location: 'Lagos, Nigeria',
    bio: 'Super Admin with full system control and management capabilities.',
    role: 'Super Administrator',
    permissions: ['User Management', 'Payment Processing', 'System Settings', 'Analytics Access']
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || 'Abdullah Sofiyat',
      email: user?.email || 'admin@skilllift.com',
      phone: '+234 801 234 5678',
      location: 'Lagos, Nigeria',
      bio: 'Super Admin with full system control and management capabilities.',
      role: 'Super Administrator',
      permissions: ['User Management', 'Payment Processing', 'System Settings', 'Analytics Access']
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
              <FaCrown className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{formData.name}</h1>
              <p className="text-lg text-accent-600 font-semibold">{formData.role}</p>
              <p className="text-neutral-600">Administrator Profile</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-accent-500 text-white px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-success-500 text-white px-4 py-2 rounded-lg hover:bg-success-600 transition-colors"
                >
                  <FaSave />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-neutral-500 text-white px-4 py-2 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-accent-500" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-neutral-900">{formData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-neutral-900">{formData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-neutral-900">{formData.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-neutral-900">{formData.location}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-neutral-900">{formData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-accent-500" />
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-700 mb-2">Account Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <span className="text-success-600 font-medium">Active</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-700 mb-2">Last Login</h3>
                <p className="text-neutral-900">Today at 9:30 AM</p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-700 mb-2">Account Created</h3>
                <p className="text-neutral-900">January 15, 2024</p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-700 mb-2">Login Count</h3>
                <p className="text-neutral-900">127 times</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permissions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Permissions</h2>
            <div className="space-y-3">
              {formData.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                  <span className="text-neutral-700">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
                <div className="font-medium text-neutral-900">Change Password</div>
                <div className="text-sm text-neutral-600">Update your login credentials</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
                <div className="font-medium text-neutral-900">Two-Factor Auth</div>
                <div className="text-sm text-neutral-600">Enable additional security</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
                <div className="font-medium text-neutral-900">Activity Log</div>
                <div className="text-sm text-neutral-600">View your recent actions</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
