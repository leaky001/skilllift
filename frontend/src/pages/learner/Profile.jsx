import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const LearnerProfile = () => {
  const { user, updateProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Load profile data from backend
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        const userData = response.data.data;
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.learnerProfile?.bio || '',
          profilePicture: userData.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to auth context data
      if (user) {
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: '',
          profilePicture: user.profilePicture || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarSelected = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      setUploadingAvatar(true);
      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.success) {
        const url = response.data.data.profilePicture;
        setProfile((prev) => ({ ...prev, profilePicture: url }));
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile picture. Please try a different image.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getBackendOrigin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // strip trailing /api if present
    return apiUrl.replace(/\/api$/i, '');
  };

  const resolveImageUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined' || url.trim() === '') return '';
    // If it's already a full URL (http/https), return as is
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    // If it starts with /, it's a relative path
    if (url.startsWith('/')) {
      return `${getBackendOrigin()}${url}`;
    }
    // Otherwise, assume it's a relative path and add /
    return `${getBackendOrigin()}/${url}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare profile data with learner profile
      const profileData = {
        name: profile.name,
        phone: profile.phone,
        learnerProfile: {
          bio: profile.bio
        }
      };
      
      const result = await updateProfile(profileData);
      if (result.success) {
        setIsEditing(false);
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Profile</h1>
          <p className="text-slate-600 text-lg">Manage your profile information</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FaSave />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            title="Change profile photo"
          >
            {profile.profilePicture && profile.profilePicture !== 'null' && profile.profilePicture !== 'undefined' && profile.profilePicture.trim() !== '' ? (
              <img
                key={profile.profilePicture}
                src={resolveImageUrl(profile.profilePicture)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('❌ Error loading profile picture:', resolveImageUrl(profile.profilePicture));
                  // Hide the broken image and show fallback
                  e.target.style.display = 'none';
                  // Clear the invalid URL
                  setProfile((prev) => ({ ...prev, profilePicture: '' }));
                }}
                onLoad={() => {
                  console.log('✅ Profile picture loaded successfully');
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'L'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-xs font-semibold">
              {uploadingAvatar ? 'Uploading...' : 'Change'}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelected}
          />
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-slate-900">{profile.name || 'Learner'}</h2>
            <p className="text-slate-600 font-medium">Student</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg disabled:bg-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg disabled:bg-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg disabled:bg-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LearnerProfile;
