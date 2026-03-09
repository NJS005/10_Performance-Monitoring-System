import React from 'react';

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm 
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};