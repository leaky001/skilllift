import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Navigation from './Navigation';

const Header = ({ 
  title = 'Skill-lift',
  subtitle = 'Professional Learning Platform',
  navigationItems = [],
  showLogin = true,
  className = '' 
}) => {
  return (
    <header className={`bg-white border-b border-green-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          {navigationItems.length > 0 && (
            <Navigation items={navigationItems} />
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {showLogin && (
              <>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
