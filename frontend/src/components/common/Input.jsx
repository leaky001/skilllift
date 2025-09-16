import React from 'react';

const Input = ({ 
  label,
  error,
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full border border-slate-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-white text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-primary-500',
    filled: 'bg-slate-50 text-slate-900 placeholder-slate-500 focus:border-primary-500 focus:ring-primary-500',
    outlined: 'bg-transparent text-slate-900 placeholder-slate-400 border-2 focus:border-primary-500 focus:ring-primary-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const errorClasses = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${errorClasses} ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-900">
          {label}
        </label>
      )}
      <input
        className={classes}
        {...props}
      />
      {error && (
        <p className="text-sm text-error-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
