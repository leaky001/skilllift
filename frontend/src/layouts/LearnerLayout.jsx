import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TabIndicator from '../components/TabIndicator';
import { 
  FaHome, 
  FaBookOpen, 
  FaVideo, 
  FaFileAlt, 
  FaCertificate, 
  FaBell, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCog,
  FaGraduationCap,
  FaComments,
  FaStar,
  FaHeart,
  FaPlay
} from 'react-icons/fa';
import RealTimeNotifications from '../components/notifications/RealTimeNotifications';

const LearnerLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/learner/dashboard', icon: FaHome },
    { name: 'Courses', href: '/learner/courses', icon: FaBookOpen },
    { name: 'Live Classes', href: '/learner/live-classes', icon: FaVideo },
    { name: 'Class Replays', href: '/learner/replays', icon: FaPlay },
    { name: 'Assignments', href: '/learner/assignments', icon: FaFileAlt },
    { name: 'Certificates', href: '/learner/certificates', icon: FaCertificate },
    { name: 'Rate Courses', href: '/learner/rate-courses', icon: FaStar },
    { name: 'Tutor Feedback', href: '/learner/tutor-feedback', icon: FaComments },
    { name: 'Notifications', href: '/learner/notifications', icon: FaBell },
    { name: 'Settings', href: '/learner/settings', icon: FaCog },
  ];

  const handleLogout = () => {
    logout();
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-slate-900">SkillLift</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side - mobile menu button and search */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-600"
              >
                <FaBars className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses, tutors..."
                    className="w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - notifications and profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <RealTimeNotifications />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/i,'')}${user.profilePicture}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{user?.name || 'Ridwan Idris'}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <div className="py-2">
                      <Link
                        to="/learner/profile"
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <FaUser className="inline mr-2 text-slate-500" />
                        Profile
                      </Link>
                      <Link
                        to="/learner/notification-preferences"
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <FaCog className="inline mr-2 text-slate-500" />
                        Notification Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <FaSignOutAlt className="inline mr-2 text-slate-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
          <Outlet />
        </main>
        
        {/* Tab Indicator */}
        <TabIndicator />
      </div>

      {/* Click outside to close dropdowns */}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => {
            setIsProfileDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LearnerLayout;
