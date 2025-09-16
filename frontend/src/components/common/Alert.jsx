import React from 'react';

const Alert = ({ 
  children, 
  variant = 'info', 
  className = '', 
  icon,
  dismissible = false,
  onDismiss,
  ...props 
}) => {
  const baseClasses = 'flex items-start p-4 rounded-lg border transition-all duration-200';
  
  const variants = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-secondary-50 border-secondary-200 text-secondary-800',
    warning: 'bg-accent-50 border-accent-200 text-accent-800',
    error: 'bg-error-50 border-error-200 text-error-800'
  };
  
  const iconVariants = {
    info: 'text-primary-600',
    success: 'text-secondary-600',
    warning: 'text-accent-600',
    error: 'text-error-600'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {icon && (
        <div className={`flex-shrink-0 mr-3 ${iconVariants[variant]}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ml-3 ${iconVariants[variant]} hover:opacity-75 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
