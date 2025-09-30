import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaGraduationCap, 
  FaUsers, 
  FaUserTie,
  FaUserGraduate,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaBookOpen,
  FaVideo,
  FaFileAlt,
  FaCertificate,
  FaHandshake,
  FaCreditCard,
  FaChartBar,
  FaShieldAlt,
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import RealTimeNotifications from '../notifications/RealTimeNotifications';

const MobileNavigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowUserMenu(false);
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
    setShowUserMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', icon: FaHome, path: '/dashboard' },
      { name: 'Courses', icon: FaBookOpen, path: '/courses' },
      { name: 'Live Classes', icon: FaVideo, path: '/live-classes' },
      { name: 'Assignments', icon: FaFileAlt, path: '/assignments' },
      { name: 'Certificates', icon: FaCertificate, path: '/certificates' },
      { name: 'Payments', icon: FaCreditCard, path: '/payments' },
    ];

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Users', icon: FaUsers, path: '/admin/users' },

        { name: 'Analytics', icon: FaChartBar, path: '/admin/analytics' },
      ];
    }

    if (user.role === 'tutor') {
      return [
        ...baseItems,
        { name: 'My Students', icon: FaUserGraduate, path: '/tutor/learners' },
        { name: 'Create Course', icon: FaBookOpen, path: '/tutor/create-course' },
        { name: 'Earnings', icon: FaCreditCard, path: '/tutor/earnings' },
      ];
    }

    return baseItems;
  };

  // User menu items
  const getUserMenuItems = () => [
    { name: 'Profile', icon: FaUser, path: '/profile' },
    { name: 'Settings', icon: FaCog, path: '/settings' },
    { name: 'Support', icon: FaEnvelope, path: '/support' },
    { name: 'Logout', icon: FaSignOutAlt, action: handleLogout },
  ];

  // Toggle submenu
  const toggleSubmenu = (menuName) => {
    setActiveSubmenu(activeSubmenu === menuName ? null : menuName);
  };

  // Navigation item component
  const NavigationItem = ({ item, isSubmenu = false }) => {
    const isActive = location.pathname === item.path;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = activeSubmenu === item.name;

    if (item.action) {
      return (
        <button
          onClick={item.action}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
            isSubmenu ? 'pl-8' : ''
          } ${
            isActive 
              ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon className="text-lg flex-shrink-0" />
          <span className="flex-1">{item.name}</span>
        </button>
      );
    }

    return (
      <div>
        <Link
          to={item.path}
          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
            isSubmenu ? 'pl-8' : ''
          } ${
            isActive 
              ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="text-lg flex-shrink-0" />
            <span className="flex-1">{item.name}</span>
          </div>
          {hasSubmenu && (
            <motion.div
              animate={{ rotate: isSubmenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronRight className="text-sm" />
            </motion.div>
          )}
        </Link>

        {/* Submenu */}
        {hasSubmenu && (
          <AnimatePresence>
            {isSubmenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {item.submenu.map((subItem, index) => (
                  <NavigationItem key={index} item={subItem} isSubmenu={true} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              ref={menuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-primary-600 text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">SkillLift</h1>
                    <p className="text-sm text-primary-100">Learning Platform</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-primary-600 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <FaChevronDown className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* User Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 space-y-1 overflow-hidden"
                      >
                        {getUserMenuItems().map((item, index) => (
                          <div key={index}>
                            {item.action ? (
                              <button
                                onClick={item.action}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <item.icon className="text-sm" />
                                <span className="text-sm">{item.name}</span>
                              </button>
                            ) : (
                              <Link
                                to={item.path}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <item.icon className="text-sm" />
                                <span className="text-sm">{item.name}</span>
                              </Link>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search courses, tutors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="py-4">
                <div className="space-y-1">
                  {getNavigationItems().map((item, index) => (
                    <NavigationItem key={index} item={item} />
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="mt-auto p-4 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  <p>© 2024 SkillLift</p>
                  <div className="flex items-center justify-center space-x-4 mt-2">
                    <Link to="/support" className="hover:text-primary-600 transition-colors">
                      <FaEnvelope className="inline mr-1" />
                      Support
                    </Link>
                    <Link to="/contact" className="hover:text-primary-600 transition-colors">
                      <FaPhone className="inline mr-1" />
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Header Actions */}
      <div className="lg:hidden flex items-center space-x-2">
        {/* Search Toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Toggle search"
        >
          <FaSearch />
        </button>

        {/* Notifications */}
        <RealTimeNotifications />

        {/* User Menu Toggle */}
        {user && (
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle user menu"
          >
            <FaUser />
          </button>
        )}
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 lg:hidden"
          >
            <div className="p-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search courses, tutors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FaTimes />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;
