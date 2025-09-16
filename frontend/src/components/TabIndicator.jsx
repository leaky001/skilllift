import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa';

const TabIndicator = () => {
  const { user, getTabInfo } = useAuth();
  
  // Hide the tab indicator completely to avoid blocking UI elements
  return null;
  
  if (!user) return null;
  
  const tabInfo = getTabInfo();
  
  const getRoleIcon = (role) => {
    switch (role) {
      case 'tutor':
        return <FaChalkboardTeacher className="text-blue-600" />;
      case 'admin':
        return <FaUserShield className="text-red-600" />;
      case 'learner':
        return <FaUser className="text-green-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'tutor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'learner':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div
      className={`fixed top-4 right-4 z-30 px-3 py-2 rounded-lg border-2 shadow-lg pointer-events-none ${getRoleColor(user.role)}`}
    >
      <div className="flex items-center space-x-2">
        {getRoleIcon(user.role)}
        <div className="text-sm font-semibold">
          <div className="capitalize">{user.role}</div>
          <div className="text-xs opacity-75">{user.name}</div>
        </div>
      </div>
      <div className="text-xs opacity-60 mt-1">
        Tab: {tabInfo.tabId.slice(-8)}
      </div>
    </div>
  );
};

export default TabIndicator;
