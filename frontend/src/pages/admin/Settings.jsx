import React, { useState } from 'react';
import { 
  FaCog, 
  FaSave, 
  FaUndo, 
  FaCreditCard, 
  FaShieldAlt, 
  FaBell, 
  FaGlobe, 
  FaUsers,
  FaPercentage,
  FaMoneyBillWave,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'SkillLift',
    platformDescription: 'Empowering learners and tutors to achieve their goals through innovative online education.',
    supportEmail: 'support@skilllift.com',
    contactPhone: '+234 800 123 4567',
    timezone: 'Africa/Lagos',
    language: 'English',
    
    // Platform Fees
    platformFeePercentage: 15,
    minimumWithdrawal: 5000,
    maximumWithdrawal: 1000000,
    transactionFee: 100,
    
    // Security Settings
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    
    // Content Settings
    autoApproveCourses: false,
    requireContentReview: true,
    maxFileSize: 100,
    allowedFileTypes: ['pdf', 'mp4', 'jpg', 'png', 'doc', 'docx'],
    
    // User Settings
    allowTutorRegistration: true,
    allowLearnerRegistration: true,
    requireApprovalForTutors: true,
    maxCoursesPerTutor: 50,
    maxStudentsPerCourse: 1000
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const startEditing = () => {
    setOriginalSettings({ ...settings });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setSettings({ ...originalSettings });
    setIsEditing(false);
  };

  const saveSettings = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings);
    setIsEditing(false);
    // Show success message
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      const defaultSettings = {
        platformName: 'SkillLift',
        platformDescription: 'Empowering learners and tutors to achieve their goals through innovative online education.',
        supportEmail: 'support@skilllift.com',
        contactPhone: '+234 800 123 4567',
        timezone: 'Africa/Lagos',
        language: 'English',
        platformFeePercentage: 15,
        minimumWithdrawal: 5000,
        maximumWithdrawal: 1000000,
        transactionFee: 100,
        requireEmailVerification: true,
        requirePhoneVerification: false,
        maxLoginAttempts: 5,
        sessionTimeout: 24,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        autoApproveCourses: false,
        requireContentReview: true,
        maxFileSize: 100,
        allowedFileTypes: ['pdf', 'mp4', 'jpg', 'png', 'doc', 'docx'],
        allowTutorRegistration: true,
        allowLearnerRegistration: true,
        requireApprovalForTutors: true,
        maxCoursesPerTutor: 50,
        maxStudentsPerCourse: 1000
      };
      setSettings(defaultSettings);
      setIsEditing(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: FaGlobe },
    { id: 'fees', name: 'Platform Fees', icon: FaCreditCard },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'content', name: 'Content', icon: FaUsers },
    { id: 'users', name: 'User Management', icon: FaUsers }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Platform Settings</h1>
        <p className="text-neutral-600">Configure platform settings, fees, and security parameters.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <FaSave className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-400 transition-colors flex items-center space-x-2"
              >
                <FaUndo className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <FaCog className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
          )}
        </div>
        
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900">General Platform Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Platform Description
                </label>
                <textarea
                  value={settings.platformDescription}
                  onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                />
              </div>
            </div>
          )}

          {/* Platform Fees */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900">Platform Fee Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Platform Fee Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.platformFeePercentage}
                      onChange={(e) => handleSettingChange('platformFeePercentage', parseFloat(e.target.value))}
                      disabled={!isEditing}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                    />
                    <FaPercentage className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Percentage taken from each transaction</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Transaction Fee (₦)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.transactionFee}
                      onChange={(e) => handleSettingChange('transactionFee', parseInt(e.target.value))}
                      disabled={!isEditing}
                      min="0"
                      className="w-full px-3 py-2 pl-8 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                    />
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Fixed fee per transaction</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Minimum Withdrawal (₦)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.minimumWithdrawal}
                      onChange={(e) => handleSettingChange('minimumWithdrawal', parseInt(e.target.value))}
                      disabled={!isEditing}
                      min="0"
                      className="w-full px-3 py-2 pl-8 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                    />
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum Withdrawal (₦)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.maximumWithdrawal}
                      onChange={(e) => handleSettingChange('maximumWithdrawal', parseInt(e.target.value))}
                      disabled={!isEditing}
                      min="0"
                      className="w-full px-3 py-2 pl-8 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                    />
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900">Security & Verification Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Require Email Verification</label>
                    <p className="text-xs text-neutral-500">Users must verify their email address</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('requireEmailVerification', !settings.requireEmailVerification)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.requireEmailVerification ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Require Phone Verification</label>
                    <p className="text-xs text-neutral-500">Users must verify their phone number</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('requirePhoneVerification', !settings.requirePhoneVerification)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.requirePhoneVerification ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Require Approval for Tutors</label>
                    <p className="text-xs text-neutral-500">Admin must approve new tutor registrations</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('requireApprovalForTutors', !settings.requireApprovalForTutors)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.requireApprovalForTutors ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900">Notification Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Email Notifications</label>
                    <p className="text-xs text-neutral-500">Send notifications via email</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.emailNotifications ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">SMS Notifications</label>
                    <p className="text-xs text-neutral-500">Send notifications via SMS</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.smsNotifications ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Push Notifications</label>
                    <p className="text-xs text-neutral-500">Send push notifications to mobile apps</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.pushNotifications ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Marketing Emails</label>
                    <p className="text-xs text-neutral-500">Send promotional and marketing emails</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('marketingEmails', !settings.marketingEmails)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.marketingEmails ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Settings */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900">Content Management Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Auto-approve Courses</label>
                    <p className="text-xs text-neutral-500">Automatically approve new courses</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoApproveCourses', !settings.autoApproveCourses)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.autoApproveCourses ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Require Content Review</label>
                    <p className="text-xs text-neutral-500">Review all content before publication</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('requireContentReview', !settings.requireContentReview)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.requireContentReview ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes.join(', ')}
                    onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                    disabled={!isEditing}
                    placeholder="pdf, mp4, jpg, png"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Separate file types with commas</p>
                </div>
              </div>
            </div>
          )}

          {/* User Management Settings */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900">User Management Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Allow Tutor Registration</label>
                    <p className="text-xs text-neutral-500">Allow new tutors to register</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('allowTutorRegistration', !settings.allowTutorRegistration)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.allowTutorRegistration ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Allow Learner Registration</label>
                    <p className="text-xs text-neutral-500">Allow new learners to register</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('allowLearnerRegistration', !settings.allowLearnerRegistration)}
                    disabled={!isEditing}
                    className="text-2xl"
                  >
                    {settings.allowLearnerRegistration ? <FaToggleOn className="text-success-600" /> : <FaToggleOff className="text-neutral-400" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum Courses per Tutor
                  </label>
                  <input
                    type="number"
                    value={settings.maxCoursesPerTutor}
                    onChange={(e) => handleSettingChange('maxCoursesPerTutor', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Maximum Students per Course
                  </label>
                  <input
                    type="number"
                    value={settings.maxStudentsPerCourse}
                    onChange={(e) => handleSettingChange('maxStudentsPerCourse', parseInt(e.target.value))}
                    disabled={!isEditing}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
