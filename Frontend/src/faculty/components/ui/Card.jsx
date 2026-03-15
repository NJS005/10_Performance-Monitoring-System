import React from 'react';

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <div 
      className={`
        bg-slate-50 border border-slate-200 rounded-xl shadow-sm 
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};