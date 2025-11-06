import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaCamera, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TutorProfile = () => {
  const { user, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Helper function to resolve image URL
  const getBackendOrigin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // strip trailing /api if present
    return apiUrl.replace(/\/api$/i, '');
  };

  const resolveImageUrl = (url) => {
    if (!url) return '';
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

  // Predefined skills options
  const skillOptions = [
    'JavaScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript', 'HTML', 'CSS', 'SASS',
    'Bootstrap', 'Tailwind CSS', 'jQuery', 'Express.js', 'Django', 'Flask', 'Laravel',
    'Spring Boot', 'ASP.NET', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'Digital Marketing',
    'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing',
    'Analytics', 'Data Science', 'Machine Learning', 'AI', 'Blockchain', 'Web3',
    'Mobile Development', 'iOS', 'Android', 'Flutter', 'React Native', 'Xamarin',
    'Game Development', 'Unity', 'Unreal Engine', '3D Modeling', 'Animation',
    'Video Editing', 'Photography', 'Graphic Design', 'UI/UX Design', 'Product Design',
    'Project Management', 'Agile', 'Scrum', 'DevOps', 'Cybersecurity', 'Ethical Hacking',
    'Network Security', 'Cloud Security', 'Penetration Testing', 'Forensics',
    'Business Analysis', 'Data Analysis', 'Excel', 'Power BI', 'Tableau', 'SQL',
    'Statistics', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Writing', 'Communication', 'Public Speaking', 'Leadership', 'Management',
    'Finance', 'Accounting', 'Economics', 'Marketing', 'Sales', 'Customer Service',
    'Human Resources', 'Operations', 'Supply Chain', 'Logistics', 'Quality Assurance',
    'Testing', 'QA', 'Automation', 'Selenium', 'Cypress', 'Jest', 'Mocha',
    'Webpack', 'Babel', 'ESLint', 'Prettier', 'NPM', 'Yarn', 'Parcel', 'Vite'
  ];

  // Load profile data
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
          bio: userData.tutorProfile?.bio || '',
          skills: userData.tutorProfile?.skills || []
        });
        // Set the profile picture preview from the saved URL
        console.log('🔍 Profile picture URL from server:', userData.profilePicture);
        console.log('🔍 Full user data:', userData);
        
        // Only set profile picture if it exists and is not empty/null/undefined
        if (userData.profilePicture && userData.profilePicture !== 'null' && userData.profilePicture !== 'undefined' && userData.profilePicture.trim() !== '') {
          const profilePicUrl = resolveImageUrl(userData.profilePicture);
          console.log('✅ Resolved profile picture URL:', profilePicUrl);
          setProfilePicturePreview(profilePicUrl);
        } else {
          console.log('⚠️ No valid profile picture found, using default avatar');
          setProfilePicturePreview(null);
        }
        // Clear any temporary file selection
        setProfilePicture(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('phone', profile.phone);
      formData.append('tutorProfile', JSON.stringify({
        bio: profile.bio,
        skills: profile.skills
      }));
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setIsEditing(false);
        console.log('Profile updated successfully');
        console.log('Response data:', response.data.data);
        // Update profile picture preview if a new one was uploaded
        if (response.data.data?.profilePicture) {
          const updatedProfilePicUrl = resolveImageUrl(response.data.data.profilePicture);
          console.log('✅ Updated profile picture URL:', updatedProfilePicUrl);
          setProfilePicturePreview(updatedProfilePicUrl);
        }
        // Refresh user profile in context to update header
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        // Reload profile to get updated data (this will also refresh the profile picture)
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addPredefinedSkill = (skill) => {
    if (!profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - check MIME type and extension
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validImageTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      console.log('✅ Valid image file selected:', {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
        console.log('✅ Image preview created');
      };
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        alert('Error reading image file. Please try a different image.');
        e.target.value = ''; // Clear the input
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = async () => {
    // Clear local state
    setProfilePicture(null);
    setProfilePicturePreview(null);
    
    // If we're in edit mode and there's a saved profile picture, we need to clear it from the backend
    if (isEditing) {
      try {
        // Create a FormData with an empty profilePicture to clear it
        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('phone', profile.phone);
        formData.append('tutorProfile', JSON.stringify({
          bio: profile.bio,
          skills: profile.skills
        }));
        // Send a request to clear the profile picture
        // Note: The backend should handle empty/null profilePicture to clear it
        const response = await api.put('/auth/profile', {
          name: profile.name,
          phone: profile.phone,
          tutorProfile: {
            bio: profile.bio,
            skills: profile.skills
          },
          profilePicture: null // Clear the profile picture
        });
        
        if (response.data.success) {
          console.log('✅ Profile picture cleared');
          // Refresh user profile
          if (refreshUserProfile) {
            await refreshUserProfile();
          }
          // Reload profile
          await loadProfile();
        }
      } catch (error) {
        console.error('Error clearing profile picture:', error);
        // Don't show error to user, just clear locally
      }
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
          <p className="text-slate-600 text-lg">Manage your profile information and skills</p>
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

      {/* Basic Profile Information */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
        <div className="flex items-center mb-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg border-4 border-white relative">
              {profilePicturePreview ? (
                <>
                  <img 
                    key={profilePicturePreview} 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Error loading profile picture:', profilePicturePreview);
                      console.error('❌ Image element:', e.target);
                      // Hide the broken image
                      e.target.style.display = 'none';
                      // Show fallback
                      const fallback = e.target.nextElementSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                      // Clear the invalid URL
                      setProfilePicturePreview(null);
                    }}
                    onLoad={() => {
                      console.log('✅ Profile picture loaded successfully:', profilePicturePreview);
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center absolute inset-0" style={{ display: 'none' }}>
                    {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
                </div>
              )}
            </div>
            
            {/* Edit mode camera button */}
            {isEditing && (
              <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2">
                <label className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white p-2.5 rounded-full cursor-pointer transition-all duration-200 shadow-lg border-2 border-white z-10">
                  <FaCamera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
                {profilePicturePreview && (
                  <button
                    onClick={removeProfilePicture}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-all duration-200 shadow-lg border-2 border-white z-20"
                    title="Remove profile picture"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            {/* Show error message if image fails to load */}
            {profilePicturePreview && (
              <div className="mt-2 text-xs text-red-600 text-center">
                If you see code/text instead of your image, click "Edit Profile" and upload a new image file (JPG, PNG, etc.)
              </div>
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-slate-900">{profile.name || 'Tutor'}</h2>
            <p className="text-slate-600 font-medium">Tutor Profile</p>
            {!isEditing && (
              <p className="text-sm text-slate-500 mt-1">
                Click "Edit Profile" to upload a profile picture
              </p>
            )}
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
              placeholder="Tell us about your teaching experience and expertise..."
            />
          </div>
        </div>
      </div>

      {/* Skills Management */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Skills & Expertise</h3>
          <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{profile.skills.length} skills</span>
        </div>

        {/* Current Skills */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Current Skills</h4>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-200"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">No skills added yet. Add some skills to showcase your expertise!</p>
          )}
        </div>

        {/* Add Skills */}
        {isEditing && (
          <div className="space-y-4">
            {/* Add Custom Skill */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Add Custom Skill</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Enter a skill..."
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                />
                <button
                  onClick={addSkill}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Predefined Skills */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Popular Skills</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addPredefinedSkill(skill)}
                    disabled={profile.skills.includes(skill)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 font-medium ${
                      profile.skills.includes(skill)
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TutorProfile;
