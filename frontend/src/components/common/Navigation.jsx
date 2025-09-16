import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ items = [], className = '' }) => {
  const location = useLocation();
  
  return (
    <nav className={`flex space-x-1 ${className}`}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const baseClasses = 'nav-item px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
        const activeClasses = isActive ? 'nav-item active' : '';
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${baseClasses} ${activeClasses}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
