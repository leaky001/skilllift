import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RealTimeNotifications from '../components/notifications/RealTimeNotifications';
import TabIndicator from '../components/TabIndicator';
import { 
  FaHome, 
  FaBook, 
  FaVideo, 
  FaTasks, 
  FaCertificate, 
  FaUsers, 
  FaBell, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaGraduationCap,
  FaChartLine,
  FaPlay,
  FaFileAlt,
  FaStar,
  FaPlus,
  FaEnvelope,
  FaShieldAlt,
  FaSearch
} from 'react-icons/fa';
import apiService from '../services/api';

const TutorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiService.get(`/search?q=${encodeURIComponent(query)}&type=tutor`);
      if (response.data.success) {
        setSearchResults(response.data.data || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search if API fails
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Navigate based on result type
    if (result.type === 'course') {
      navigate(`/tutor/courses/${result.id}`);
    } else if (result.type === 'learner') {
      navigate(`/tutor/learners/${result.id}`);
    } else if (result.type === 'assignment') {
      navigate(`/tutor/assignments/${result.id}`);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/tutor/dashboard', icon: FaHome },
    { name: 'KYC Verification', href: '/tutor/kyc-submission', icon: FaShieldAlt },
    { name: 'Courses', href: '/tutor/courses', icon: FaBook },
    { name: 'Live Classes', href: '/tutor/live-classes', icon: FaVideo },
    { name: 'Assignments', href: '/tutor/assignments', icon: FaTasks },
    { name: 'Certificates', href: '/tutor/certificates', icon: FaCertificate },
    { name: 'Learners', href: '/tutor/learners', icon: FaUsers },
    { name: 'Payments', href: '/tutor/payments', icon: FaChartLine },
    { name: 'Replays', href: '/tutor/replays', icon: FaPlay },
    { name: 'Messages', href: '/tutor/messages', icon: FaEnvelope },
    { name: 'Notifications', href: '/tutor/notifications', icon: FaBell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-2 mr-3">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-slate-900">SkillLift</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-primary-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-primary-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-700 hover:text-slate-900"
            >
              <FaBars className="h-6 w-6" />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-lg mx-4 hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses, learners..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <FaSearch className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaTimes className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {result.type === 'course' && <FaBook className="h-4 w-4 text-blue-500" />}
                            {result.type === 'learner' && <FaUser className="h-4 w-4 text-green-500" />}
                            {result.type === 'assignment' && <FaTasks className="h-4 w-4 text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {result.title || result.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {result.description || result.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                  className="flex items-center space-x-3 p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/i,'')}${user.profilePicture}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the broken image and show fallback
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center"><svg class="text-white text-sm" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{user?.name || 'Muiz Abass'}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-neutral-200 z-50">
                    <div className="py-2">
                      <Link
                        to="/tutor/profile"
                        className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      >
                        <FaUser className="inline mr-2 text-neutral-500" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      >
                        <FaSignOutAlt className="inline mr-2 text-neutral-500" />
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
        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-50">
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

export default TutorLayout;
