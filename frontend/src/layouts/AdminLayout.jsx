import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TabIndicator from '../components/TabIndicator';
import { 
  FaHome, 
  FaUsers, 
  FaShieldAlt, 
  FaCreditCard, 
  FaGraduationCap, 
  FaBell, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaFileAlt,
  FaStar,
  FaExclamationTriangle,
  FaCog,
  FaBookOpen,
  FaEnvelope
} from 'react-icons/fa';
import NotificationDropdown from '../components/notification/NotificationDropdown';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome },
    { name: 'User Management', href: '/admin/users', icon: FaUsers },
    { name: 'KYC Management', href: '/admin/kyc', icon: FaShieldAlt },
    { name: 'Payments', href: '/admin/payments', icon: FaCreditCard },
    { name: 'Mentorship', href: '/admin/mentorship', icon: FaGraduationCap },
    { name: 'Ratings', href: '/admin/ratings', icon: FaStar },
    { name: 'Messages', href: '/admin/messages', icon: FaEnvelope },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartLine },
    { name: 'Settings', href: '/admin/settings', icon: FaCog },
    { name: 'Notifications', href: '/admin/notifications', icon: FaBell },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header - Fixed */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-2 mr-3">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-slate-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 admin-sidebar">
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
                  placeholder="Search users, reports..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right side - notifications and profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 text-neutral-700 hover:text-limeDark hover:bg-cream rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-lime to-limeMedium rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span className="hidden sm:block font-medium">{user?.name || 'Abdullah Sofiyat'}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-lime/20 z-50">
                    <div className="py-2">
                      <Link
                        to="/admin/profile"
                        className="block px-4 py-2 text-neutral-700 hover:bg-cream hover:text-limeDark transition-colors"
                      >
                        <FaUser className="inline mr-2 text-neutral-500" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-neutral-700 hover:bg-cream hover:text-limeDark transition-colors"
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
      {(isProfileDropdownOpen || isNotificationDropdownOpen) && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsNotificationDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminLayout;
