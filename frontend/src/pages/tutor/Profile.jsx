import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaCamera, FaImage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TutorProfile = () => {
  const { user } = useAuth();
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
        console.log('Profile picture URL from server:', userData.profilePicture);
        // Construct full URL if it's a relative path
        let profilePicUrl = userData.profilePicture;
        if (profilePicUrl && !profilePicUrl.startsWith('http')) {
          profilePicUrl = `http://localhost:5000${profilePicUrl}`;
        }
        console.log('Constructed profile picture URL:', profilePicUrl);
        setProfilePicturePreview(profilePicUrl || null);
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
        // Reload profile to get updated data
        loadProfile();
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <FaSave />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Basic Profile Information */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center mb-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'
              )}
            </div>
            
            {/* Edit mode camera button */}
            {isEditing && (
              <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2">
                <label className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white z-10">
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
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors shadow-lg border-2 border-white z-20"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name || 'Tutor'}</h2>
            <p className="text-gray-600">Tutor Profile</p>
            {!isEditing && (
              <p className="text-sm text-gray-500 mt-1">
                Click "Edit Profile" to upload a profile picture
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about your teaching experience and expertise..."
            />
          </div>
        </div>
      </div>

      {/* Skills Management */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Skills & Expertise</h3>
          <span className="text-sm text-gray-500">{profile.skills.length} skills</span>
        </div>

        {/* Current Skills */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Skills</h4>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No skills added yet. Add some skills to showcase your expertise!</p>
          )}
        </div>

        {/* Add Skills */}
        {isEditing && (
          <div className="space-y-4">
            {/* Add Custom Skill */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Skill</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Enter a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Predefined Skills */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Skills</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => addPredefinedSkill(skill)}
                    disabled={profile.skills.includes(skill)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      profile.skills.includes(skill)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
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
  );
};

export default TutorProfile;
