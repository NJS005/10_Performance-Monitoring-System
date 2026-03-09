import React from 'react';

export const Badge = ({ status, children }) => {
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
      border ${statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}
    `}>
      {children}
    </span>
  );
};