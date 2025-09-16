import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  hover = true,
  padding = 'default',
  ...props 
}) => {
  const baseClasses = 'bg-white border border-slate-200 rounded-xl transition-all duration-300';
  
  const variants = {
    default: 'shadow-sm hover:shadow-md',
    elevated: 'shadow-md hover:shadow-lg',
    flat: 'shadow-none',
    outlined: 'border-2 border-primary-200 hover:border-primary-300',
    filled: 'bg-primary-50 border-primary-200 hover:bg-primary-100'
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const hoverClasses = hover && onClick ? 'cursor-pointer hover:transform hover:scale-[1.02]' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
